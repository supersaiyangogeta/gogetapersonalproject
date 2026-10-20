/*
 * CHAPTER 6 — CELL SAGA: THE CELL GAMES, PART FIVE (rebuilt 2026-10-01)
 * Mission "Father-Son Kamehameha" (canon, played as Gohan) — the owner's six-phase brief:
 *
 *   RETURN    (scene)  the smoke; a thin beam out of it, through Trunks' chest — he falls, on camera;
 *                      Super Perfect Cell walks out of the smoke crackling with gold lightning
 *   RAGE      (scene)  Vegeta's barrage; Cell untouched; swatted like a fly; the blast at Vegeta, and
 *                      Gohan throwing himself in front of it — the left arm broken and hanging
 *   DESPAIR   (scene)  on his right knee, clutching the arm, the aura guttering: "It's all my fault."
 *                      Cell in his deep crouch: the Kamehameha that could end the solar system
 *   VOICE     (scene)  King Kai's link; his father's voice; "Forget about the Earth!" — he stands on one
 *                      leg, turns side-on, the right hand at the hip; a translucent gold Goku behind him
 *   BEAM *    (play)   the clash — Goku's voice when he is pushed back; Piccolo, Tien, Yamcha and Krillin
 *                      hitting Cell's back and blown into the dirt; Vegeta dropping out of the sky with a
 *                      blast into his shoulder blade; "NOW, GOHAN!"; the final push is the player's
 *   END       (scene)  the beam doubles and swallows him: the armour flakes to ash, the skin peels, the
 *                      body goes, the purple core tries to regrow and burns; the beam leaves the planet
 *   AFTER     (scene)  the trench; the gold goes out of his hair; he sways, and falls on his face,
 *                      smiling. Vegeta, on a rock: "I will never fight again..."
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const CK = SL.data.cellKit;

  const FSK = { cellBeamStart: 2.2, voiceAt: 0.3, zFightersAt: 0.4, vegetaAt: 0.52 };

  function setup(battle) {
    const b = battle;
    const S = CK.cast(b, { player: 'gohan' });
    CK.spectate(b, S, ['gohan', 'a16', 'goku']);
    CK.gone(S.a16);
    for (const j of S.juniors || []) CK.gone(j);
    CK.gone(S.goku);
    S.goku.alive = false;
    CK.watch(S.a18, CK.onRing(b, -5, -9), 'knockdown', 'ko');
    CK.toForm(S.gohan, 'ssj2');
    S.gohan.lockedForms = {};
    S.gohan.setRage(true, 1);
    S.gohan.setDamage(2);
    CK.place(S.gohan, CK.onRing(b, 0, 5), Math.PI);
    S.cell.setHidden(true);
    S.satan.setState('scripted', { pose: 'ms_hide', expression: 'shock' });
    // Trunks and Vegeta come down off the ridge to the boy when the smoke settles
    CK.watch(S.trunks, CK.onRing(b, 4.5, 8), 'idle', 'calm', CK.onRing(b, 0, 0));
    CK.watch(S.vegeta, CK.onRing(b, -4, 9), 'armsCrossed', 'calm', CK.onRing(b, 0, 0));
  }

  function stageBeam(b) {
    const S = b.story, gh = S.gohan, c = S.cell;
    gh.lockedForms = {};
    CK.toForm(gh, 'ssj2');
    gh.setHidden(false);
    gh.setRage(true, 1);
    gh.setTorn(true);
    CK.place(gh, CK.onRing(b, 0, 9), Math.PI);
    c.setHidden(false);
    c.alive = true;
    CK.toForm(c, 'perfect');
    CK.superAura(c);
    CK.placeAir(c, CK.onRing(b, 0, -10).add(new V3(0, 5, 0)), 0);
    CK.watch(S.trunks, CK.onRing(b, 4.5, 8), 'knockdown', 'ko');
    CK.watch(S.vegeta, CK.ground(b, new V3(-13, 0, 14)), 'knockdown', 'ko', c.pos);
  }

  const P = {};

  P.ret = {
    id: 'return',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'cf_return');
      yield* SL.Cinema.play(m, 'cf_rage');
      yield* SL.Cinema.play(m, 'cf_despair');
      yield* SL.Cinema.play(m, 'cf_voice');
    },
  };

  /**
   * The Father-Son Kamehameha, played: Cell's beam comes first and heavier; Gohan answers it with
   * one hand; the clash is the engine's BeamClash, shaped by the story at three points.
   */
  P.beam = {
    id: 'beam',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, gh = S.gohan, c = S.cell;
      CK.prep(m);
      CK.clearCombat(b);
      stageBeam(b);
      CK.takeControl(b, gh);
      gh.setTorn(true);
      CK.spirit(b, true, m.flags.fskVoice ? 0.72 : 0.55);
      const follow = () => CK.spiritFollow(b);
      m.tickHooks.push(follow);
      gh.hp = Math.max(Math.min(gh.hp, Math.round(gh.hpMax * 0.5)), Math.round(gh.hpMax * 0.35));
      gh.ki = gh.kiMax;
      gh.damageDealtMul = 1;
      gh.damageTakenMul = 0.45;
      gh.noFlight = true;
      gh.lockedSlots = { special1: true, special2: true, ultimate: true, transform: true };
      gh.specOverrides = { ultimate: { chargeMin: 10, chargeMax: 50, oneHand: true, radius: [1.5, 1.5], poses: { charge: 'tg2_oneKameCharge', fire: 'tg2_oneKameFire' } } };
      gh.anim.poses = Object.assign({}, gh.anim.poses, { idle: gh.poses.tg2_oneArm });
      CK.place(gh, CK.onRing(b, 0, 9), Math.PI);
      c.untargetable = false;
      CK.placeAir(c, CK.onRing(b, 0, -12).add(new V3(0, 7, 0)), 0);
      c.hp = c.hpMax;
      c.cannotDie = false; // the one stretch where he can die
      c.noRegen = true;
      c.infiniteHp = false;
      c.ki = c.kiMax;
      c.damageDealtMul = 0.7;
      c.specOverrides = { ultimate: { chargeMin: 100, chargeMax: 100, name: 'Kamehameha', color: 0x8ad4ff, radius: [1.5, 1.5], speed: 20, range: 80, sustain: 260, poses: { charge: 'cl_superKameCharge', fire: 'beamFire' } } };
      b.clash.maxSeconds = 40;
      const st = { cooldown: 90, rounds: 0 };
      c.controller = {
        update() {
          const it = SL.emptyIntent();
          if (b.inputLocked || b.aiLocked) return it;
          c.target = gh;
          if (c.state === 'beamCharge') {
            it.ultHeld = true;
            return it;
          }
          if (c.state !== 'free') return it;
          if (st.cooldown > 0) {
            st.cooldown--;
            return it;
          }
          c.ki = c.kiMax;
          st.rounds++;
          st.cooldown = 150;
          it.ult = true;
          it.ultHeld = true;
          return it;
        },
      };
      c.target = gh;
      gh.target = c;
      c.setState('free');
      CK.goFight(m, ['finale', 7]);
      m.objective('fsk', 'Father-Son Kamehameha', { icon: 'ultimate', target: 100 });
      m.prompt('cfFsk', 'ultimate', 'Kamehameha', { required: true, when: () => gh.state === 'free' && !gh.lockedSlots.ultimate, always: true });
      m.prompt('cfPush', 'light', 'Push', { required: true, when: () => !!b.clash.active, always: true });
      const beats = { voice: !!m.flags.fskVoice, z: !!m.flags.fskZ, vegeta: !!m.flags.fskVegeta, clashes: 0, lost: 0 };
      let wonClash = false;
      // a sphere of volatile light where the two beams meet
      const T = SL.Toon;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
      orb.visible = false;
      b.scene.add(orb);
      m.onDispose(() => {
        b.scene.remove(orb);
        orb.geometry.dispose();
        orb.material.dispose();
      });
      const wide = () => {
        m.shot((t, out) => {
          const pa = gh.chest(), pb = c.chest();
          const live = b.clash.active;
          const mid = live ? live.point : pa.clone().lerp(pb, 0.5);
          const axis = pb.clone().sub(pa);
          const sep = axis.length();
          axis.normalize();
          const side = new V3().crossVectors(axis, new V3(0, 1, 0));
          if (side.lengthSq() < 0.01) side.set(1, 0, 0);
          side.normalize();
          const centre = pa.clone().lerp(pb, 0.5).lerp(mid, 0.4);
          out.pos.copy(centre).addScaledVector(side, sep * 0.95).add(new V3(0, sep * 0.12, 0));
          out.look.copy(centre);
          out.fov = 50;
        }, 999, { hold: true, blendIn: 0.3 });
      };
      // a short insert, then back to the wide side-on shot the struggle is read from
      let briefUntil = 0, nextInsert = 0, insertAt = 0;
      const brief = (fn, seconds) => {
        briefUntil = b.frame + Math.round(seconds * 60);
        m.shot(fn, seconds, { cut: true, blendIn: 0, onEnd: () => b.clash.active && wide() });
      };
      // THE STRUGGLE'S CAMERA (cinematic brief, section 43): the wide side-on shot is home; between the story
      // beats it cuts away briefly, in this order — Gohan straining, Cell pushing, over Gohan's shoulder, the
      // reverse over Cell's, the whole arena lit by it, Vegeta watching — never a continuous spin
      const head = (f) => SL.Cinema.actorPoint({ cast: { x: f } }, 'x:head');
      const frame = () => {
        const pa = gh.chest(), pb = c.chest(), axis = pb.clone().sub(pa).setY(0).normalize();
        return { pa, pb, axis, right: new V3(axis.z, 0, -axis.x), pt: b.clash.active ? b.clash.active.point : pa.clone().lerp(pb, 0.5) };
      };
      const INSERTS = [
        () => brief((t, out) => {
          const F = frame(), h = head(gh);
          out.pos.copy(h).addScaledVector(F.axis, 0.95).addScaledVector(F.right, 0.45).add(new V3(0, -0.05, 0));
          out.look.copy(h).add(new V3(0, -0.12, 0));
          out.fov = 36;
        }, 1.5),
        () => brief((t, out) => {
          const F = frame(), h = head(c);
          out.pos.copy(h).addScaledVector(F.axis, -1.1).addScaledVector(F.right, -0.45).add(new V3(0, -0.05, 0));
          out.look.copy(h).add(new V3(0, -0.12, 0));
          out.fov = 36;
        }, 1.5),
        () => brief((t, out) => {
          const F = frame();
          out.pos.copy(F.pa).addScaledVector(F.axis, -2.6).addScaledVector(F.right, 0.95).add(new V3(0, 0.55, 0));
          out.look.copy(F.pt);
          out.fov = 46;
        }, 1.8),
        () => brief((t, out) => {
          const F = frame();
          out.pos.copy(F.pb).addScaledVector(F.axis, 2.8).addScaledVector(F.right, -1).add(new V3(0, 0.6, 0));
          out.look.copy(F.pt);
          out.fov = 46;
        }, 1.8),
        () => brief((t, out) => {
          const F = frame(), sep = F.pa.distanceTo(F.pb), mid = F.pa.clone().lerp(F.pb, 0.5);
          out.pos.copy(mid).addScaledVector(F.right, sep * 1.5).add(new V3(0, sep * 0.75 + t * 2, 0));
          out.look.copy(mid);
          out.fov = 56;
        }, 2),
        () => {
          const v = S.vegeta;
          if (!v || v.hidden || v._gone) return;
          brief((t, out) => {
            const h = head(v), F = frame();
            out.pos.copy(h).add(new V3(0, 0.5, 0)).addScaledVector(F.right, 1.1);
            out.look.copy(h);
            out.fov = 38;
          }, 1.4);
        },
      ];
      const offS = b.on('clashStart', (e) => {
        if (!((e.a === gh || e.b === gh) && (e.a === c || e.b === c))) return;
        beats.clashes++;
        const cl = b.clash.active;
        cl.gohanBeam = cl.a.owner === gh ? cl.a : cl.b;
        cl.cellBeam = cl.a.owner === c ? cl.a : cl.b;
        cl.basePowerG = cl.gohanBeam.power;
        cl.basePowerC = cl.cellBeam.power;
        cl.cellBeam.power = cl.basePowerC * (beats.vegeta ? 0.8 : beats.voice ? 1.5 : FSK.cellBeamStart);
        cl.gohanBeam.power = cl.basePowerG * (beats.voice ? 1.9 : 1);
        m.music(null, 7);
        orb.visible = true;
        wide();
        nextInsert = b.frame + 150;
      });
      const offE = b.on('clashEnd', (e) => {
        orb.visible = false;
        if (e.winner === gh) {
          wonClash = true;
          gh.damageDealtMul = 3.4;
          b.slowmo(0.3, 1.8);
          SL.ScreenFX.flash(0.7, '#e8f6ff');
          m.say('teen_gohan', 'AAAAAHHHHHH!', 1.6, { style: 'shout' });
        } else if (e.winner === c) {
          beats.lost++;
          m.say('goku', 'Get up, Gohan. You\'re not done.', 2.6, { style: 'quiet' });
        }
      });
      let lastHitType = null;
      const offD = b.on('damage', (e) => {
        if (e.target === c && e.attacker === gh) lastHitType = e.type;
      });
      let envTick = 0;
      const hook = () => {
        // the answer is only possible once his beam is coming
        if (c.state === 'beamFire' || b.clash.active) {
          if (gh.lockedSlots.ultimate) delete gh.lockedSlots.ultimate;
        } else if (!gh.lockedSlots.ultimate && !['beamCharge', 'beamFire', 'clash'].includes(gh.state) && !wonClash) gh.lockedSlots.ultimate = true;
        const cl = b.clash.active;
        if (!cl || !cl.gohanBeam) {
          m.progress('fsk', wonClash ? 100 : 0);
          const spot = CK.onRing(b, 0, 9);
          if (!wonClash && gh.state === 'free' && c.state !== 'beamFire' && (Math.abs(gh.pos.x) > 15 || Math.abs(gh.pos.z) > 15 || gh.pos.y < spot.y - 1)) {
            b.vfx.flash(gh.chest(), 2, 0xffe25a, 0.25, SL.Toon.tex.glow);
            CK.place(gh, spot, Math.PI);
            CK.faceTo(gh, c.pos);
          }
          return;
        }
        // the deadlock sphere: swirling where the beams meet, growing with the pressure on it
        orb.position.copy(cl.point);
        const s = 1.6 + Math.abs(cl.push || 0) * 2 + Math.sin(b.frame * 0.4) * 0.2;
        orb.scale.setScalar(s);
        if (b.frame % 4 === 0) b.vfx.bolt(cl.point.clone().add(new V3(U.rand(-1.5, 1.5), U.rand(-1.5, 1.5), U.rand(-1.5, 1.5))), U.rand(1.5, 3), b.frame % 8 ? 0xfff3a0 : 0xbfe4ff);
        const p = b.clash.playerProgress();
        m.progress('fsk', Math.floor(p * 100));
        // the next insert, once the wide shot has had its time and no story beat is on screen
        if (b.frame >= briefUntil && b.frame >= nextInsert) {
          INSERTS[insertAt++ % INSERTS.length]();
          nextInsert = b.frame + 240;
        }
        // 1. his father's voice, when the boy is pushed back
        if (!beats.voice && p <= FSK.voiceAt) {
          beats.voice = true;
          m.flags.fskVoice = true;
          m.say('goku', 'Gohan! You\'re not alone! Release every drop of your power!', 3.4, { style: 'shout' });
          cl.gohanBeam.power = cl.basePowerG * 1.9;
          cl.cellBeam.power = cl.basePowerC * 1.6;
          SL.ScreenFX.flash(0.3, '#dff2ff');
          S.spiritLevel = 0.8;
          S.goku.model.setSpiritLevel(0.8);
          brief((t, out) => {
            const ch = gh.chest(), fwd = new V3(Math.sin(gh.yaw), 0, Math.cos(gh.yaw)), right = new V3(-fwd.z, 0, fwd.x);
            out.pos.copy(ch).addScaledVector(fwd, -0.7 - t * 0.3).addScaledVector(right, -3.8).add(new V3(0, 0.1, 0));
            out.look.copy(ch).addScaledVector(fwd, -0.4).add(new V3(0, 0.35, 0));
            out.fov = 38;
          }, 2.6);
        }
        // 2. the Z Fighters will not watch him die alone: four beams into Cell's back — and the flare
        if (beats.voice && !beats.z && p >= FSK.zFightersAt) {
          beats.z = true;
          m.flags.fskZ = true;
          zFighters(m);
          brief((t, out) => {
            const ch = c.chest();
            out.pos.copy(ch).add(new V3(-9, 4, -10));
            out.look.copy(ch);
            out.fov = 46;
          }, 3.2);
        }
        // 3. Vegeta out of the sky: one blast into the shoulder blade, and Cell's head jerks
        if (beats.z && !beats.vegeta && p >= FSK.vegetaAt) {
          beats.vegeta = true;
          m.flags.fskVegeta = true;
          vegetaBlast(m);
          cl.cellBeam.power = cl.basePowerC * 0.75;
          brief((t, out) => {
            const ch = c.chest();
            out.pos.copy(ch).add(new V3(4, 2.6, -6));
            out.look.copy(ch);
            out.fov = 40;
          }, 2.2);
          m.say('goku', 'NOW, GOHAN! DO IT! RELEASE EVERYTHING YOU\'VE GOT!', 3.2, { style: 'shout' });
        }
        // the ground comes apart under it
        envTick++;
        if (envTick % 18 === 0) {
          const pt = cl.point;
          const under = new V3(pt.x, b.stage.heightAt(pt.x, pt.z), pt.z);
          b.stage.crater(under, 2 + Math.abs(cl.push) * 3, 0.3, null);
          b.vfx.rock(under.clone().add(new V3(U.rand(-4, 4), 0.2, U.rand(-4, 4))), new V3(0, U.rand(4, 9), 0), U.rand(0.2, 0.5), b.stage.rockColor);
          b.cameraTraumaAt(pt, 0.2 + Math.abs(cl.push) * 0.3);
        }
      };
      m.tickHooks.push(hook);
      yield () => !c.alive || wonClash;
      // the beam that connects is what ends him (a skip or a won clash both land here)
      CK.removeHook(m, hook);
      CK.removeHook(m, follow);
      for (const off of [offS, offE, offD]) off();
      orb.visible = false;
      m.complete('fsk');
      m.flags.cellBeaten = true;
      m.flags.finishedWithBeam = lastHitType === 'beam' || wonClash;
      m.flags.fskClashes = beats.clashes;
      b.clash.maxSeconds = 7;
      gh.lockedSlots = {};
      gh.noFlight = false;
      yield 0.6;
    },
  };

  /** Piccolo, Tien, Yamcha and Krillin hit Cell's back with everything; he flares and they hit the dirt. */
  function zFighters(m) {
    const b = m.battle, S = b.story, c = S.cell;
    const who = [['piccolo', 0xffe25a], ['tien', 0xffd080], ['yamcha', 0xffb0c8], ['krillin', 0x8ad4ff]];
    who.forEach(([name, col], i) => {
      const f = S[name];
      if (!f || f._gone) return;
      const a = -0.9 + i * 0.6;
      const at = c.pos.clone().add(new V3(Math.sin(a) * 9, 3 + (i % 2) * 2, -Math.cos(a) * 9));
      f.setHidden(false);
      CK.placeAir(f, at);
      CK.faceTo(f, c.pos);
      f.setState('scripted', { pose: 'blastR', expression: 'shout' });
      const from = f.chest();
      for (let s = 0; s <= 10; s++) b.vfx.trail(from.clone().lerp(c.chest(), s / 10), col, 0.4, 0.5);
      b.vfx.explosion(c.chest().add(new V3(Math.sin(a) * 0.4, 0.2, -0.3)), 2, col, { smoke: true });
    });
    b.sfx('kiBlastBig', c, { vol: 1.2 });
    m.say('piccolo', 'We won\'t let him die alone!', 2.4, { style: 'shout' });
    // the flare: one burst of his aura and they are all in the dirt
    b.onTick(
      (() => {
        let n = 0;
        return () => {
          n++;
          if (n < 70) return true;
          b.vfx.ring(c.chest(), 12, 0xffe25a, 0.6);
          b.vfx.explosion(c.chest(), 3.4, 0xffe25a, { smoke: false });
          b.sfx('explosionBig', c, { vol: 1.1 });
          for (const [name] of who) {
            const f = S[name];
            if (!f || f._gone) continue;
            CK.watch(f, CK.ground(b, f.pos.clone().sub(c.pos).setY(0).normalize().multiplyScalar(14).add(c.pos)), 'knockdown', 'ko', c.pos);
          }
          m.say('cell', 'Insects! Nothing you do can change anything!', 2.8, { style: 'shout' });
          return false;
        };
      })()
    );
  }

  /** Vegeta drops out of the sky behind Cell; one blast into the right shoulder blade. */
  function vegetaBlast(m) {
    const b = m.battle, S = b.story, c = S.cell, v = S.vegeta;
    v.setHidden(false);
    CK.toForm(v, 'ssj');
    const back = c.forward.clone().setY(0).normalize().negate();
    CK.placeAir(v, c.pos.clone().addScaledVector(back, 7).add(new V3(2, 9, 0)));
    CK.faceTo(v, c.pos);
    v.setState('scripted', { pose: 'v_bigBang', expression: 'shout' });
    const from = v.chest(), to = c.chest().addScaledVector(back, 0.4).add(new V3(0.35, 0.3, 0));
    for (let s = 0; s <= 12; s++) b.vfx.trail(from.clone().lerp(to, s / 12), 0xffe890, 0.6, 0.5);
    b.vfx.explosion(to, 3, 0xffe890, { smoke: true });
    b.sfx('explosionBig', c, { vol: 1.3 });
    b.cameraTraumaAt(to, 0.8);
    m.say('vegeta', 'GAAAAAHHH!', 1.6, { style: 'shout' });
  }

  P.end = {
    id: 'end',
    run: function* (m) {
      const b = m.battle;
      CK.clearCombat(b);
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      yield* SL.Cinema.play(m, 'cf_disintegrate');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle;
      CK.spirit(b, false);
      for (const f of b.fighters) if (f !== b.player) f.controller = CK.scripted();
      yield* SL.Cinema.play(m, 'cf_after');
      m.lock(true);
      m.fade('black', 1.4);
      yield* m.cine(1.6);
      m.endShot();
      m.title(m.def.chapter, 'FATHER-SON KAMEHAMEHA', m.nextLine(), 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'cell_fatherson',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'Father-Son Kamehameha',
    subtitle: 'Earth · Age 767 · one arm, one beam',
    character: 'teen_gohan',
    stage: 'cellarena',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'He came back stronger. Trunks is dead, Gohan has one arm, and his father is a voice nobody else can hear.',
    rewards: ['Gohan (age 11) playable', 'Story: the end of Cell'],
    setup,
    phases: [P.ret, P.beam, P.end, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.cellFatherSon = { FSK, stageBeam };
})();
