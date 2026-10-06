/*
 * SCENES — Chapter 8, the 25th World Martial Arts Tournament (Age 774).
 *
 *   flight_lesson     Gohan explains flying the only way he can: by doing it
 *   flight_after      she can fly; Goten can too, and it took him one try
 *   junior_open       the stadium, the crowd, a man who has been dead seven years, and the son
 *                     he has never met (behind Chi-Chi, then in his arms)
 *   junior_pact       no Super Saiyan — and one hand behind Trunks' back
 *   junior_breakfree  the sleeper hold, broken the only way Goten had left
 *   junior_twohands   afterwards, on the grass: an argument between champions of the rules
 *   junior_after      the champion explains what just happened to him
 *   piccolo_forfeits  Piccolo walks into the ring, looks at "Shin", and walks out
 *   spopovich_regrows the kick that turns his head all the way round — and his hands turning it back
 *   spopovich_cruelty kneeling on her; Gohan on the ring's edge; Yamu calls him off
 *   kibito_asks       "Show me your full power"
 *   kai_reveal        the god in the tournament, and the wizard he came to stop
 *
 * Dialogue is paraphrased English written for this project; no Japanese line is
 * claimed. The announcer's match calls come from SL.Tournament, not from here.
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
    if (f) {
      f.setHidden(false);
      f.untargetable = true;
    }
  };

  /* ------------------------------------------------------------ the lesson */

  S.flight_lesson = {
    id: 'flight_lesson',
    cast,
    music: { song: 'farewell', level: 2 },
    events: [
      {
        pose: [
          { who: 'videl', pose: 'vd_arms', face: 'angry', speed: 3 },
          { who: 'gohan', pose: 'ag_idle', face: 'soft', speed: 2 },
        ],
        cam: { from: { at: 'videl', off: [5.5, 2.4, 4] }, to: { at: 'videl', off: [4.4, 2, 3.2] }, look: { at: 'videl', off: [-1.2, 0.2, -3.5] }, fov: 46, fov2: 42, ease: 'inOut' },
        say: { who: 'videl', line: 'You promised. Teach me to fly, or I tell the whole school who the Great Saiyaman is.', duration: 4.4 },
        hold: 4.6,
      },
      {
        cam: { from: { at: 'gohan', local: [0.9, 0.4, 2.4] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 38 },
        say: { who: 'adult_gohan', line: 'Right. First you have to feel your ki. It is in you already — gather it, then push it down.', duration: 4.4, style: 'quiet' },
        hold: 4.6,
      },
      // he just does it: up off the grass, no fuss
      {
        call: (ctx) => {
          const g = ctx.cast.gohan;
          if (g) g.grounded = false;
        },
        move: { who: 'gohan', at: 'gohan', off: [0, 1.6, 0], seconds: 1.4, ground: false },
        pose: [{ who: 'gohan', pose: 'flyIdle', face: 'soft', speed: 3 }],
        sfx: { name: 'kiUp', who: 'gohan', vol: 0.6, pitch: 1.3 },
        vfx: { kind: 'dust', at: { at: 'gohan', off: [0, -1.4, 0] }, radius: 1.6, count: 8 },
        cam: { from: { at: 'videl', local: [-0.8, 0.3, -1.6] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 44 },
        say: { who: 'adult_gohan', line: 'Like this. See?', duration: 2.2, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'videl', pose: 'vd_idle', face: 'angry', speed: 4 }],
        cam: { from: { at: 'videl', local: [0.7, 0.4, 2] }, look: { at: 'videl', off: [0, 0.42, 0] }, fov: 36 },
        say: { who: 'videl', line: '"Like this." Great. Very helpful.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const g = ctx.cast.gohan;
      if (g) g.setState('scripted', { pose: 'flyIdle', expression: 'soft' });
      ctx.m.flags.lessonStarted = true;
    },
  };

  S.flight_after = {
    id: 'flight_after',
    cast,
    music: { song: 'farewell', level: 3 },
    events: [
      {
        pose: [{ who: 'videl', pose: 'vd_arms', face: 'calm', speed: 3 }],
        cam: { from: { at: 'videl', local: [1, 0.5, 2.6] }, look: { at: 'videl', off: [0, 0.4, 0] }, fov: 40 },
        say: { who: 'videl', line: 'I did it. I actually did it.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // and then a seven-year-old does it on his first try
      {
        call: show('goten'),
        move: { who: 'goten', at: 'videl', off: [2.2, 2.2, -1.5], seconds: 1.6, ground: false },
        pose: [{ who: 'goten', pose: 'gt_cheer', face: 'calm', speed: 5 }],
        cam: { from: { at: 'videl', off: [4.2, 2.2, 4.2] }, look: { at: 'videl', off: [1.2, 1.2, -0.8] }, fov: 46 },
        say: { who: 'goten', line: 'Wow! Like this? This is easy!', duration: 2.6, style: 'shout' },
        hold: 2.8,
      },
      {
        pose: [{ who: 'videl', pose: 'vd_idle', face: 'angry', speed: 5 }],
        cam: { from: { at: 'videl', local: [0.6, 0.4, 1.8] }, look: { at: 'videl', off: [0, 0.42, 0] }, fov: 34 },
        say: { who: 'videl', line: 'One try. He did it in one try.', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.videlFlies = true;
    },
  };

  /* ------------------------------------------------------------ the tournament */

  S.junior_open = {
    id: 'junior_open',
    cast,
    music: { song: 'battle', level: 3 },
    events: [
      // the stadium, full
      {
        call: (ctx) => ctx.b.stage.cheer && ctx.b.stage.cheer(1),
        cam: { from: [44, 26, 44], to: [30, 16, 32], look: [0, 1, 0], fov: 54, fov2: 48, ease: 'inOut' },
        say: { who: 'announcer', line: 'Ladies and gentlemen — welcome to the Twenty-Fifth World Martial Arts Tournament!', duration: 4, style: 'shout' },
        hold: 4.2,
      },
      // by the gate: a man with a halo who has been dead for seven years
      {
        call: (ctx) => {
          show('goku')(ctx);
          const g = ctx.cast.goku;
          if (g && !ctx.b.story.gokuHalo) ctx.b.story.gokuHalo = SL.Cinema.halo(ctx.b, g);
        },
        pose: [{ who: 'goku', pose: 'idle', face: 'soft', speed: 2 }],
        cam: { from: { at: 'goku', local: [-2.6, 0.6, 2.4] }, to: { at: 'goku', local: [-2, 0.5, 1.9] }, look: { at: 'goku', off: [0, 0.5, 0] }, fov: 42, fov2: 38 },
        say: { who: 'goku', line: 'One day back on Earth. I was not going to miss this.', duration: 3.4, style: 'quiet' },
        hold: 3.6,
      },
      // Chi-Chi, and a small boy with his father's hair who will not come out from behind her
      {
        call: (ctx) => {
          show('chichi')(ctx);
          show('goten')(ctx);
          for (const k of ['goten', 'goku', 'chichi']) if (ctx.cast[k]) ctx.cast[k].intangible = true;
        },
        pose: [
          { who: 'chichi', pose: 'cc_idle', face: 'soft', speed: 2 },
          { who: 'goten', pose: 'gt_shy', face: 'shock', speed: 3 },
        ],
        cam: { from: { at: 'goku', local: [-1.1, 0.6, -2.2] }, look: { at: 'chichi', off: [0.3, -0.15, 0] }, fov: 40 },
        say: { who: 'chichi', line: 'Goku... this is Goten. Your son.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        cam: { from: { at: 'goten', local: [-0.9, 0.1, 1.9] }, look: { at: 'goten:head' }, fov: 34 },
        hold: 1.8,
      },
      // his father goes down on one knee, arms open
      {
        pose: [{ who: 'goku', pose: 'g_kneelOpen', face: 'soft', speed: 4 }],
        cam: { from: { at: 'goku', local: [1.4, 0.2, 2.2] }, look: { at: 'goku', off: [0, -0.1, 0] }, fov: 38 },
        say: { who: 'goku', line: 'Hey, Goten. Wow — you look just like me.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goten', pose: 'gt_idle', face: 'soft', speed: 3 }],
        cam: { from: { at: 'goten', local: [-0.8, 0.1, 1.6] }, look: { at: 'goten:head' }, fov: 32 },
        say: { who: 'goten', line: '...Dad?', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      // and he runs, and jumps, and his father catches him
      {
        call: (ctx) => {
          const g = ctx.cast.goten;
          if (!g) return;
          ctx.leapFrom = g.pos.clone();
          g.grounded = false;
        },
        tick: (ctx, s) => {
          const g = ctx.cast.goten, k = ctx.cast.goku;
          if (!g || !k || !ctx.leapFrom) return;
          const to = k.pos.clone().addScaledVector(k.forward, 0.3).add(new V3(0, 0.5, 0));
          const u = Math.min(1, s / 0.85);
          const p = ctx.leapFrom.clone().lerp(to, u);
          p.y += Math.sin(u * Math.PI) * 1.1;
          g.setPosition(p);
          g.yaw = g.prevYaw = Math.atan2(k.pos.x - g.pos.x, k.pos.z - g.pos.z);
        },
        pose: [
          { who: 'goten', pose: 'gt_leap', face: 'grin', speed: 12 },
          { who: 'goku', pose: 'g_holdKid', face: 'grin', speed: 6 },
        ],
        sfx: { name: 'jump', who: 'goten', vol: 0.7, pitch: 1.4 },
        cam: { from: { at: 'goku', local: [2.6, 0.9, 1.6] }, look: { at: 'goku', off: [0, 0.3, 0.8] }, fov: 44 },
        hold: 0.95,
      },
      {
        tick: (ctx) => {
          const g = ctx.cast.goten, k = ctx.cast.goku;
          if (!g || !k) return;
          g.setPosition(k.pos.clone().addScaledVector(k.forward, 0.3).add(new V3(0, 0.5, 0)));
          g.vel.set(0, 0, 0);
          g.grounded = false;
          g.yaw = g.prevYaw = Math.atan2(k.pos.x - g.pos.x, k.pos.z - g.pos.z);
        },
        pose: [{ who: 'goten', pose: 'gt_hug', face: 'grin', speed: 8 }],
        cam: { from: { at: 'goku', local: [1.3, 0.55, 2.4] }, to: { at: 'goku', local: [1, 0.5, 1.9] }, look: { at: 'goku', off: [0, 0.55, 0] }, fov: 38, fov2: 36 },
        say: { who: 'goku', line: 'Ha ha! Nice to finally meet you, son.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      {
        pose: [{ who: 'chichi', pose: 'cc_idle', face: 'soft', speed: 2 }],
        cam: { from: { at: 'chichi', local: [0.7, 0.35, 1.9] }, look: { at: 'chichi', off: [0, 0.42, 0] }, fov: 34 },
        say: { who: 'chichi', line: 'Seven years, Goku. Seven years.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        pose: [
          { who: 'trunks', pose: 'kt_smug', face: 'angry', speed: 3 },
        ],
        cam: { from: { at: 'trunks', local: [0.9, 0.25, 2.3] }, look: { at: 'trunks:head' }, fov: 38 },
        say: { who: 'kid_trunks', line: 'Hey, Goten! Junior division is ours. And if we meet in the final — no holding back.', duration: 3.8 },
        hold: 4,
      },
    ],
    end(ctx) {
      // back on his own feet, next to his father
      const g = ctx.cast.goten, k = ctx.cast.goku;
      if (g && k) {
        const p = k.pos.clone().addScaledVector(new V3(k.forward.z, 0, -k.forward.x), 0.8);
        p.y = ctx.b.stage.heightAt(p.x, p.z);
        g.setPosition(p);
        g.grounded = true;
        g.setState('scripted', { pose: 'gt_idle', expression: 'calm' });
      }
      for (const k of ['goten', 'goku', 'chichi']) if (ctx.cast[k]) ctx.cast[k].intangible = false;
      ctx.m.flags.tournamentOpened = true;
      ctx.m.flags.gotenMetGoku = true;
    },
  };

  /** On the ring, before the final: two boys making up the rules of their own fight. */
  S.junior_pact = {
    id: 'junior_pact',
    cast,
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'goten', pose: 'gt_idle', face: 'calm', speed: 3 },
          { who: 'trunks', pose: 'kt_idle', face: 'calm', speed: 3 },
        ],
        call: (ctx) => {
          const t = ctx.cast.trunks, g = ctx.cast.goten;
          if (!t || !g) return;
          const s = SL.Cinema.twoShot(t, g, { fov: 40, height: 0.4, lookUp: 0.1, minDist: 3.2, pad: 1 });
          ctx.twoShot = s;
        },
        cam: { from: { at: 'goten', local: [0.9, 0.2, 2.2] }, look: { at: 'goten:head' }, fov: 36 },
        say: { who: 'goten', line: 'Trunks — no Super Saiyan, okay? Mom says it\'s cheating.', duration: 3.4 },
        hold: 3.6,
      },
      // one hand goes behind his back, and stays there
      {
        call: (ctx) => {
          const t = ctx.cast.trunks;
          if (t && SL.data.juniorFinal) SL.data.juniorFinal.oneArm(t, true);
        },
        pose: [{ who: 'trunks', pose: 'kt_smug', face: 'grin', speed: 4 }],
        cam: { from: { at: 'trunks', local: [1.1, 0.2, 1.8] }, look: { at: 'trunks', off: [0, 0.2, 0] }, fov: 38 },
        say: { who: 'kid_trunks', line: 'Fine by me. I\'ll even do it with one hand.', duration: 2.8 },
        hold: 3,
      },
      {
        pose: [{ who: 'goten', pose: 'gt_idle', face: 'angry', speed: 4 }],
        cam: { from: { at: 'goten', local: [0.6, 0.1, 1.5] }, look: { at: 'goten:head' }, fov: 32 },
        say: { who: 'goten', line: 'One hand?! You\'re gonna be sorry!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const t = ctx.cast.trunks, g = ctx.cast.goten;
      if (t && SL.data.juniorFinal) SL.data.juniorFinal.oneArm(t, true);
      if (t) t.setState('scripted', { pose: 'kt_idle', expression: 'grin' });
      if (g) g.setState('scripted', { pose: 'gt_idle', expression: 'angry' });
      ctx.m.flags.pact = true;
    },
  };

  /** The sleeper hold, broken the only way Goten had left. */
  S.junior_breakfree = {
    id: 'junior_breakfree',
    cast,
    music: { song: 'battle', level: 5 },
    events: [
      {
        call: (ctx) => {
          const g = ctx.cast.goten, t = ctx.cast.trunks, b = ctx.b;
          if (!g || !t) return;
          const i = g.def.forms.findIndex((f) => f.id === 'ssj');
          if (g.lockedForms) delete g.lockedForms.ssj;
          if (i > 0 && g.formIndex !== i) g.applyForm(i);
          b.vfx.ring(g.pos.clone().add(new V3(0, 0.3, 0)), 7, 0xffd33a, 0.5, new V3(0, 1, 0));
          b.vfx.flash(g.chest(), 4, 0xffe060, 0.4, SL.Toon.tex.glow);
          b.vfx.dust(g.pos, 1.6, 8, b.stage.def.arena ? b.stage.def.arena.dust : undefined);
          b.cameraTraumaAt(g.chest(), 0.7);
          // the burst throws Trunks off his back
          const away = t.pos.clone().sub(g.pos).setY(0);
          if (away.lengthSq() < 0.001) away.set(0, 0, 1);
          away.normalize();
          const A = b.stage.arena, lim = A.half - 1.5;
          const p = g.pos.clone().addScaledVector(away, 3.2);
          t.setPosition(new V3(SL.util.clamp(p.x, -lim, lim), A.y, SL.util.clamp(p.z, -lim, lim)));
          t.yaw = t.prevYaw = Math.atan2(g.pos.x - t.pos.x, g.pos.z - t.pos.z);
          g.yaw = g.prevYaw = Math.atan2(t.pos.x - g.pos.x, t.pos.z - g.pos.z);
          if (b.stage.cheer) b.stage.cheer(1);
          if (b.stage.gasp) b.stage.gasp(1);
        },
        pose: [
          { who: 'goten', pose: 'powerUp', face: 'shout', speed: 18 },
          { who: 'trunks', pose: 'hitHeavy', face: 'shock', speed: 20 },
        ],
        sfx: { name: 'transformBurst', who: 'goten', vol: 1 },
        screen: { flash: 0.6, color: '#fff2b0' },
        cam: { from: { at: 'goten', local: [3.4, 0.6, 3.6] }, look: { at: 'goten', off: [0, 0.3, 0] }, fov: 50 },
        hold: 1.7,
      },
      {
        pose: [{ who: 'trunks', pose: 'kt_idle', face: 'angry', speed: 6, aura: 0 }],
        cam: { from: { at: 'trunks', local: [0.7, 0.2, 1.7] }, look: { at: 'trunks:head' }, fov: 34 },
        say: { who: 'kid_trunks', line: 'HEY! We said no Super Saiyan!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goten', pose: 'gt_idle', face: 'angry', speed: 5, aura: 0.12 }],
        cam: { from: { at: 'goten', local: [0.7, 0.2, 1.7] }, look: { at: 'goten:head' }, fov: 34 },
        say: { who: 'goten', line: 'You were choking me! That\'s not fair either!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'trunks', pose: 'kt_smug', face: 'grin', speed: 4 }],
        cam: { from: { at: 'trunks', local: [1, 0.3, 2.2] }, look: { at: 'trunks', off: [0, 0.2, 0] }, fov: 38 },
        say: { who: 'kid_trunks', line: 'Fine. Then I don\'t have to hold back either.', duration: 2.6 },
        hold: 2.8,
      },
    ],
    end(ctx) {
      const g = ctx.cast.goten;
      if (g) {
        const i = g.def.forms.findIndex((f) => f.id === 'ssj');
        if (g.lockedForms) delete g.lockedForms.ssj;
        if (i > 0 && g.formIndex !== i) g.applyForm(i);
        g.setState('scripted', { pose: 'gt_idle', expression: 'angry' });
      }
      ctx.m.flags.gotenBrokePact = true;
    },
  };

  /** Afterwards, on the grass: an argument between champions of the rules. */
  S.junior_twohands = {
    id: 'junior_twohands',
    cast,
    music: { song: 'battle', level: 2 },
    events: [
      {
        // on the grass where he landed, facing the ring he was just blown off: filmed from beside him,
        // low, the ring's edge and the champion above it behind him
        call: (ctx) => {
          const g = ctx.cast.goten;
          if (!g) return;
          const out = g.pos.clone().setY(0);
          if (out.lengthSq() < 0.01) out.set(0, 0, 1);
          out.normalize();
          const side = new V3(out.z, 0, -out.x);
          g.yaw = g.prevYaw = Math.atan2(-out.x, -out.z);
          const cam = (k, s) => {
            const p = g.pos.clone().addScaledVector(side, s).addScaledVector(out, k);
            p.y = ctx.b.stage.heightAt(p.x, p.z) + 0.75;
            return { pos: p };
          };
          ctx.cast.gotenCamA = cam(0.9, 2.1);
          ctx.cast.gotenCamB = cam(0.5, -1.6);
        },
        pose: [{ who: 'goten', pose: 'gt_sit', face: 'angry', speed: 4, aura: 0 }],
        cam: { from: { at: 'gotenCamA' }, look: { at: 'goten:head' }, fov: 40 },
        say: { who: 'goten', line: 'Hey! That was TWO hands! You said one!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'trunks', pose: 'kt_smug', face: 'grin', speed: 4, aura: 0 }],
        cam: { from: { at: 'trunks', local: [0.8, 0.25, 1.8] }, look: { at: 'trunks:head' }, fov: 34 },
        say: { who: 'kid_trunks', line: 'You went Super Saiyan first. That cancels it.', duration: 2.8 },
        hold: 3,
      },
      {
        pose: [{ who: 'goten', pose: 'gt_sit', face: 'calm', speed: 4, aura: 0 }],
        cam: { from: { at: 'gotenCamB' }, look: { at: 'goten:head' }, fov: 36 },
        say: { who: 'goten', line: '...Does it?', duration: 1.8, style: 'quiet' },
        hold: 2,
      },
      {
        call: (ctx) => ctx.b.stage.cheer && ctx.b.stage.cheer(1),
        cam: { from: [18, 9, 20], look: [0, 1.4, 0], fov: 50 },
        say: { who: 'kid_trunks', line: 'It does now!', duration: 2, style: 'shout' },
        hold: 2.2,
      },
    ],
    end(ctx) {
      ctx.m.flags.twoHandsArgued = true;
    },
  };

  S.junior_after = {
    id: 'junior_after',
    cast,
    music: { song: 'battle', level: 2 },
    events: [
      {
        pose: [{ who: 'satan', pose: 'ms_panic', face: 'shock', speed: 4 }],
        cam: { from: { at: 'satan', local: [1, 0.5, 2.6] }, look: { at: 'satan', off: [0, 0.45, 0] }, fov: 40 },
        say: { who: 'mr_satan', line: 'Ha — HA HA! I let the boy win, of course! Somebody has to encourage the young ones!', duration: 4.2, style: 'shout' },
        hold: 4.4,
      },
      {
        call: (ctx) => ctx.b.stage.cheer && ctx.b.stage.cheer(1),
        pose: [{ who: 'satan', pose: 'ms_peace', face: 'grin', speed: 4 }],
        cam: { from: [16, 7, 18], look: [0, 1.4, 0], fov: 48 },
        say: { who: 'announcer', line: 'What a champion! What generosity!', duration: 2.8, style: 'shout' },
        hold: 3,
      },
      {
        pose: [{ who: 'trunks', pose: 'kt_smug', face: 'angry', speed: 3 }],
        cam: { from: { at: 'trunks', local: [0.7, 0.3, 1.8] }, look: { at: 'trunks', off: [0, 0.3, 0] }, fov: 36 },
        say: { who: 'kid_trunks', line: '...Adults are weird.', duration: 2.2, style: 'quiet' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      ctx.m.flags.juniorsDone = true;
    },
  };

  S.piccolo_forfeits = {
    id: 'piccolo_forfeits',
    cast,
    music: { song: 'battle', level: 2 },
    events: [
      {
        pose: [
          { who: 'piccolo', pose: 'armsCrossed', face: 'calm', speed: 2 },
          { who: 'kai', pose: 'sk_idle', face: 'calm', speed: 1 },
        ],
        cam: { from: [11, 3.2, 1.5], to: [9, 2.8, 1], look: [0, 2, 0], fov: 44, fov2: 40 },
        hold: 2.6,
      },
      {
        cam: { from: { at: 'piccolo', local: [0.7, 0.45, 2] }, look: { at: 'piccolo', off: [0, 0.45, 0] }, fov: 34 },
        sfx: { name: 'heartbeat', who: 'piccolo', vol: 0.5, pitch: 0.9 },
        say: { who: 'piccolo', line: '...No. I know what you are. I forfeit.', duration: 3.2, style: 'quiet' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'kai', pose: 'sk_halt', face: 'calm', speed: 2 }],
        cam: { from: { at: 'kai', local: [0.7, 0.3, 2] }, look: { at: 'kai', off: [0, 0.4, 0] }, fov: 34 },
        say: { who: 'shin', line: 'Thank you. You will understand soon.', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      ctx.m.flags.piccoloForfeited = true;
    },
  };

  /**
   * THE HIT THAT SHOULD HAVE ENDED IT. Her kick lands on the side of his head and his head goes
   * all the way round. The stadium goes quiet. Then he reaches up, takes hold of it with both
   * hands, and turns it back — with a crack everybody hears — and he is smiling. (Shown, not
   * dwelt on: no blood, the camera never lingers on the neck itself.)
   */
  S.spopovich_regrows = {
    id: 'spopovich_regrows',
    cast,
    music: { song: null, level: 0 },
    events: [
      // the kick, in the air, at the moment it lands
      {
        call: (ctx) => {
          const v = ctx.cast.videl, s = ctx.cast.spopovich;
          if (!v || !s) return;
          const p = s.pos.clone().addScaledVector(s.forward, 1.05).add(new V3(0.25, s.height * 0.62, 0));
          v.intangible = s.intangible = true;
          v.setPosition(p);
          v.grounded = false;
          v.yaw = v.prevYaw = Math.atan2(s.pos.x - v.pos.x, s.pos.z - v.pos.z);
        },
        pose: [
          { who: 'videl', pose: 'vd_eagle', face: 'shout', speed: 30 },
          { who: 'spopovich', pose: 'hitSideL', face: 'grin', speed: 30 },
        ],
        sfx: { name: 'punchHeavy', who: 'spopovich', vol: 1.2, pitch: 0.85 },
        slow: { scale: 0.2, seconds: 0.7 },
        shake: { at: { at: 'spopovich' }, amount: 0.5 },
        cam: { from: { at: 'spopovich', local: [2.6, 0.9, 0.6] }, look: { at: 'spopovich:head' }, fov: 40 },
        hold: 0.9,
      },
      // his head is facing the wrong way, and the whole stadium can see it
      {
        call: (ctx) => {
          const v = ctx.cast.videl, s = ctx.cast.spopovich, b = ctx.b;
          if (v && s) {
            const back = v.pos.clone().sub(s.pos).setY(0);
            if (back.lengthSq() < 0.01) back.set(0, 0, 1);
            back.normalize();
            const A = b.stage.arena, lim = A.half - 1;
            const p = s.pos.clone().addScaledVector(back, 3);
            v.setPosition(new V3(SL.util.clamp(p.x, -lim, lim), A.y, SL.util.clamp(p.z, -lim, lim)));
            v.grounded = true;
            v.yaw = v.prevYaw = Math.atan2(s.pos.x - v.pos.x, s.pos.z - v.pos.z);
          }
          b.sfx('boneCrack', s, { vol: 1 });
          if (b.stage.gasp) b.stage.gasp(1);
        },
        pose: [
          { who: 'spopovich', pose: 'sp_neckBack', face: 'grin', speed: 26 },
          { who: 'videl', pose: 'vd_idle', face: 'shock', speed: 6 },
        ],
        // from behind him: his own face looking back over his shoulders, Videl beyond him
        cam: { from: { at: 'spopovich', local: [1.3, 0.55, -2.9] }, to: { at: 'spopovich', local: [1, 0.5, -2.3] }, look: { at: 'spopovich:head' }, fov: 40 },
        say: { who: 'announcer', line: 'His neck — his NECK! Somebody get a doctor out here!', duration: 3, style: 'shout' },
        hold: 3,
      },
      {
        cam: { from: { at: 'videl:face', local: [0.15, 0.05, 1.1] }, look: { at: 'videl:head' }, fov: 32 },
        say: { who: 'videl', line: 'No... I didn\'t mean to—', duration: 2, style: 'quiet' },
        hold: 2.2,
      },
      // both hands come up, take hold of his own head...
      {
        pose: [{ who: 'spopovich', pose: 'sp_twistBack', face: 'grin', speed: 12 }],
        cam: { from: { at: 'spopovich', local: [1.2, 0.55, 2.2] }, look: { at: 'spopovich:head' }, fov: 36 },
        hold: 0.9,
      },
      // ...and turn it back
      {
        sfx: { name: 'boneCrack', who: 'spopovich', vol: 1.2, pitch: 0.8 },
        shake: { at: { at: 'spopovich' }, amount: 0.25 },
        vfx: { kind: 'stream', at: { at: 'spopovich:head' }, radius: 1.2, color: 0x9aff6a, count: 10, size: 0.12, life: 0.5 },
        hold: 1,
      },
      {
        pose: [{ who: 'spopovich', pose: 'sp_idle', face: 'grin', speed: 4 }],
        cam: { from: { at: 'spopovich:face', local: [0.1, 0.1, 1.3] }, look: { at: 'spopovich:head' }, fov: 32 },
        hold: 1.6,
      },
      // outside the ring, somebody else understands first
      {
        pose: [{ who: 'gohan', pose: 'ag_idle', face: 'shock', speed: 4 }],
        cam: { from: { at: 'gohan', local: [0.7, 0.4, 1.9] }, look: { at: 'gohan:head' }, fov: 34 },
        say: { who: 'adult_gohan', line: 'That isn\'t possible. He should be dead...', duration: 2.8, style: 'quiet' },
        hold: 3,
      },
      {
        pose: [{ who: 'videl', pose: 'vd_idle', face: 'shock', speed: 4 }],
        cam: { from: { at: 'videl', local: [0.6, 0.4, 1.8] }, look: { at: 'videl', off: [0, 0.4, 0] }, fov: 34 },
        say: { who: 'videl', line: 'That is not possible. Nobody gets up from that.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const s = ctx.cast.spopovich, v = ctx.cast.videl, b = ctx.b;
      if (v && s) {
        v.grounded = true;
        const A = b.stage.arena;
        if (v.pos.y > A.y + 0.2) v.setPosition(new V3(v.pos.x, A.y, v.pos.z));
      }
      if (v) v.intangible = false;
      if (s) {
        s.intangible = false;
        s.setState('free');
      }
      ctx.m.flags.sawRegrowth = true;
      ctx.m.flags.sawNeck = true;
    },
  };

  S.spopovich_cruelty = {
    id: 'spopovich_cruelty',
    cast,
    music: { song: null, level: 0 },
    events: [
      // she is down, and he is kneeling on her
      {
        call: (ctx) => {
          const v = ctx.cast.videl, s = ctx.cast.spopovich;
          if (v && s) {
            v.intangible = s.intangible = true;
            const side = new V3(v.forward.z, 0, -v.forward.x);
            const p = v.pos.clone().addScaledVector(side, 0.75);
            s.setPosition(new V3(p.x, v.pos.y, p.z));
            s.yaw = s.prevYaw = Math.atan2(v.pos.x - s.pos.x, v.pos.z - s.pos.z);
          }
          if (ctx.b.stage.gasp) ctx.b.stage.gasp(0.8);
        },
        pose: [
          { who: 'videl', pose: 'knockdown', face: 'hurt', speed: 3 },
          { who: 'spopovich', pose: 'sp_pin', face: 'grin', speed: 6 },
        ],
        sfx: { name: 'punchHeavy', who: 'spopovich', vol: 0.9, pitch: 0.55 },
        cam: { from: { at: 'spopovich', local: [2.6, 0.2, 2.4] }, look: { at: 'videl', off: [0, -0.3, 0] }, fov: 42 },
        say: { who: 'spopovich', line: 'Where did all that talk go? Hm?', duration: 2.6, style: 'quiet' },
        hold: 2.8,
      },
      // he leans on her
      {
        sfx: { name: 'punchHeavy', who: 'videl', vol: 0.8, pitch: 0.45 },
        shake: { at: { at: 'videl' }, amount: 0.3 },
        cam: { from: { at: 'videl:head', off: [0.9, 0.5, 0.9] }, look: { at: 'videl:head' }, fov: 34 },
        hold: 1.6,
      },
      // Gohan, at the edge of the ring, about to stop being careful
      {
        pose: [{ who: 'gohan', pose: 'ag_fight', face: 'angry', speed: 6, aura: 0.8 }],
        mood: { amount: 0.3, color: 0x201010, seconds: 0.6 },
        crack: { at: { at: 'gohan', off: [0, -0.9, 0] }, radius: 1.6, depth: 0.1 },
        cam: { from: { at: 'gohan', local: [0.6, 0.3, 1.9] }, to: { at: 'gohan', local: [0.5, 0.35, 1.5] }, look: { at: 'gohan:head' }, fov: 34, fov2: 30 },
        sfx: { name: 'kiUp', who: 'gohan', vol: 0.9, pitch: 0.8 },
        say: { who: 'adult_gohan', line: 'Stop it. STOP IT!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      // one foot on the ring
      {
        call: (ctx) => {
          const g = ctx.cast.gohan, A = ctx.b.stage.arena;
          if (!g || !A) return;
          ctx.stepFrom = g.pos.clone();
          ctx.stepTo = new V3(-A.half + 0.9, A.y, SL.util.clamp(g.pos.z, -A.half + 1, A.half - 1));
          g.grounded = false;
        },
        tick: (ctx, s) => {
          const g = ctx.cast.gohan;
          if (!g || !ctx.stepTo) return;
          const u = Math.min(1, s / 0.55);
          const p = ctx.stepFrom.clone().lerp(ctx.stepTo, u);
          p.y += Math.sin(u * Math.PI) * 0.7;
          g.setPosition(p);
          if (u >= 1) g.grounded = true;
        },
        cam: { from: { at: 'videl', off: [-6, 2.6, 5] }, look: { at: 'gohan', off: [0, 0.2, 0] }, fov: 46 },
        hold: 0.5,
      },
      // and Yamu calls him off
      {
        pose: [{ who: 'yamu', pose: 'ym_point', face: 'angry', speed: 6 }],
        cam: { from: { at: 'yamu', local: [0.8, 0.35, 2.1] }, look: { at: 'yamu:head' }, fov: 36 },
        say: { who: 'yamu', line: 'Spopovich! Enough. Don\'t waste it on her — we have real work to do.', duration: 3.4, style: 'shout' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'spopovich', pose: 'sp_idle', face: 'grin', speed: 5 }],
        cam: { from: { at: 'spopovich', local: [1, 0.3, 2.2] }, look: { at: 'spopovich:head' }, fov: 36 },
        say: { who: 'spopovich', line: '...Hn.', duration: 1.2, style: 'quiet' },
        hold: 1.3,
      },
      // he throws her out of the ring, because now he is told to
      {
        call: (ctx) => {
          const v = ctx.cast.videl, A = ctx.b.stage.arena;
          if (!v || !A) return;
          v.setPosition(v.pos.clone().setX(A.half + 3).setY(ctx.b.stage.heightAt(A.half + 3, v.pos.z)));
          v.grounded = true;
          v.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
        },
        pose: [{ who: 'spopovich', pose: 'hammer', face: 'grin', speed: 10 }],
        sfx: { name: 'punchHeavy', who: 'spopovich', vol: 1, pitch: 0.7 },
        vfx: { kind: 'dust', at: { at: 'videl' }, radius: 1.1, count: 5 },
        cam: { from: { at: 'videl', off: [5.5, 3, 4.5] }, look: { at: 'videl', off: [0, 0, 0] }, fov: 44 },
        hold: 1.8,
      },
    ],
    end(ctx) {
      const v = ctx.cast.videl;
      if (v) v.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
      for (const k of ['videl', 'spopovich']) if (ctx.cast[k]) ctx.cast[k].intangible = false;
      ctx.m.flags.videlBeaten = true;
      ctx.m.flags.yamuCalledOff = true;
    },
    clearMood: false,
  };

  S.kibito_asks = {
    id: 'kibito_asks',
    cast,
    music: { song: 'battle', level: 3 },
    events: [
      {
        pose: [
          { who: 'kibito', pose: 'kb_idle', face: 'calm', speed: 2 },
          { who: 'gohan', pose: 'ag_idle', face: 'calm', speed: 2 },
        ],
        cam: { from: { at: 'kibito', local: [0.8, 0.45, 2.4] }, look: { at: 'kibito', off: [0, 0.45, 0] }, fov: 36 },
        say: { who: 'kibito', line: 'I have no interest in fighting you. Show me your power — all of it. The golden form, and past it.', duration: 4.2, style: 'quiet' },
        hold: 4.4,
      },
      {
        cam: { from: { at: 'gohan', local: [0.7, 0.4, 2.1] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 36 },
        say: { who: 'adult_gohan', line: 'In front of all these people? ...Fine. If that is what it takes.', duration: 3.6, style: 'quiet' },
        hold: 3.8,
      },
    ],
    end(ctx) {
      ctx.m.flags.kibitoAsked = true;
    },
  };

  S.kai_reveal = {
    id: 'kai_reveal',
    cast,
    music: { song: null, level: 0 },
    events: [
      {
        call: (ctx) => {
          for (const k of ['kai', 'goku', 'vegeta', 'piccolo']) show(k)(ctx);
        },
        pose: [
          { who: 'kai', pose: 'sk_halt', face: 'calm', speed: 3 },
          { who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 2 },
        ],
        cam: { from: { at: 'kai', local: [2.4, 0.8, 4.2] }, look: { at: 'kai', off: [0, 0.3, 0] }, fov: 44 },
        say: { who: 'supreme_kai', line: 'Do not go after them. Not yet. I need them to lead us to their master.', duration: 3.8 },
        hold: 4,
      },
      {
        cam: { from: { at: 'kai', local: [0.6, 0.35, 1.9] }, to: { at: 'kai', local: [0.5, 0.35, 1.6] }, look: { at: 'kai', off: [0, 0.42, 0] }, fov: 34, fov2: 30 },
        say: { who: 'supreme_kai', line: 'I am the Supreme Kai. And a wizard named Babidi has come to Earth to wake something that should stay asleep.', duration: 5, style: 'quiet' },
        hold: 5.2,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry', speed: 2 }],
        cam: { from: { at: 'vegeta', local: [0.7, 0.4, 2] }, look: { at: 'vegeta', off: [0, 0.42, 0] }, fov: 34 },
        say: { who: 'vegeta', line: 'I came here to fight Kakarot. Not to chase a wizard.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
      // Kibito's hands over Gohan: the energy comes back
      {
        pose: [
          { who: 'kibito', pose: 'kb_heal', face: 'calm', speed: 2 },
          { who: 'gohan', pose: 'knockdown', face: 'hurt', speed: 2 },
        ],
        vfx: { kind: 'stream', at: { at: 'gohan' }, radius: 1.6, color: 0xffe8a0, count: 12, size: 0.16, life: 0.6 },
        sfx: { name: 'kiUp', who: 'gohan', vol: 0.6, pitch: 1.1 },
        cam: { from: { at: 'kibito', off: [2.2, 1.4, 2.6] }, look: { at: 'gohan', off: [0, -0.3, 0] }, fov: 42 },
        hold: 2.8,
      },
      {
        pose: [{ who: 'gohan', pose: 'ag_fight', face: 'angry', speed: 3 }],
        cam: { from: { at: 'gohan', local: [0.7, 0.4, 2.1] }, look: { at: 'gohan', off: [0, 0.42, 0] }, fov: 36 },
        say: { who: 'adult_gohan', line: 'They went east. I can still feel them — barely.', duration: 3, style: 'quiet' },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const g = ctx.cast.gohan;
      if (g) g.setState('free');
      ctx.m.flags.kaiRevealed = true;
    },
  };
})();
