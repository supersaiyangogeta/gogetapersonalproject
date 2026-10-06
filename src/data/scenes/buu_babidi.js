/*
 * SCENES — Chapter 9, the wizard (Age 774).
 *
 *   ship_arrival     the ship, the wizard, the demon king — and what Babidi does
 *                    with servants who are no longer useful
 *   zoon_enter       the first floor becomes a planet, and Pui Pui steps out
 *   puipui_end       it was never a contest
 *   dark_enter       the lights go, and something that eats them opens its eyes
 *   yakon_end        more light than it can hold
 *   dabura_enter     the Demon King draws his sword
 *   dabura_recalled  Babidi stops the fight, because he has found something better
 *
 * Adaptation note: in the source Babidi watches the floors from his control room
 * through a crystal ball. Here he stands on a ledge above each floor — he is
 * still only watching, but the camera can see him do it.
 *
 * Dialogue is paraphrased English written for this project; no Japanese line is
 * claimed.
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;

  const cast = (m) => {
    const s = m.battle.story || {};
    const out = {};
    for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
    return out;
  };
  const show = (who) => (ctx) => {
    const f = ctx.cast[who];
    if (f) f.setHidden(false);
  };

  /* ------------------------------------------------------------ the ship */

  S.ship_arrival = {
    id: 'ship_arrival',
    cast,
    music: { song: null, level: 0 },
    events: [
      {
        mood: { amount: 0.25, color: 0x1a1024, seconds: 1 },
        // from the ridge, over the watchers' shoulders: the two land at a ship in a crater
        cam: { from: { at: 'gohan', off: [3.2, 2.6, 5.4] }, to: { at: 'gohan', off: [2.2, 2, 3.6] }, look: { at: 'yamu', off: [0, 2, -6] }, fov: 46, fov2: 40, ease: 'inOut' },
        say: { who: 'supreme_kai', line: 'Down. They have stopped.', duration: 2.4, style: 'quiet' },
        hold: 3.2,
      },
      // the hatch opens and a very small man comes out of it
      {
        call: (ctx) => {
          show('babidi')(ctx);
          show('dabura')(ctx);
        },
        pose: [
          { who: 'babidi', pose: 'bb_cackle', face: 'grin', speed: 4 },
          { who: 'dabura', pose: 'db_idle', face: 'smirk', speed: 2 },
        ],
        sfx: { name: 'rumble', vol: 0.7, pitch: 0.7 },
        // a three-quarter view from between his two servants, the demon king behind him
        cam: { from: { at: 'babidi', local: [1.6, 0.8, 3.4] }, to: { at: 'babidi', local: [1.2, 0.6, 2.6] }, look: { at: 'babidi', off: [0.8, 0.6, -0.3] }, fov: 48, fov2: 44 },
        say: { who: 'babidi', line: 'Well? Did you bring me the energy? Show me, show me.', duration: 3.4 },
        hold: 3.6,
      },
      {
        pose: [{ who: 'yamu', pose: 'blastR', face: 'grin', speed: 3 }],
        cam: { from: { at: 'yamu', local: [0.8, 0.45, 2.4] }, look: { at: 'yamu', off: [0, 0.4, 0] }, fov: 36 },
        say: { who: 'yamu', line: 'Every drop of it, master. From a Super Saiyan.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      // and what he does with people he no longer needs
      {
        pose: [{ who: 'babidi', pose: 'bb_cast', face: 'angry', speed: 6 }],
        cam: { from: { at: 'babidi', local: [0.8, 0.3, 2] }, look: { at: 'babidi', off: [0, 0.5, 0] }, fov: 34 },
        say: { who: 'babidi', line: 'Good. Then I have no more use for you. Paparapapa!', duration: 3, style: 'shout' },
        hold: 2.2,
      },
      {
        call: (ctx) => {
          const sp = ctx.cast.spopovich;
          if (!sp) return;
          ctx.b.vfx.explosion(sp.chest(), 2.2, 0x9aff6a, { smoke: true });
          sp.setHidden(true);
          sp.alive = false;
        },
        screen: { flash: 0.6, color: '#d8ffb0' },
        sfx: { name: 'explosionBig', vol: 1.1, pitch: 1.1 },
        shake: { at: { at: 'yamu' }, amount: 0.5 },
        cam: { from: { at: 'yamu', off: [6, 3, 7] }, look: { at: 'yamu', off: [-1.6, 0.4, 0] }, fov: 46 },
        hold: 1.8,
      },
      {
        pose: [{ who: 'dabura', pose: 'blastR', face: 'smirk', speed: 8 }],
        call: (ctx) => {
          const y = ctx.cast.yamu;
          if (!y) return;
          ctx.b.vfx.explosion(y.chest(), 2, 0xff6a3a, { smoke: true });
          y.setHidden(true);
          y.alive = false;
        },
        sfx: { name: 'kiBlastBig', who: 'dabura', vol: 1 },
        cam: { from: { at: 'dabura', local: [1.4, 0.5, 3] }, look: { at: 'dabura', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'dabura', line: 'And the other one, master?', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
      // the watchers on the ridge; the demon king looks straight at them
      {
        pose: [
          { who: 'kai', pose: 'sk_point', face: 'shock', speed: 3 },
          { who: 'piccolo', pose: 'armsCrossed', face: 'angry', speed: 2 },
        ],
        cam: { from: { at: 'kai', local: [1.8, 0.6, 3.6] }, look: { at: 'kai', off: [1.2, 0.3, -1] }, fov: 44 },
        say: { who: 'supreme_kai', line: 'Dabura. The king of the Demon Realm, under the mark. Whatever you do — do not let him spit on you.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
      // too late for two of them
      {
        pose: [{ who: 'dabura', pose: 'db_spit', face: 'smirk', speed: 8 }],
        sfx: { name: 'guardBreak', who: 'dabura', vol: 0.8, pitch: 0.6 },
        cam: { from: { at: 'dabura', local: [0.7, 0.3, 2] }, look: { at: 'dabura', off: [0, 0.5, 0] }, fov: 34 },
        hold: 1.2,
      },
      {
        call: (ctx) => {
          const d = ctx.cast.dabura;
          for (const k of ['piccolo', 'krillin']) {
            const f = ctx.cast[k];
            if (!f) continue;
            // the spit itself, crossing the crater
            if (d) for (let i = 0; i <= 16; i++) ctx.b.vfx.trail(d.chest().lerp(f.chest(), i / 16), 0xd8d0b8, 0.22, 0.45);
            ctx.b.vfx.dust(f.pos, 1.2, 8, 0x9a948a);
            f.setState('held', { frames: 999999, stone: { frames: 999999, mash: 0 } });
            if (f.model.setStone) f.model.setStone(true);
          }
        },
        sfx: { name: 'rockBreak', vol: 0.8, pitch: 0.8 },
        // from the ship's side, so both statues face the camera
        cam: { from: { at: 'piccolo', local: [1.4, 0.5, 3.6] }, look: { at: 'piccolo', off: [0.6, 0.1, 0] }, fov: 40 },
        say: { who: 'goku', line: 'Piccolo! Krillin! They are... stone.', duration: 3, style: 'shout' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'babidi', pose: 'bb_cackle', face: 'grin', speed: 5 }],
        cam: { from: { at: 'babidi', local: [0.9, 0.35, 2.4] }, look: { at: 'babidi', off: [0, 0.55, 0] }, fov: 36 },
        say: { who: 'babidi', line: 'Come inside, then. Each floor has something waiting. Hohoho.', duration: 3.4 },
        hold: 3.6,
      },
    ],
    end(ctx) {
      for (const k of ['spopovich', 'yamu']) {
        const f = ctx.cast[k];
        if (f) {
          f.setHidden(true);
          f.alive = false;
        }
      }
      for (const k of ['piccolo', 'krillin']) {
        const f = ctx.cast[k];
        if (f && f.state !== 'held') {
          f.setState('held', { frames: 999999, stone: { frames: 999999, mash: 0 } });
          if (f.model.setStone) f.model.setStone(true);
        }
      }
      ctx.m.flags.shipReached = true;
      ctx.m.flags.petrified = ['piccolo', 'krillin'];
    },
    clearMood: false,
  };

  /* ------------------------------------------------------------ the floors */

  S.zoon_enter = {
    id: 'zoon_enter',
    cast,
    music: { song: 'battle', level: 3 },
    events: [
      {
        screen: { flash: 0.7, color: '#ffd0a0' },
        cam: { from: { at: 'vegeta', off: [9, 4, 9] }, to: { at: 'vegeta', off: [6, 3, 6] }, look: { at: 'vegeta', off: [0, 0.5, -3] }, fov: 50, fov2: 44 },
        say: { who: 'babidi', line: 'Welcome to Planet Zoon! Ten times the gravity of your little Earth.', duration: 3.8 },
        hold: 4,
      },
      {
        call: show('puipui'),
        pose: [{ who: 'puipui', pose: 'idle', face: 'smirk', speed: 2 }],
        cam: { from: { at: 'puipui', local: [0.9, 0.45, 2.6] }, look: { at: 'puipui', off: [0, 0.45, 0] }, fov: 38 },
        say: { who: 'pui_pui', line: 'Here you will be slow, and heavy, and I will not.', duration: 3.2 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 2 }],
        cam: { from: { at: 'vegeta', local: [0.7, 0.4, 2] }, look: { at: 'vegeta', off: [0, 0.45, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'Ten times? I have trained at far worse than this. Kakarot — this one is mine.', duration: 3.8, style: 'quiet' },
        hold: 4,
      },
    ],
    end(ctx) {
      ctx.m.flags.zoonEntered = true;
    },
  };

  /**
   * IT WAS NEVER A CONTEST. Vegeta is simply in front of him — no Super Saiyan, no wind-up — both
   * palms flat on Pui Pui's chest. A beat in which Pui Pui understands. Then the blast, point
   * blank, and there is nothing left of him but dust drifting in ten times gravity.
   */
  S.puipui_end = {
    id: 'puipui_end',
    cast,
    music: { song: null, level: 0 },
    events: [
      // he closes the distance faster than the eye
      {
        call: (ctx) => {
          const v = ctx.cast.vegeta, p = ctx.cast.puipui, b = ctx.b;
          if (!v || !p) return;
          b.vfx.afterimage(v.pos, v.height, 0xffffff);
          b.sfx('vanish', v);
          v.intangible = p.intangible = true;
          const at = p.pos.clone().addScaledVector(p.forward, 0.95);
          at.y = b.stage.hasGround ? b.stage.heightAt(at.x, at.z) : at.y;
          v.setPosition(at);
          v.grounded = true;
          v.yaw = v.prevYaw = Math.atan2(p.pos.x - v.pos.x, p.pos.z - v.pos.z);
          p.yaw = p.prevYaw = Math.atan2(v.pos.x - p.pos.x, v.pos.z - p.pos.z);
        },
        pose: [
          { who: 'vegeta', pose: 'v_twoPalms', face: 'smirk', speed: 30 },
          { who: 'puipui', pose: 'hitBody', face: 'shock', speed: 20 },
        ],
        cam: { from: { at: 'vegeta', local: [2.6, 0.35, 0.5] }, look: { at: 'vegeta', local: [0, 0.3, 0.5] }, fov: 40 },
        hold: 0.7,
      },
      // the beat in which he understands
      {
        pose: [{ who: 'puipui', pose: 'idle', face: 'shock', speed: 6 }],
        // over Vegeta's shoulder onto the face that has just understood
        cam: { from: { at: 'vegeta', local: [0.55, 0.62, -0.95] }, look: { at: 'puipui:head' }, fov: 34 },
        say: { who: 'pui_pui', line: 'W-wait—', duration: 1.2, style: 'quiet' },
        hold: 1.2,
      },
      {
        cam: { from: { at: 'puipui', local: [-0.85, 0.7, -1.1] }, look: { at: 'vegeta:head' }, fov: 34 },
        say: { who: 'vegeta', line: 'Goodbye.', duration: 1.2, style: 'quiet' },
        hold: 1.2,
      },
      // point blank
      {
        call: (ctx) => {
          const p = ctx.cast.puipui, v = ctx.cast.vegeta, b = ctx.b;
          if (!p || !v) return;
          const c = p.chest();
          b.vfx.flash(c, 5, 0xfff4c0, 0.4, SL.Toon.tex.glow);
          b.vfx.explosion(c.clone().addScaledVector(v.forward, 1.4), 5, 0xffe27a, { smoke: false });
          b.vfx.ring(c, 6, 0xffe27a, 0.5);
          // what is left of him: dust, blown away from the palms
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            const d = v.forward.clone().multiplyScalar(9 + (i % 4) * 2).add(new V3(Math.cos(a) * 2.5, 1.5 + (i % 3), Math.sin(a) * 2.5));
            b.vfx.rock(c.clone(), d, 0.06 + (i % 3) * 0.03, 0xc8a8ff);
          }
          p.setHidden(true);
          p.alive = false;
          b.cameraTraumaAt(c, 0.7);
          b.emit('puipuiVaporized', { by: v });
        },
        pose: [{ who: 'vegeta', pose: 'v_twoPalms', face: 'smirk', speed: 30 }],
        screen: { flash: 0.5, color: '#fff4c0' },
        sfx: { name: 'explosionBig', vol: 1.1 },
        cam: { from: { at: 'vegeta', local: [3.4, 0.8, -1.6] }, look: { at: 'vegeta', local: [0, 0.4, 1.8] }, fov: 46 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'smirk', speed: 5 }],
        cam: { from: { at: 'vegeta', local: [0.9, 0.35, 2.4] }, look: { at: 'vegeta:head' }, fov: 36 },
        say: { who: 'vegeta', line: 'Ten times gravity. Was that supposed to slow me down? Next.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const p = ctx.cast.puipui;
      if (p) {
        p.setHidden(true);
        p.alive = false;
      }
      if (ctx.cast.vegeta) ctx.cast.vegeta.intangible = false;
      ctx.m.flags.puipuiDone = true;
      ctx.m.flags.puipuiPointBlank = true;
    },
  };

  S.dark_enter = {
    id: 'dark_enter',
    cast,
    music: { song: null, level: 0 },
    events: [
      {
        mood: { amount: 0.55, color: 0x05050c, seconds: 1.2 },
        cam: { from: { at: 'goku', off: [5, 2.4, 6] }, look: { at: 'goku', off: [0, 0.4, -4] }, fov: 48 },
        say: { who: 'goku', line: 'The lights went out. There is something here with us.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        call: show('yakon'),
        pose: [{ who: 'yakon', pose: 'sp_idle', face: 'grin', speed: 2 }],
        cam: { from: { at: 'yakon', local: [0.8, 0.5, 2.8] }, look: { at: 'yakon', off: [0, 0.5, 0] }, fov: 38 },
        say: { who: 'babidi', line: 'Yakon comes from a world with no light. He eats it. Go on — glow for him, Saiyan.', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.darkEntered = true;
    },
    clearMood: false,
  };

  S.yakon_end = {
    id: 'yakon_end',
    cast,
    music: { song: null, level: 0 },
    events: [
      {
        screen: { flash: 0.8, color: '#fff4c0' },
        sfx: { name: 'explosionHuge', vol: 1, pitch: 1.2 },
        cam: { from: { at: 'goku', off: [5, 2.2, 6] }, look: { at: 'goku', off: [0, 0.6, -4] }, fov: 48 },
        say: { who: 'goku', line: 'I told you. More than you could eat.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.yakonDone = true;
    },
  };

  S.dabura_enter = {
    id: 'dabura_enter',
    cast,
    music: { song: 'ominous', level: 4 },
    events: [
      {
        mood: { amount: 0.2, color: 0x3a0a0a, seconds: 1 },
        cam: { from: { at: 'gohan', off: [10, 5, 12] }, to: { at: 'gohan', off: [7, 3.5, 9] }, look: { at: 'gohan', off: [0, 0.6, -6] }, fov: 52, fov2: 46, ease: 'inOut' },
        hold: 3,
      },
      {
        call: show('dabura'),
        pose: [{ who: 'dabura', pose: 'db_idle', face: 'smirk', speed: 2 }],
        cam: { from: { at: 'dabura', local: [1.1, 0.5, 3.2] }, to: { at: 'dabura', local: [0.8, 0.45, 2.5] }, look: { at: 'dabura', off: [0, 0.45, 0] }, fov: 40, fov2: 36 },
        say: { who: 'dabura', line: 'My own realm. I would rather do this here than anywhere. Which of you is first?', duration: 4, style: 'quiet' },
        hold: 4.2,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_fight', face: 'angry', speed: 3 }],
        cam: { from: { at: 'gohan', local: [0.7, 0.4, 2] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 34 },
        say: { who: 'adult_gohan', line: 'Me. For Piccolo, and for Krillin.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.daburaEntered = true;
    },
    clearMood: false,
  };

  S.dabura_recalled = {
    id: 'dabura_recalled',
    cast,
    music: { song: null, level: 0 },
    events: [
      {
        pose: [
          { who: 'babidi', pose: 'bb_cast', face: 'angry', speed: 5 },
          { who: 'dabura', pose: 'db_idle', face: 'angry', speed: 2 },
        ],
        cam: { from: { at: 'babidi', local: [1.2, 0.6, 3.2] }, look: { at: 'babidi', off: [0, 0.55, 0] }, fov: 38 },
        say: { who: 'babidi', line: 'Dabura, stop. Stop! The boy is too strong for you — and I have found something better.', duration: 4.2, style: 'shout' },
        hold: 4.4,
      },
      // what he found: the proud one, watching, with darkness in his heart
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 2 }],
        mood: { amount: 0.45, color: 0x1a0612, seconds: 1 },
        cam: { from: { at: 'vegeta', local: [0.6, 0.35, 1.9] }, to: { at: 'vegeta', local: [0.45, 0.35, 1.5] }, look: { at: 'vegeta', off: [0, 0.42, 0] }, fov: 34, fov2: 28 },
        say: { who: 'babidi', line: 'You. The proud one. So much anger... and a heart that is not so pure after all. Hohoho.', duration: 4.6, style: 'quiet' },
        hold: 4.8,
      },
      {
        pose: [{ who: 'vegeta', pose: 'powerCrouch', face: 'grit', speed: 4 }],
        sfx: { name: 'heartbeat', who: 'vegeta', vol: 0.8, pitch: 0.8 },
        cam: { from: { at: 'vegeta', local: [1.4, 0.2, 2.8] }, look: { at: 'vegeta', off: [0, 0.3, 0] }, fov: 40 },
        say: { who: 'vegeta', line: 'Get... out of my head, wizard.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.babidiFoundVegeta = true;
    },
    clearMood: false,
  };
})();
