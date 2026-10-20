/*
 * SCENES — CHAPTER 18 · UNIVERSE 6 ("The Pride of Sadala"). Data for SL.Cinema (src/game/cinema.js), staged from
 * documentation/SUPER_SAGA_VISUAL_REFERENCE.md §1–2 (Version B, the owner's draft default):
 *
 *   u6_arena    the high sweep over the ring on the Nameless Planet, the Super Dragon Balls hanging in the void; the
 *               two gods in their boxes; VADOS LEADS UNIVERSE 6 OUT — a tracking shot down the line, then each of
 *               them on his own so the contrast reads: Cabba at attention, Frost's courtly bow, Hit's hands in his
 *               pockets and his eyes in shadow, Botamo's bulk, Magetta's steam; the match called; Cabba's bow
 *   u6_provoke  Base Vegeta standing over a beaten, kneeling Cabba (low, up at him): the threat to Sadala; the tight
 *               close-up of Cabba's eyes as it lands
 *   u6_after    Cabba wakes outside the ring, and thanks him; Vegeta's answer; HIT steps forward — the static eye-level
 *               shot, the hands in the pockets, the gaze fixed on Vegeta (the next match)
 *
 * Dialogue: original lines in the characters' voices; the closing lesson is the owner's supplied draft line.
 * Positions: u6_cabba.js SPOT (the ring is 30 m square at the origin; Universe 7 at +x, Universe 6 at -x).
 */
