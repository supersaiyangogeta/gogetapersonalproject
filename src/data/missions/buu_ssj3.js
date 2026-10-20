/*
 * CHAPTER 11 — BUU SAGA: BUYING TIME
 * Mission "The Third Level" (canon; played as Goku). Goku stalls Majin Buu in a city while the
 * boys are taught to fuse, shows him Super Saiyan 3 — and pays for it — and Babidi learns what
 * happens to a wizard who shouts at Buu.
 *
 *   CITY    (scene)      Babidi's voice over a city; Buu turning people into sweets; a tower
 *                         coming down; Goku suddenly in the square
 *   DELAY   (checkpoint) Super Saiyan 2 against Buu among the buildings: keep him on you — every
 *                         blast that misses takes a building (the optional objective counts them)
 *   ASCEND                the third level, pushed through by holding Charge: the city shakes,
 *                         the sky goes, lightning finds the towers, and a silence before it lands
 *   THIRD    (checkpoint) Super Saiyan 3: overwhelming, and it burns ki every second. Blow him
 *                         apart twice — or run dry trying (the story goes on either way)
 *   LIMIT    (scene)      "This body won't hold it for long." He tells Buu to wait, and goes
 *   BABIDI   (scene)      the wizard shouts at the wrong creature
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const DELAY_SECONDS = 26;

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(0, 10), startKi: 100 });
    const buu = b.spawn({ charId: 'majin_buu', team: 1, pos: at(0, -6), startKi: 160, tags: { boss: true, priority: true } });
    const babidi = b.spawn({ charId: 'babidi', team: 1, pos: at(9, -12) });
    const civilians = [];
    for (let i = 0; i < 5; i++) {
      const c = b.spawn({ charId: 'civilian', team: 0, pos: at(-6 + i * 3, 16 + (i % 2) * 2.5) });
      K.watcher(c, 'guard', 'shock');
      civilians.push(c);
    }
    goku.lockedForms = { kaioken: true, ssj3: true };
    K.toForm(goku, 'ssj2');
    goku.setHidden(true); // he arrives in the square with Instant Transmission
    buu.controller = K.scripted();
    buu.mech.maxReforms = Infinity;
    K.hover(b, buu, buu.pos, 7);
    K.watcher(babidi, 'bb_cast', 'grin');
    // the tower Buu brings down in the opening: the nearest building to the square
    let tower = null;
    for (const o of b.stage.obstacles) if (o.building && o.alive && (!tower || Math.hypot(o.x, o.z) < Math.hypot(tower.x, tower.z))) tower = o;
    b.story = { goku, buu, babidi, civilians, tower };
  }

  function faceUp(b) {
    const S = b.story;
    K.faceTo(S.goku, S.buu.pos);
    K.faceTo(S.buu, S.goku.pos);
    K.faceTo(S.babidi, S.goku.pos);
  }

  function fight(m, opts = {}) {
    const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
    if (b.player !== g) b.switchPlayer(g, { force: true });
    g.target = buu;
    buu.target = g;
    buu.controller = new SL.AIController(b, { difficulty: 'normal' });
    g.setState('free');
    buu.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  function cityState(b) {
    const S = b.story;
    S.goku.setHidden(false);
    for (const c of S.civilians) if (c.model.setStone) c.model.setStone(true, 'candy');
    if (S.tower && S.tower.alive) b.stage.destroyPillar(S.tower, { quiet: true });
    b.stage.setMood(0.25, 0x2a1030, 1);
  }

  const P = {};

  P.city = {
    id: 'city',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      faceUp(b);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'ssj3_city');
    },
  };

  /** Keep him on you. The city is what pays for every miss. */
  P.delay = {
    id: 'delay',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      cityState(b);
      K.place(g, K.ground(b, new V3(0, 0, 8)));
      K.place(buu, K.ground(b, new V3(0, 0, -6)));
      faceUp(b);
      K.toForm(g, 'ssj2');
      g.lockedForms = { kaioken: true, ssj3: true };
      g.hp = g.hpMax;
      g.ki = 100;
      g.cannotDie = true;
      g.damagePlan = [{ level: 1, below: 0.6 }];
      buu.hp = buu.hpMax;
      buu.damageDealtMul = 0.5;
      m.music('finale', 5);
      m.objective('delay', 'Keep him on you', { icon: 'clock', target: DELAY_SECONDS });
      m.objective('city', 'Keep the city standing', { icon: 'guard', optional: true });
      let fallen = 0, t = 0;
      const offB = b.on('buildingDown', () => {
        fallen++;
        m.failObjective('city');
      });
      fight(m);
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('delay', Math.min(DELAY_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= DELAY_SECONDS || g.hpFrac < 0.35;
      K.unhook(m, hook);
      offB();
      m.complete('delay');
      if (!fallen) m.complete('city');
      m.flags.buildingsDown = fallen;
      m.qteParts.push(fallen ? 0.5 : 1);
    },
  };

  /**
   * A column of gold plasma from under his feet into the clouds: a churning geyser while the power
   * climbs (set(k) 0..1), collapsing into his body when the form lands (collapse()).
   */
  function geyser(b, f) {
    const g = new THREE.Group();
    const geo = new THREE.CylinderGeometry(1, 1.3, 1, 28, 1, true);
    geo.translate(0, 0.5, 0);
    const mat = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const outer = new THREE.Mesh(geo, mat(0xffc83a, 0));
    const inner = new THREE.Mesh(geo, mat(0xfff4c0, 0));
    g.add(outer, inner);
    b.scene.add(g);
    let k = 0, n = 0, fall = -1;
    b.onTick(() => {
      if (b.disposed || !g.parent) return false;
      n++;
      g.position.copy(f.pos).add(new V3(0, -1.2, 0));
      const churn = 1 + Math.sin(n * 0.5) * 0.08 + Math.sin(n * 1.3) * 0.05;
      const shrink = fall >= 0 ? Math.max(0, 1 - fall / 15) : 1;
      if (fall >= 0) fall++;
      const r = (0.9 + k * 1.5) * churn * shrink;
      outer.scale.set(r, 220, r);
      inner.scale.set(r * 0.45, 220, r * 0.45);
      outer.rotation.y += 0.04;
      outer.material.opacity = (0.08 + k * 0.32) * shrink;
      inner.material.opacity = (0.1 + k * 0.4) * shrink;
      if (fall > 15) {
        api.dispose();
        return false;
      }
      return true;
    });
    const api = {
      set(v) {
        k = v;
      },
      collapse() {
        if (fall < 0) fall = 0;
      },
      dispose() {
        b.scene.remove(g);
        geo.dispose();
        outer.material.dispose();
        inner.material.dispose();
      },
    };
    if (b.mission) b.mission.onDispose(api.dispose);
    return api;
  }

  P.ascend = {
    id: 'ascend',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (buu.mech.apart) yield () => !buu.mech.apart;
      buu.controller = K.scripted();
      g.setHidden(false); // entered straight from the Developer Menu, he has not arrived yet
      // the owner's brief (2026-10-02): all of it in mid-air over the square — Goku, Buu, the wizard
      K.hover(b, g, new V3(0, 0, 7), 5);
      K.hover(b, buu, new V3(0, 0, -6), 5);
      K.hover(b, S.babidi, new V3(5, 0, -9), 6);
      faceUp(b);
      yield* SL.Cinema.play(m, 'ssj3_offer');
      buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      g.hp = Math.max(g.hp, g.hpMax * 0.7);
      g.ki = 100;
      m.objective('ascend', 'Go even further', { icon: 'transform' });
      // while he holds it: head thrown back, chest open, the roar (instead of the ordinary charge pose)
      const chargePose = g.anim.poses.charge;
      g.anim.poses = Object.assign({}, g.anim.poses, { charge: g.poses.g3_ascend || chargePose });
      m.say('goku', 'AAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHH!', 6.5, { style: 'dual' });
      // low, a Dutch angle, the column of gold going up past him
      const low = () =>
        m.shot((t, out) => {
          const c = g.chest();
          const toB = buu.pos.clone().sub(g.pos).setY(0).normalize();
          const side = new V3(-toB.z, 0, toB.x);
          K.camAt(out, c.clone().addScaledVector(toB, 5).addScaledVector(side, 2.2).add(new V3(0, -1.2, 0)), c.clone().add(new V3(0, 0.9, 0)), 54);
          out.roll = 0.12;
        }, 60, { cut: true, blendIn: 0 });
      let holding = true;
      low();
      // a cut away and back: after it, the low shot again (or whatever 'after' chains on)
      const cut = (fn, seconds, after) => m.shot(fn, seconds, { cut: true, blendIn: 0, onEnd: after || (() => holding && low()) });
      const col = geyser(b, g);
      const earth = K.earthView(b);
      let power = 0;
      // the city answering: the ground opening, rocks lifting into the column, windows going
      const city = () => {
        if (!holding) return;
        power = Math.min(1, power + 1 / (6 * 60));
        col.set(Math.max(power, 0.25));
        if (power > 0.25 && b.frame % 8 === 0) {
          const p = g.pos.clone().add(new V3(U.rand(-9, 9), 0, U.rand(-9, 9)));
          p.y = b.stage.heightAt(p.x, p.z) + 0.2;
          b.vfx.rock(p, new V3(U.rand(-0.6, 0.6), U.rand(7, 11), U.rand(-0.6, 0.6)), U.rand(0.25, 0.7), b.stage.rockColor);
        }
        if (power > 0.4 && b.frame % 11 === 0) {
          const near = b.stage.obstacles.filter((o) => o.alive && o.building && Math.hypot(o.x - g.pos.x, o.z - g.pos.z) < 90);
          const o = near[(b.frame / 11) % Math.max(1, near.length) | 0];
          if (o) b.vfx.debrisBurst(new V3(o.x + U.rand(-2, 2), o.h * U.rand(0.3, 0.9), o.z + U.rand(-2, 2)), 4, 0xcfe0f0, 7, 0.14);
        }
        if (power > 0.5 && b.frame % 23 === 0) b.stage.crater(K.ground(b, g.pos.clone().add(new V3(U.rand(-6, 6), 0, U.rand(-6, 6)))), U.rand(2, 4), 0.25, null);
      };
      m.tickHooks.push(city);
      // the column collapses into him the moment the form lands (the burst), not after the cinematic
      const implode = () => {
        if (g.form.id !== 'ssj3') return;
        col.collapse();
        K.unhook(m, implode);
      };
      m.tickHooks.push(implode);
      yield* SL.data.cinematics.ascend(m, {
        fighter: g,
        form: 'ssj3',
        witness: buu,
        seconds: 6,
        label: 'Hold — all the way',
        meter: 'SUPER SAIYAN 3',
        music: 6,
        dust: false, // pavement: rubble, not sand clouds (330 frames of dust buried him)
        silent: true, // "...EVEN FURTHER BEYOND!" was said in the scene
        beats: [
          // the sky closes over him into a storm
          { at: 0.15, run: () => { b.stage.setMood(0.7, 0x0a0a1a, 1); b.sfx('rumble', g, { vol: 1.1, dur: 4 }); } },
          // King Kai, from the other world
          {
            at: 0.3,
            run: () => {
              SL.ScreenFX.vision(0.35);
              b.sfx('visionIn', null, { vol: 0.6 });
              m.say('king_kai', 'Goku! Stop it! You\'re using up all your remaining time on Earth!', 3.4, { style: 'shout' });
              b.onTick((() => { let n = 0; return () => { if (++n < 150) return true; SL.ScreenFX.vision(0); return false; }; })());
            },
          },
          // the whole city from the clouds, shaking, a gold column in the middle of it
          {
            at: 0.45,
            run: () => {
              b.vfx.skyBolt(g.pos.clone().add(new V3(6, 0, -4)), 60);
              b.vfx.skyBolt(g.pos.clone().add(new V3(-8, 0, 3)), 60);
              cut((t, out) => {
                const c = g.chest();
                K.camAt(out, c.clone().add(new V3(70 + t * 20, 150 + t * 30, 80 + t * 20)), c, 40);
                b.camera.addTrauma(0.08);
              }, 1.8);
            },
          },
          // the Earth from space, trembling, a gold light on it
          {
            at: 0.62,
            run: () => {
              earth.show();
              cut((t, out) => {
                earth.shake();
                const c = earth.centre;
                K.camAt(out, c.clone().add(new V3(0, 260, 1150 - t * 120)), c.clone().add(new V3(0, 60, 0)), 36);
              }, 2, () => {
                earth.hide();
                if (holding) low();
              });
            },
          },
          // the wizard holding on against the wind; Buu's grin gone, hands up against the light
          {
            at: 0.78,
            run: () => {
              S.babidi.setState('scripted', { pose: 'bb_cower', expression: 'shock' });
              buu.setState('scripted', { pose: 'bu_shield', expression: 'shock' });
              cut((t, out) => {
                const c = S.babidi.chest();
                K.camAt(out, c.clone().addScaledVector(S.babidi.forward, 2.2).add(new V3(0.9, 0.3, 0)), c, 40);
              }, 1.2, () =>
                cut((t, out) => {
                  const h = SL.Cinema.actorPoint({ cast: { x: buu } }, 'x:head');
                  K.camAt(out, h.clone().addScaledVector(buu.forward, 3).add(new V3(0.6, -0.2, 0)), h.clone().add(new V3(0, -0.2, 0)), 40);
                }, 1.2)
              );
            },
          },
          { at: 0.9, run: () => b.stage.setMood(0.85, 0x05050c, 0.8) },
        ],
        onReady: () => {
          holding = false;
          col.set(0.3); // calmer while the transformation is shot from close (at full it washed the frame out)
          earth.hide();
          m.endShot();
        },
      });
      K.unhook(m, city);
      g.anim.poses = Object.assign({}, g.anim.poses, { charge: chargePose });
      // the column collapses into him when the form lands
      K.unhook(m, implode);
      if (g.form.id === 'ssj3') col.collapse();
      else col.dispose();
      m.complete('ascend');
      g.lockedForms = { kaioken: true };
      // down his back as the mane hangs to his knees
      m.shot((t, out) => {
        const c = g.chest(), back = g.forward.clone().setY(0).normalize().negate();
        const side = new V3(-back.z, 0, back.x);
        K.camAt(out, c.clone().addScaledVector(back, 2.4).addScaledVector(side, 0.7).add(new V3(0, U.lerp(0.9, -1.1, U.easeInOutCubic(t)), 0)), c.clone().addScaledVector(back, 0.3).add(new V3(0, U.lerp(0.6, -1, U.easeInOutCubic(t)), 0)), 40);
      }, 2.4, { cut: true, blendIn: 0 });
      g.setState('scripted', { pose: 'g3_pant', expression: 'calm' });
      yield* m.cine(2.4);
      yield* SL.Cinema.play(m, 'ssj3_unveil');
      S.babidi.setState('scripted', { pose: 'bb_cast', expression: 'grin' });
    },
  };

  /** The third level: overwhelming, and it drinks his ki. */
  P.third = {
    id: 'third',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      cityState(b);
      if (buu.mech.apart) yield () => !buu.mech.apart;
      K.toForm(g, 'ssj3');
      g.lockedForms = { kaioken: true };
      g.ki = Math.max(g.ki, 100);
      g.cannotDie = true;
      g.damageDealtMul = 1.1;
      g.damagePlan = [{ level: 2, below: 0.5 }];
      buu.hp = Math.max(buu.hp, buu.hpMax * 0.8);
      buu.reformTo = 0.62;
      buu.mech.breakIdx = 0;
      buu.damageDealtMul = 0.4;
      buu.damageTakenMul = 1.25;
      b.stage.clearMood(1.5);
      // Super Saiyan 3's own theme (soundtrack PDF p.93; the sequencer's ssj3_theme, an original stand-in)
      m.music('ssj3_theme', 6);
      m.objective('apart', 'Blow him apart — twice', { icon: 'fist', target: 2 });
      m.prompt('ssj3Ki', 'charge', 'Charge — the form is burning your ki', { when: () => g.ki < 35 && g.form.id === 'ssj3', until: () => g.ki > 60 });
      let aparts = 0, dry = false;
      const offA = b.on('buuApart', (e) => {
        if (e.fighter === buu) m.progress('apart', ++aparts);
      });
      const offX = b.on('formExhausted', (e) => {
        if (e.fighter === g) dry = true;
      });
      fight(m);
      yield () => aparts >= 2 || dry || g.formIndex === 0;
      offA();
      offX();
      m.flags.ssj3Aparts = aparts;
      m.flags.ssj3RanDry = dry || g.formIndex === 0;
      if (aparts < 2) m.failObjective('apart');
      m.qteParts.push(aparts / 2);
      m.lock(true);
      K.clearCombat(b);
      buu.controller = K.scripted();
      if (buu.mech.apart) yield () => !buu.mech.apart;
      buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      faceUp(b);
      yield* SL.Cinema.play(m, 'ssj3_limit');
      yield* SL.Cinema.play(m, 'ssj3_babidi');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'THE THIRD LEVEL', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_ssj3',
    canon: true,
    chapter: 'CHAPTER 11 · BUU SAGA',
    title: 'The Third Level',
    subtitle: 'Earth · Age 774 · buying time',
    character: 'goku',
    stage: 'satan_city',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Goku has one day on Earth and a monster to stall. He shows Buu something he has been saving — and it costs more than he has.',
    rewards: ['Goku: Super Saiyan 3', 'Super Saiyan 3 in Free Battle'],
    setup,
    phases: [P.city, P.delay, P.ascend, P.third, P.after],
  };

  SL.data.missions[def.id] = def;
})();
