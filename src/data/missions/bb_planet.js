/*
 * MOVIE 2 · DRAGON BALL SUPER: BROLY — part 1: "The Fall of Planet Vegeta" (Age 737)
 *
 *   EXILE *    (scene bb_pv_exile)   Planet Vegeta at dawn: the domed city, the palace. King Vegeta will not have a
 *                                    baby stronger than his own son: the pod with the infant Broly is sent to Vampa,
 *                                    and Paragus goes after it.
 *   PLAN       (scene bb_pv_plan)    in orbit, Frieza looks down at the red planet: the Saiyans grow too strong, and
 *                                    there is that legend. Every Saiyan is to be called home.
 *   RETURN *   (play)                BARDOCK comes home in his pod to a planet full of Frieza's men — the recall order
 *                                    smells wrong, and they will not let him near the launch pad. Two squads and an
 *                                    elite stand in the way.
 *   GINE       (scene bb_pv_gine)    at the pad: Gine. Bardock has decided — Kakarot leaves tonight, for Earth.
 *   LAUNCH *   (cue + staged)        the pod with their son in it: Gine at the console, Launch (Light) — it lifts off
 *                                    and streaks away into the orange sky.
 *   FALL       (staged)              the sky goes white-orange: a sun coming down. Bardock looks up — "Kakarot. Live."
 *                                    In orbit, the Supernova sinks into the planet; it cracks, glows and goes; Frieza
 *                                    laughs; a single pod falls toward a blue world.
 *   AFTER                            the title; next: "The Wild Planet".
 * Every phase marked * is a checkpoint. Dialogue: original lines written for this project.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const BK = SL.data.brolyKit;

  const PV = { waveA: 4, waveB: 3, launchAuto: 5, novaSeconds: 4, crackSeconds: 3.2 };
  const SPOT = { bardock: [26, 18], gine: [-30, -8], king: [10, 80], paragus: [6, 74], babyPod: [16, 72] };

  function setup(battle) {
    const b = battle;
    const at = (k) => BK.at(b, SPOT[k][0], SPOT[k][1]);
    const bardock = b.spawn({ charId: 'bardock', player: true, team: 0, pos: at('bardock'), startKi: 100 });
    const gine = b.spawn({ charId: 'gine', team: 0, pos: at('gine'), startKi: 0 });
    const king = b.spawn({ charId: 'king_vegeta', team: 0, pos: at('king'), startKi: 0 });
    const paragus = b.spawn({ charId: 'paragus', team: 0, pos: at('paragus'), startKi: 0 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: BK.at(b, -60, -60), startKi: 0 });
    const zarbon = b.spawn({ charId: 'zarbon', team: 1, pos: BK.at(b, -63, -62), startKi: 0 });
    const dodoria = b.spawn({ charId: 'dodoria', team: 1, pos: BK.at(b, -57, -62), startKi: 0 });
    K.watcher(gine, 'gine_idle', 'soft');
    K.watcher(king, 'kv_idle', 'cold');
    K.watcher(paragus, 'pg_idle', 'serious');
    for (const f of [frieza, zarbon, dodoria]) {
      K.watcher(f, 'idle', 'smirk');
      f.setHidden(true);
    }
    bardock.cannotDie = true;
    K.faceTo(king, BK.at(b, SPOT.babyPod[0], SPOT.babyPod[1]));
    K.faceTo(paragus, king.pos);
    b.story = { bardock, gine, king, paragus, frieza, zarbon, dodoria, soldiers: [] };
  }

  /** The baby's pod by the palace steps (a prop the scene launches). */
  function babyPod(m) {
    const b = m.battle, S = b.story;
    if (S.babyPod) return S.babyPod;
    const p = BK.at(b, SPOT.babyPod[0], SPOT.babyPod[1], 1.2);
    const pr = b.stage.addProp({ kind: 'pod', pos: p, r: 1.1, hp: 1e9, id: 'babyPod' });
    pr.lockable = false;
    pr.invulnerable = true;
    pr.static = true;
    S.babyPod = pr;
    return pr;
  }

  /** A prop flying up out of the frame on a streak of light (a pod leaving). */
  function launch(m, pr, opts = {}) {
    const b = m.battle;
    const from = pr.pos.clone();
    const dir = (opts.dir || new V3(0.25, 1, -0.35)).clone().normalize();
    let n = 0;
    b.onTick(() => {
      if (b.disposed || n > 200) return false;
      n++;
      const k = n / 60;
      pr.pos.copy(from).addScaledVector(dir, k * k * 18 + k * 2);
      pr.group.position.copy(pr.pos);
      if (n % 2 === 0) b.vfx.trail(pr.pos, opts.color || 0xbfe6ff, 0.9, 0.7);
      if (n === 1) {
        b.vfx.dust(from.clone().setY(from.y - 1), 2.4, 16, b.stage.def.dust || 0xb07a60);
        b.vfx.ring(from.clone().setY(from.y - 0.9), 4, 0xffd8a0, 0.5, new V3(0, 1, 0));
        b.sfx('dash', null, { at: from, pitch: 0.7, vol: 1 });
      }
      if (n === 200) pr.group.visible = false;
      return true;
    });
  }

  const P = {};

  P.exile = {
    id: 'exile',
    checkpoint: true,
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      babyPod(m);
      yield* SL.Cinema.play(m, 'bb_pv_exile');
      // the pod goes to Vampa
      const S = m.battle.story;
      if (S.babyPod && S.babyPod.group.visible && !m.flags.podGone) {
        m.flags.podGone = true;
        launch(m, S.babyPod, { dir: new V3(-0.3, 1, 0.4), color: 0x9affb8 });
        yield* SL.Cinema.play(m, 'bb_pv_exile2');
      }
      if (S.babyPod) S.babyPod.group.visible = false;
    },
  };

  /** In orbit over the red planet (the prologue's own orbit stage): Frieza's decision. */
  P.plan = {
    id: 'plan',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 0.4);
      yield* m.cine(0.45);
      for (const f of [S.bardock, S.gine, S.king, S.paragus]) f.setHidden(true);
      b.changeStage('orbit');
      m.endShot();
      const fz = S.frieza, zb = S.zarbon, dd = S.dodoria;
      for (const f of [fz, zb, dd]) {
        f.setHidden(false);
        f.grounded = false;
      }
      fz.setPosition(new V3(0, 44, -80));
      zb.setPosition(new V3(-3.4, 43.6, -78));
      dd.setPosition(new V3(3.4, 43.4, -78.5));
      for (const f of [fz, zb, dd]) {
        f.vel.set(0, 0, 0);
        f.yaw = f.prevYaw = Math.PI;
      }
      if (!S.hoverPod && SL.data.missions.prologue_final_stand && SL.data.missions.prologue_final_stand.props) {
        S.hoverPod = SL.data.missions.prologue_final_stand.props.hoverPod(1);
        fz.object.add(S.hoverPod);
      }
      fz.setState('scripted', { pose: 'fz_pod', expression: 'smirk' });
      zb.setState('scripted', { pose: 'armsCrossed', expression: 'calm' });
      dd.setState('scripted', { pose: 'idle', expression: 'grin' });
      m.fade('clear', 0.6);
      yield* SL.Cinema.play(m, 'bb_pv_plan');
      m.fade('black', 0.5);
      yield* m.cine(0.55);
      for (const f of [fz, zb, dd]) f.setHidden(true);
      if (S.hoverPod && S.hoverPod.parent) S.hoverPod.parent.remove(S.hoverPod);
      b.changeStage('planet_vegeta');
      m.endShot();
      for (const f of [S.gine, S.king, S.paragus]) f.setHidden(false);
      m.fade('clear', 0.6);
    },
  };

  P.ret = {
    id: 'return',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.bardock;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (b.stage.def.id !== 'planet_vegeta') {
        b.changeStage('planet_vegeta');
        m.endShot();
      }
      for (const f of [S.frieza, S.zarbon, S.dodoria, S.king, S.paragus]) f.setHidden(true);
      K.place(S.gine, BK.at(b, SPOT.gine[0], SPOT.gine[1]), 0);
      K.watcher(S.gine, 'gine_idle', 'soft');
      S.gine.setHidden(false);
      // the pod comes down out of the orange sky
      const land = BK.at(b, SPOT.bardock[0], SPOT.bardock[1]);
      if (!S.bardockPod) {
        const pr = b.stage.addProp({ kind: 'pod', pos: land.clone().add(new V3(-30, 60, 40)), r: 1.2, hp: 1e9, id: 'bardockPod' });
        pr.lockable = false;
        pr.invulnerable = true;
        pr.static = true;
        S.bardockPod = pr;
      }
      const pod = S.bardockPod;
      p.setHidden(true);
      p.controller = K.scripted();
      m.title(BK.CHAPTER, 'THE FALL OF PLANET VEGETA', 'Planet Vegeta · Age 737', 3.2);
      m.music('saiyan_home', 1);
      const from = land.clone().add(new V3(-30, 60, 40)), to = land.clone().add(new V3(0, 1.2, 0));
      m.shot((t, out) => {
        out.pos.copy(land).add(new V3(9, 2.2, -10));
        out.look.copy(pod.pos);
        out.fov = 52;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      let n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 60);
        pod.pos.copy(from).lerp(to, k * k);
        pod.group.position.copy(pod.pos);
        if (n % 2 === 0) b.vfx.trail(pod.pos, 0xffc080, 1, 0.6);
        return k >= 1 || b.skipRequested;
      };
      pod.pos.copy(to);
      pod.group.position.copy(to);
      b.stage.crater(land.clone(), 3, 0.8, null);
      b.vfx.dust(land.clone(), 3, 18, b.stage.def.dust);
      b.sfx('groundImpact', null, { at: land, vol: 1.1 });
      b.cameraTraumaAt(land, 0.5);
      p.setHidden(false);
      K.place(p, land.clone().add(new V3(-2.4, 0, -2)), 0);
      K.faceTo(p, BK.at(b, SPOT.gine[0], SPOT.gine[1]));
      yield* m.cine(0.8);
      m.endShot();
      // Frieza's men, between him and the pad
      const S2 = (x, z, id = 'frieza_soldier') => {
        const f = m.spawn({ charId: id, team: 1, pos: BK.at(b, x, z), startKi: 40, warp: false, tag: 'recall' });
        S.soldiers.push(f);
        K.faceTo(f, p.pos);
        return f;
      };
      if (!m.flags.waveA) {
        m.flags.waveA = true;
        for (let i = 0; i < PV.waveA; i++) S2(8 - i * 4, 4 - (i % 2) * 3);
      }
      p.hp = Math.max(p.hp, p.hpMax * 0.9);
      p.controller = null;
      b.switchPlayer(p, { force: true, quiet: true });
      m.say('bardock', 'A recall order for every Saiyan at once... and a welcome party. Something stinks.', 3.2);
      m.objective('pad', 'Get to the launch pad — Frieza\'s men are in the way', { icon: 'fist' });
      m.objective('squads', 'Defeat the squads', { icon: 'fist', target: PV.waveA + PV.waveB + 1 });
      const count = () => S.soldiers.filter((f) => !f.alive).length;
      m.lock(false);
      b.aiLocked = false;
      yield () => count() >= PV.waveA || m.state !== 'running';
      m.progress('squads', count());
      if (m.state !== 'running') return;
      // the second squad and their elite come out of the side street
      m.say('frieza_elite', 'That one\'s Bardock. Lord Frieza wants them ALL accounted for — bring him down!', 3, { style: 'shout' });
      for (let i = 0; i < PV.waveB; i++) S2(-14 - i * 3.5, -2 + i * 2.5);
      S2(-20, 4, 'frieza_elite');
      let shown = -1;
      yield () => {
        const c = count();
        if (c !== shown) m.progress('squads', (shown = c));
        return S.soldiers.every((f) => !f.alive) || m.state !== 'running';
      };
      if (m.state !== 'running') return;
      m.complete('squads');
      m.complete('pad');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      p.setState('scripted', { pose: 'idle', expression: 'serious' });
      yield* m.cine(0.6);
    },
  };

  P.gine = {
    id: 'gine',
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.bardock;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      for (const f of S.soldiers) f.setHidden(true);
      const pad = b.stage.landmarks.pad;
      K.place(p, pad.clone().add(new V3(4.5, 0, 9)), 0);
      K.place(S.gine, pad.clone().add(new V3(-1.5, 0, 10.5)), 0);
      K.faceTo(p, S.gine.pos);
      K.faceTo(S.gine, p.pos);
      p.controller = K.scripted();
      yield* SL.Cinema.play(m, 'bb_pv_gine');
    },
  };

  P.launch = {
    id: 'launch',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.bardock, g = S.gine;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      for (const f of S.soldiers) f.setHidden(true);
      const st = b.stage, pad = st.landmarks.pad;
      const pods = st.saiyanPods || [];
      const kakarot = pods[0];
      // at the pod: Gine at the console, Bardock beside her
      const podPos = kakarot ? kakarot.position.clone() : pad.clone().add(new V3(6, 1.6, 0));
      const toPad = pad.clone().sub(podPos).setY(0).normalize();
      K.place(g, BK.at(b, podPos.x + toPad.x * 2.2, podPos.z + toPad.z * 2.2), 0);
      K.place(p, BK.at(b, podPos.x + toPad.x * 2.8 + toPad.z * 1.6, podPos.z + toPad.z * 2.8 - toPad.x * 1.6), 0);
      K.faceTo(g, podPos);
      K.faceTo(p, podPos);
      p.controller = K.scripted();
      g.setState('scripted', { pose: 'gine_console', expression: 'sad' });
      p.setState('scripted', { pose: 'armsCrossed', expression: 'serious' });
      b.switchPlayer(p, { force: true, quiet: true });
      m.music('farewell', 1);
      m.shot((t, out) => {
        out.pos.copy(podPos).addScaledVector(toPad, 4.8).add(new V3(toPad.z * 1.2, 0.8, -toPad.x * 1.2));
        out.look.copy(podPos).add(new V3(0, 0.1, 0));
        out.fov = 44;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('gine', 'Kakarot... be good. Eat well. Don\'t forget us.', 3, { style: 'quiet' });
      yield* m.cine(2.4);
      m.objective('launch', 'Launch the pod', { icon: 'target' });
      const r = yield* m.cue('light', 'Launch the pod', { auto: PV.launchAuto });
      m.qteParts.push(r.pressed ? 1 : 0.6);
      m.complete('launch');
      if (kakarot && !m.flags.launched) {
        m.flags.launched = true;
        const pr = { pos: kakarot.position.clone(), group: kakarot };
        launch(m, pr, { dir: new V3(0.3, 1, 0.2), color: 0xbfe6ff });
      }
      g.setState('scripted', { pose: 'gine_wave', expression: 'sad' });
      p.setState('scripted', { pose: 'idle', expression: 'serious' });
      // from low behind them: the pod rising past, Gine waving
      m.shot((t, out, el) => {
        const k = Math.min(1, (el || 0) / 2.6);
        out.pos.copy(g.pos).addScaledVector(toPad, 3.4).add(new V3(0, 0.6, 0));
        out.look.copy(podPos).add(new V3(0, 2 + k * 18, 0));
        out.fov = 54;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      yield* m.cine(2.6);
      g.setState('scripted', { pose: 'gine_cry', expression: 'sad' });
      SL.Cinema.shotOn(m, { gine: g }, { subject: 'gine', focus: 'upper', angle: 'three' }, 2.6, { cut: true, blendIn: 0, hold: true });
      m.say('bardock', 'He\'ll make it. He\'s our son.', 2.4);
      yield* m.cine(2.6);
      m.endShot();
    },
  };

  /** The Supernova over the city, then the planet seen from orbit going to pieces. */
  P.fall = {
    id: 'fall',
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.bardock, g = S.gine;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      const st = b.stage;
      const T = SL.Toon;
      // a sun in the sky, coming down
      const sunG = new THREE.Group();
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshBasicMaterial({ color: 0xffa040, fog: false }));
      const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xffe0a0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
      sunG.add(sphere, core);
      b.scene.add(sunG);
      const cleanSun = () => {
        if (sunG.parent) b.scene.remove(sunG);
        sphere.geometry.dispose();
        sphere.material.dispose();
        core.material.dispose();
      };
      m.onDispose(cleanSun);
      const sky0 = p.pos.clone().add(new V3(-40, 420, -260));
      let sk = 0;
      const sunTick = () => {
        sk = Math.min(1, sk + 1 / (60 * 7));
        sunG.position.copy(sky0).lerp(p.pos.clone().add(new V3(-10, 120, -60)), sk * sk);
        const r = 30 + sk * 60;
        sphere.scale.setScalar(r);
        core.scale.setScalar(r * 3.2);
      };
      m.tickHooks.push(sunTick);
      st.setMood(0.35, 0x6a2a08, 2);
      SL.Music.stop(1);
      p.setState('scripted', { pose: 'idle', expression: 'shock' });
      K.faceTo(p, sunG.position);
      K.faceTo(g, sunG.position);
      g.setState('scripted', { pose: 'gine_cry', expression: 'shock' });
      // the two of them, small, under it
      m.shot((t, out) => {
        const mid = p.pos.clone().lerp(g.pos, 0.5);
        out.pos.copy(mid).add(new V3(6, 0.6, 8));
        out.look.copy(mid).add(new V3(-2, 4, -4)).lerp(sunG.position, 0.08);
        out.fov = 60;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      b.sfx('rumble', null, { vol: 0.8, pitch: 0.6 });
      yield* m.cine(2.4);
      SL.Cinema.shotOn(m, { bardock: p }, { subject: 'bardock', focus: 'closeup', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      m.say('bardock', 'Frieza...', 1.6, { style: 'quiet' });
      yield* m.cine(1.8);
      p.setState('scripted', { pose: 'idle', expression: 'soft' });
      m.say('bardock', 'Kakarot. Live.', 2.2, { style: 'quiet' });
      yield* m.cine(2.2);
      SL.ScreenFX.flash(0.9, '#ffd8a0');
      m.fade('white', 0.5);
      yield* m.cine(0.6);
      K.unhook(m, sunTick);
      cleanSun();
      for (const f of [p, g, S.king, S.paragus]) f.setHidden(true);
      for (const f of S.soldiers) f.setHidden(true);
      st.clearMood(0.1);
      // ---- in orbit: the end of the planet
      b.changeStage('orbit');
      m.endShot();
      const os = b.stage;
      const fz = S.frieza;
      fz.setHidden(false);
      fz.grounded = false;
      fz.setPosition(new V3(0, 44, -80));
      fz.vel.set(0, 0, 0);
      fz.yaw = fz.prevYaw = Math.PI;
      if (SL.data.missions.prologue_final_stand && SL.data.missions.prologue_final_stand.props) {
        if (!S.hoverPod) S.hoverPod = SL.data.missions.prologue_final_stand.props.hoverPod(1);
        if (!S.hoverPod.parent) fz.object.add(S.hoverPod);
      }
      fz.setState('scripted', { pose: 'fz_finger', expression: 'smirk' });
      const FX = SL.data.cinematics.planetFX;
      const planet = os.planet, atmo = os.atmo;
      const extras = [];
      const drop = () => {
        for (const x of extras.splice(0)) x.dispose();
      };
      m.onDispose(drop);
      const nova = new THREE.Group();
      const nb = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshBasicMaterial({ color: 0xff8a2a, fog: false }));
      const ng = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0xffd090, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
      nova.add(nb, ng);
      b.scene.add(nova);
      extras.push({ dispose: () => {
        if (nova.parent) b.scene.remove(nova);
        nb.geometry.dispose();
        nb.material.dispose();
        ng.material.dispose();
      } });
      const PC = planet ? planet.position.clone() : new V3(0, -860, -260);
      const F = fz.chest();
      const down = F.clone().sub(PC).normalize().negate();
      const I = PC.clone().addScaledVector(down.clone().negate(), 700);
      const n0 = F.clone().add(new V3(0, 14, 0));
      const cracks = planet && FX ? FX.crackShell(b, planet, down.clone().negate()) : null;
      if (cracks) extras.push(cracks);
      let T0 = 0;
      const nrm = F.clone().sub(I).normalize();
      const side = new V3().crossVectors(nrm, new V3(0, 1, 0)).normalize();
      const tick = () => {
        T0 += 1 / 60;
        if (T0 < PV.novaSeconds) {
          const k = Math.pow(T0 / PV.novaSeconds, 3);
          nova.position.lerpVectors(n0, I, k);
          const r = U.lerp(10, 105, k);
          nb.scale.setScalar(r);
          ng.scale.setScalar(r * 3);
        } else if (planet && planet.visible) {
          const k = U.clamp01((T0 - PV.novaSeconds) / PV.crackSeconds);
          nova.visible = k < 0.4;
          if (cracks) cracks.set(k);
          const em = planet.material && planet.material.emissive;
          if (em) em.setRGB(0.55 * k, 0.16 * k, 0.03 * k);
          planet.scale.setScalar(1 + 0.025 * k * k);
          if (cracks) cracks.mesh.scale.setScalar(1 + 0.025 * k * k);
          if (b.frame % 10 === 0) {
            const d = down.clone().negate().add(new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).multiplyScalar(0.3 + k * 0.6)).normalize();
            const at = PC.clone().addScaledVector(d, 700);
            b.vfx.ball(at, U.rand(30, 70) * (0.6 + k), 0xff8a3a, 1.2);
          }
          b.camera.trauma = Math.max(b.camera.trauma, 0.1 + 0.2 * k);
        }
        for (const x of extras) if (x.update) x.update(1 / 60);
      };
      m.tickHooks.push(tick);
      m.shot((t, out, el) => {
        const kC = U.clamp01(((el || 0) - PV.novaSeconds) / 6);
        const dist = U.lerp(17, 90, kC * kC);
        out.pos.copy(F).addScaledVector(nrm, dist).addScaledVector(side, U.lerp(-6, -40, kC)).add(new V3(0, U.lerp(2.5, 30, kC), 0));
        out.look.copy((el || 0) < PV.novaSeconds ? nova.position : I).lerp(PC, kC * 0.5);
        out.fov = U.lerp(56, 62, kC);
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.fade('clear', 0.5);
      b.sfx('rumble', null, { vol: 0.8 });
      m.say('frieza', 'Goodbye, my little monkeys.', 2.4);
      yield* m.cine(PV.novaSeconds);
      b.sfx('groundImpact', null, { vol: 1 });
      fz.setState('scripted', { pose: 'fz_laugh', expression: 'grin' });
      yield* m.cine(PV.crackSeconds);
      // gone
      SL.ScreenFX.flash(0.8, '#ffe2b0');
      b.sfx('explosionHuge', null, { vol: 1.2 });
      b.vfx.ball(PC, 880, 0xffb060, 4.5);
      b.vfx.flash(PC, 3200, 0xffd9a0, 1.4, T.tex.glow);
      b.vfx.ring(PC, 1900, 0xffd0a0, 3.4, new V3(0.15, 1, 0.1).normalize());
      b.camera.addTrauma(0.6);
      if (planet) planet.visible = false;
      if (atmo) atmo.visible = false;
      if (cracks) {
        cracks.dispose();
        extras.splice(extras.indexOf(cracks), 1);
      }
      if (FX) {
        extras.push(FX.planetChunks(b, PC, 36));
        extras.push(FX.emberCloud(b, PC));
      }
      os.setMood(0.2, 0x2a0a04, 2);
      yield* m.cine(4.5);
      // a single pod, falling toward a blue world
      m.fade('black', 1);
      yield* m.cine(1.1);
      K.unhook(m, tick);
      drop();
      fz.setHidden(true);
      os.clearMood(0.1);
      b.camera.trauma = 0;
      const Q = new V3(0, 70, 330), dirE = new V3(-0.25, -0.42, 0.87).normalize();
      const E = Q.clone().addScaledVector(dirE, 520);
      if (FX) {
        const earth = FX.earthFx(b, E, 250);
        const pod = FX.podFx(b);
        extras.push(earth, pod);
        const podFrom = Q.clone().add(new V3(1.4, -0.5, -7));
        const podTo = E.clone().addScaledVector(dirE.clone().negate().add(new V3(0, 0.35, 0)).normalize(), 252);
        let kp = 0;
        const podTick = () => {
          kp = Math.min(1, kp + 1 / (60 * 5.6));
          pod.group.position.lerpVectors(podFrom, podTo, Math.pow(kp, 0.6));
          if (b.frame % 2 === 0 && kp < 1) b.vfx.trail(pod.group.position, kp > 0.9 ? 0xffa050 : 0x9fd8ff, U.lerp(1.2, 3, kp), 0.9);
          earth.update(1 / 60);
        };
        m.tickHooks.push(podTick);
        m.onDispose(() => K.unhook(m, podTick));
        m.shot((t, out, el) => {
          out.pos.copy(Q).addScaledVector(dirE, 30 * Math.min(1, (el || 0) / 8));
          out.look.copy(E).add(new V3(0, 150, 0)).lerp(pod.group.position, U.clamp01(((el || 0) - 0.4) / 2) * 0.3);
          out.fov = 52;
        }, 999, { hold: true, cut: true, blendIn: 0 });
      }
      m.fade('clear', 1.4);
      SL.Music.stinger('dawn');
      yield* m.cine(2.2);
      m.title('', 'Earth', 'A pod falls · Age 737', 3.2);
      yield* m.cine(3.4);
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(BK.CHAPTER, 'THE FALL OF PLANET VEGETA', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'bb_planet',
    movie: 'super_broly',
    chapter: BK.CHAPTER,
    title: 'The Fall of Planet Vegeta',
    subtitle: 'Part 1 · Planet Vegeta · Age 737',
    character: 'bardock',
    stage: 'planet_vegeta',
    parTime: 300,
    qteLabel: 'The launch',
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'A king afraid of a baby, a tyrant afraid of a legend, and one Saiyan soldier who sends his son away before the sky falls.',
    rewards: ['Movie: The Fall of Planet Vegeta'],
    setup,
    phases: [P.exile, P.plan, P.ret, P.gine, P.launch, P.fall, P.after],
  };

  SL.data.bbPlanet = { PV };
  SL.data.missions[def.id] = def;
})();