(function () {
  'use strict';
  const S = (SL.data.scenes = SL.data.scenes || {});
  const V3 = THREE.Vector3;
  const cast = (m) => SL.data.brolyKit.cast(m);
  const K = () => SL.data.buuKit;
  const spot = (k) => SL.data.u6Cabba.SPOT[k];
  const ground = (b, k, lift) => K().ground(b, new V3(spot(k)[0], 0, spot(k)[1]), lift || 0);
  const TEAM6 = ['vados', 'cabba', 'frost', 'hit', 'botamo', 'magetta'];
  // the steam out of Magetta's smokestack: a grey puff above his dome every so often
  const steam = (ctx, s) => {
    const mg = ctx.cast.magetta;
    if (!mg || Math.round(s * 60) % 28 !== 0) return;
    const top = mg.headPos ? mg.headPos().add(new V3(0, 0.45, 0)) : mg.chest().add(new V3(0, 1.4, 0));
    ctx.b.vfx.dust(top, 0.5, 3, 0xd8d8e0);
  };

  /* =================================================================== THE ARENA AND THE ROSTER */
  S.u6_arena = {
    id: 'u6_arena',
    cast,
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      // high over the ring, sweeping: the stone square, the boxes, the black sky and the amber worlds in it
      {
        cam: { from: [64, 26, 64], to: [50, 20, -44], look: [-10, 12, -10], look2: [0, 8, 0], fov: 58, fov2: 52, ease: 'inOut', raw: true },
        title: { chapter: 'CHAPTER 18 · UNIVERSE 6', title: 'THE PRIDE OF SADALA', subtitle: 'The Nameless Planet · between Universes 6 and 7', duration: 4.4 },
        tick: steam,
        hold: 4.6,
      },
      // up past the ring at the Super Dragon Balls
      {
        cam: { from: [-8, 2.6, 26], to: [-5, 3.4, 21], look: [380, 330, -600], look2: [300, 300, -600], fov: 54, raw: true },
        say: { who: 'whis', line: 'The Super Dragon Balls. Each one larger than a planet... and the winner of today\'s tournament gets a wish.', duration: 4.2 },
        hold: 4.3,
      },
      // the two gods across the ring from each other
      {
        pose: [{ who: 'champa', pose: 'ch6_shout', face: 'grin' }],
        cam: { subject: 'champa', focus: 'medium', angle: 'three' },
        say: { who: 'champa', line: 'When my team wins, Beerus, your Earth is mine — and every last thing they cook on it!', duration: 3.8, style: 'shout' },
        hold: 3.9,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'cold' }, { who: 'champa', pose: 'ch6_idle', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Keep dreaming, brother. You lost the last time we did this.', duration: 3 },
        hold: 3.1,
      },
      // VADOS LEADS UNIVERSE 6 OUT: a medium-wide tracking shot beside the line as they cross to their side
      {
        pose: [
          { who: 'vados', pose: 'w_walk', face: 'calm', speed: 5 },
          { who: 'cabba', pose: 'bb_walk', face: 'determined', speed: 6 },
          { who: 'frost', pose: 'bb_walk', face: 'calm', speed: 6 },
          { who: 'hit', pose: 'bb_walk', face: 'cold', speed: 5 },
          { who: 'botamo', pose: 'bb_walk', face: 'calm', speed: 4 },
          { who: 'magetta', pose: 'bb_walk', face: 'cold', speed: 3 },
        ],
        call: (ctx) => {
          const b = ctx.b;
          ctx.flags.walk = {};
          for (const k of TEAM6) {
            const f = ctx.cast[k];
            const to = ground(b, k);
            // they start well back along the line they walk, staggered: Vados first
            const i = TEAM6.indexOf(k);
            const from = to.clone().add(new V3(-14 - i * 1.2, 0, -18 - i * 0.6));
            from.y = b.stage.heightAt(from.x, from.z);
            ctx.flags.walk[k] = { from, to };
            K().place(f, from, Math.atan2(to.x - from.x, to.z - from.z));
          }
          ctx.m.shot((t, out) => {
            // beside the line, far enough back to hold all six: the centre of the group, tracked
            const mid = new V3();
            for (const n of TEAM6) mid.add(ctx.cast[n].pos);
            mid.multiplyScalar(1 / TEAM6.length);
            const dir = ctx.flags.walk.vados.to.clone().sub(ctx.flags.walk.vados.from).setY(0).normalize();
            const side = new V3(dir.z, 0, -dir.x);
            out.pos.copy(mid).addScaledVector(side, 17).addScaledVector(dir, 4).add(new V3(0, 3, 0));
            out.look.copy(mid).add(new V3(0, 1.2, 0));
            out.fov = 46;
          }, 5.4, { cut: true, blendIn: 0 });
        },
        tick: (ctx, s) => {
          const k = Math.min(1, s / 5.2);
          for (const n of TEAM6) {
            const w = ctx.flags.walk && ctx.flags.walk[n];
            if (!w) continue;
            const p = w.from.clone().lerp(w.to, k);
            K().place(ctx.cast[n], p, ctx.cast[n].yaw);
          }
          steam(ctx, s);
        },
        say: { who: 'vados', line: 'This way, everyone. Do try to look like a team — Lord Champa is watching.', duration: 3.6 },
        hold: 5.3,
      },
      // each of them on his own: the contrast is the point
      {
        call: (ctx) => {
          for (const n of TEAM6) {
            const w = ctx.flags.walk && ctx.flags.walk[n];
            if (w) K().place(ctx.cast[n], w.to, 0);
            K().faceTo(ctx.cast[n], new V3(0, 0, 0));
          }
        },
        pose: [{ who: 'cabba', pose: 'cb_idle', face: 'determined' }, { who: 'vados', pose: 'w_idle', face: 'calm' }],
        cam: { subject: 'cabba', focus: 'full', angle: 'three' },
        hold: 1.7,
      },
      {
        pose: [{ who: 'frost', pose: 'fr_bow', face: 'calm', speed: 5 }],
        cam: { subject: 'frost', focus: 'upper', angle: 'three' },
        say: { who: 'frost', line: 'A pleasure, Universe 7. Let us all fight with honour.', duration: 2.6 },
        hold: 2.6,
      },
      // Hit: still, the hands in his pockets, the eyes in the shadow of his brow
      {
        pose: [{ who: 'frost', pose: 'fr_polite', face: 'calm' }, { who: 'hit', pose: 'ht_pockets', face: 'cold' }],
        cam: { subject: 'hit', focus: 'upper', angle: 'low', fov: 40 },
        hold: 2.2,
      },
      {
        pose: [{ who: 'botamo', pose: 'bo_idle', face: 'calm' }, { who: 'magetta', pose: 'mg_idle', face: 'cold' }],
        cam: { subject: 'botamo', with: 'magetta', focus: 'full', angle: 'low' },
        tick: steam,
        hold: 2.4,
      },
      // the match is called
      {
        pose: [{ who: 'goku', pose: 'g_handsHips', face: 'grin' }, { who: 'vegeta', pose: 'armsCrossed', face: 'serious' }],
        cam: { subject: 'goku', with: 'vegeta', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'A Saiyan from Universe 6, huh? Go easy on him, Vegeta!', duration: 2.8 },
        hold: 2.9,
      },
      {
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Easy? He came here to fight a Saiyan. He gets one.', duration: 2.8 },
        hold: 2.9,
      },
      // both of them up onto the ring, the announcer between them
      {
        call: (ctx) => {
          const b = ctx.b, S = ctx.cast;
          K().place(S.vegeta, ground(b, 'ringV'), Math.PI);
          K().place(S.cabba, ground(b, 'ringC'), 0);
          // square to the line between them: both on the ring, facing each other
          ctx.m.shot((t, out) => {
            const tw = SL.Cinema.twoShot(S.cabba, S.vegeta, { fov: 42, pad: 2, lookUp: 0.1 });
            out.pos.copy(tw.pos);
            out.look.copy(tw.look);
            out.fov = tw.fov;
          }, 3.3, { cut: true, blendIn: 0 });
        },
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'serious' }, { who: 'cabba', pose: 'cb_idle', face: 'determined' }],
        say: { who: 'announcer', line: 'Next match! From Universe 7, Vegeta! From Universe 6, Cabba!', duration: 3.2 },
        hold: 3.3,
      },
      {
        pose: [{ who: 'cabba', pose: 'cb_bow', face: 'determined', speed: 5 }],
        cam: { subject: 'cabba', focus: 'full', angle: 'three' },
        say: { who: 'cabba', line: 'Cabba, of the Sadala Defense Force. It\'s an honour, Prince Vegeta. Please — teach me what it means to be a Saiyan.', duration: 4.4 },
        hold: 4.5,
      },
      {
        pose: [{ who: 'cabba', pose: 'cb_stance', face: 'determined' }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'A prince of a planet that no longer exists. Show me what your soldiers are made of.', duration: 3.4 },
        hold: 3.5,
      },
    ],
    end(ctx) {
      const b = ctx.b, S = ctx.b.story;
      for (const n of ['vados', 'frost', 'hit', 'botamo', 'magetta']) {
        K().place(S[n], ground(b, n), 0);
        K().faceTo(S[n], new V3(0, 0, 0));
      }
      K().watcher(S.vados, 'w_idle', 'calm');
      K().watcher(S.frost, 'fr_polite', 'calm');
      K().watcher(S.hit, 'ht_pockets', 'cold');
      K().watcher(S.botamo, 'bo_idle', 'calm');
      K().watcher(S.magetta, 'mg_idle', 'cold');
      K().watcher(S.champa, 'ch6_idle', 'smirk');
      K().watcher(S.beerus, 'bs_idle', 'calm');
      K().watcher(S.goku, 'g_handsHips', 'grin');
      ctx.m.flags.arena = true;
    },
  };

  /* =================================================================== THE PROVOCATION */
  S.u6_provoke = {
    id: 'u6_provoke',
    cast,
    music: { song: null, level: 0 },
    auraCap: 0,
    events: [
      // Cabba on one knee near the edge, gasping; Vegeta walks over to stand over him
      {
        pose: [{ who: 'cabba', pose: 'cb_kneel', face: 'hurt' }, { who: 'vegeta', pose: 'bb_walk', face: 'cold', speed: 4 }],
        cam: { subject: 'cabba', with: 'vegeta', focus: 'full', angle: 'side' },
        sfx: { name: 'heartbeat', vol: 0.5 },
        tick: (ctx, s) => {
          const v = ctx.cast.vegeta, f = ctx.flags.over;
          if (!f) return;
          K().place(v, f.from.clone().lerp(f.to, Math.min(1, s / 2.2)), v.yaw);
        },
        call: (ctx) => {
          const v = ctx.cast.vegeta, c = ctx.cast.cabba;
          const away = v.pos.clone().sub(c.pos).setY(0);
          if (away.lengthSq() < 0.01) away.set(0, 0, 1);
          away.normalize();
          const to = c.pos.clone().addScaledVector(away, 1.7);
          to.y = ctx.b.stage.heightAt(to.x, to.z);
          ctx.flags.over = { from: v.pos.clone(), to };
          K().faceTo(v, c.pos);
        },
        say: { who: 'cabba', line: '(gasping) I... I can\'t touch him...', duration: 2.4, style: 'quiet' },
        hold: 2.4,
      },
      // LOW, up at Base Vegeta: arms crossed, the cold scowl
      {
        call: (ctx) => {
          const f = ctx.flags.over;
          if (f) K().place(ctx.cast.vegeta, f.to, 0);
          K().faceTo(ctx.cast.vegeta, ctx.cast.cabba.pos);
          K().faceTo(ctx.cast.cabba, ctx.cast.vegeta.pos);
        },
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cold' }],
        cam: { subject: 'vegeta', focus: 'full', angle: 'low', fov: 44 },
        say: { who: 'vegeta', line: 'Is that all? Then give up. Surrender, and go home.', duration: 3 },
        hold: 3.1,
      },
      {
        cam: { subject: 'cabba', focus: 'upper', angle: 'high' },
        say: { who: 'cabba', line: '...I\'m sorry. I can\'t win this. I... forfeit—', duration: 2.8, style: 'quiet' },
        hold: 2.9,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'angry' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low', fov: 40 },
        say: { who: 'vegeta', line: 'Surrender, and when this tournament is over I will go to your Universe myself — and wipe Planet Sadala out of existence.', duration: 4.8, style: 'shout' },
        hold: 4.9,
      },
      // the tight close-up: the pupils shrinking, the threat landing
      {
        pose: [{ who: 'cabba', pose: 'cb_horror', face: 'shock' }],
        cam: { subject: 'cabba', focus: 'face', angle: 'front', fov: 30 },
        sfx: { name: 'heartbeat', vol: 0.9 },
        hold: 1.5,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'low' },
        say: { who: 'vegeta', line: 'Your Defense Force. Your people. Every one of them.', duration: 2.8 },
        hold: 2.9,
      },
      {
        pose: [{ who: 'cabba', pose: 'cb_horror', face: 'grit' }],
        cam: { subject: 'cabba', focus: 'face', angle: 'three', fov: 28 },
        say: { who: 'cabba', line: '...You... wouldn\'t...', duration: 2, style: 'quiet' },
        shake: { at: 'cabba', amount: 0.25 },
        hold: 2.1,
      },
    ],
    end(ctx) {
      const f = ctx.flags.over;
      if (f) K().place(ctx.cast.vegeta, f.to, 0);
      K().faceTo(ctx.cast.vegeta, ctx.cast.cabba.pos);
      K().faceTo(ctx.cast.cabba, ctx.cast.vegeta.pos);
      ctx.cast.vegeta.setState('scripted', { pose: 'armsCrossed', expression: 'cold' });
      ctx.cast.cabba.setState('scripted', { pose: 'cb_horror', expression: 'grit' });
      ctx.m.flags.provoked = true;
    },
  };

  /* =================================================================== AFTER: THE NEXT MATCH */
  S.u6_after = {
    id: 'u6_after',
    cast,
    music: { song: 'battle', level: 0 },
    auraCap: 0,
    events: [
      // outside the ring, Cabba comes round, sits up, and bows from where he sits
      {
        pose: [{ who: 'cabba', pose: 'cb_kneel', face: 'hurt', speed: 4 }],
        cam: { subject: 'cabba', focus: 'upper', angle: 'three' },
        say: { who: 'cabba', line: 'That feeling... I can still feel it. Thank you... Master Vegeta.', duration: 3.6 },
        hold: 3.7,
      },
      {
        pose: [{ who: 'vegeta', pose: 'armsCrossed', face: 'cocky' }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'Hmph. "Master." Go home and train, Cabba. Teach the others. Then come and find me.', duration: 4.2 },
        hold: 4.3,
      },
      {
        pose: [{ who: 'champa', pose: 'ch6_shout', face: 'angry' }],
        cam: { subject: 'champa', focus: 'medium', angle: 'three' },
        say: { who: 'champa', line: 'Cabba lost?! Hit! Get up there and finish this!', duration: 3, style: 'shout' },
        hold: 3.1,
      },
      // HIT steps forward: static, eye level, the hands in his pockets, the gaze on Vegeta
      {
        // one step toward the ring (he stays off it: the lens stands between him and its edge, at his eye level)
        call: (ctx) => {
          const h = ctx.cast.hit, b = ctx.b;
          K().faceTo(h, ctx.cast.vegeta.pos);
          const fwd = h.forward.clone().setY(0).normalize();
          ctx.flags.hitFrom = h.pos.clone();
          ctx.flags.hitTo = K().ground(b, h.pos.clone().addScaledVector(fwd, 1.2));
          const eye = h.headPos();
          const lens = h.pos.clone().addScaledVector(fwd, 4.4);
          lens.y = eye.y - 0.1;
          ctx.m.shot((t, out) => {
            out.pos.copy(lens);
            out.look.copy(h.chest()).add(new V3(0, 0.25, 0));
            out.fov = 40;
          }, 3, { cut: true, blendIn: 0 });
        },
        tick: (ctx, s) => {
          const h = ctx.cast.hit;
          if (!ctx.flags.hitFrom) return;
          K().place(h, ctx.flags.hitFrom.clone().lerp(ctx.flags.hitTo, Math.min(1, s / 1.6)), h.yaw);
        },
        pose: [{ who: 'hit', pose: 'ht_step', face: 'cold' }, { who: 'champa', pose: 'ch6_idle', face: 'grin' }],
        sfx: { name: 'heartbeat', vol: 0.5 },
        hold: 3,
      },
      {
        call: (ctx) => K().faceTo(ctx.cast.hit, ctx.cast.vegeta.pos),
        pose: [{ who: 'hit', pose: 'ht_pockets', face: 'cold' }],
        cam: { subject: 'hit', focus: 'closeup', angle: 'front', fov: 34 },
        say: { who: 'hit', line: '...', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
      {
        call: (ctx) => K().faceTo(ctx.cast.vegeta, ctx.cast.hit.pos),
        cam: { subject: 'vegeta', angle: 'ots', over: 'hit', focus: 'upper' },
        say: { who: 'vegeta', line: 'So you\'re the assassin. Good. I was just getting warmed up.', duration: 3.2 },
        hold: 3.3,
      },
    ],
    end(ctx) {
      ctx.m.flags.after = true;
    },
  };
})();
