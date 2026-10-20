/*
 * CHAPTER 4 — NAMEK SAGA
 * Mission "The Emperor's True Power" (canon, played as Goku).
 *
 * Canon beats: the prince is in the ground and Goku turns around. The first exchange
 * belongs to Frieza — base Goku can fight him, dodge him and sometimes touch him, and
 * none of it matters. Then the Kaioken, and for the first time the emperor has to move
 * his feet; every level Goku pushes to, Frieza answers.
 *
 * Phases: OPEN (scene `goku_frieza_confrontation`: wide and above, Frieza on his rock, Goku
 * in his guard on the low ground) → BASE (checkpoint: the first exchanges staged in scene
 * `goku_tests_frieza`, then base Goku against a Frieza who is toying with him — the story
 * battle, not an even match) → LAKE (staged, two cues: kicked into a lake, the underwater
 * Kamehameha decoys, the double-foot stomp into the shore rock — roadmap #24) → KAIOKEN (scene `frieza_shows_the_gap`: through the pillar,
 * "I've been holding back"; then `goku_kaioken_escalation`: he lights it, the first Kaioken
 * rush, Frieza's counter) → RISING (checkpoint: Kaioken x2 → x3 → x4, each one answered) →
 * AFTER (Frieza has started to take it seriously, and says how much further there is to go).
 * Goku's gi takes its first damage at the pillar (Fighter.setDamage; the Namek gi's rips).
 *
 * The story ceiling here is x4 (formCaps); x10 and x20 belong to the next mission.
 * Super Saiyan is locked by the chronology rule (SL.data.formGivenBy).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -12);
  const BASE_SECONDS = 30;
  const RISING_SECONDS = 30;
  const PERCH = new V3(0, 0, -6); // Frieza's rock, relative to FIELD
  const PILLAR = new V3(-7.5, 0, 6.5); // the pillar Goku goes through

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }
  function ground(b, v, lift = 0) {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z) + lift;
    return p;
  }
  function place(f, pos, yaw) {
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  function clearArea(b, center, r) {
    for (const o of b.stage.obstacles) {
      if (!o.alive) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  const cpu = (b, profile) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** The grave he made in the mission before this one, still there. */
  function grave() {
    const g = new THREE.Group();
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), SL.Toon.mat(0x6a5a44));
    mound.scale.set(1, 0.35, 0.8);
    g.add(mound);
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.8, 0.14), SL.Toon.mat(0x8a8f86));
    SL.Toon.addOutline(stone, 1.4);
    stone.position.set(0, 0.42, -0.62);
    stone.rotation.z = 0.06;
    g.add(stone);
    return g;
  }

  /**
   * Frieza as the fight opens: the emperor, toying, nowhere near trying. tune: the story
   * phase's rhythm and string length (owner's Frieza fairness pass — the early emperor is
   * dangerous but learnable: short strings, long looks at what Goku does about them).
   */
  function emperor(b, fz, g, tune = {}) {
    fz.applyForm(3);
    fz.mech.phase = 3;
    fz.bossPhaseCap = 3;
    fz.hp = fz.hpMax;
    fz.poise.value = fz.poise.max;
    fz.cannotDie = true;
    fz.infiniteHp = true; // nothing in this mission finishes him
    fz.aiPhase = 'dominant';
    fz.aiRhythm = tune.rhythm || null;
    fz.controller = cpu(b, tune.profile);
    fz.target = g;
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 40);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 8))), startKi: 100 });
    // he has the Kaioken, but the story lights it in the middle of the fight
    goku.lockedForms = { kaioken: true };
    goku.lockedSlots = { transform: true };
    // tonight's ceiling: x4. x10 and x20 are the next mission's
    goku.formCaps = { kaioken: 2 };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: ground(b, FIELD.clone().add(new V3(16, 0, 18))), startKi: 30 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: ground(b, FIELD.clone().add(new V3(-15, 0, 19))), startKi: 30 });
    // the prince is in the ground by now; he is kept in the cast so the story knows him
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: ground(b, FIELD.clone().add(new V3(13, 0, 18))), startKi: 20 });
    vegeta.lockedForms = { ssj: true };
    vegeta.lockedSlots = { transform: true };
    vegeta.setHidden(true);
    vegeta.alive = false;
    for (const f of [krillin, gohan, vegeta]) {
      f.controller = scripted();
      f.untargetable = true;
      f.intangible = true; // watching from far off: a stray blast passes them (one used to floor Gohan)
      f.cannotDie = true;
      f.hp = Math.round(f.hpMax * 0.12); // everybody here has already lost today
    }
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -6))), startKi: 140, tags: { boss: true, priority: true } });
    frieza.controller = scripted();
    frieza.applyForm(3); // final form: this is the fight everything has been leading to
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    const graveAt = ground(b, FIELD.clone().add(new V3(11, 0, 13)));
    const mound = grave();
    mound.position.copy(graveAt);
    b.stage.scene.add(mound);
    if (b.mission) b.mission.onDispose(() => b.stage.scene.remove(mound));
    faceTo(frieza, goku.pos);
    // the field as the fight finds it (Namek saga cinematic brief): a low rock Frieza waits on, and a
    // rock pillar beside Goku's ground that the gap in power puts him through
    const perch = b.stage.addSpire(FIELD.x + PERCH.x, FIELD.z + PERCH.z, 1.9, 1.5);
    const pillar = b.stage.addSpire(FIELD.x + PILLAR.x, FIELD.z + PILLAR.z, 1.5, 6);
    for (const o of [perch, pillar]) o.hp = o.maxHp = 1e9; // the story breaks them, not a stray blast
    // where the blow lands him: the pillar's face toward the field at chest height, and its foot
    const side = new V3(1, 0, 0);
    const hit = new V3(pillar.x, 0, pillar.z).addScaledVector(side, pillar.r + 0.45);
    hit.y = b.stage.heightAt(hit.x, hit.z) + 1.3;
    const foot = ground(b, new V3(pillar.x, 0, pillar.z).addScaledVector(side, 0.9));
    b.story = {
      goku, krillin, gohan, vegeta, frieza,
      grave: { pos: graveAt, object: mound },
      field: { pos: FIELD.clone() },
      rocks: { perch, pillar },
      pillarHit: { pos: hit },
      pillarFoot: { pos: foot },
    };
  }

  /** A rock the fight has already broken, when a checkpoint lands past the beat that broke it. */
  function broken(b, o) {
    if (o && o.alive) b.stage.destroyPillar(o, { quiet: true });
  }

  const P = {};

  /*
   * The grave is behind him and the emperor is in front of him: the fight starts here. Wide and above
   * first, then closer; Frieza on his rock, Goku on the low ground in his guard (scene
   * `goku_frieza_confrontation`).
   */
  P.open = {
    id: 'open',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza, perch = S.rocks.perch;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      for (const f of [g, fz]) f.controller = scripted();
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      if (perch.alive) place(fz, new V3(perch.x, perch.top, perch.z), 0);
      else place(fz, ground(b, FIELD.clone().add(PERCH)), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      yield* SL.Cinema.play(m, 'goku_frieza_confrontation');
    },
  };

  /*
   * BASE GOKU AGAINST THE EMPEROR. He can fight, dodge and counter; he cannot make it
   * matter. Frieza slips most of what Goku throws (a story power gap, the other way round
   * from the Ginyu fight) and hits at a fraction of what he could.
   */
  P.base = {
    id: 'base',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      g.setHidden(false);
      g.untargetable = false;
      b.switchPlayer(g, { force: true });
      g.lockedForms = Object.assign(g.lockedForms || {}, { kaioken: true }); // still saved
      g.lockedSlots = { transform: true };
      if (g.formIndex !== 0) g.applyForm(0);
      g.hp = g.hpMax;
      g.ki = Math.max(g.ki, 90);
      g.cannotDie = true; // canon: this is not where Goku dies
      // the first exchanges are staged (scene `goku_tests_frieza`): Goku tests him, Frieza takes the
      // exchange back and sends him sliding; the fight is handed over from where that leaves them
      for (const f of [g, fz]) f.controller = scripted();
      broken(b, S.rocks.perch);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -1.4))), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      yield* SL.Cinema.play(m, 'goku_tests_frieza');
      m.lock(true);
      // toying: two decisions and a long look, strings of one to three blows
      emperor(b, fz, g, { rhythm: { burst: 2, rest: 100 }, profile: { comboLen: 2 } });
      fz.damageDealtMul = 0.5; // he is not trying yet, and it shows
      // most of what base Goku throws is simply not there when it arrives
      fz.storyEvade = { chance: 0.55, gap: 26, from: [g] };
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('battle', 3);
      m.objective('base', 'Stand up to the emperor', { icon: 'clock', target: BASE_SECONDS });
      m.objective('touch', 'Land eight clean hits', { icon: 'fist', optional: true, target: 8 });
      let hits = 0, slipped = 0;
      b.on('damage', (e) => {
        if (e.target === fz && e.attacker === g) {
          hits++;
          m.progress('touch', Math.min(8, hits));
        }
      });
      b.on('storyEvade', (e) => {
        if (e.fighter !== fz) return;
        slipped++;
        if (slipped === 1) m.say('frieza', 'Too slow, monkey.', 1.8);
        if (slipped === 5) m.say('frieza', 'Is this really the best the Saiyans have to offer?', 2.4);
      });
      m.prompt('gkBeam', 'dodge', 'His beam goes through a guard — move', {
        always: true,
        when: () => fz.state === 'specialThrow',
        until: () => fz.state !== 'specialThrow',
      });
      let t = 0;
      const clock = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('base', Math.min(BASE_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(clock);
      yield () => t >= BASE_SECONDS || !g.alive;
      const i = m.tickHooks.indexOf(clock);
      if (i >= 0) m.tickHooks.splice(i, 1);
      fz.storyEvade = null;
      if (!g.alive) return;
      m.complete('base');
      if (hits >= 8) m.complete('touch');
      else m.failObjective('touch');
      m.flags.baseHits = hits;
      m.flags.baseSlipped = slipped;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  /*
   * THE LAKE (the owner's moveset roadmap #24, 2026-10-17: "the underwater Kamehameha trick and the double-foot
   * stomp"). Frieza kicks him into a lake and waits over the water for him to come up. Seen split at the water line
   * (Frieza above, Goku deep below), Goku fires two Kamehameha underwater to either side of the lake (a cue): two
   * columns of water go up and Frieza looks from one to the other — and Goku comes straight up out of the spray, turns
   * over high above him and drives both feet down into his face, into the rock of the shore (a cue). Staged; the
   * lake is dug into the Namek ground here (the stage's water plane fills anything below its level).
   */
  const LAKE = new V3(0, 0, -58); // the lake's centre (FIELD is at z -12: the lake lies beyond Frieza's rock)
  const LAKE_R = 24, LAKE_DEPTH = 9;
  {
    const C = SL.data.poses;
    // rising through the water: arms straight up together, legs together (hands are [left, right])
    C.g_swimUp = C.g_swimUp || { hands: ['fist', 'fist'], root: { rx: -4 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-20, 0, 0], shoulderL: [-172, 0, 6], elbowL: [-6, 0, 0], shoulderR: [-172, 0, -6], elbowR: [-6, 0, 0], thighL: [-4, 0, 2], kneeL: [6, 0, 0], footL: [40, 0, 0], thighR: [-4, 0, -2], kneeR: [6, 0, 0], footR: [40, 0, 0] };
    // coming down feet first: both soles driven straight down, arms flung up, looking down at him
    C.g_doubleStomp = C.g_doubleStomp || { hands: ['fist', 'fist'], root: { y: 0.1, rx: 6 }, spine: [8, 0, 0], chest: [6, 0, 0], head: [30, 0, 0], shoulderL: [-150, 0, 26], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -26], elbowR: [-30, 0, 0], thighL: [-8, 0, 5], kneeL: [12, 0, 0], footL: [30, 0, 0], thighR: [-8, 0, -5], kneeR: [12, 0, 0], footR: [30, 0, 0] };
  }

  /** A column of water thrown up off the lake: a pale cylinder rising and thinning, spray round its foot. */
  function waterPillar(m, at) {
    const b = m.battle;
    const mat = new THREE.MeshBasicMaterial({ color: 0xd8f4ee, transparent: true, opacity: 0.75, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.6, 1, 14, 1, true), mat);
    mesh.position.copy(at);
    b.scene.add(mesh);
    const dispose = () => {
      if (!mesh.parent) return;
      b.scene.remove(mesh);
      mesh.geometry.dispose();
      mat.dispose();
    };
    m.onDispose(dispose);
    let life = 0;
    b.onTick(() => {
      if (b.disposed || !mesh.parent) return false;
      life += 1 / 60;
      const k = life / 2.4, h = 26 * Math.min(1, k * 2.2);
      mesh.scale.set(1 + k * 0.6, Math.max(0.01, h), 1 + k * 0.6);
      mesh.position.y = at.y + h / 2;
      mat.opacity = 0.75 * Math.max(0, 1 - Math.max(0, k - 0.4) * 1.7);
      if (k >= 1) {
        dispose();
        return false;
      }
      return true;
    });
    b.vfx.ring(at.clone().add(new V3(0, 0.1, 0)), 7, 0xd8f4ee, 0.6, new V3(0, 1, 0));
    b.vfx.debrisBurst(at.clone().add(new V3(0, 1, 0)), 14, 0xbfe8e4, 16, 0.25);
    b.sfx('explosionBig', null, { at, vol: 0.8, pitch: 1.3 });
    m.flags.pillars = (m.flags.pillars || 0) + 1;
  }

  /**
   * Under the water, the picture is: a blue-green wash over the frame whenever the lens is below the surface
   * (a DOM layer over the canvas, like the other screen effects; nothing in a headless run). Returns { off() }.
   */
  function underwater(m, level) {
    const b = m.battle;
    let el = null;
    try {
      const host = (SL.ScreenFX.flashEl && SL.ScreenFX.flashEl.parentNode) || (typeof document !== 'undefined' && document.body);
      if (host && host.appendChild) {
        el = document.createElement('div');
        el.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0;transition:opacity 0.15s;background:radial-gradient(ellipse at 50% 30%, rgba(40,160,170,0.32), rgba(6,60,80,0.62));';
        host.appendChild(el);
      }
    } catch (e) {
      el = null;
    }
    const hook = () => {
      const below = b.camera.camera.position.y < level;
      m.flags.underwaterShots = (m.flags.underwaterShots || 0) + (below ? 1 : 0);
      if (el) el.style.opacity = below ? '1' : '0';
    };
    m.tickHooks.push(hook);
    const off = () => {
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null;
    };
    m.onDispose(off);
    return { off };
  }

  P.lake = {
    id: 'lake',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      const st = SL.data.u6Kit.staged(m);
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      fz.storyEvade = null;
      const lvl = (b.stage.def.water && b.stage.def.water.level) || -2.6;
      const lake = new V3(FIELD.x + LAKE.x, 0, LAKE.z);
      // the lake: dug once into the ground (the water plane fills it), seen from below as well
      if (!S.lakeDug) {
        clearArea(b, lake, LAKE_R * 1.4);
        b.stage.crater(new V3(lake.x, b.stage.heightAt(lake.x, lake.z), lake.z), LAKE_R, LAKE_DEPTH, null, { clean: true });
        S.lakeDug = true;
      }
      const water = b.stage.water;
      const side0 = water ? water.material.side : 0;
      if (water) water.material.side = THREE.DoubleSide;
      m.onDispose(() => water && (water.material.side = side0));
      const wash = underwater(m, lvl);
      const toField = new V3(0, 0, 1); // from the lake toward the field
      const across = new V3(1, 0, 0);
      // 1. the kick: Frieza sends him off the shore into the middle of it
      const shore = ground(b, lake.clone().addScaledVector(toField, LAKE_R + 4));
      place(g, shore, Math.PI);
      place(fz, ground(b, shore.clone().addScaledVector(toField, 2.2)), Math.PI);
      faceTo(fz, g.pos);
      g.setState('scripted', { pose: 'idle', expression: 'grit' });
      fz.setState('scripted', { pose: 'g_sideKick', expression: 'cold', speed: 24 });
      m.shot((t, out) => camAt(out, shore.clone().addScaledVector(across, 14).add(new V3(0, 3, -6)), shore.clone().add(new V3(0, 1, -10)), 52), 999, { cut: true, blendIn: 0, hold: true });
      b.sfx('punchHeavy', g, { vol: 1.1 });
      b.vfx.impact(g.chest(), 3, 0xffffff);
      const bottom = ground(b, lake.clone());
      const from = g.pos.clone();
      let n = 0;
      g.setState('scripted', { pose: 'tumble', expression: 'hurt', speed: 14 });
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : Math.min(1, n / 50);
        const p = from.clone().lerp(new V3(lake.x, lvl, lake.z), k);
        p.y += Math.sin(k * Math.PI) * 6;
        g.grounded = false;
        g.setPosition(p);
        g.vel.set(0, 0, 0);
        return k >= 1;
      };
      waterPillar(m, new V3(lake.x, lvl, lake.z));
      place(g, bottom, 0);
      faceTo(g, shore);
      g.setState('scripted', { pose: 'idle', expression: 'grit' });
      m.flags.inLake = bottom.y < lvl - 2;
      // 2. split at the water line: Frieza over the water, smug; Goku deep under it
      const wait = new V3(lake.x, lvl + 3.2, lake.z + LAKE_R * 0.62);
      place(fz, wait, Math.PI);
      faceTo(fz, bottom);
      fz.setState('scripted', { pose: 'armsCrossed', expression: 'smirk' });
      b.stage.setMood(0.35, 0x0a4a4a, 0.6);
      m.onDispose(() => b.stage.clearMood(0.1));
      // side-on to the line between them, the lens just over the surface: him above it, Goku through it below
      const mid = new V3(lake.x, lvl, (bottom.z + wait.z) / 2);
      m.shot((t, out) => camAt(out, mid.clone().add(new V3(17, 0.3, 0)), mid.clone().add(new V3(0, 0.2, 0)), 62), 999, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Hiding in the water? Come up whenever you like, monkey. I will be right here.', 3.4);
      yield* st.wait(3.4);
      // 3. under the water: the decoys
      m.shot((t, out) => camAt(out, g.chest().addScaledVector(across, 3.4).add(new V3(0, 0.4, 2)), g.chest().add(new V3(0, 0.6, 0)), 46), 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'He\'s waiting for me up there... Then let\'s give him something to look at.', 3, { style: 'quiet' });
      yield* st.wait(2.2);
      g.setState('scripted', { pose: 'g_kameCharge', expression: 'grit', speed: 10 });
      const r1 = yield* st.cue('s1', 'Kamehameha — the decoys (Special 1)', { auto: 3 });
      m.qteParts.push(r1.pressed ? 1 : 0.5);
      for (const s of [-1, 1]) {
        const to = new V3(lake.x + s * LAKE_R * 0.7, lvl - 1, lake.z - 2);
        g.yaw = g.prevYaw = Math.atan2(to.x - g.pos.x, to.z - g.pos.z);
        g.setState('scripted', { pose: 'g_kameFire', expression: 'shout', speed: 24 });
        if (!b.skipRequested) {
          b.vfx.slash(g.handPos('R'), to, 0x8ad8ff, 0.4, 0.6);
          b.vfx.slash(g.handPos('R'), to, 0xffffff, 0.3, 0.2);
          b.sfx('beamFire', g, { vol: 0.9, pitch: 1.2 });
        }
        waterPillar(m, new V3(to.x, lvl, to.z));
        // he looks: first one way, then the other
        fz.yaw = fz.prevYaw = Math.atan2(to.x - fz.pos.x, to.z - fz.pos.z);
        fz.setState('scripted', { pose: 'idle', expression: 'shock' });
        m.shot((t, out) => camAt(out, fz.chest().addScaledVector(toField, 4).add(new V3(s * -1.5, 0.4, 0)), fz.chest(), 44), 999, { cut: true, blendIn: 0, hold: true });
        m.say('frieza', s < 0 ? 'What—?!' : 'Where is he?!', 1.4, { style: 'shout' });
        yield* st.wait(1.1);
      }
      m.flags.decoys = 2;
      // 4. straight up out of the spray, over him
      const over = fz.pos.clone().add(new V3(0, 11, 0));
      g.setState('scripted', { pose: 'g_swimUp', expression: 'grit', speed: 20 });
      // S-FRZ-02 (Roadmap Three, the owner's Gemini fight research — a research draft, not checked against the footage):
      // low and wide, the lens just over the water looking up past Frieza, tilting fast with Goku as he rockets out
      const g0 = g.pos.clone();
      const low = new V3(g0.x, lvl + 0.45, g0.z).addScaledVector(across, 7).addScaledVector(toField, 3.5);
      m.shot((t, out) => {
        camAt(out, low, g.chest().lerp(fz.chest(), 0.2), 54);
        out.roll = -0.08;
      }, 999, { cut: true, blendIn: 0, hold: true });
      m.flags.breachShot = true;
      let surfacedAt = 0;
      n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / 34));
        g.grounded = false;
        g.setPosition(g0.clone().lerp(over, k));
        g.vel.set(0, 0, 0);
        // he breaks the surface: the column of water goes up there and then, not after he is over him
        if (!surfacedAt && g.pos.y > lvl) {
          surfacedAt = n;
          waterPillar(m, new V3(g.pos.x, lvl, g.pos.z));
        }
        return k >= 1;
      };
      if (!surfacedAt) waterPillar(m, new V3(g0.x, lvl, g0.z));
      m.flags.surfaced = true;
      // he turns over at the top — high above, looking down on both of them and the water
      m.shot((t, out) => camAt(out, fz.pos.clone().add(new V3(3, 18, 4)), fz.pos.clone().add(new V3(0, 4, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
      g.setState('scripted', { pose: 'tumble', expression: 'grit', speed: 18 });
      faceTo(g, fz.pos);
      yield* st.wait(0.3);
      g.setState('scripted', { pose: 'g_doubleStomp', expression: 'shout', speed: 20 });
      const r2 = yield* st.cue('heavy', 'Both feet — now! (Heavy)', { auto: 2.4, slow: 0.35 });
      m.qteParts.push(r2.pressed ? 1 : 0.5);
      // 5. both feet into his face, and the two of them down into the rock of the shore
      const rock = ground(b, lake.clone().addScaledVector(toField, LAKE_R * 0.95));
      const f0 = fz.pos.clone(), gs = g.pos.clone();
      fz.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', speed: 30 });
      b.sfx('punchHeavy', fz, { vol: 1.3 });
      b.vfx.impact(fz.chest(), 4, 0xffffff);
      n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : Math.min(1, n / 16);
        fz.grounded = g.grounded = false;
        fz.setPosition(f0.clone().lerp(rock, k * k));
        g.setPosition(gs.clone().lerp(rock.clone().add(new V3(0, 1.9, 0)), k * k));
        fz.vel.set(0, 0, 0);
        g.vel.set(0, 0, 0);
        return k >= 1;
      };
      b.stage.crater(rock.clone(), 3.4, 1.4, null);
      place(fz, ground(b, rock), 0);
      faceTo(fz, lake);
      fz.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      if (!b.skipRequested) {
        b.vfx.dust(rock.clone(), 3, 20);
        b.vfx.debrisBurst(rock.clone().add(new V3(0, 0.5, 0)), 16, b.stage.def.terrain.rock, 14, 0.4);
        b.sfx('groundImpact', fz, { vol: 1.3 });
        b.cameraTraumaAt(rock, 0.9);
      }
      m.flags.stomp = true;
      const land = ground(b, rock.clone().addScaledVector(toField, 3));
      place(g, land, 0);
      faceTo(g, fz.pos);
      g.setState('scripted', { pose: 'idle', expression: 'smirk' });
      b.stage.clearMood(0.8);
      m.shot((t, out) => camAt(out, land.clone().addScaledVector(across, 6).add(new V3(0, 1.4, 2)), rock.clone().add(new V3(0, 0.8, 0)), 48), 999, { cut: true, blendIn: 0, hold: true });
      m.say('goku', 'Gotcha. Didn\'t see that one coming, huh?', 2.4);
      yield* st.wait(2.4);
      fz.setState('scripted', { pose: 'idle', expression: 'angry' });
      m.say('frieza', 'You... You put your filthy feet on MY face?!', 2.8, { style: 'shout' });
      yield* st.wait(2.8);
      if (water) water.material.side = side0;
      wash.off();
      m.endShot();
      b.skipRequested = false;
    },
  };

  /*
   * THE GAP, then the answer. Frieza stops toying and puts Goku through the pillar (scene
   * `frieza_shows_the_gap`: "I've been holding back"); Goku gets up and lights the Kaioken
   * (scene `goku_kaioken_escalation`, ending on his first Kaioken rush and Frieza's counter).
   */
  P.kaioken = {
    id: 'kaioken',
    run: function* (m) {
      const b = m.battle, S = b.story;
      clearCombat(b);
      for (const f of [S.goku, S.frieza]) f.controller = scripted();
      S.frieza.storyEvade = null;
      broken(b, S.rocks.perch);
      place(S.goku, ground(b, FIELD.clone().add(new V3(0, 0, PILLAR.z))), Math.PI);
      place(S.frieza, ground(b, FIELD.clone()), 0);
      faceTo(S.goku, S.frieza.pos);
      faceTo(S.frieza, S.goku.pos);
      S.goku.hp = Math.round(S.goku.hpMax * 0.45);
      yield* SL.Cinema.play(m, 'frieza_shows_the_gap');
      yield* SL.Cinema.play(m, 'goku_kaioken_escalation');
    },
  };

  /*
   * THE KAIOKEN, RISING. x2 lands; x3 and x4 are charged up to with the charge button, and
   * every level Frieza answers — his output goes up a step, he says so, and the exchanges
   * get heavier. The body pays: health drain and strain are real.
   */
  P.rising = {
    id: 'rising',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      g.setHidden(false);
      g.untargetable = false;
      b.switchPlayer(g, { force: true });
      // reaching this checkpoint directly: the story already lit the Kaioken, broke both rocks, and
      // put the first damage in the gi
      m.teach(g, 'form:kaioken');
      g.formCaps = { kaioken: 2 };
      if (g.formIndex < 1) g.applyForm(1);
      broken(b, S.rocks.perch);
      broken(b, S.rocks.pillar);
      if ((g.damageLevel || 0) < 1) g.setDamage(1);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 8))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      g.hp = Math.max(g.hp, Math.round(g.hpMax * 0.6));
      g.ki = Math.max(g.ki, 85);
      g.cannotDie = true;
      emperor(b, fz, g, { rhythm: { burst: 3, rest: 80 }, profile: { comboLen: 2 } });
      fz.storyEvade = null; // with the Kaioken lit, Goku lands
      fz.damageDealtMul = 0.6; // he has started paying attention
      g.target = fz;
      g.setState('free');
      fz.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('finale', 4);
      m.objective('push', 'Push the Kaioken to x4', { icon: 'transform', target: 2 });
      m.objective('hold', 'Keep him honest', { icon: 'clock', target: RISING_SECONDS });
      m.objective('strain', 'Finish it without overloading', { icon: 'guard', optional: true });
      let overloads = 0, kaiokenSeconds = 0, landed = 0;
      b.on('overload', (e) => {
        if (e.fighter !== g) return;
        overloads++;
        if (overloads === 1) m.failObjective('strain');
      });
      b.on('damage', (e) => {
        if (e.target === fz && e.attacker === g) landed++;
      });
      // ESCALATION: every time Goku pushes the Kaioken higher, Frieza answers it
      let stage = 0;
      b.on('formLevel', (e) => {
        if (e.fighter !== g || e.level <= stage) return;
        stage = e.level;
        m.progress('push', Math.min(2, stage));
        fz.damageDealtMul = 0.6 + stage * 0.1;
        b.bark(fz, 'taunt');
        b.cameraTraumaAt(g.chest(), 0.35);
        m.say('frieza', stage >= 2 ? 'Even higher? Then I\'ll stop playing nice.' : 'Oh? You\'re stronger than I thought.', 2.4);
      });
      // teach the climb where it is used, not in a menu
      m.prompt('kkUp', 'charge', 'Hold Charge — push the Kaioken higher', {
        required: true,
        always: true,
        when: () => g.formIndex === 1 && g.formLevel < 2 && g.state === 'free',
        until: () => g.formLevel >= 2,
      });
      m.prompt('kkCost', 'charge', 'The Kaioken burns health — power down to cool off', {
        always: true,
        when: () => g.formIndex > 0 && g.hpFrac < 0.3,
        until: () => g.formIndex === 0,
      });
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        if (g.formIndex > 0) kaiokenSeconds += 1 / 60;
        m.progress('hold', Math.min(RISING_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      // the climb is the point: the phase ends once he has reached x4 and held the fight
      yield () => (t >= RISING_SECONDS && stage >= 2) || t >= RISING_SECONDS * 2 || !g.alive;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      if (!g.alive) return;
      if (stage >= 2) m.complete('push');
      m.complete('hold');
      if (!overloads) m.complete('strain');
      m.flags.kaiokenSeconds = Math.round(kaiokenSeconds);
      m.flags.kaiokenReached = stage;
      m.flags.risingLanded = landed;
      m.flags.overloads = overloads;
      m.qteParts.push(U.clamp01(g.hpFrac));
      yield 0.4;
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [g, fz]) f.controller = scripted();
      // he ends it with the Kaioken still burning, whatever the last second of the fight was
      if (g.formIndex < 1) g.applyForm(1);
      place(g, ground(b, FIELD.clone().add(new V3(0, 0, 5))), Math.PI);
      place(fz, ground(b, FIELD.clone().add(new V3(0, 0, -3))), 0);
      faceTo(g, fz.pos);
      faceTo(fz, g.pos);
      g.setState('scripted', { pose: 'g_kaiokenFlex', expression: 'grit' });
      fz.setState('scripted', { pose: 'idle', expression: 'smirk' });
      m.shot((t, out) => camAt(out, g.chest().clone().addScaledVector(g.forward, U.lerp(2.6, 2.1, t)).add(new V3(-0.8, 0.3, 0)), g.chest(), 40), 3.2, { cut: true, blendIn: 0 });
      m.say('goku', 'x4, and he is still standing there like it is nothing.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      m.shot((t, out) => {
        const s = SL.Cinema.overShoulder(g, fz, { fov: 36, back: U.lerp(2.4, 2, t), side: 1, height: 0.8, lookUp: 0.25 });
        camAt(out, s.pos, s.look, s.fov);
      }, 3.6, { cut: true, blendIn: 0 });
      m.say('frieza', 'Impressive. You\'ve made me use my hands. Let\'s see how long that body of yours holds up.', 3.6);
      yield* m.cine(3.8);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('CHAPTER 4 · NAMEK SAGA', "THE EMPEROR'S TRUE POWER", m.nextLine(), 3.8);
      yield* m.cine(4);
    },
  };

  const def = {
    id: 'namek_goku',
    canon: true,
    chapter: 'CHAPTER 4 · NAMEK SAGA',
    title: "The Emperor's True Power",
    subtitle: 'Namek · base Goku against the emperor, and the Kaioken rising',
    character: 'goku',
    stage: 'namek',
    parTime: 360,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'He can fight Frieza, dodge him, even touch him — and none of it matters, until the Kaioken. Every level he climbs, the emperor answers.',
    rewards: ['Chapter 4 continues'],
    setup,
    phases: [P.open, P.base, P.lake, P.kaioken, P.rising, P.after],
  };

  SL.data.missions[def.id] = def;
})();
