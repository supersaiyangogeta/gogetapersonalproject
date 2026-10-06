/*
 * SCENES — Vegeta's last minutes, and what Goku does afterwards.
 *
 *   vegeta_final_words   the prince, beaten, saying the thing he has never said
 *   goku_buries_vegeta   no VFX, no music swell, no UI: a man digging
 *
 * These two are deliberately the quietest cinematics in the chapter. The first
 * one is close-ups and stillness — Frieza stays at the edge of frame and says
 * nothing for most of it — and the second has no effects at all beyond dust and
 * the sound of the ground. They are placed either side of the loudest fight in
 * the game on purpose.
 *
 * Both are data for the cinema runner and both declare their end state, so a
 * player who skips still ends with Vegeta gone, the grave made and the story
 * flags set.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  /** Store a computed camera as two scene points, so a beat can name them. */
  function shot(ctx, name, s) {
    ctx.cast[name] = { pos: s.pos };
    ctx.cast[name + 'At'] = { pos: s.look };
  }

  S.vegeta_final_words = {
    id: 'vegeta_final_words',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, vegeta: s.vegeta, frieza: s.frieza };
    },
    music: { song: 'menu', level: 0 },
    events: [
      // he is on the ground, and he is not getting up this time
      {
        call: (ctx) => {
          // a checkpoint or a phase jump can arrive here without the landing having played
          if (ctx.cast.goku) { ctx.cast.goku.setHidden(false); ctx.cast.goku.untargetable = true; }
        },
        pose: [
          { who: 'vegeta', pose: 'lieBack', face: 'hurt' },
          { who: 'goku', pose: 'kneelGrieve', face: 'grit' },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        mood: { amount: 0.3, color: 0x241c30, seconds: 2.4 },
        cam: {
          from: { at: 'vegeta', off: [4.5, 3.4, 5] },
          to: { at: 'vegeta', off: [2.4, 1.1, 2.8] },
          look: { at: 'vegeta' },
          fov: 50,
          fov2: 40,
          ease: 'inOut',
        },
        hold: 4,
      },
      // Goku kneels next to him. The camera gets low and stays there.
      {
        move: { who: 'goku', at: 'vegeta', off: [1.6, 0, 1.2], face: 'vegeta', seconds: 1.6 },
        pose: [{ who: 'goku', pose: 'kneelGrieve', face: 'grit', speed: 3 }],
        cam: {
          from: { at: 'vegeta:face', local: [0.3, -0.5, 1.3] },
          to: { at: 'vegeta:face', local: [0.2, -0.4, 1] },
          look: { at: 'vegeta:face' },
          fov: 40,
          fov2: 34,
        },
        hold: 2.6,
      },
      {
        say: { who: 'vegeta', line: 'Do not look at me like that, Kakarot.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      // the thing he has never said to anybody
      {
        cam: { from: { at: 'vegeta:face', local: [0.12, -0.3, 0.8] }, look: { at: 'vegeta:face' }, fov: 34 },
        say: { who: 'vegeta', line: 'After that we worked for him. Soldiers. Puppets. I was a prince, and he made me his dog.', duration: 4.8, style: 'quiet' },
        hold: 4.8,
      },
      {
        cam: { from: { at: 'goku:head', local: [0.4, -0.12, 0.95] }, look: { at: 'goku:head' }, fov: 36 },
        pose: [{ who: 'goku', pose: 'idle', face: 'angry' }],
        say: { who: 'goku', line: 'I know. I am going to finish it.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      {
        cam: { from: { at: 'vegeta:face', local: [0.18, -0.35, 0.9] }, look: { at: 'vegeta:face' }, fov: 35 },
        say: { who: 'vegeta', line: 'Then do not lose. Do not you dare lose to him.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      // he goes quiet. The scene does not rush away from it.
      {
        pose: [{ who: 'vegeta', pose: 'lieBack', face: 'ko', speed: 2 }],
        sfx: { name: 'uiBack', vol: 0.4 },
        cam: {
          from: { at: 'vegeta', off: [1.8, 0.9, 2.2] },
          to: { at: 'vegeta', off: [3.6, 2.8, 4.4] },
          look: { at: 'vegeta' },
          fov: 36,
          fov2: 46,
          ease: 'out',
        },
        hold: 5,
      },
      // Goku, from behind, saying nothing at all
      {
        cam: { from: { at: 'goku', local: [1.2, 0.5, -2.8] }, look: { at: 'vegeta', off: [0, -0.4, 0] }, fov: 42 },
        pose: [{ who: 'goku', pose: 'kneelGrieve', face: 'angry', speed: 2 }],
        hold: 4,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const v = cast.vegeta;
      if (v) {
        v.hp = 0;
        v.alive = false;
        v.untargetable = true;
        v.setState('scripted', { pose: 'lieBack', expression: 'ko' });
      }
      if (cast.goku) cast.goku.setState('free');
      m.flags.vegetaFell = true;
    },
  };

  S.goku_buries_vegeta = {
    id: 'goku_buries_vegeta',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, vegeta: s.vegeta, grave: s.grave };
    },
    // no music under this one at all
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          if (ctx.cast.goku) { ctx.cast.goku.setHidden(false); ctx.cast.goku.untargetable = true; }
        },
        mood: { amount: 0.22, color: 0x1e2a30, seconds: 3 },
        pose: [{ who: 'goku', pose: 'idle', face: 'calm', speed: 2 }],
        cam: {
          from: { at: 'goku', off: [6, 4, 7] },
          to: { at: 'goku', off: [3.4, 1.6, 4.2] },
          look: { at: 'goku', off: [0, 0.2, 0] },
          fov: 50,
          fov2: 44,
          ease: 'inOut',
        },
        hold: 4,
      },
      // the digging: dust, and the sound of ground being moved, nothing else
      {
        vfx: { kind: 'dust', at: { at: 'grave' }, radius: 1.6, count: 10 },
        sfx: { name: 'groundImpact', vol: 0.35, pitch: 0.7 },
        cam: { from: { at: 'goku', local: [2.2, 0.15, 2.6] }, look: { at: 'goku', off: [0, -0.25, 0] }, fov: 40 },
        hold: 3.2,
      },
      {
        vfx: { kind: 'dust', at: { at: 'grave' }, radius: 1.8, count: 12 },
        sfx: { name: 'groundImpact', vol: 0.3, pitch: 0.62 },
        hold: 3,
      },
      // the body goes in. The camera looks away, at the horizon, while it happens.
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          const grave = ctx.cast.grave;
          if (v && grave) {
            const at = grave.pos ? grave.pos.clone() : grave.position.clone();
            at.y -= 0.35;
            v.setPosition(at);
            v.setState('scripted', { pose: 'knockdown', expression: 'ko' });
          }
        },
        cam: {
          from: { at: 'goku', local: [1.6, 0.9, -3.4] },
          to: { at: 'goku', local: [1.3, 1.2, -4.2] },
          look: { at: 'goku', off: [0, 0.2, 0] },
          fov: 46,
          ease: 'out',
        },
        hold: 4.2,
      },
      // he stands over it for a while
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grit', speed: 2 }],
        cam: { from: { at: 'goku', local: [0.8, 0.4, 2.4] }, look: { at: 'goku', off: [0, 0.1, 0] }, fov: 36 },
        say: { who: 'goku', line: 'You were right about one thing. Somebody has to finish it.', duration: 4, style: 'quiet' },
        hold: 4.4,
      },
      {
        cam: {
          from: { at: 'grave', off: [3.2, 2.2, 4] },
          to: { at: 'grave', off: [7, 5.5, 9] },
          look: { at: 'grave' },
          fov: 44,
          fov2: 54,
          ease: 'out',
        },
        hold: 5,
      },
    ],
    end(ctx) {
      const { m, cast } = ctx;
      const v = cast.vegeta;
      if (v) {
        v.setHidden && v.setHidden(true);
        v.untargetable = true;
        v.alive = false;
      }
      if (cast.goku) cast.goku.setState('free');
      m.flags.vegetaBuried = true;
    },
  };

  /*
   * SCENE — "The shot that ends the prince" (owner, human playtest round 3: Vegeta's death was
   * dialogue, a character lying down, more dialogue, and a mission transition; it has to be
   * something the player watches happen). The order is the owner's: Vegeta speaks to Goku,
   * Frieza reacts, Frieza fires, the beam is SEEN to hit him, he is thrown by it, he falls,
   * and Goku reacts before anybody says another word.
   */
  S.frieza_kills_vegeta = {
    id: 'frieza_kills_vegeta',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, vegeta: s.vegeta, frieza: s.frieza };
    },
    music: { song: null, level: 0 },
    events: [
      // 1. where everybody is: the prince on his back, Goku beside him, Frieza standing off
      {
        call: (ctx) => {
          const { goku, vegeta, frieza } = ctx.cast;
          const b = ctx.b;
          goku.setHidden(false); // whatever route the player took to get here, he is on the field
          goku.untargetable = true;
          vegeta.intangible = true;
          vegeta.untargetable = true;
          frieza.untargetable = true;
          const at = vegeta.pos.clone().add(new V3(6.5, 0, -3.5));
          at.y = b.stage.heightAt(at.x, at.z);
          frieza.setPosition(at);
          frieza.yaw = frieza.prevYaw = Math.atan2(vegeta.pos.x - at.x, vegeta.pos.z - at.z);
          const g = vegeta.pos.clone().add(new V3(-1.5, 0, 1.4));
          g.y = b.stage.heightAt(g.x, g.z);
          goku.setPosition(g);
          goku.yaw = goku.prevYaw = Math.atan2(vegeta.pos.x - g.x, vegeta.pos.z - g.z);
          shot(ctx, 'wide', SL.Cinema.twoShot(vegeta, frieza, { fov: 44, height: 1.4, pad: 2.4, side: -1 }));
        },
        pose: [
          { who: 'vegeta', pose: 'lieBack', face: 'hurt' },
          { who: 'goku', pose: 'kneelGrieve', face: 'grit' },
          { who: 'frieza', pose: 'idle', face: 'calm' },
        ],
        mood: { amount: 0.32, color: 0x241c30, seconds: 2 },
        cam: { from: { at: 'wide' }, look: { at: 'wideAt' }, fov: 44 },
        hold: 2.6,
      },
      // 2. he speaks to Kakarot, and only to Kakarot
      {
        cam: { from: { at: 'vegeta:face', local: [0.2, -0.4, 1.05] }, to: { at: 'vegeta:face', local: [0.15, -0.35, 0.85] }, look: { at: 'vegeta:face' }, fov: 40, fov2: 35 },
        say: { who: 'vegeta', line: 'Kakarot... listen to me. There is nobody else left who can do this.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      // what he has never told anybody: it was no meteor
      {
        cam: { from: { at: 'goku:head', local: [0.42, -0.12, 0.9] }, look: { at: 'goku:head' }, fov: 38 },
        pose: [{ who: 'goku', pose: 'kneelGrieve', face: 'shock', speed: 2 }],
        say: { who: 'vegeta', line: 'Planet Vegeta was no accident. He destroyed it himself — our people, my father, all of it — because he was afraid of what we would become.', duration: 5.4, style: 'quiet' },
        hold: 5.6,
      },
      // 3. Frieza has heard enough of it
      {
        pose: [{ who: 'frieza', pose: 'fz_finger', face: 'smirk' }],
        cam: { from: { at: 'frieza:head', local: [0.5, -0.1, 1.15] }, look: { at: 'frieza:head' }, fov: 36 },
        say: { who: 'frieza', line: 'Still talking. You always did talk.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
      // 4. the finger, and the light gathering on it. Everything slows down.
      {
        call: (ctx) => {
          const fz = ctx.cast.frieza;
          ctx.aimFrom = fz.handPos('R');
          ctx.b.sfx('kiUp', fz, { pitch: 1.35, vol: 0.9 });
        },
        slow: { scale: 0.45, seconds: 1.6 },
        cam: { from: { at: 'frieza', local: [1.15, 0.35, 1.5] }, to: { at: 'frieza', local: [0.95, 0.3, 1.2] }, look: { at: 'frieza', off: [0, 0.45, 0] }, fov: 34, fov2: 30 },
        tick: (ctx) => {
          const fz = ctx.cast.frieza;
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.streamInward(fz.handPos('R'), 1.1, 0xff3a6a, 2, 0.1, 0.25);
        },
        hold: 1.6,
      },
      // 5. Goku sees it coming and cannot do anything about it
      {
        pose: [{ who: 'goku', pose: 'kneelGrieve', face: 'shock', speed: 5 }],
        cam: { from: { at: 'goku:head', local: [0.5, -0.1, 0.95] }, look: { at: 'goku:head' }, fov: 38 },
        say: { who: 'goku', line: 'NO—', duration: 0.9, style: 'shout' },
        hold: 1,
      },
      // 6. THE SHOT. Side-on to the line it travels, so the beam is seen to cross the gap and land.
      {
        call: (ctx) => {
          const { frieza, vegeta } = ctx.cast;
          const b = ctx.b;
          const from = frieza.handPos('R');
          const to = vegeta.chest();
          for (let i = 0; i <= 22; i++) b.vfx.trail(from.clone().lerp(to, i / 22), 0xff3a6a, 0.5, 0.45);
          b.vfx.flash(from, 1.1, 0xffd8e2, 0.15, SL.Toon.tex.glow);
          b.sfx('beamFire', frieza, { pitch: 1.2, vol: 1.2 });
          ctx.hitAt = to.clone();
          shot(ctx, 'line', SL.Cinema.twoShot(vegeta, frieza, { fov: 38, height: 0.9, pad: 0.8, side: 1, lookUp: 0.35 }));
        },
        cam: { from: { at: 'line' }, look: { at: 'lineAt' }, fov: 40 },
        hold: 0.5,
      },
      // 7. it lands: his body takes it, the ground answers, the screen goes white for a frame
      {
        call: (ctx) => {
          const { vegeta } = ctx.cast;
          const b = ctx.b;
          const at = ctx.hitAt || vegeta.chest();
          b.vfx.impact(at, 3, 0xffd8e2);
          b.vfx.flash(at, 2.2, 0xffffff, 0.18, SL.Toon.tex.glow);
          b.vfx.ring(at, 4, 0xff6a8a, 0.4);
          b.vfx.dust(vegeta.pos, 1.8, 8);
          b.sfx('explosionBig', null, { at, vol: 0.9 });
          b.cameraTraumaAt(at, 0.9);
          vegeta.hp = 1;
          vegeta.setState('scripted', { pose: 'pierced', expression: 'shock' });
        },
        screen: { flash: 0.12, color: '#ffe6ec' },
        slow: { scale: 0.45, seconds: 0.7 },
        cam: { from: { at: 'vegeta:face', local: [0.9, -0.55, 1.5] }, to: { at: 'vegeta:face', local: [0.7, -0.5, 1.25] }, look: { at: 'vegeta:face', off: [0, -0.15, 0] }, fov: 42, fov2: 38 },
        hold: 1.4,
      },
      // 8. he goes down. Level with the ground, where he lands.
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta;
          ctx.b.sfx('groundImpact', v, { vol: 0.8, pitch: 0.75 });
          ctx.b.vfx.dust(v.pos, 1.6, 7);
          const side = new V3(1, 0, 1).normalize();
          shot(ctx, 'fall', { pos: v.pos.clone().addScaledVector(side, 2.6).add(new V3(0, 0.75, 0)), look: v.pos.clone().add(new V3(0, 0.35, 0)), fov: 42 });
        },
        pose: [{ who: 'vegeta', pose: 'lieBack', face: 'hurt', speed: 4 }],
        cam: { from: { at: 'fall' }, look: { at: 'fallAt' }, fov: 42 },
        hold: 2.2,
      },
      // 9. Goku. No line, just his face.
      {
        pose: [{ who: 'goku', pose: 'kneelGrieve', face: 'angry', speed: 3 }],
        cam: { from: { at: 'goku:head', local: [0.42, -0.12, 0.85] }, to: { at: 'goku:head', local: [0.34, -0.1, 0.7] }, look: { at: 'goku:head' }, fov: 38, fov2: 33 },
        mood: { amount: 0.4, color: 0x1a1426, seconds: 1.4 },
        hold: 2.6,
      },
      // 10. and the man who did it, entirely untroubled by it
      {
        pose: [{ who: 'frieza', pose: 'idle', face: 'smirk' }],
        cam: { from: { at: 'frieza:head', local: [0.6, -0.12, 1.3] }, to: { at: 'frieza:head', local: [0.5, -0.1, 1.1] }, look: { at: 'frieza:head' }, fov: 38, fov2: 35 },
        say: { who: 'frieza', line: 'There. Now the field is quiet.', duration: 2.4, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const { b, m, cast } = ctx;
      const { vegeta, goku, frieza } = cast;
      if (vegeta) {
        vegeta.hp = 1;
        vegeta.intangible = true;
        vegeta.untargetable = true;
        vegeta.setState('scripted', { pose: 'lieBack', expression: 'hurt' });
      }
      if (goku) {
        goku.setState('scripted', { pose: 'kneelGrieve', expression: 'angry' });
        const at = vegeta ? vegeta.pos.clone().add(new V3(-1.5, 0, 1.4)) : goku.pos.clone();
        if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
        goku.setPosition(at);
        goku.yaw = goku.prevYaw = Math.atan2(vegeta.pos.x - at.x, vegeta.pos.z - at.z);
      }
      if (frieza) frieza.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.flags.beamFired = true;
      m.flags.vegetaShot = true;
    },
  };

  /*
   * SCENE — "What Kakarot says to him afterwards" (the owner's speech, kept word for word).
   * It is a performance, not a text box: it starts at the grave with nothing under it, his face
   * changes line by line, the camera comes in as the anger arrives, the ground starts to answer
   * him, and the last line is a low shot up at a man with his fists closed while the field lifts
   * around him. Frieza is in the scene the whole time, listening.
   */
  S.goku_declares_frieza = {
    id: 'goku_declares_frieza',
    cast: (m) => {
      const s = m.battle.story;
      return { goku: s.goku, frieza: s.frieza, grave: s.grave };
    },
    music: { song: null, level: 0 },
    events: [
      // the grave, and the man standing over it. Nothing under it yet.
      {
        call: (ctx) => {
          const { goku, frieza } = ctx.cast;
          const b = ctx.b;
          goku.setHidden(false);
          frieza.setHidden(false);
          frieza.untargetable = true;
          const at = goku.pos.clone().addScaledVector(goku.forward, -1).add(new V3(7, 0, -6));
          at.y = b.stage.heightAt(at.x, at.z);
          frieza.setPosition(at);
          frieza.yaw = frieza.prevYaw = Math.atan2(goku.pos.x - at.x, goku.pos.z - at.z);
          goku.yaw = goku.prevYaw = Math.atan2(at.x - goku.pos.x, at.z - goku.pos.z);
        },
        pose: [
          { who: 'goku', pose: 'idle', face: 'calm' },
          { who: 'frieza', pose: 'idle', face: 'smirk' },
        ],
        mood: { amount: 0.26, color: 0x20263a, seconds: 2.4 },
        cam: { from: { at: 'goku:head', local: [0.55, -0.05, 1.5] }, to: { at: 'goku:head', local: [0.45, -0.05, 1.2] }, look: { at: 'goku:head' }, fov: 38, fov2: 34 },
        hold: 2.4,
      },
      {
        say: { who: 'goku', line: 'I get it now, it wasn’t losing your race that made you so angry…', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        say: { who: 'goku', line: 'at least not entirely.', duration: 2.2, style: 'quiet' },
        hold: 2.6,
      },
      // the grave in the frame with him: this is who he is talking about
      {
        call: (ctx) => shot(ctx, 'graveShot', SL.Cinema.twoShot(ctx.cast.goku, ctx.cast.grave.pos || ctx.cast.grave, { fov: 40, height: 1.2, pad: 1.2, side: -1, lookUp: 0.4 })),
        cam: { from: { at: 'graveShot' }, look: { at: 'graveShotAt' }, fov: 40 },
        say: { who: 'goku', line: 'You were mad because he forced you to be his puppet.', duration: 3.6 },
        hold: 3.8,
      },
      {
        say: { who: 'goku', line: 'You couldn’t stand losing your pride.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      // back on his face, closer than before
      {
        pose: [{ who: 'goku', pose: 'g_resolve', face: 'grit', speed: 3 }],
        cam: { from: { at: 'goku:head', local: [0.4, -0.08, 1.15] }, to: { at: 'goku:head', local: [0.32, -0.06, 0.95] }, look: { at: 'goku:head' }, fov: 36, fov2: 32 },
        say: { who: 'goku', line: 'I may have hated you when you were alive,', duration: 3.2 },
        hold: 3.4,
      },
      {
        say: { who: 'goku', line: 'but I always respected your pride.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      // Frieza, bored of being talked past — and about to stop being bored
      {
        call: (ctx) => shot(ctx, 'fzListen', SL.Cinema.overShoulder(ctx.cast.goku, ctx.cast.frieza, { fov: 40, back: 2.4, side: 1, height: 0.8, lookUp: 0.25 })),
        pose: [{ who: 'frieza', pose: 'idle', face: 'calm' }],
        cam: { from: { at: 'fzListen' }, look: { at: 'fzListenAt' }, fov: 40 },
        hold: 1.8,
      },
      // it turns. The ground starts to answer him.
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          ctx.b.sfx('kiUp', g, { pitch: 0.8, vol: 1 });
          ctx.m.music('finale', 2);
        },
        pose: [{ who: 'goku', pose: 'powerCrouch', face: 'angry', speed: 4, aura: 1 }],
        cam: { from: { at: 'goku', local: [1.5, -0.45, 2.3] }, to: { at: 'goku', local: [1.2, -0.5, 1.9] }, look: { at: 'goku', off: [0, 0.35, 0] }, fov: 42, fov2: 38 },
        say: { who: 'goku', line: 'And now it’s time for me to share that pride.', duration: 3.4 },
        tick: (ctx) => {
          const g = ctx.cast.goku;
          if (ctx.b.frame % 4 === 0) ctx.b.vfx.streamInward(g.chest(), 3.4, 0xdff2ff, 3, 0.16, 0.4);
        },
        hold: 3.6,
      },
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          ctx.b.vfx.ring(g.chest(), 4, 0xdff2ff, 0.4, new V3(0, 1, 0));
          ctx.b.cameraTraumaAt(g.pos, 0.3);
        },
        cam: { from: { at: 'goku:head', local: [0.3, -0.06, 0.85] }, look: { at: 'goku:head' }, fov: 34 },
        say: { who: 'goku', line: 'Pride in myself.', duration: 2.4 },
        hold: 2.6,
      },
      // from the ground, looking up at him, while the field starts to come apart
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          const b = ctx.b;
          b.vfx.dust(g.pos, 5, 24);
          b.sfx('kiUp', g, { pitch: 1.05, vol: 1.2 });
          b.cameraTraumaAt(g.pos, 0.5);
          ctx.m.music('finale', 4);
        },
        pose: [{ who: 'goku', pose: 'g_ssjClench', face: 'shout', speed: 5, aura: 1 }],
        vfx: { kind: 'rocks', at: { at: 'goku' }, count: 10, radius: 5, lift: 9 },
        shake: { at: { at: 'goku' }, amount: 0.4 },
        cam: { from: { at: 'goku', local: [1.1, -1.15, 2.1] }, to: { at: 'goku', local: [0.9, -1.15, 1.7] }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 44, fov2: 40 },
        say: { who: 'goku', line: 'I am a Saiyan that was raised on Planet Earth!', duration: 3.4, style: 'shout' },
        tick: (ctx) => {
          const g = ctx.cast.goku;
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.trail(g.chest().add(new V3((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3)), 0xdff2ff, 0.5, 0.35);
        },
        hold: 3.6,
      },
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          ctx.b.vfx.ring(g.chest(), 7, 0xffffff, 0.5, new V3(0, 1, 0));
          ctx.b.cameraTraumaAt(g.pos, 0.6);
        },
        say: { who: 'goku', line: 'And in the name of every single Saiyan you made suffer!', duration: 3.6, style: 'shout' },
        hold: 3.8,
      },
      {
        say: { who: 'goku', line: 'For them and for the people on Planet Namek too!', duration: 3.4, style: 'shout' },
        hold: 3.6,
      },
      // the declaration: the loudest frame in the chapter
      {
        call: (ctx) => {
          const g = ctx.cast.goku;
          const b = ctx.b;
          b.vfx.explosion(g.chest(), 6, 0xdff2ff, { smoke: false });
          b.vfx.ring(g.chest(), 12, 0xffffff, 0.7, new V3(0, 1, 0));
          b.vfx.flash(g.chest(), 9, 0xffffff, 0.3, SL.Toon.tex.glow);
          b.sfx('kaiokenBoom', g, { vol: 1.3 });
          b.cameraTraumaAt(g.pos, 1);
          ctx.m.music('finale', 5);
        },
        screen: { flash: 0.5, color: '#eaf6ff' },
        pose: [{ who: 'goku', pose: 'g_ssjRage', face: 'shout', speed: 6, aura: 1 }],
        cam: { from: { at: 'goku', local: [0.7, -1.3, 2.4] }, to: { at: 'goku', local: [0.5, -1.25, 1.8] }, look: { at: 'goku', off: [0, 0.6, 0] }, fov: 46, fov2: 40 },
        say: { who: 'goku', line: 'I WILL DEFEAT YOU!!!!', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      // and the answer, from a man who has never been spoken to like that
      {
        call: (ctx) => shot(ctx, 'fzAnswer', SL.Cinema.overShoulder(ctx.cast.goku, ctx.cast.frieza, { fov: 36, back: 2.2, side: -1, height: 0.9, lookUp: 0.3 })),
        pose: [{ who: 'frieza', pose: 'fz_laugh', face: 'angry' }],
        cam: { from: { at: 'fzAnswer' }, look: { at: 'fzAnswerAt' }, fov: 36 },
        say: { who: 'frieza', line: 'You will TRY, monkey. Come here and try.', duration: 3.2, style: 'shout' },
        hold: 3.4,
      },
    ],
    end(ctx) {
      const { b, m, cast } = ctx;
      const { goku, frieza } = cast;
      if (frieza) {
        frieza.setHidden(false);
        frieza.untargetable = false;
        frieza.setState('scripted', { pose: 'idle', expression: 'angry' });
      }
      if (goku) {
        goku.setState('scripted', { pose: 'idle', expression: 'angry' });
        if (frieza) goku.yaw = goku.prevYaw = Math.atan2(frieza.pos.x - goku.pos.x, frieza.pos.z - goku.pos.z);
      }
      b.stage.clearMood(1);
      m.flags.gokuDeclared = true;
    },
  };
})();
