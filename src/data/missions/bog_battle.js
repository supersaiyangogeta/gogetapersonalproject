/*
 * CHAPTER 16 — BATTLE OF GODS, mission 6: "Battle of Gods" (canon). Played as SUPER SAIYAN GOD GOKU.
 *
 *   RISE      (scene, GROUND → AIR)   "Somewhere with a little more room"; up off the deck, high over the ocean;
 *                                     divine ki feels like floating in water; THE FIRST CLASH: both vanish, empty
 *                                     sky, back already flying at each other, fist on fist — the flash, a ring of
 *                                     cloud, the ocean thrown up in a ring under it, both thrown back
 *   SKY *     (play, AIR)             over the ocean: a god's speed; every heavy blow throws the sea up; he is
 *                                     finally interested (God's Whim: ROUSED)
 *   DIVE      (scene, AIR → GROUND)   the fists meet; a kick drives Goku into the sea; down through the blue, and
 *                                     through the roof of a cavern under the sea floor
 *   CAVERN *  (play, UNDERGROUND)     crystals everywhere: they light the fight, flare at every heavy blow and
 *                                     shatter under it; the roof is a real roof (Stage.keepInDome: bodies, blasts
 *                                     and the lens all stay under it)
 *   BURIED    (scene, UNDERGROUND)    Beerus' barrage; the roof brought down on Goku; silence; the god turns his
 *                                     back; a tremor, a rock, magenta light through the cracks, his voice from under
 *                                     the rock — "I... WON'T LET YOU... DESTROY... MY... WORLD!!" — the pile blown
 *                                     outward, the God aura, the charge
 *   LAUNCH    (scene, UNDERGROUND → AIR → SPACE)  the 360° melee in the middle of the cave; the fists meet and
 *                                     every crystal goes; up through the ocean in a column of water, through the
 *                                     clouds, the sky going black, the Earth below; the clash over its curve
 *   EDGE *    (play, AIR / SPACE)     at the edge of space, with the God form's time running out
 *   EXPIRE    (scene, SPACE)          the red goes out of his hair — but the power stays in him
 *   GOD KI *  (play, SPACE)           Super Saiyan, with a god's power, still keeping up
 *   AFTER                             ("Next: My World")
 *
 * SPACE, said out loud: the ship's deck is GROUND; the sky over the ocean is AIR (keepAbove: nobody sinks into the
 * sea); the cavern is GROUND with AIR above it under a dome; the stratosphere is a 'space' stage (no ground at all).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = () => SL.data.bogKit;
  const BP = () => SL.data.bogParty;
  const S = (SL.data.scenes = SL.data.scenes || {});

  const B = {
    sky: new V3(70, 34, 64),         // the middle of the fight over the ocean (world height 34: ~41 m over the water)
    cave: new V3(0, 0, 0),
    edge: new V3(0, 0, 0),
    floors: { sky: 0.72, cave: 0.5, edge: 0.34, godki: 0.22 },
    godSeconds: 50,
    godkiSeconds: 45,
  };

  function setup(battle) {
    const b = battle;
    // Goku of the Super era: his own transformation lines, not Namek's
    K().superVoice(b);
    const s = BP().setup(b, { player: 'goku', godsHere: true });
    for (const f of Object.values(s)) if (f && f.setState && f !== s.goku) f.untargetable = f.intangible = true;
    K().toForm(s.goku, 'god');
    s.goku.lockedForms = { kaioken: true, ssj: true, ssj2: true, ssj3: true, godki: true };
    s.beerus.team = 1;
    return s;
  }

  /** The watchers on the deck, looking up (everybody but the two gods). */
  function watchers(m, pose = 'bg_lookUp') {
    const s = m.battle.story;
    for (const k of Object.keys(s)) {
      const f = s[k];
      if (!f || !f.setState || f === s.goku || f === s.beerus || f.hidden) continue;
      f.controller = K().scripted();
      f.untargetable = f.intangible = true;
      // everybody stunned — except Whis, who is enjoying himself
      if (f.state !== 'scripted' || pose) f.setState('scripted', { pose: k === 'whis' ? 'w_idle' : pose, expression: k === 'whis' ? 'smirk' : 'shock' });
    }
  }
  function hideWatchers(m) {
    const s = m.battle.story;
    for (const k of Object.keys(s)) {
      const f = s[k];
      if (!f || !f.setState || f === s.goku || f === s.beerus) continue;
      f.setHidden(true);
      f.untargetable = f.intangible = true;
      f.controller = K().scripted();
    }
  }

  /** A god fight: real gameplay; the story owns only the floors (who cannot be finished yet) and the space. */
  function godFight(m, opts) {
    const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
    bs.storyNoSell = null;
    bs.storyBlock = null;
    // he can still slip a blow now and then — but now he has to move to do it
    bs.storyEvade = { mode: 'god', chance: opts.evade === undefined ? 0.25 : opts.evade, gap: 45, kinds: ['step', 'vanish', 'parry'], stepPose: 'bg_sidestep', parryPose: 'bg_parry', count: 0 };
    K().brawl(m, g, bs, { profile: { aggression: opts.aggression || 0.78, defense: 0.7 }, song: opts.song || 'ssj_god', music: opts.music || 6 });
    bs.hp = Math.max(bs.hp, bs.hpMax * (opts.from || 1));
    const sf = m.storyFight({
      floors: [{ f: bs, at: opts.floor }, { f: g, at: 0.3 }],
      dealt: [{ f: g, mul: 1.15 }, { f: bs, mul: 0.55 }],
      taken: [{ f: bs, mul: 0.55 }],
      ease: { foe: bs, hero: g, below: 0.5, min: 0.4 },
      fighters: [g, bs],
      space: opts.space || 'air',
    });
    // the shockwave of a god's blow: rings in the air on every heavy hit
    const offShock = b.on('damage', (e) => {
      if (!e || e.blocked || !(e.amount > 1100)) return;
      if (e.target !== g && e.target !== bs) return;
      const p = e.point || e.target.chest();
      b.vfx.ring(p, 7, e.target === bs ? 0xff7a8a : 0xd8b0ff, 0.45);
      b.cameraTraumaAt(p, 0.3);
    });
    m.onDispose(offShock);
    return {
      sf,
      off() {
        sf.off();
        offShock();
      },
      floored: () => sf.floored(bs),
    };
  }

  /** The objective that tells how far he has pushed the god (to the floor). */
  function pushMeter(m, label, floor) {
    const bs = m.battle.story.beerus;
    let shown = -1;
    const top = Math.max(floor + 0.01, bs.hpFrac);
    return () => {
      const k = Math.round(((top - Math.max(floor, bs.hpFrac)) / (top - floor)) * 10);
      if (k !== shown) {
        shown = k;
        m.objective('push', label + '  ·  ' + k * 10 + '%');
      }
    };
  }

  /* ============================================================================ THE SET PIECES' OWN EFFECTS */
  /** The same "random" every run (a scene must look the same watched twice). */
  const rnd = (i, s = 0) => {
    const x = Math.sin(i * 127.1 + s * 311.7 + 0.5) * 43758.5453;
    return x - Math.floor(x);
  };
  const GOKU_TRAIL = 0xff5a6a, BEERUS_TRAIL = 0xc89aff;

  /** A god gone: the afterimage where he was, the snap of the air closing behind him. */
  function vanish(b, f, color) {
    if (f.hidden) return;
    b.vfx.afterimage(f.pos.clone(), 1.9 * (f.scale || 1), color);
    b.sfx('vanish', f, { vol: 1 });
    f.setHidden(true);
  }
  /** ...and back, already moving: at pos, in pose. */
  function appear(b, f, pos, pose, expr, color) {
    SL.Staging._put(f, pos);
    f.grounded = false;
    f.vel.set(0, 0, 0);
    f.setHidden(false);
    f.setState('scripted', { pose, expression: expr, speed: 30 });
    b.vfx.afterimage(pos.clone(), 1.9 * (f.scale || 1), color);
    b.sfx('teleport', f, { vol: 0.9 });
  }
  /** Both of them turned to face each other. */
  function faceOff(s) {
    K().faceTo(s.goku, s.beerus.pos);
    K().faceTo(s.beerus, s.goku.pos);
  }

  /**
   * A RING OF CLOUD thrown out flat from a blow in the open sky (the air itself condensing as the shock goes
   * through it): puffs round a circle in the plane whose normal is opts.normal, flying outward and slowing.
   */
  function cloudRing(b, at, opts = {}) {
    const n = opts.count || 72, sp = opts.speed || 30, r0 = opts.r0 || 2.5, size = opts.size || 3.4;
    const normal = (opts.normal || new V3(0, 1, 0)).clone().normalize();
    const u = Math.abs(normal.y) > 0.9 ? new V3(1, 0, 0) : new V3(0, 1, 0);
    const e1 = u.clone().cross(normal).normalize(), e2 = normal.clone().cross(e1).normalize();
    const g = opts.grey === undefined ? 0.96 : opts.grey;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(i) * 0.06;
      const d = e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a));
      const p = at.clone().addScaledVector(d, r0);
      const v = d.multiplyScalar(sp * (0.85 + rnd(i, 2) * 0.3));
      const c = g - rnd(i, 3) * 0.06;
      b.vfx.smoke.emit(p.x, p.y, p.z, v.x, v.y, v.z, c, c, Math.min(1, c + 0.03), opts.alpha || 0.85, size * (0.7 + rnd(i, 4) * 0.6), opts.life || 2.6, { grow: 1.8, drag: 0.85 });
    }
  }

  /**
   * THE OCEAN ANSWERING a blow struck high above it: a dip right under it, then a ring of spray racing out
   * across the water (seconds long, radius m wide), and the flat rings of the shock on the surface.
   */
  function seaRing(b, at, opts = {}) {
    const lvl = b.stage.waterLevel;
    if (lvl === undefined) return;
    const c = new V3(at.x, lvl + 0.15, at.z);
    const R = opts.radius || 70, secs = opts.seconds || 1.9;
    b.vfx.ring(c, R, 0xeaf8ff, secs, new V3(0, 1, 0));
    b.vfx.ring(c, R * 0.55, 0xbfe8ff, secs * 0.8, new V3(0, 1, 0));
    K().splash(b, c, 4.5);
    let n = 0;
    b.onTick(() => {
      n++;
      const t = n / 60 / secs;
      if (t >= 1) return false;
      if (n % 2) return true;
      const r = 3 + (R - 3) * U.easeOutCubic(t);
      const k = 28;
      for (let i = 0; i < k; i++) {
        const a = (i / k) * Math.PI * 2 + rnd(n, i) * 0.2;
        const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
        const up = (4 + rnd(i, n) * 5) * (1 - t * 0.6);
        b.vfx.smoke.emit(x, c.y + 0.4, z, Math.cos(a) * 5, up, Math.sin(a) * 5, 0.94, 0.98, 1, 0.75 * (1 - t), 2.4 + 2.4 * (1 - t), 1.2, { grow: 1.3, drag: 1.4, gravity: 5 });
      }
      return true;
    });
  }

  /**
   * THE RUBBLE: the cavern caving in on him. A mound of broken rock over `at` (on the floor):
   *   drop(k)   the rocks coming down out of the roof onto it (0 still up there → 1 settled)
   *   glow(k)   the God's light getting out between them — magenta through the gaps, a light inside the pile
   *             that turns the rocks' undersides red, shafts of it out of the top (0 dark → 1 blazing)
   *   shake(a)  every rock trembling (metres)
   *   nudge(i)  one rock lifting and falling back (the first sign)
   *   burst()   the whole pile thrown outward and gone
   *   dispose()
   */
  function rubble(b, at, opts = {}) {
    const R = opts.radius || 3.4;
    const g = new THREE.Group();
    g.position.copy(at);
    b.scene.add(g);
    const T = SL.Toon;
    const cols = [0x3a3456, 0x2e2a46, 0x46405e, 0x2a2640, 0x524a6a];
    const geos = [new THREE.DodecahedronGeometry(1, 0), new THREE.IcosahedronGeometry(1, 0), new THREE.BoxGeometry(1.5, 0.9, 1.1)];
    const rocks = [];
    const LAYERS = [[16, R * 0.92, 0.45, 1.0], [12, R * 0.62, 1.25, 0.9], [7, R * 0.34, 1.95, 0.8], [3, 0.35, 2.55, 0.85]];
    let i = 0;
    for (const [count, rr, hy, sz] of LAYERS) {
      for (let j = 0; j < count; j++, i++) {
        const a = (j / count) * Math.PI * 2 + rnd(i) * 0.5;
        const home = new V3(Math.cos(a) * rr * (0.8 + rnd(i, 2) * 0.25), hy + rnd(i, 3) * 0.25, Math.sin(a) * rr * (0.8 + rnd(i, 2) * 0.25));
        const mesh = new THREE.Mesh(geos[i % 3], T.mat(cols[i % cols.length]));
        const s = sz * (0.75 + rnd(i, 4) * 0.55);
        mesh.scale.set(s * (0.9 + rnd(i, 5) * 0.4), s * (0.65 + rnd(i, 6) * 0.3), s * (0.9 + rnd(i, 7) * 0.4));
        mesh.rotation.set(rnd(i, 8) * 6, rnd(i, 9) * 6, rnd(i, 10) * 6);
        mesh.position.copy(home);
        g.add(mesh);
        rocks.push({ mesh, home, high: 14 + rnd(i, 11) * 16, delay: rnd(i, 12) * 0.45, rot: mesh.rotation.clone(), lift: 0 });
      }
    }
    // the light inside: glow sprites under the surface (they show only where the rocks leave a gap), shafts out of
    // the top, and crack lines over the rock
    const add = (c, o) => new THREE.SpriteMaterial({ map: T.tex.glow, color: c, blending: THREE.AdditiveBlending, transparent: true, opacity: o, depthWrite: false, fog: false });
    const gaps = [];
    for (let k = 0; k < 26; k++) {
      const a = rnd(k, 20) * Math.PI * 2, el = 0.15 + rnd(k, 21) * 1.2;
      const sp = new THREE.Sprite(add(0xff2a8a, 0));
      sp.position.set(Math.cos(a) * Math.cos(el) * R * 0.78, 0.3 + Math.sin(el) * 2.2, Math.sin(a) * Math.cos(el) * R * 0.78);
      sp.scale.setScalar(1.1 + rnd(k, 22) * 0.9);
      sp.userData.ph = rnd(k, 23) * 6;
      g.add(sp);
      gaps.push(sp);
    }
    const shafts = [];
    for (let k = 0; k < 9; k++) {
      const a = rnd(k, 30) * Math.PI * 2, d = rnd(k, 31) * R * 0.6;
      const sp = new THREE.Sprite(add(0xff3a6a, 0));
      sp.position.set(Math.cos(a) * d, 2.6 + rnd(k, 32), Math.sin(a) * d);
      sp.scale.set(0.35 + rnd(k, 33) * 0.3, 3.5 + rnd(k, 34) * 3, 1);
      g.add(sp);
      shafts.push(sp);
    }
    // the cracks: zigzags found on the rock itself (a ray from outside onto the pile, step by step across it); a
    // segment that would bridge two rocks ends the crack there — the light is IN the rock, and moves with it
    const crackMat = new THREE.MeshBasicMaterial({ color: 0xff3a9a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const crackGeo = new THREE.BoxGeometry(1, 1, 1);
    const cracks = [];
    g.updateMatrixWorld(true);
    const ray = new THREE.Raycaster();
    const meshes = rocks.map((r) => r.mesh);
    const onRock = (a, el) => {
      const dir = new V3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el));
      ray.set(g.position.clone().add(new V3(0, 0.5, 0)).addScaledVector(dir, R + 6), dir.clone().negate());
      const hit = ray.intersectObjects(meshes, false)[0];
      if (!hit) return null;
      const n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : dir;
      return { p: hit.point.clone().addScaledVector(n, 0.025).sub(g.position), rock: rocks[meshes.indexOf(hit.object)] };
    };
    for (let k = 0; k < 18; k++) {
      let a = rnd(k, 40) * Math.PI * 2, el = 0.12 + rnd(k, 41) * 0.95;
      let prev = onRock(a, el);
      for (let q = 0; q < 5 && prev; q++) {
        a += (rnd(k, 42 + q) - 0.5) * 0.32;
        el += (rnd(k, 48 + q) - 0.35) * 0.22;
        const next = onRock(a, el);
        if (!next || next.rock !== prev.rock || next.p.distanceTo(prev.p) > 1.1) break;
        const seg = new THREE.Mesh(crackGeo, crackMat);
        seg.position.copy(prev.p).lerp(next.p, 0.5);
        seg.lookAt(next.p.clone().add(g.position));
        seg.scale.set(0.055, 0.055, prev.p.distanceTo(next.p) + 0.04);
        seg.userData = { k: k / 18, rock: prev.rock, home: seg.position.clone() };
        seg.visible = false;
        g.add(seg);
        cracks.push(seg);
        prev = next;
      }
    }
    const light = new THREE.PointLight(0xff2a6a, 0, 18, 2);
    light.position.set(0, 1.2, 0);
    g.add(light);
    let dropK = 1, glowK = 0, amp = 0, n = 0, gone = false;
    const place = () => {
      n++;
      for (const r of rocks) {
        const k = U.clamp01((dropK - r.delay * 0.6) / (1 - r.delay * 0.6));
        const fall = 1 - k * k;
        r.mesh.position.copy(r.home);
        r.mesh.position.y += r.high * fall + r.lift;
        if (amp > 0) {
          r.mesh.position.x += Math.sin(n * 1.9 + r.home.x * 7) * amp;
          r.mesh.position.y += Math.sin(n * 2.3 + r.home.z * 5) * amp * 0.6;
          r.mesh.position.z += Math.cos(n * 1.7 + r.home.y * 9) * amp;
        }
        r.lift *= 0.9;
      }
      for (const sp of gaps) sp.material.opacity = glowK * (0.7 + Math.sin(n * 0.25 + sp.userData.ph) * 0.3);
      for (const sp of shafts) sp.material.opacity = U.clamp01(glowK * 1.6 - 0.6) * (0.6 + Math.sin(n * 0.4 + sp.position.x) * 0.25);
      crackMat.opacity = U.clamp01(glowK * 1.4) * (0.85 + Math.sin(n * 0.5) * 0.15);
      for (const c of cracks) {
        c.visible = glowK > 0.05 && c.userData.k <= glowK * 1.25;
        if (c.visible) c.position.copy(c.userData.home).add(c.userData.rock.mesh.position).sub(c.userData.rock.home);
      }
      light.intensity = glowK * 5;
      const col = new THREE.Color(0xff2a9a).lerp(new THREE.Color(0xff3a2a), U.clamp01(glowK * 1.3 - 0.3));
      light.color.copy(col);
      crackMat.color.copy(col);
    };
    b.onTick(() => {
      if (gone) return false;
      place();
      return true;
    });
    return {
      group: g,
      top: () => g.position.clone().add(new V3(0, 2.8, 0)),
      drop(k) {
        dropK = U.clamp01(k);
      },
      glow(k) {
        glowK = U.clamp01(k);
      },
      shake(a) {
        amp = a;
      },
      nudge(i, h = 0.3) {
        const r = rocks[rocks.length - 1 - (i % rocks.length)];
        if (r) r.lift = h;
      },
      burst() {
        for (const r of rocks) {
          const p = r.mesh.getWorldPosition(new V3());
          const d = p.clone().sub(g.position).setY(0);
          if (d.lengthSq() < 0.01) d.set(rnd(r.home.x * 9) - 0.5, 0, rnd(r.home.z * 9) - 0.5);
          d.normalize();
          const v = d.multiplyScalar(14 + rnd(r.home.x, 3) * 16).add(new V3(0, 10 + rnd(r.home.z, 4) * 14, 0));
          b.vfx.rock(p, v, r.mesh.scale.x * 0.85, cols[Math.floor(rnd(r.home.y, 5) * cols.length)]);
        }
        this.dispose();
      },
      dispose() {
        if (gone) return;
        gone = true;
        b.scene.remove(g);
        for (const sp of gaps.concat(shafts)) sp.material.dispose();
        crackMat.dispose();
        crackGeo.dispose();
        geos.forEach((x) => x.dispose());
      },
    };
  }

  /**
   * A BALL OF GOD KI thrown down (Beerus' barrage): a purple light flying from `from` to `to` over `seconds`,
   * bursting where it lands — a crater, rock thrown up, dust. Every tick until it lands.
   */
  function kiShot(b, from, to, seconds, opts = {}) {
    let n = 0;
    const total = Math.max(1, Math.round(seconds * 60));
    const p = from.clone();
    b.onTick(() => {
      n++;
      p.copy(from).lerp(to, n / total);
      b.vfx.flash(p, opts.size || 1.1, opts.color || 0xd07aff, 0.05, SL.Toon.tex.glow);
      b.vfx.trail(p, opts.color || 0xd07aff, 0.35, 0.18);
      if (n < total) return true;
      b.vfx.explosion(to, opts.radius || 1.6, opts.color || 0xd07aff, { smoke: true });
      if (b.stage.crater && b.stage.hasGround && to.y - b.stage.heightAt(to.x, to.z) < 1.2) b.stage.crater(to, opts.radius ? opts.radius * 1.4 : 2, 0.35, null);
      b.vfx.debrisBurst(to.clone().add(new V3(0, 0.3, 0)), 6, 0x3a3456, 9, 0.22);
      b.vfx.dust(to, 1.6, 8, 0x5a5470);
      b.sfx('explosionSmall', null, { at: to, pitch: 0.8 + rnd(n) * 0.3, vol: 0.9 });
      b.cameraTraumaAt(to, 0.22);
      return false;
    });
  }

  /** Light dust settling everywhere in a room (after the collapse): slow, grey, sinking. */
  function settleDust(b, at, radius, count = 40) {
    for (let i = 0; i < count; i++) {
      const a = rnd(i, 60) * Math.PI * 2, d = rnd(i, 61) * radius;
      const g = 0.32 + rnd(i, 62) * 0.12;
      b.vfx.smoke.emit(at.x + Math.cos(a) * d, at.y + 0.5 + rnd(i, 63) * 5, at.z + Math.sin(a) * d, Math.cos(a) * 0.6, -0.25, Math.sin(a) * 0.6, g, g * 0.95, g * 1.1, 0.5, 3 + rnd(i, 64) * 3, 4.5, { grow: 0.8, drag: 0.6 });
    }
  }

  const P = {};
  P.rise = K().scene('rise', 'bgb_rise');

  /** OVER THE OCEAN (AIR). */
  P.sky = {
    id: 'sky',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'cruise_liner') {
        b.changeStage('cruise_liner');
        m.endShot();
      }
      K().toForm(g, 'god');
      watchers(m);
      K().air(m, g, B.sky.x - 5, B.sky.y, B.sky.z, B.sky);
      K().air(m, bs, B.sky.x + 5, B.sky.y + 1, B.sky.z, g.pos);
      const above = K().keepAbove(m, [g, bs]);
      const sea = K().seaReacts(m);
      const fight = godFight(m, { floor: B.floors.sky, evade: 0.3 });
      m.objective('push', 'AIR · Over the ocean');
      const meter = pushMeter(m, 'Push the God of Destruction back', B.floors.sky);
      m.prompt('godDash', 'boost', 'Divine speed', { until: () => g.speed > 26 });
      m.say('beerus', 'Come, Super Saiyan God. Show me.', 2.4);
      const lines = [[0.94, 'goku', 'Whoa — I can see him moving!'], [0.86, 'beerus', 'Ha! NOW this is a fight!'], [0.8, 'whis', '(My, my. He\'s keeping up with Lord Beerus.)'], [0.75, 'goku', 'This is amazing!']];
      let said = 0, t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        meter();
        while (said < lines.length && bs.hpFrac <= lines[said][0]) {
          m.say(lines[said][1], lines[said][2], 2.4, { style: lines[said][1] === 'whis' ? 'quiet' : undefined });
          said++;
        }
      };
      m.tickHooks.push(hook);
      yield () => fight.floored() || t > 100;
      K().unhook(m, hook);
      K().unhook(m, above);
      sea();
      fight.off();
      m.complete('push');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      yield* m.cine(0.3);
      yield* SL.Cinema.play(m, 'bgb_dive');
    },
  };

  /** THE CRYSTAL CAVERN (GROUND, and AIR under the dome). */
  P.cavern = {
    id: 'cavern',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'crystal_cavern') {
        b.changeStage('crystal_cavern');
        m.endShot();
      }
      hideWatchers(m);
      K().toForm(g, 'god');
      if (bs.hpFrac > B.floors.sky + 0.02) bs.hp = bs.hpMax * B.floors.sky;
      K().ground(m, g, -5, -4, new V3(5, 0, 4));
      K().air(m, bs, 6, 5, 5, g.pos, 'bs_flyIdle');
      const fight = godFight(m, { floor: B.floors.cave, evade: 0.22, space: 'free', music: 6 });
      // every blow that lands near the crystals rings through them; a body thrown into them shatters them
      const crystals = b.stage.crystals || [];
      const offC = b.on('damage', (e) => {
        if (!e || !e.target || !(e.amount > 300)) return;
        const p = e.target.pos;
        for (const pr of crystals) {
          if (!pr.alive) continue;
          const d = pr.pos.distanceTo(p);
          if (d < 7) {
            b.stage.damageProp(pr, e.amount * (d < 3 ? 1.2 : 0.35), e.attacker);
            b.vfx.sparks(pr.pos, 0xbff4ff, 5, 4, 0.08);
          }
          // the cave rings with it: every crystal near a heavy blow flares
          if (e.amount > 900 && d < 26) pr._flare = Math.max(pr._flare || 0, 1 - d / 30);
        }
        // a god's blow shakes the roof: shards of rock and crystal come down over the fight
        if (e.amount > 1500 && !e.blocked) {
          for (let i = 0; i < 4; i++) {
            const x = p.x + (rnd(b.frame, i) - 0.5) * 12, z = p.z + (rnd(b.frame, i + 9) - 0.5) * 12;
            const D = b.stage.dome;
            const y = D ? D.y0 + Math.sqrt(Math.max(0, (D.r * D.inner) ** 2 - x * x - z * z)) * D.sy - 2 : 30;
            b.vfx.rock(new V3(x, y, z), new V3(0, -5, 0), 0.25 + rnd(b.frame, i + 3) * 0.4, i % 2 ? 0x2e2a46 : 0x9ae6ff);
          }
        }
      });
      m.onDispose(offC);
      // the flare dying away (each crystal's own glow, back to its own size)
      const flare = () => {
        for (const pr of crystals) {
          if (!pr.glow || !pr._flare) continue;
          if (pr._glowS === undefined) {
            pr._glowS = pr.glow.scale.x;
            pr._glowO = pr.glow.material.opacity;
          }
          pr._flare = Math.max(0, pr._flare - 1 / 40);
          pr.glow.scale.setScalar(pr._glowS * (1 + pr._flare * 0.9));
          pr.glow.material.opacity = Math.min(1, pr._glowO + pr._flare * 0.6);
        }
      };
      m.tickHooks.push(flare);
      let broken = 0;
      const offB = b.on('propDestroyed', (e) => {
        if (!crystals.includes(e.prop)) return;
        broken++;
        b.vfx.sparks(e.prop.pos, 0xe8fbff, 26, 10, 0.12);
        b.sfx('rockBreak', null, { at: e.prop.pos, pitch: 1.6, vol: 1 });
        if (broken === 2) m.say('beerus', 'Pretty, isn\'t it? Pity.', 2.2);
      });
      m.onDispose(offB);
      m.objective('push', 'UNDERGROUND · The crystal cavern');
      const meter = pushMeter(m, 'Drive him through the crystals', B.floors.cave);
      m.say('goku', 'A cave under the sea?! Heh — no holding back down here!', 2.8);
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        meter();
      };
      m.tickHooks.push(hook);
      yield () => fight.floored() || t > 90;
      K().unhook(m, hook);
      K().unhook(m, flare);
      offC();
      offB();
      fight.off();
      m.flags.crystalsBroken = broken;
      m.complete('push');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      // the god stops playing: the barrage, the cave brought down on him — and what comes out of the rock
      yield* SL.Cinema.play(m, 'bgb_buried');
      yield* SL.Cinema.play(m, 'bgb_launch');
    },
  };

  /** THE EDGE OF SPACE (SPACE): the God form's time is running out. */
  P.edge = {
    id: 'edge',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        m.endShot();
      }
      hideWatchers(m);
      b.stage.setAltitude(0.92);
      K().toForm(g, 'god');
      if (bs.hpFrac > B.floors.cave + 0.02) bs.hp = bs.hpMax * B.floors.cave;
      K().air(m, g, -5, 0, 0, B.edge);
      K().air(m, bs, 5, 1.5, 0, g.pos);
      const fight = godFight(m, { floor: B.floors.edge, evade: 0.2, song: 'final_clash', music: 6 });
      m.objective('push', 'SPACE · The edge of space');
      const meter = pushMeter(m, 'Above the Earth', B.floors.edge);
      let left = B.godSeconds, shown = -1;
      m.say('beerus', 'The view is better up here, don\'t you think?', 2.6);
      const hook = () => {
        if (b.inputLocked) return;
        left = Math.max(0, left - 1 / 60);
        meter();
        const sec = Math.ceil(left);
        if (sec !== shown) {
          shown = sec;
          m.objective('time', 'Super Saiyan God: ' + sec + ' s');
        }
        // the flame starts to gutter in the last seconds
        if (left < 10 && b.frame % 20 === 0) {
          g.aura.setStyle(b.frame % 40 ? g.form.aura : { color: 0xffcc3a, core: 0xffffff, particles: 0xfff0a0 });
          b.vfx.flash(g.headPos(), 0.8, 0xffd040, 0.15, SL.Toon.tex.glow);
        }
      };
      m.tickHooks.push(hook);
      yield () => left <= 0 || (fight.floored() && left < B.godSeconds - 20);
      K().unhook(m, hook);
      g.aura.setStyle(g.form.aura);
      fight.off();
      m.complete('time');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      yield* SL.Cinema.play(m, 'bgb_expire');
    },
  };

  /** SUPER SAIYAN, WITH A GOD'S POWER (SPACE). */
  P.godki = {
    id: 'godki',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, g = s.goku, bs = s.beerus;
      m.lock(true);
      m.clearObjectives();
      K().clearCombat(b);
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        m.endShot();
      }
      hideWatchers(m);
      b.stage.setAltitude(0.95);
      K().toForm(g, 'godki');
      m.teach(g, 'form:godki');
      if (bs.hpFrac > B.floors.edge + 0.02) bs.hp = bs.hpMax * B.floors.edge;
      K().air(m, g, -5, 0, 0, B.edge);
      K().air(m, bs, 5, 1.5, 0, g.pos);
      const fight = godFight(m, { floor: B.floors.godki, evade: 0.25, song: 'final_clash', music: 6 });
      m.objective('push', 'SPACE · God Ki');
      const meter = pushMeter(m, 'Keep up with a god', B.floors.godki);
      let t = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        meter();
      };
      m.tickHooks.push(hook);
      yield () => fight.floored() || t > B.godkiSeconds;
      K().unhook(m, hook);
      fight.off();
      m.complete('push');
      m.lock(true);
      K().clearCombat(b);
      bs.controller = K().scripted();
      bs.storyEvade = null;
      yield* SL.Cinema.play(m, 'bgb_enough');
    },
  };

  P.after = K().after('BATTLE OF GODS');

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, p) => K().pt(ctx, n, p);

  /**
   * A GOD'S CLASH (the owner: "both disappear; brief empty sky; sudden reappearance; both accelerate toward each
   * other; synchronized punches; the fists collide; an enormous flash; a cloud ring; the world below reacts; the
   * camera shakes; both recoil"). Returns the scene events. o:
   *   at(ctx)   the point the fists meet          axis  Goku comes from -axis, Beerus from +axis (default x)
   *   wide(c)   the lens for the empty sky: { from, look, fov } as world points
   *   react(c)  the lens on the world's answer   sea   the ocean below answers   space  no air: no cloud
   *   gap       how far apart they reappear (m)   approach  seconds to close it
   */
  function clashEvents(o) {
    // (built on first use: scene data is loaded long before there is a 3D engine to make vectors with)
    let axis = null, side = null;
    const geo = () => {
      if (axis) return;
      const a = o.axis || [1, 0, 0];
      axis = new V3(a[0], a[1], a[2]).normalize();
      // the lens on the side of the punching arms (Goku's right, Beerus' left): on the other side the bodies hide the fists
      side = new V3(axis.z, 0, -axis.x);
    };
    const gap = o.gap || 18, approach = o.approach || 0.55;
    const CH = 1.15; // feet to fist height
    const at = (ctx) => ctx.cast.cx.pos;
    const home = (ctx, who, d) => (geo(), at(ctx).clone().addScaledVector(axis, who === 'goku' ? -d : d).add(new V3(0, -CH, 0)));
    return [
      // they look at each other... and they are gone
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          geo();
          const c = o.at(ctx);
          pt(ctx, 'cx', c);
          const w = o.wide(c);
          pt(ctx, 'cxWide', w.from);
          pt(ctx, 'cxWideLook', w.look);
          ctx.cxFov = w.fov || 46;
          b.after(26, () => {
            vanish(b, s.goku, 0xffb0b8);
            vanish(b, s.beerus, 0xd8b8ff);
          });
        },
        cam: { from: { at: 'cxWide' }, look: { at: 'cxWideLook' }, fov: 46, raw: true },
        sfx: { name: 'wind', vol: 0.7, pitch: 0.5 },
        music: { level: 0 },
        hold: 0.5 + (o.empty === undefined ? 0.85 : o.empty),
      },
      // ...back, already flying at each other, faster every frame
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          appear(b, s.goku, home(ctx, 'goku', gap), 'dash', 'shout', 0xffb0b8);
          appear(b, s.beerus, home(ctx, 'beerus', gap), 'bs_rushDash', 'grin', 0xd8b8ff);
          faceOff(s);
          // far enough out that both of them are in the frame the moment they reappear
          pt(ctx, 'cxSide', at(ctx).clone().addScaledVector(side, gap * 1.15).add(new V3(0, 1.4, 0)));
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          const k = Math.min(1, t / approach), e = k * k;
          const d = gap + (0.95 - gap) * e;
          SL.Staging._put(s.goku, home(ctx, 'goku', d));
          SL.Staging._put(s.beerus, home(ctx, 'beerus', d));
          b.vfx.trail(s.goku.chest(), GOKU_TRAIL, 0.7, 0.4);
          b.vfx.trail(s.beerus.chest(), BEERUS_TRAIL, 0.7, 0.4);
          if (k > 0.6 && b.frame % 2 === 0) {
            b.vfx.afterimage(s.goku.pos.clone(), 1.8, 0xffb0b8);
            b.vfx.afterimage(s.beerus.pos.clone(), 1.8, 0xd8b8ff);
          }
        },
        cam: { from: { at: 'cxSide' }, look: { at: 'cx' }, fov: 60, raw: true },
        sfx: { name: 'dash', vol: 1.1, pitch: 0.7 },
        hold: approach,
      },
      // THE FISTS: knuckles on knuckles, and everything goes white
      {
        pose: [
          { who: 'goku', pose: 'punchR', face: 'shout', speed: 60 },
          { who: 'beerus', pose: 'punchL', face: 'grin', speed: 60 },
        ],
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, c = at(ctx);
          SL.Staging._put(s.goku, home(ctx, 'goku', 0.95));
          SL.Staging._put(s.beerus, home(ctx, 'beerus', 0.95));
          faceOff(s);
          pt(ctx, 'tip', c);
          pt(ctx, 'tipCam', c.clone().addScaledVector(side, 3.1).add(new V3(0, 0.35, 0)));
          // the flash: enormous and short — the fists have to read through it in the slow motion after
          b.vfx.flash(c, o.space ? 30 : 24, 0xffffff, 0.22, SL.Toon.tex.glow);
          b.vfx.flash(c, 3.2, 0xffe8f0, 0.9);
          b.vfx.ring(c, 26, 0xffffff, 0.95, axis);
          b.vfx.ring(c, 15, o.space ? 0xbfe0ff : 0xffb8c8, 0.75);
          b.vfx.light(c, 0xfff0f4, 4, 60, 0.45);
          if (!o.space) {
            cloudRing(b, c, { normal: axis, speed: 36 });
            cloudRing(b, c, { normal: new V3(0, 1, 0), speed: 28, count: 56, size: 2.8 });
          } else {
            // no air to condense: the shock is light, ring after ring
            b.vfx.ring(c, 40, 0xdff0ff, 1.3, axis);
            b.after(8, () => b.vfx.ring(c, 60, 0xffe0f0, 1.4, axis));
          }
          b.vfx.sparks(c, 0xffffff, 40, 22, 0.14);
          SL.ScreenFX.flash(0.75, '#ffffff');
          b.sfx('explosionHuge', null, { at: c, pitch: 0.72, vol: 1.3 });
          b.sfx('punchHeavy', null, { at: c, pitch: 0.55, vol: 1.5 });
          b.cameraTraumaAt(c, 1);
          b.slowmo(0.16, 1.15);
        },
        // every frame of the slow motion the knuckles stay on the knuckles
        tick: (ctx) => {
          const s = st(ctx);
          const tip = K().touch(s.goku, s.beerus, { handB: 'L', reachB: 0.045 });
          ctx.cast.tip.pos.copy(tip);
        },
        cam: { from: { at: 'tipCam' }, look: { at: 'tip' }, fov: 30, raw: true },
        // the music hits with the fists
        music: o.music || { song: 'ssj_god', level: 3 },
        hold: 1.15,
      },
      // THE WORLD ANSWERS: the ring of cloud racing out, the sea thrown up under it (or the light over the Earth)
      {
        call: (ctx) => {
          const b = ctx.b, c = at(ctx);
          const r = o.react(c);
          pt(ctx, 'cxReact', r.from);
          pt(ctx, 'cxReactLook', r.look);
          if (o.sea) seaRing(b, c, { radius: 80, seconds: 2.1 });
          b.cameraTraumaAt(c, 0.7);
          b.sfx('rumble', null, { vol: 0.9, pitch: 0.6 });
        },
        tick: (ctx) => {
          const s = st(ctx);
          K().touch(s.goku, s.beerus, { handB: 'L', reachB: 0.045 });
        },
        cam: { from: { at: 'cxReact' }, look: { at: 'cxReactLook' }, fov: 60, raw: true, shake: 0.4 },
        hold: 1.9,
      },
      // both thrown back by it
      {
        call: (ctx) => {
          pt(ctx, 'gBack', home(ctx, 'goku', 3.4).add(new V3(0, 0.4, 0)));
          pt(ctx, 'bBack', home(ctx, 'beerus', 3.4).add(new V3(0, 0.7, 0)));
          pt(ctx, 'cxTwo', at(ctx).clone().addScaledVector(side, 9).add(new V3(0, 1, 0)));
        },
        space: [
          { who: 'goku', mode: 'flight', to: 'gBack', seconds: 0.45, pose: 'flyBack', endPose: 'g_godStance' },
          { who: 'beerus', mode: 'flight', to: 'bBack', seconds: 0.45, pose: 'flyBack', endPose: 'bs_stance' },
        ],
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.trail(s.goku.chest(), GOKU_TRAIL, 0.5, 0.3);
          b.vfx.trail(s.beerus.chest(), BEERUS_TRAIL, 0.5, 0.3);
        },
        cam: { from: { at: 'cxTwo' }, look: { at: 'cx' }, fov: 52, raw: true },
      },
      {
        call: (ctx) => faceOff(st(ctx)),
        pose: [
          { who: 'goku', pose: 'g_godStance', face: 'grin' },
          { who: 'beerus', pose: 'bs_stance', face: 'smirk' },
        ],
        cam: { subject: 'beerus', with: 'goku', focus: 'medium', angle: 'three' },
        say: o.line || { who: 'beerus', line: 'Ha! Not bad at all.', duration: 2 },
        hold: (o.line && o.line.duration) || 2,
      },
    ];
  }

  /**
   * THE 360° MELEE (the cavern's set piece): the two of them in the middle of the cave, trading blows too fast to
   * follow while they turn round each other; every blow a flash and a ring; every second one's shock reaching the
   * walls and shattering a crystal behind them; the lens going all the way round.
   */
  const WHIRL = { centre: new V3(0, 7, 0), beat: 0.2 };
  function whirl(ctx, t) {
    const s = st(ctx), b = ctx.b, C = WHIRL.centre;
    const ang = 0.4 + t * 1.3;
    const ax = new V3(Math.cos(ang), 0, Math.sin(ang));
    const c = C.clone().add(new V3(0, Math.sin(t * 4.2) * 0.45, 0));
    SL.Staging._put(s.goku, c.clone().addScaledVector(ax, -0.85).add(new V3(0, -1.15, 0)));
    SL.Staging._put(s.beerus, c.clone().addScaledVector(ax, 0.85).add(new V3(0, -1.15, 0)));
    s.goku.grounded = s.beerus.grounded = false;
    faceOff(s);
    const beat = Math.floor(t / WHIRL.beat);
    if (beat === ctx.whirlBeat) return;
    ctx.whirlBeat = beat;
    const G = ['punchR', 'g_kick', 'punchL', 'g_elbow', 'uppercut', 'g_spinKick'];
    const BZ = ['bs_chop', 'bs_knee', 'bs_backhand', 'bs_heel', 'bs_slap', 'bs_poke'];
    const gokuSwings = beat % 2 === 0;
    s.goku.setState('scripted', { pose: gokuSwings ? G[(beat >> 1) % G.length] : 'guard', expression: gokuSwings ? 'shout' : 'grit', speed: 34 });
    s.beerus.setState('scripted', { pose: gokuSwings ? 'bs_guard' : BZ[(beat >> 1) % BZ.length], expression: gokuSwings ? 'grin' : 'wicked', speed: 34 });
    const hit = c.clone().addScaledVector(ax, gokuSwings ? 0.4 : -0.4).add(new V3(0, (rnd(beat) - 0.5) * 0.7, 0));
    b.vfx.flash(hit, 3.4, 0xffffff, 0.12, SL.Toon.tex.glow);
    b.vfx.ring(hit, 1.6 + rnd(beat, 1) * 1.4, gokuSwings ? 0xffb0c0 : 0xd8b8ff, 0.25);
    b.vfx.sparks(hit, 0xfff0f8, 12, 10, 0.1);
    b.sfx(beat % 3 ? 'punchHeavy' : 'block', null, { at: hit, pitch: 0.8 + rnd(beat, 2) * 0.4, vol: 1 });
    b.cameraTraumaAt(hit, 0.2);
    if (beat % 2 === 1) {
      const lens = b.camera.camera.position;
      const away = C.clone().sub(lens).setY(0);
      if (away.lengthSq() > 1e-4) away.normalize();
      let best = null, bd = -2;
      for (const pr of b.stage.crystals || []) {
        if (!pr.alive) continue;
        const d = pr.pos.clone().sub(C).setY(0).normalize().dot(away);
        if (d > bd) {
          bd = d;
          best = pr;
        }
      }
      if (best) {
        b.vfx.ring(best.pos, 6, 0xbff4ff, 0.4);
        b.stage.damageProp(best, 1e6, gokuSwings ? s.goku : s.beerus);
      }
    }
  }

  /* ---------------------------------------------------------------- up off the deck */
  S.bgb_rise = {
    id: 'bgb_rise',
    cast,
    music: { song: 'ssj_god', level: 2 },
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().toForm(s.goku, 'god');
          m.space(s.goku, 'ground', { pos: new V3(0, 0, 18), face: new V3(4, 0, 12), pose: 'g_godStance', expr: 'calm' });
          m.space(s.beerus, 'ground', { pos: new V3(4, 0, 12), face: s.goku.pos, pose: 'bs_idle', expr: 'smirk' });
          watchers(m, 'idle');
        },
        title: { chapter: 'CHAPTER 16 · BATTLE OF GODS', title: 'BATTLE OF GODS', subtitle: 'Goku vs Beerus · over the ocean', duration: 3.6 },
        cam: { subject: 'goku', with: 'beerus', focus: 'full', angle: 'three' },
        say: { who: 'beerus', line: 'Shall we go somewhere with a little more room? I\'d hate to sink your friend\'s boat.', duration: 3.8 },
        hold: 3.8,
      },
      // AIR: up off the deck
      {
        space: [
          { who: 'goku', mode: 'flight', to: [B.sky.x - 5, B.sky.y, B.sky.z], seconds: 2.2, pose: 'flyUp', endPose: 'flyIdle' },
          { who: 'beerus', mode: 'flight', to: [B.sky.x + 5, B.sky.y + 1, B.sky.z], seconds: 2.2, pose: 'bs_flyForward', endPose: 'bs_flyIdle' },
        ],
        call: (ctx) => {
          watchers(ctx.m);
          pt(ctx, 'deck', new V3(-2, 1.6, 6));
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          if (b.frame % 2 === 0) {
            b.vfx.trail(s.goku.chest(), 0xff6a6a, 0.8, 0.5);
            b.vfx.trail(s.beerus.chest(), 0xc89aff, 0.8, 0.5);
          }
        },
        cam: { from: { at: 'deck' }, look: { at: 'goku' }, fov: 58 },
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          K().faceTo(s.goku, s.beerus.pos);
          K().faceTo(s.beerus, s.goku.pos);
          pt(ctx, 'mid', B.sky.clone());
        },
        cam: { from: { at: 'mid', off: [46, 12, 60] }, to: { at: 'mid', off: [30, 6, 40] }, look: { at: 'mid' }, fov: 40 },
        sfx: { name: 'wind', vol: 0.8, pitch: 0.6 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'goku', pose: 'lookHands', face: 'shock', speed: 5 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Whoa... my body feels so light. It\'s like I\'m floating in water.', duration: 3.2 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_stance', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'That\'s divine ki. Get used to it quickly — I won\'t wait.', duration: 3 },
        hold: 3,
      },
      {
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'grin', speed: 6 }],
        cam: { subject: 'goku', with: 'beerus', focus: 'full', angle: 'three' },
        say: { who: 'goku', line: 'Heh. Then here I come!', duration: 2 },
        hold: 2,
      },
      // THE FIRST CLASH OF GODS, high over the ocean (AIR): gone, empty sky, back, fist on fist
      ...clashEvents({
        at: (ctx) => {
          const s = st(ctx);
          return s.goku.pos.clone().lerp(s.beerus.pos, 0.5).add(new V3(0, 1.15, 0));
        },
        sea: true,
        wide: (c) => ({ from: c.clone().add(new V3(0, 3.5, 30)), look: c.clone().add(new V3(0, -3, 0)) }),
        react: (c) => ({ from: c.clone().add(new V3(34, 20, 40)), look: c.clone().add(new V3(0, -26, 0)) }),
        line: { who: 'beerus', line: 'Ha! Not bad at all, Super Saiyan God!', duration: 2.4, to: 'goku' },
      }),
    ],
  };

  /* ---------------------------------------------------------------- into the sea, through the cavern roof */
  S.bgb_dive = {
    id: 'bgb_dive',
    cast,
    clearMood: false,
    events: [
      // the fists meet in the middle of the sky
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          const mid = s.goku.pos.clone().lerp(s.beerus.pos, 0.5);
          if (mid.y < -2) mid.y = 10;
          K().air(m, s.goku, mid.x - 0.95, mid.y, mid.z, mid, 'punchR', 'shout');
          K().air(m, s.beerus, mid.x + 0.95, mid.y, mid.z, mid, 'punchL', 'grin');
          const c = mid.clone().add(new V3(0, 1.15, 0));
          b.vfx.ring(c, 18, 0xffffff, 0.7, new V3(1, 0, 0));
          b.vfx.flash(c, 14, 0xffe0e0, 0.35, SL.Toon.tex.glow);
          cloudRing(b, c, { normal: new V3(1, 0, 0), speed: 28, count: 56 });
          SL.ScreenFX.flash(0.6, '#ffffff');
          b.sfx('explosionBig', null, { at: mid, pitch: 0.7 });
          b.cameraTraumaAt(mid, 1);
          b.slowmo(0.25, 0.9);
          seaRing(b, mid, { radius: 50, seconds: 1.6 });
          pt(ctx, 'clash', c);
          pt(ctx, 'clashCam', c.clone().add(new V3(0.3, 0.4, -4.2)));
        },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.cast.clash.pos.copy(K().touch(s.goku, s.beerus, { handB: 'L', reachB: 0.045 }));
        },
        cam: { from: { at: 'clashCam' }, look: { at: 'clash' }, fov: 40, raw: true },
        hold: 1.6,
      },
      // the kick, straight down
      {
        pose: [{ who: 'beerus', pose: 'bs_heel', face: 'grin', speed: 24 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.flash(s.goku.chest(), 2.2, 0xffffff, 0.2, SL.Toon.tex.glow);
          b.sfx('punchHeavy', s.goku, { pitch: 0.9, vol: 1.3 });
          const lvl = b.stage.waterLevel === undefined ? -7.5 : b.stage.waterLevel;
          pt(ctx, 'sea', new V3(s.goku.pos.x - 2, lvl, s.goku.pos.z));
        },
        space: { who: 'goku', mode: 'flight', to: 'sea', seconds: 0.55, pose: 'tumble', endPose: 'tumble' },
        cam: { from: { at: 'sea', off: [10, 6, 14] }, look: { at: 'goku' }, fov: 56 },
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().splash(b, ctx.cast.sea.pos, 5);
          K().splash(b, ctx.cast.sea.pos.clone().add(new V3(2, 0, 1)), 3);
          b.sfx('explosionBig', null, { at: ctx.cast.sea.pos, pitch: 0.5, vol: 1.2 });
          s.goku.setHidden(true);
        },
        cam: { from: { at: 'sea', off: [10, 6, 14] }, look: { at: 'sea', off: [0, 3, 0] }, fov: 52 },
        say: { who: 'beerus', line: 'Hm. Running away?', duration: 1.6 },
        hold: 1.6,
      },
      // he dives after him
      {
        space: { who: 'beerus', mode: 'flight', to: 'sea', seconds: 0.5, pose: 'bs_flyForward', endPose: 'bs_flyForward' },
        cam: { from: { at: 'sea', off: [-8, 3, 10] }, look: { at: 'beerus' }, fov: 54 },
      },
      // the blue: down through the water
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.setHidden(true);
          K().splash(b, ctx.cast.sea.pos, 4);
          SL.ScreenFX.flash(0.6, '#2a6ab8');
          ctx.m.fade('black', 0.8);
        },
        sfx: { name: 'wind', pitch: 0.35, vol: 1 },
        hold: 0.9,
      },
      // the CAVERN: through the roof, down onto the floor
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          b.changeStage('crystal_cavern');
          m.endShot();
          hideWatchers(m);
          s.goku.setHidden(false);
          s.beerus.setHidden(false);
          SL.Staging._put(s.goku, new V3(-4, 30, -3));
          s.goku.grounded = false;
          s.goku.setState('scripted', { pose: 'tumble', expression: 'grit' });
          SL.Staging._put(s.beerus, new V3(6, 34, 5));
          s.beerus.grounded = false;
          s.beerus.setState('scripted', { pose: 'bs_flyIdle', expression: 'grin' });
          m.fade('clear', 0.4);
          b.stage.setMood(0.25, 0x0a1a3a, 0.2);
          for (let i = 0; i < 20; i++) b.vfx.rock(new V3(-4 + (i % 5) - 2, 32, -3 + Math.floor(i / 5) - 2), new V3((i % 3) - 1, -6, (i % 4) - 1.5), 0.3 + (i % 3) * 0.15, 0x3a3456);
          pt(ctx, 'land', new V3(-4, 0, -3));
          pt(ctx, 'low', new V3(10, 2, 12));
        },
        space: { who: 'goku', mode: 'groundImpact', to: 'land', seconds: 0.5, endPose: 'knockdown', expr: 'grit', radius: 3.5 },
        cam: { from: { at: 'low' }, look: { at: 'goku' }, fov: 60 },
      },
      {
        call: (ctx) => {
          const b = ctx.b, s = st(ctx);
          for (const pr of b.stage.crystals || []) if (pr.alive && pr.pos.distanceTo(s.goku.pos) < 8) b.stage.damageProp(pr, 1e6, s.beerus);
        },
        pose: [{ who: 'goku', pose: 'getup', face: 'grin', speed: 6 }],
        cam: { subject: 'goku', focus: 'full', angle: 'low' },
        say: { who: 'goku', line: 'Whoa... where ARE we?', duration: 2 },
        hold: 2,
      },
      {
        space: { who: 'beerus', mode: 'flight', to: [6, 6, 5], seconds: 1, pose: 'bs_flyIdle', endPose: 'bs_flyIdle' },
        cam: { subject: 'beerus', focus: 'wide', angle: 'low', room: 4 },
        say: { who: 'beerus', line: 'A cave under the sea floor. Nobody to get in our way.', duration: 2.8 },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      if (b.stage.def.id !== 'crystal_cavern') {
        b.changeStage('crystal_cavern');
        ctx.m.endShot();
      }
      hideWatchers(ctx.m);
      s.goku.setHidden(false);
      s.beerus.setHidden(false);
      ctx.m.fade('clear', 0.3);
    },
  };

  /* ---------------------------------------------------------------- buried — and what comes out of the rock */
  // UNDERGROUND the whole way: the cavern floor, the roof over it, the god in the air under the roof
  const BUR = { goku: new V3(0, 0, -2), beerus: new V3(5, 10, 9) };
  const roofOver = (b, x, z) => {
    const D = b.stage.dome;
    if (!D) return 30;
    const q2 = (D.r * D.inner) ** 2 - x * x - z * z;
    return D.y0 + Math.sqrt(Math.max(0, q2)) * D.sy - 2;
  };
  const echo = (line, duration, style) => ({ who: 'goku', line, duration, style: style || 'echo' });
  S.bgb_buried = {
    id: 'bgb_buried',
    cast,
    clearMood: false,
    events: [
      // the god above, the Saiyan below: he has had his fun
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m, b = ctx.b;
          K().clearCombat(b);
          K().toForm(s.goku, 'god');
          K().ground(m, s.goku, BUR.goku.x, BUR.goku.z, BUR.beerus, 'g_godStance', 'grit');
          K().air(m, s.beerus, BUR.beerus.x, BUR.beerus.y, BUR.beerus.z, s.goku.pos, 'bs_stance', 'smirk');
          for (const pr of b.stage.crystals || []) if (pr.alive && pr.pos.distanceTo(BUR.goku) < 9) b.stage.damageProp(pr, 1e6, s.beerus);
          pt(ctx, 'pile', BUR.goku);
        },
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'You\'re fun, Saiyan. But you seem to have forgotten which one of us is the god.', duration: 3.4, to: 'goku' },
        hold: 3.4,
      },
      // THE BARRAGE: over his shoulder, down onto the Saiyan — ball after ball of god ki
      {
        pose: [
          { who: 'beerus', pose: 'blastR', face: 'wicked', speed: 24 },
          { who: 'goku', pose: 'guard', face: 'grit', speed: 14 },
        ],
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          for (let i = 0; i < 16; i++) {
            b.after(1 + i * 8, () => {
              const right = i % 2 === 0;
              s.beerus.setState('scripted', { pose: right ? 'blastR' : 'blastL', expression: 'wicked', speed: 40 });
              const from = s.beerus.handPos(right ? 'R' : 'L');
              const to = s.goku.pos.clone().add(new V3((rnd(i, 1) - 0.5) * 4.4, 0.2 + rnd(i, 2) * 1.6, (rnd(i, 3) - 0.5) * 4.4));
              kiShot(b, from, to, 0.24, { size: 1.2, radius: 1.5 });
              b.sfx('kiBlast', s.beerus, { pitch: 0.9 + rnd(i, 4) * 0.3, vol: 0.9 });
              if (i % 3 === 1) b.after(14, () => s.goku.setState('scripted', { pose: 'guardHit', expression: 'hurt', speed: 30 }));
              if (i % 3 === 2) b.after(16, () => s.goku.setState('scripted', { pose: 'guard', expression: 'grit', speed: 20 }));
            });
          }
        },
        cam: { from: { at: 'beerus', local: [1.5, 1.3, -3.1] }, look: { at: 'goku' }, fov: 46, raw: true, follow: true },
        music: { song: 'ssj_god', level: 3 },
        hold: 1.6,
      },
      // from the floor behind him: the light coming in on top of him, the roof answering every one
      {
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          const n = Math.round(t * 60);
          if (n % 7 === 0) {
            const right = n % 14 === 0;
            const from = s.beerus.handPos(right ? 'R' : 'L');
            const to = s.goku.pos.clone().add(new V3((rnd(n, 5) - 0.5) * 5, 0.3 + rnd(n, 6) * 1.4, (rnd(n, 7) - 0.5) * 5));
            kiShot(b, from, to, 0.22, { size: 1, radius: 1.05 });
            s.beerus.setState('scripted', { pose: right ? 'blastR' : 'blastL', expression: 'wicked', speed: 40 });
          }
          if (n % 9 === 0) {
            const x = BUR.goku.x + (rnd(n, 8) - 0.5) * 9, z = BUR.goku.z + (rnd(n, 9) - 0.5) * 9;
            b.vfx.rock(new V3(x, roofOver(b, x, z), z), new V3(0, -6, 0), 0.4 + rnd(n, 10) * 0.6, 0x3a3456);
          }
          if (n % 20 === 0) b.camera.addTrauma(0.12);
        },
        call: (ctx) => {
          // low, in front of him and off to the side: the blasts coming down on him out of the dark
          pt(ctx, 'floorCam', BUR.goku.clone().add(new V3(-7.5, 1.1, 7)));
          pt(ctx, 'floorLook', BUR.goku.clone().add(new V3(1.2, 3.2, 2.2)));
        },
        cam: { from: { at: 'floorCam' }, look: { at: 'floorLook' }, fov: 54, raw: true },
        hold: 1.5,
      },
      // THE LAST ONE: bigger, thrown into the roof right over him — and the cavern comes down on him
      {
        pose: [{ who: 'beerus', pose: 'throwRelease', face: 'wicked', speed: 20 }],
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          const roof = new V3(BUR.goku.x + 1, roofOver(b, BUR.goku.x, BUR.goku.z), BUR.goku.z);
          kiShot(b, s.beerus.handPos('R'), roof, 0.4, { size: 2.6, radius: 4, color: 0xe08aff });
          ctx.rub = rubble(b, BUR.goku, { radius: 3.4 });
          ctx.rub.drop(0);
          pt(ctx, 'roof', roof);
          pt(ctx, 'fallCam', BUR.goku.clone().add(new V3(12, 2.4, 10)));
          ctx.fall = 0;
        },
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b, rub = ctx.rub;
          if (t < 0.4) return;
          if (!ctx.fall) {
            ctx.fall = 1;
            b.sfx('explosionBig', null, { at: ctx.cast.roof.pos, pitch: 0.55, vol: 1.3 });
            b.sfx('rockBreak', null, { at: ctx.cast.roof.pos, pitch: 0.6, vol: 1.3 });
            b.sfx('rumble', null, { vol: 1.2, pitch: 0.7 });
            b.cameraTraumaAt(BUR.goku, 0.8);
            s.goku.setState('scripted', { pose: 'guard', expression: 'shock', speed: 20 });
          }
          const k = Math.min(1, (t - 0.4) / 0.85);
          rub.drop(k);
          if (b.frame % 2 === 0 && k < 1) {
            const x = BUR.goku.x + (rnd(b.frame, 11) - 0.5) * 12, z = BUR.goku.z + (rnd(b.frame, 12) - 0.5) * 12;
            b.vfx.rock(new V3(x, roofOver(b, x, z), z), new V3(0, -14, 0), 0.6 + rnd(b.frame, 13) * 0.8, 0x2e2a46);
          }
          if (k > 0.55 && !s.goku.hidden) {
            s.goku.setHidden(true);
            b.vfx.dust(BUR.goku, 5, 40, 0x5a5470);
            b.vfx.dust(BUR.goku, 9, 30, 0x4a4460);
            b.cameraTraumaAt(BUR.goku, 1);
            b.sfx('groundImpact', null, { at: BUR.goku, pitch: 0.5, vol: 1.4 });
          }
        },
        cam: { from: { at: 'fallCam' }, look: { at: 'pile', off: [0, 3.5, 0] }, fov: 60, raw: true },
        hold: 1.9,
      },
      // SILENCE. The dust settling over a mound of rock, the god in the air over it
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          if (!s.goku.hidden) s.goku.setHidden(true);
          ctx.rub.drop(1);
          SL.Music.stop(0.5);
          settleDust(b, BUR.goku, 10, 46);
          s.beerus.setState('scripted', { pose: 'bs_flyIdle', expression: 'calm', speed: 6 });
          K().faceTo(s.beerus, BUR.goku);
          pt(ctx, 'silA', BUR.goku.clone().add(new V3(-15, 2.4, 23)));
          pt(ctx, 'silB', BUR.goku.clone().add(new V3(-12, 3, 19)));
          pt(ctx, 'silLook', BUR.goku.clone().add(new V3(2.4, 4.6, 5.2)));
        },
        cam: { from: { at: 'silA' }, to: { at: 'silB' }, look: { at: 'silLook' }, fov: 54, raw: true, ease: 'linear' },
        hold: 3,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Hmph. Was that all?', duration: 2.2, style: 'quiet' },
        hold: 2.2,
      },
      // he turns his back on it
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.yaw0 = s.beerus.yaw;
          const toPile = BUR.goku.clone().sub(s.beerus.pos).setY(0).normalize();
          pt(ctx, 'turnCam', BUR.goku.clone().addScaledVector(toPile, 4.2).add(new V3(0, 1.3, 0)));
          s.beerus.setState('scripted', { pose: 'bs_idle', expression: 'calm', speed: 4 });
        },
        tick: (ctx, t) => {
          const s = st(ctx);
          const k = U.easeInOutCubic(Math.min(1, t / 1.2));
          s.beerus.yaw = s.beerus.prevYaw = ctx.yaw0 + Math.PI * 0.85 * k;
        },
        cam: { from: { at: 'turnCam' }, look: { at: 'beerus' }, fov: 28, raw: true },
        say: { who: 'beerus', line: 'What a shame. And I was just starting to enjoy myself.', duration: 3, style: 'quiet' },
        hold: 3,
      },
      // a tremor. Tiny.
      {
        call: (ctx) => {
          const b = ctx.b;
          ctx.rub.shake(0.012);
          b.cameraTraumaAt(BUR.goku, 0.12);
          b.sfx('rumble', null, { vol: 0.35, pitch: 0.45 });
          pt(ctx, 'moundCam', BUR.goku.clone().add(new V3(3.6, 0.7, 4.2)));
        },
        cam: { from: { at: 'moundCam' }, look: { at: 'pile', off: [0, 1.6, 0] }, fov: 42, raw: true },
        hold: 1.3,
      },
      // a rock moves
      {
        call: (ctx) => {
          const b = ctx.b;
          ctx.rub.shake(0.004);
          ctx.rub.nudge(0, 0.4);
          b.after(36, () => ctx.rub && ctx.rub.nudge(2, 0.28));
          b.sfx('rockBreak', null, { at: BUR.goku, pitch: 1.6, vol: 0.4 });
          const top = BUR.goku.clone().add(new V3(0, 2.6, 0));
          for (let i = 0; i < 5; i++) b.vfx.rock(top, new V3((rnd(i, 70) - 0.5) * 3, 1.5, (rnd(i, 71) - 0.5) * 3), 0.08 + rnd(i, 72) * 0.08, 0x46405e);
          pt(ctx, 'rockCam', BUR.goku.clone().add(new V3(4.4, 3.6, 5.2)));
        },
        cam: { from: { at: 'rockCam' }, look: { at: 'pile', off: [0, 2.3, 0] }, fov: 32, raw: true },
        hold: 1.3,
      },
      // the light: magenta, through the cracks between the rocks
      {
        tick: (ctx, t) => {
          ctx.rub.glow(0.12 + t * 0.22);
          ctx.rub.shake(0.01 + t * 0.01);
        },
        call: (ctx) => pt(ctx, 'glowCam', BUR.goku.clone().add(new V3(-3.4, 0.45, 3.6))),
        cam: { from: { at: 'glowCam' }, look: { at: 'pile', off: [0, 1.4, 0] }, fov: 46, raw: true },
        sfx: { name: 'kiUp', vol: 0.5, pitch: 0.5 },
        hold: 1.7,
      },
      // more cracks; the whole pile shaking
      {
        tick: (ctx, t) => {
          const b = ctx.b;
          ctx.rub.glow(0.5 + t * 0.15);
          ctx.rub.shake(0.03 + t * 0.03);
          if (b.frame % 12 === 0) b.camera.addTrauma(0.08);
          if (b.frame % 5 === 0) b.vfx.dust(BUR.goku, 2.5, 3, 0x5a5470);
        },
        call: (ctx) => pt(ctx, 'shakeCam', BUR.goku.clone().add(new V3(6.5, 1.6, 7.5))),
        cam: { from: { at: 'shakeCam' }, look: { at: 'pile', off: [0, 1.5, 0] }, fov: 50, raw: true },
        sfx: { name: 'rumble', vol: 0.8, pitch: 0.6 },
        hold: 1.4,
      },
      // HIS VOICE, from under the rock
      {
        tick: (ctx) => {
          ctx.rub.glow(0.72);
          ctx.rub.shake(0.07);
        },
        call: (ctx) => pt(ctx, 'voiceCam', BUR.goku.clone().add(new V3(2.4, 0.5, 4.8))),
        cam: { from: { at: 'voiceCam' }, look: { at: 'pile', off: [0, 2.6, 0] }, fov: 52, raw: true },
        say: echo('I...', 1.1),
        hold: 1.1,
      },
      // the god's ears: he turns back
      {
        call: (ctx) => {
          ctx.yaw1 = st(ctx).beerus.yaw;
        },
        tick: (ctx, t) => {
          const s = st(ctx);
          ctx.rub.shake(0.08);
          const want = Math.atan2(BUR.goku.x - s.beerus.pos.x, BUR.goku.z - s.beerus.pos.z);
          let d = want - ctx.yaw1;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          s.beerus.yaw = s.beerus.prevYaw = ctx.yaw1 + d * U.easeInOutCubic(Math.min(1, t / 0.7));
        },
        pose: [{ who: 'beerus', pose: 'bs_flyIdle', face: 'shock', speed: 10 }],
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three', side: -1 },
        say: echo('...WON\'T LET YOU...', 1.4),
        hold: 1.4,
      },
      {
        tick: (ctx) => {
          ctx.rub.glow(0.9);
          ctx.rub.shake(0.12);
          if (ctx.b.frame % 6 === 0) ctx.b.camera.addTrauma(0.1);
        },
        call: (ctx) => pt(ctx, 'crackCam', BUR.goku.clone().add(new V3(-2.6, 1.0, 3.3))),
        cam: { from: { at: 'crackCam' }, look: { at: 'pile', off: [0, 1.8, 0] }, fov: 44, raw: true },
        sfx: { name: 'kiCharge', vol: 0.8, pitch: 0.6 },
        say: echo('...DESTROY...', 1.1),
        hold: 1.1,
      },
      {
        tick: (ctx) => {
          ctx.rub.glow(1);
          ctx.rub.shake(0.16);
        },
        cam: { subject: 'beerus', focus: 'face', angle: 'front' },
        say: echo('...MY...', 0.9),
        hold: 0.9,
      },
      {
        tick: (ctx) => {
          ctx.rub.glow(1);
          ctx.rub.shake(0.24);
          ctx.b.camera.addTrauma(0.05);
        },
        call: (ctx) => pt(ctx, 'roarCam', BUR.goku.clone().add(new V3(0.6, 0.6, 6.5))),
        cam: { from: { at: 'roarCam' }, look: { at: 'pile', off: [0, 1.9, 0] }, fov: 54, raw: true },
        sfx: { name: 'roar', vol: 1.2, pitch: 0.75 },
        say: echo('...WORRRRRRRRLLLDD!!', 1.9, 'shout echo'),
        hold: 0.75,
      },
      // THE ROCK GOES: the whole pile thrown outward, and out of it, the God
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          const c = BUR.goku.clone().add(new V3(0, 1.4, 0));
          ctx.rub.burst();
          ctx.rub = null;
          s.goku.setHidden(false);
          SL.Staging._put(s.goku, BUR.goku.clone().add(new V3(0, 0.4, 0)));
          s.goku.grounded = false;
          K().faceTo(s.goku, s.beerus.pos);
          b.vfx.explosion(c, 3.2, 0xff3a6a, { smoke: false });
          b.vfx.flash(c, 22, 0xff4a7a, 0.5, SL.Toon.tex.glow);
          b.vfx.ring(BUR.goku.clone().add(new V3(0, 0.3, 0)), 22, 0xff6a8a, 0.8, new V3(0, 1, 0));
          b.vfx.ring(c, 14, 0xffffff, 0.5);
          b.vfx.light(c, 0xff3a5a, 10, 60, 1.2);
          b.vfx.dust(BUR.goku, 10, 40, 0x5a5470);
          b.vfx.debrisBurst(c, 24, 0x3a3456, 18, 0.35);
          SL.ScreenFX.flash(0.7, '#ff5a8a');
          b.sfx('explosionHuge', null, { at: c, pitch: 0.6, vol: 1.4 });
          b.sfx('transformBurst', s.goku, { pitch: 0.8, vol: 1.2 });
          b.cameraTraumaAt(c, 1);
          b.slowmo(0.3, 0.8);
          m.music('final_clash', 3);
          pt(ctx, 'burstCam', BUR.goku.clone().add(new V3(8.5, 0.8, 9.5)));
          pt(ctx, 'up', BUR.goku.clone().add(new V3(0, 3.4, 0)));
        },
        space: { who: 'goku', mode: 'flight', to: 'up', seconds: 0.55, pose: 'bg_roar', endPose: 'bg_roar' },
        pose: [{ who: 'goku', pose: 'bg_roar', face: 'shout', speed: 30, aura: 1.5 }],
        cam: { from: { at: 'burstCam' }, look: { at: 'pile', off: [0, 2.6, 0] }, fov: 62, raw: true },
        hold: 1.5,
      },
      // the God's aura opening out round him
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.ring(s.goku.chest(), 9, 0xff5a6a, 0.6);
          b.after(14, () => b.vfx.ring(s.goku.chest(), 13, 0xff8a9a, 0.7));
          b.vfx.dust(BUR.goku, 7, 30, 0x5a5470);
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          if (b.frame % 3 === 0) b.vfx.streamInward(s.goku.chest(), 4, 0xff6a7a, 3, 0.16, 0.4);
        },
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'angry', speed: 8, aura: 1.2 }],
        cam: { subject: 'goku', focus: 'upper', focus2: 'closeup', angle: 'front' },
        sfx: { name: 'aura', vol: 1, pitch: 0.8 },
        hold: 1.9,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_stance', face: 'grin', speed: 8 }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Ha...! NOW you\'ve got my attention!', duration: 2.4, to: 'goku' },
        hold: 2.4,
      },
      // HE CHARGES
      {
        call: (ctx) => {
          const s = st(ctx);
          const d = s.beerus.pos.clone().sub(s.goku.pos).normalize();
          pt(ctx, 'hit', s.beerus.pos.clone().addScaledVector(d, -1.4));
        },
        space: { who: 'goku', mode: 'flight', to: 'hit', seconds: 0.4, pose: 'dash', endPose: 'punchR' },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.trail(s.goku.chest(), GOKU_TRAIL, 0.9, 0.45);
          if (b.frame % 2 === 0) b.vfx.afterimage(s.goku.pos.clone(), 1.8, 0xffb0b8);
        },
        cam: { from: { at: 'goku', local: [0.6, 0.5, -3] }, look: { at: 'beerus' }, fov: 60, raw: true, follow: true },
        sfx: { name: 'dash', vol: 1.2, pitch: 0.8 },
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (ctx.rub) ctx.rub.dispose();
      ctx.rub = null;
      s.goku.setHidden(false);
      s.beerus.setHidden(false);
      ctx.m.flags.buried = true;
    },
  };

  /* ---------------------------------------------------------------- the launch: up through everything */
  S.bgb_launch = {
    id: 'bgb_launch',
    cast,
    clearMood: false,
    events: [
      // THE 360° MELEE: blow for blow in the middle of the cave, the lens all the way round them
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().clearCombat(ctx.b);
          K().toForm(s.goku, 'god');
          K().air(m, s.goku, WHIRL.centre.x - 0.85, WHIRL.centre.y, WHIRL.centre.z, WHIRL.centre, 'punchR', 'shout');
          K().air(m, s.beerus, WHIRL.centre.x + 0.85, WHIRL.centre.y, WHIRL.centre.z, WHIRL.centre, 'bs_guard', 'grin');
          ctx.whirlBeat = -1;
          m.music('final_clash', 3);
        },
        tick: (ctx, t) => whirl(ctx, t),
        cam: { from: [0, 7, 0], look: [0, 7.1, 0], orbit: { at: [0, 6.8, 0], from: 0.3, to: 0.3 + Math.PI * 2, radius: 7.2, radius2: 5.6, y: 1.6, y2: 0.3 }, fov: 50, ease: 'linear', raw: true },
        hold: 3.6,
      },
      // the last one of the exchange: fist on fist — and every crystal left in the cave goes at once
      {
        pose: [
          { who: 'goku', pose: 'punchR', face: 'shout', speed: 50 },
          { who: 'beerus', pose: 'punchL', face: 'grin', speed: 50 },
        ],
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          K().air(m, s.goku, -0.95, 6, 0, new V3(0, 6, 0), 'punchR', 'shout');
          K().air(m, s.beerus, 0.95, 6, 0, new V3(0, 6, 0), 'punchL', 'grin');
          const mid = new V3(0, 7.15, 0);
          b.vfx.ring(mid, 30, 0xffffff, 0.8);
          b.vfx.ring(mid, 18, 0xff8aa0, 0.6);
          b.vfx.flash(mid, 5, 0xffe0f0, 0.35, SL.Toon.tex.glow);
          b.sfx('explosionHuge', null, { at: mid, pitch: 0.8 });
          b.cameraTraumaAt(mid, 1);
          b.slowmo(0.2, 1);
          for (const pr of b.stage.crystals || []) if (pr.alive) b.stage.damageProp(pr, 1e6, s.goku);
          // the roof answers: shards of it coming down all over the cave
          for (let i = 0; i < 26; i++) {
            const a = rnd(i, 80) * Math.PI * 2, d = 4 + rnd(i, 81) * 34;
            const x = Math.cos(a) * d, z = Math.sin(a) * d;
            b.vfx.rock(new V3(x, roofOver(b, x, z), z), new V3(0, -4 - rnd(i, 82) * 6, 0), 0.4 + rnd(i, 83) * 0.9, i % 4 ? 0x2e2a46 : 0x9ae6ff);
          }
          pt(ctx, 'mid', mid);
          pt(ctx, 'midCam', mid.clone().add(new V3(0.4, 0.3, -4.4)));
        },
        tick: (ctx) => {
          const s = st(ctx);
          ctx.cast.mid.pos.copy(K().touch(s.goku, s.beerus, { handB: 'L', reachB: 0.045 }));
        },
        cam: { from: { at: 'midCam' }, look: { at: 'mid' }, fov: 40, raw: true },
        hold: 1.4,
      },
      {
        tick: (ctx) => {
          const b = ctx.b;
          if (b.frame % 3 === 0) b.vfx.rock(new V3((b.frame % 30) - 15, 30, ((b.frame * 7) % 30) - 15), new V3(0, -10, 0), 0.5, 0x3a3456);
          b.camera.addTrauma(0.04);
        },
        cam: { subject: 'goku', with: 'beerus', focus: 'upper', angle: 'low' },
        say: { who: 'goku', line: 'The whole place is coming down!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // UP: through the roof
      {
        space: [
          { who: 'goku', mode: 'flight', to: [-1, 36, 0], seconds: 0.7, pose: 'flyUp', endPose: 'flyUp' },
          { who: 'beerus', mode: 'flight', to: [1, 37, 0], seconds: 0.7, pose: 'bs_flyForward', endPose: 'bs_flyForward' },
        ],
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.trail(s.goku.chest(), 0xff6a6a, 1, 0.4);
          b.vfx.trail(s.beerus.chest(), 0xc89aff, 1, 0.4);
        },
        cam: { from: { at: 'mid', off: [6, -6, 6] }, look: { at: 'goku' }, fov: 62 },
      },
      // OUT OF THE SEA: a column of water, two streaks climbing
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          b.changeStage('cruise_liner');
          m.endShot();
          hideWatchers(m);
          b.stage.clearMood(0.1);
          const lvl = b.stage.waterLevel;
          const at = new V3(120, lvl, 140);
          SL.Staging._put(s.goku, new V3(at.x - 0.8, lvl + 2, at.z));
          SL.Staging._put(s.beerus, new V3(at.x + 0.8, lvl + 1, at.z));
          s.goku.grounded = s.beerus.grounded = false;
          s.goku.setState('scripted', { pose: 'flyUp', expression: 'grin' });
          s.beerus.setState('scripted', { pose: 'bs_flyForward', expression: 'grin' });
          for (let i = 0; i < 5; i++) K().splash(b, at.clone().add(new V3((i - 2) * 1.5, 0, 0)), 5);
          b.sfx('explosionBig', null, { at, pitch: 0.45, vol: 1.3 });
          pt(ctx, 'out', at);
          pt(ctx, 'outCam', at.clone().add(new V3(-30, 6, 40)));
        },
        space: [
          { who: 'goku', mode: 'flight', to: { at: 'out', off: [-1, 120, 0] }, seconds: 2.2, pose: 'flyUp', endPose: 'flyUp' },
          { who: 'beerus', mode: 'flight', to: { at: 'out', off: [1, 121, 0] }, seconds: 2.2, pose: 'bs_flyForward', endPose: 'bs_flyForward' },
        ],
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.trail(s.goku.chest(), 0xff6a6a, 1.4, 0.7);
          b.vfx.trail(s.beerus.chest(), 0xc89aff, 1.4, 0.7);
          if (b.frame % 3 === 0) K().splash(b, ctx.cast.out.pos, 3);
          // the sky darkens as they climb
          const k = Math.max(0, Math.min(1, (s.goku.pos.y - 10) / 110));
          K().skyTo(b, K().SKY.high, k);
        },
        cam: { from: { at: 'outCam' }, look: { at: 'goku' }, fov: 58 },
      },
      // through the clouds: white
      {
        call: (ctx) => {
          SL.ScreenFX.flash(0.9, '#ffffff');
          ctx.b.sfx('wind', null, { vol: 1.2, pitch: 0.8 });
        },
        hold: 0.35,
      },
      // THE EDGE OF SPACE: the sky going black, the Earth's curve below
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          b.changeStage('stratosphere');
          m.endShot();
          hideWatchers(m);
          b.stage.setAltitude(0.55);
          SL.Staging._put(s.goku, new V3(-0.8, -60, 0));
          SL.Staging._put(s.beerus, new V3(0.8, -59, 0));
          s.goku.setState('scripted', { pose: 'flyUp', expression: 'grin' });
          s.beerus.setState('scripted', { pose: 'bs_flyForward', expression: 'grin' });
          pt(ctx, 'below', new V3(12, -95, 24));
        },
        space: [
          { who: 'goku', mode: 'flight', to: [-5, 0, 0], seconds: 2.6, pose: 'flyUp', endPose: 'flyIdle' },
          { who: 'beerus', mode: 'flight', to: [5, 1.5, 0], seconds: 2.6, pose: 'bs_flyForward', endPose: 'bs_flyIdle' },
        ],
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          b.stage.setAltitude(0.55 + Math.min(1, t / 2.6) * 0.37);
          b.vfx.trail(s.goku.chest(), 0xff6a6a, 1.1, 0.6);
          b.vfx.trail(s.beerus.chest(), 0xc89aff, 1.1, 0.6);
        },
        cam: { from: { at: 'below' }, look: { at: 'goku' }, fov: 64 },
      },
      // the scale of it: two sparks over the curve of the world
      {
        call: (ctx) => {
          const s = st(ctx);
          K().faceTo(s.goku, s.beerus.pos);
          K().faceTo(s.beerus, s.goku.pos);
          pt(ctx, 'far', new V3(0, 0, 0));
        },
        cam: { from: { at: 'far', off: [60, 18, 90] }, to: { at: 'far', off: [40, 10, 64] }, look: { at: 'far', off: [0, -30, 0] }, fov: 52 },
        sfx: { name: 'tinnitus', vol: 0.3 },
        music: { song: 'final_clash', level: 4 },
        hold: 3.2,
      },
      {
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'grin' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Look at that... the whole Earth, right there.', duration: 2.6, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_stance', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Don\'t let the view distract you!', duration: 2, to: 'goku' },
        hold: 2,
      },
      // SPACE: the same clash over the curve of the world — light, ring after ring, no air to carry a sound
      ...clashEvents({
        at: () => new V3(0, 1.5, 0),
        space: true,
        gap: 24,
        approach: 0.6,
        empty: 1,
        wide: (c) => ({ from: c.clone().add(new V3(-8, 10, 74)), look: c.clone().add(new V3(0, -22, 0)) }),
        react: (c) => ({ from: c.clone().add(new V3(52, 12, 64)), look: c.clone().add(new V3(0, -22, 0)) }),
        line: { who: 'goku', line: 'Hah... I\'ve never felt anything like this!', duration: 2.4 },
        music: { song: 'final_clash', level: 3 },
      }),
    ],
    end(ctx) {
      const s = st(ctx), b = ctx.b;
      if (b.stage.def.id !== 'stratosphere') {
        b.changeStage('stratosphere');
        ctx.m.endShot();
      }
      hideWatchers(ctx.m);
      b.stage.setAltitude(0.92);
      s.goku.setHidden(false);
      s.beerus.setHidden(false);
    },
  };

  /* ---------------------------------------------------------------- the red goes out — the power does not */
  S.bgb_expire = {
    id: 'bgb_expire',
    cast,
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().air(m, s.goku, -4, 0, 0, new V3(4, 0, 0), 'g_godStance', 'grit');
          K().air(m, s.beerus, 4, 1, 0, s.goku.pos, 'bs_idle', 'calm');
        },
        // the flame gutters: red, gold, red, gold
        tick: (ctx, t) => {
          const s = st(ctx), b = ctx.b;
          const on = Math.floor(t * 5) % 2 === 0 && t < 2;
          K().toForm(s.goku, on ? 'god' : 'godki');
          if (b.frame % 6 === 0) b.vfx.flash(s.goku.headPos(), 0.9, on ? 0xff4a5a : 0xffd040, 0.12, SL.Toon.tex.glow);
        },
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        sfx: { name: 'heartbeat', vol: 0.8 },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().toForm(s.goku, 'godki');
          b.vfx.ring(s.goku.chest(), 4, 0xffd040, 0.5);
        },
        pose: [{ who: 'goku', pose: 'lookHands', face: 'shock', speed: 6 }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', line: 'Huh? My hair... the red\'s gone!', duration: 2.4 },
        hold: 2.4,
      },
      {
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', line: 'Your time as a god has run out.', duration: 2.4 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'beerus', pose: 'bs_stance', face: 'smirk' }],
        cam: { subject: 'beerus', with: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'beerus', line: '...And yet you\'re still keeping up with me. Your body has absorbed the god\'s power.', duration: 4 },
        hold: 4,
      },
      {
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'grin', speed: 6, aura: 0.9 }],
        cam: { subject: 'goku', focus: 'closeup', angle: 'front' },
        say: { who: 'goku', line: 'I can still feel it! Alright — let\'s keep going!', duration: 2.6, style: 'shout' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      K().toForm(st(ctx).goku, 'godki');
      ctx.m.flags.godExpired = true;
    },
  };

  S.bgb_enough = {
    id: 'bgb_enough',
    cast,
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          K().air(m, s.goku, -4, 0, 0, new V3(4, 6, 0), 'exhausted', 'grit');
          K().air(m, s.beerus, 4, 6, 0, s.goku.pos, 'bs_idle', 'calm');
        },
        cam: { subject: 'beerus', focus: 'upper', angle: 'low' },
        say: { who: 'beerus', line: 'Hmph. Enough fooling around.', duration: 2.4 },
        hold: 2.4,
      },
      {
        cam: { subject: 'beerus', focus: 'closeup', angle: 'front' },
        say: { who: 'beerus', line: 'Let\'s see if you can protect your planet, Saiyan.', duration: 2.8 },
        music: { song: 'ominous', level: 3 },
        hold: 2.8,
      },
      {
        cam: { subject: 'goku', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'goku', pose: 'g_godStance', face: 'shock' }],
        hold: 1.4,
      },
    ],
  };

  const def = {
    id: 'bog_battle',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'Battle of Gods',
    subtitle: 'Over the ocean · under the sea · at the edge of space',
    character: 'goku',
    stage: 'cruise_liner',
    parTime: 540,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'A Super Saiyan God against the God of Destruction: over the ocean, through a cavern of crystal, and up until the sky goes black.',
    rewards: ['Story: the Battle of Gods', 'Stages: the Crystal Cavern, the Edge of Space'],
    setup,
    phases: [P.rise, P.sky, P.cavern, P.edge, P.godki, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogBattle = { B };
})();
