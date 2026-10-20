/*
 * SUPER BROLY KIT — shared staging for the movie's missions (src/data/story.js `movies` → super_broly). Built on
 * the Buu Saga kit (SL.data.buuKit: ground, place, hover, faceTo, watcher, scripted, toForm, unhook) and the
 * engine's own pieces: nothing here is a parallel engine.
 *
 *   BK.at(b, x, z) / BK.lm(b, name)     a point on the ground / a glacier landmark (stage_broly.js)
 *   BK.give(f, ids)                     forms the film has already handed over by this mission (checkpoints)
 *   BK.react(m)                         THE GLACIER ANSWERS: every crater opens dark cracks across the snow and
 *                                       throws ice; heavy blows near the ground kick up snow. Bounded (the
 *                                       stage's crack pool), rate-limited, removed with the mission
 *   BK.iceBurst(b, at, power)           an impact on the ice: cracks, a snow plume, shards, a ring
 *   BK.coat(m, coated, real)            the winter coat comes off: the coated body is hidden, the fighting body
 *                                       takes its place and pose, and the coat drops to the snow
 *   BK.rageMeter(m, broly, on)          Broly's HUD meter shows RAGE instead of his adaptation
 *   BK.eyes(f, k)                       the Wrathful eyes coming on (0..1: dark to glowing amber)
 *   BK.swell(f, k, to)                  the body swelling toward a form's build (bulk, muscle, size), 0..1
 * Film poses (SL.data.poses): v_coatOff, g_pockets, v_armsCrossed2, v_braced, fz_pod (Frieza, a hand raised).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const BK = (SL.data.brolyKit = {
    CHAPTER: 'MOVIE · DRAGON BALL SUPER: BROLY',
    // the film's forms: Goku fights in base, Super Saiyan, God and (later) Blue — no Kaio-ken, no second or third
    // level, no Battle of Gods god ki; Vegeta: Super Saiyan, God, Blue — no second level, no Majin, no Super Vegeta
    LOCKS: { goku: ['kaioken', 'ssj2', 'ssj3', 'godki'], vegeta: ['ssj2', 'majin', 'super_vegeta'] },
    at(b, x, z, lift = 0) {
      return K.ground(b, new V3(x, 0, z), lift);
    },
    lm(b, name) {
      const l = b.stage.landmarks && b.stage.landmarks[name];
      return l ? l.clone() : new V3();
    },
    /** Forms this mission already has (handed over earlier in the film): unlocked for this fighter. */
    give(f, ids) {
      for (const id of [].concat(ids)) {
        if (f.storyLocks) delete f.storyLocks[id];
        if (f.lockedForms && f.lockedForms[id]) {
          const l = Object.assign({}, f.lockedForms);
          delete l[id];
          f.lockedForms = l;
        }
      }
    },
    /** An impact on the ice: dark cracks racing out, a plume of snow, shards of ice, a ring. */
    iceBurst(b, at, power = 1) {
      const st = b.stage;
      const g = at.clone();
      if (st.hasGround) g.y = st.heightAt(g.x, g.z);
      if (st.iceCrack) st.iceCrack(g, 2.5 + power * 2);
      b.vfx.dust(g.clone().add(new V3(0, 0.2, 0)), 0.8 + power * 0.7, Math.round(5 + power * 5), 0xa6bccf);
      b.vfx.debrisBurst(g.clone().add(new V3(0, 0.4, 0)), Math.round(5 + power * 6), 0x9cc8e8, 6 + power * 4, 0.14 + power * 0.06);
      b.vfx.ring(g.clone().add(new V3(0, 0.15, 0)), 1.5 + power * 2, 0x8ab8dc, 0.35, new V3(0, 1, 0));
    },
    /**
     * THE GLACIER ANSWERS the fight: a crater (a slam, a body driven into the ice, a blast) splits the snow with
     * cracks and throws ice; a heavy blow taken near the ground kicks up snow. Returns off().
     */
    react(m) {
      const b = m.battle;
      let last = -999;
      const offC = b.on('crater', (e) => {
        if (b.frame - last < 6) return;
        last = b.frame;
        BK.iceBurst(b, e.pos, U.clamp(e.radius / 4, 0.4, 2.2));
      });
      let lastHit = -999;
      const offD = b.on('damage', (e) => {
        const t = e.target;
        if (!t || e.amount < 900 || b.frame - lastHit < 14 || !b.stage.hasGround) return;
        if (t.pos.y - b.stage.heightAt(t.pos.x, t.pos.z) > 2.2) return;
        lastHit = b.frame;
        b.vfx.dust(t.pos.clone().add(new V3(0, 0.2, 0)), 0.9, 6, 0xa6bccf);
      });
      const off = () => {
        offC();
        offD();
      };
      m.onDispose(off);
      return off;
    },
    /** The winter coat comes off: the coated body goes, the fighting body stands where it stood, the coat drops. */
    coat(m, coated, real, color) {
      const b = m.battle;
      real.setHidden(false);
      K.place(real, coated.pos.clone(), coated.yaw);
      real.yaw = real.prevYaw = coated.yaw;
      coated.setHidden(true);
      coated.untargetable = coated.intangible = true;
      // the coat itself: a crumpled heap of cloth that drops and lies in the snow
      const st = b.stage;
      const heap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 6), SL.Toon.mat(color));
      heap.scale.set(1.2, 0.32, 0.9);
      const side = new V3(real.forward.z, 0, -real.forward.x);
      const p = real.pos.clone().addScaledVector(side, 0.9).addScaledVector(real.forward, -0.3);
      p.y = (st.hasGround ? st.heightAt(p.x, p.z) : p.y) + 1.4;
      heap.position.copy(p);
      SL.Toon.addOutline(heap, 1);
      b.scene.add(heap);
      const ground = (st.hasGround ? st.heightAt(p.x, p.z) : p.y - 1.4) + 0.12;
      let vy = 0;
      b.onTick(() => {
        if (b.disposed || !heap.parent) return false;
        if (heap.position.y <= ground) return false;
        vy -= 0.02;
        heap.position.y = Math.max(ground, heap.position.y + vy);
        heap.rotation.z += 0.04;
        if (heap.position.y <= ground) b.vfx.dust(heap.position.clone(), 0.5, 5, 0xa6bccf);
        return true;
      });
      m.onDispose(() => {
        if (heap.parent) heap.parent.remove(heap);
        heap.geometry.dispose();
      });
      return heap;
    },
    /** A scene's cast: everybody the mission put in b.story, by name. */
    cast(m) {
      const s = m.battle.story || {};
      const out = {};
      for (const k of Object.keys(s)) if (s[k] && s[k].pos) out[k] = s[k];
      return out;
    },
    /**
     * The face itself, whatever the body is doing (lying on his back in a crater): the centre of the skull, the
     * front of the face and the way it points, from the head joint's own frame. Returns { center, face, fwd, up, R }.
     */
    facePoint(f) {
      const j = f.model.joints.head;
      f.model.root.updateMatrixWorld(true);
      const q = j.getWorldQuaternion(new THREE.Quaternion());
      const R = f.model.b.headR * f.model.root.scale.y;
      const up = new V3(0, 1, 0).applyQuaternion(q), fwd = new V3(0, 0, 1).applyQuaternion(q);
      const center = j.getWorldPosition(new V3()).sub(f.object.position).add(f.pos).addScaledVector(up, R * 0.95);
      return { center, face: center.clone().addScaledVector(fwd, R), fwd, up, R };
    },
    rageMeter(m, f, on) {
      if (f && f.mech) f.mech.hudMode = on ? 'rage' : 'adapt';
    },
    /** The Wrathful eyes coming on, 0..1: his own dark eyes to the glowing amber of the form. */
    eyes(f, k) {
      const wr = f.def.forms.find((x) => x.id === 'wrath');
      if (!wr || !f.model || !f.model.face || !f.model.face.pupilMat) return;
      const from = new THREE.Color((f.def.appearance.face && f.def.appearance.face.pupil) || 0x141414);
      f.model.face.pupilMat.color.copy(from.lerp(new THREE.Color(wr.look.pupil), U.clamp01(k)));
    },
    /** The body swelling toward a form's build (bulk, muscle and size): k 0..1 of the way from `from` to `to`. */
    swell(f, k, toId, fromId = 'base') {
      const to = f.def.forms.find((x) => x.id === toId), from = f.def.forms.find((x) => x.id === fromId);
      if (!to || !from || !f.model) return;
      const a = from.look || {}, z = to.look || {};
      const L = (key) => U.lerp(a[key] || 1, z[key] || 1, U.clamp01(k));
      const look = Object.assign({}, a, { bulk: L('bulk'), muscle: L('muscle'), scale: L('scale') });
      f.model.setForm({ look });
    },

    /* ---------------- the whole film (parts 1–9) ---------------- */
    /** INSTANT TRANSMISSION, out: a shimmer where he stood, the pop — gone. */
    vanish(b, f, color = 0xdff2ff) {
      b.vfx.afterimage(f.pos, f.height, color);
      b.vfx.flash(f.chest(), 1.4, color, 0.16, SL.Toon.tex.glow);
      b.sfx('itPop', f, { pitch: 1 });
      f.setHidden(true);
      f.untargetable = f.intangible = true;
    },
    /** ...and in: the pop, a shimmer — there. */
    appear(b, f, pos, yaw, color = 0xdff2ff) {
      K.place(f, pos, yaw === undefined ? f.yaw : yaw);
      if (yaw !== undefined) f.yaw = f.prevYaw = yaw;
      f.setHidden(false);
      f.untargetable = f.intangible = false;
      b.vfx.flash(f.chest(), 1.4, color, 0.16, SL.Toon.tex.glow);
      b.vfx.ring(f.chest(), 1.6, color, 0.25);
      b.sfx('itPop', f, { pitch: 1.2 });
    },
    /** THE MELT: the glacier going to lava over `seconds` (stage.setMelt), lava thrown up, the ground shaking. */
    melt(m, seconds = 4) {
      const b = m.battle, st = b.stage;
      if (!st.setMelt) return;
      const from = st._melt || 0;
      const N = Math.max(1, Math.round(seconds * 60));
      let n = 0;
      b.onTick(() => {
        if (b.disposed || b.stage !== st) return false;
        n++;
        st.setMelt(U.lerp(from, 1, U.easeInOutCubic(Math.min(1, n / N))));
        if (n % 9 === 0 && n > N * 0.2) {
          const a = n * 0.77, r = 8 + (n % 47);
          st.lavaGeyser(new V3(Math.cos(a) * r, 0, Math.sin(a) * r), 6 + (n % 5));
        }
        if (n % 4 === 0) b.camera.addTrauma(0.05);
        return n < N;
      });
    },
    /** On the lava: every crater throws lava up, a body hitting the ground throws embers. Returns off(). */
    lavaReact(m) {
      const b = m.battle;
      let last = -999;
      const off = b.on('crater', (e) => {
        if (b.frame - last < 8 || !b.stage.lavaGeyser || (b.stage._melt || 0) < 0.5) return;
        last = b.frame;
        b.stage.lavaGeyser(e.pos, 4 + Math.min(8, e.radius));
      });
      m.onDispose(off);
      return off;
    },
    /** Super Saiyan Broly's eyes: the pupils shaking, cracking, gone to blank white (0..1). */
    blankEyes(f, k) {
      const md = f.model;
      if (!md || !md.face || !md.face.pupilMat) return;
      k = U.clamp01(k);
      const from = new THREE.Color(0xffb21a);
      md.face.pupilMat.color.copy(from.lerp(new THREE.Color(0xffffff), k));
      if (md._applyEyes) {
        md._pupilBase = U.lerp(1.3, 0.04, k * k);
        md._applyEyes();
      }
    },
    /** Frieza's needle: a beam no thicker than a finger, from the fingertip to the target, without a sound. */
    needle(b, from, to) {
      b.vfx.slash(from, to, 0xff3a7a, 0.05, 0.02);
      b.vfx.flash(from, 0.4, 0xff6a9a, 0.12, SL.Toon.tex.glow);
      b.after(2, () => b.vfx.sparks(to, 0xff8ab0, 4, 2, 0.04));
    },
    /** A small Frieza Force ship (Cheelai and Lemo's): a white hull, a blue canopy, three legs. lift(k) takes off. */
    ship(m, pos, yaw = 0) {
      const b = m.battle, T = SL.Toon;
      const g = new THREE.Group();
      const add = (geo, color, p, s, o = 1) => {
        const mesh = new THREE.Mesh(geo, color.isMaterial ? color : T.mat(color));
        if (p) mesh.position.set(p[0], p[1], p[2]);
        if (s) mesh.scale.set(s[0], s[1], s[2]);
        if (o) T.addOutline(mesh, o);
        g.add(mesh);
        return mesh;
      };
      add(new THREE.SphereGeometry(3, 24, 14), 0xe8e8f0, [0, 2.6, 0], [1, 0.5, 1.4], 1.6);
      add(new THREE.SphereGeometry(1.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x6ab8e8, transparent: true, opacity: 0.7 }), [0, 3.6, 1.4], [1, 0.8, 1.2], 0);
      add(new THREE.CylinderGeometry(3.05, 3.05, 0.3, 28, 1, true), 0x8a6ab8, [0, 2.6, 0], [1, 1, 1.4], 0);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        add(new THREE.CylinderGeometry(0.16, 0.22, 2.4, 8), 0x9a9aa8, [Math.sin(a) * 2, 1, Math.cos(a) * 2.4], null, 0.8);
      }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.tex.glow, color: 0x8ad8ff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.6, depthWrite: false }));
      glow.position.set(0, 2.4, -4.2);
      glow.scale.setScalar(2.6);
      g.add(glow);
      const ground = pos.clone();
      g.position.copy(ground);
      g.rotation.y = yaw;
      b.scene.add(g);
      const h = {
        group: g,
        lift(k) {
          g.position.copy(ground).add(new V3(0, k * k * 60, 0)).addScaledVector(new V3(Math.sin(yaw), 0, Math.cos(yaw)), k * k * 40);
          glow.scale.setScalar(2.6 + k * 4);
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          g.traverse((o) => {
            if (o.isMesh) o.geometry.dispose();
            if (o.isSprite) o.material.dispose();
          });
        },
      };
      m.onDispose(h.dispose);
      return h;
    },
    /**
     * THE CAPSULE HOUSE (the epilogue): a white dome on a low ring, a round door, the company mark, a few
     * windows — and supply crates stacked beside it. pop() throws the capsule's smoke and shows it.
     */
    capsuleHouse(m, pos, yaw = 0) {
      const b = m.battle, T = SL.Toon;
      const g = new THREE.Group();
      const add = (geo, color, p, s, o = 1) => {
        const mesh = new THREE.Mesh(geo, color.isMaterial ? color : T.mat(color));
        if (p) mesh.position.set(p[0], p[1], p[2]);
        if (s) mesh.scale.set(s[0], s[1], s[2]);
        if (o) T.addOutline(mesh, o);
        g.add(mesh);
        return mesh;
      };
      add(new THREE.SphereGeometry(4, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), 0xf4f2ea, [0, 0.3, 0], [1, 0.82, 1], 1.8);
      add(new THREE.CylinderGeometry(4.1, 4.3, 0.6, 32), 0xc8c4b8, [0, 0.3, 0], null, 1);
      const door = add(new THREE.CircleGeometry(1.1, 20), new THREE.MeshBasicMaterial({ color: 0x3a4a5a }), [0, 1.4, 3.75], null, 0);
      door.rotation.x = -0.2;
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: T.emblemTexture('@capsule', '#1c1c24', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
      mark.position.set(0, 2.85, 2.5);
      mark.rotation.x = -0.75;
      g.add(mark);
      for (const s of [1, -1]) {
        const w = add(new THREE.CircleGeometry(0.45, 14), new THREE.MeshBasicMaterial({ color: 0x9fd4ff }), [s * 2.6, 1.8, 2.7], null, 0);
        w.rotation.y = s * 0.75;
        w.rotation.x = -0.3;
      }
      // the supplies: crates and a sack of food
      for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(1, 0.8, 0.9), i % 2 ? 0xc89a5a : 0xb0884a, [5.2 + (i % 3) * 1.1, 0.4 + Math.floor(i / 3) * 0.8, -1 + (i % 2) * 0.4], null, 0.8);
      add(new THREE.SphereGeometry(0.7, 12, 8), 0xd8c89a, [5.4, 0.5, 1.4], [1, 0.8, 1], 0.8);
      g.position.copy(pos);
      g.rotation.y = yaw;
      g.visible = false;
      b.scene.add(g);
      const h = {
        group: g,
        pop() {
          g.visible = true;
          b.vfx.smoke.emit(pos.x, pos.y + 1.5, pos.z, 0, 1.5, 0, 0.92, 0.92, 0.94, 0.85, 3, 1.4, { grow: 2.5, drag: 1 });
          b.vfx.dust(pos.clone(), 3, 16, b.stage.def.dust || 0xd8d4c8);
          b.sfx('capsulePop', null, { at: pos, vol: 1 });
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          g.traverse((o) => {
            if (o.isMesh) o.geometry.dispose();
          });
          mark.material.map.dispose();
          mark.material.dispose();
        },
      };
      m.onDispose(h.dispose);
      return h;
    },
    /**
     * BA — Broly's only friend on Vampa: a huge, gentle beast like a beetle the size of a house, a dark violet
     * shell, long jointed legs, a small head with soft antennae. A set piece, not a fighter (Level 1 prototype,
     * built from memory). setPos(p, yaw), mood('idle'|'flinch'|'eat'), dispose().
     */
    ba(m, pos, yaw = 0) {
      const b = m.battle, T = SL.Toon;
      const g = new THREE.Group();
      const body = new THREE.Group();
      body.position.y = 3.2;
      g.add(body);
      const add = (parent, geo, color, p, s, r, o = 1.2) => {
        const mesh = new THREE.Mesh(geo, T.mat(color));
        if (p) mesh.position.set(p[0], p[1], p[2]);
        if (s) mesh.scale.set(s[0], s[1], s[2]);
        if (r) mesh.rotation.set(r[0], r[1], r[2]);
        if (o) T.addOutline(mesh, o);
        parent.add(mesh);
        return mesh;
      };
      const SHELL = 0x4a2a6a, SHELL2 = 0x6a4a8a, SKIN = 0xa89a6a, LEG = 0x3a2a4a;
      add(body, new THREE.SphereGeometry(2.6, 20, 14), SHELL, [0, 0, -0.6], [1, 0.7, 1.4]);
      add(body, new THREE.SphereGeometry(2.1, 18, 12), SHELL2, [0, 0.55, -0.4], [1, 0.5, 1.25], null, 0.8);
      add(body, new THREE.SphereGeometry(1.6, 16, 10), SKIN, [0, -0.6, 0.6], [1, 0.6, 1.2], null, 0.8);
      const head = new THREE.Group();
      head.position.set(0, 0.2, 3.1);
      body.add(head);
      add(head, new THREE.SphereGeometry(1, 14, 10), SKIN, null, [1, 0.85, 1.1]);
      for (const s of [1, -1]) {
        add(head, new THREE.SphereGeometry(0.22, 8, 6), 0x141018, [s * 0.5, 0.25, 0.75], null, null, 0);
        add(head, new THREE.CylinderGeometry(0.05, 0.03, 1.8, 5), LEG, [s * 0.35, 1.2, 0.2], null, [0.5, 0, -s * 0.4], 0.5);
      }
      const legs = [];
      for (let i = 0; i < 6; i++) {
        const side = i < 3 ? 1 : -1, row = i % 3;
        const hip = new THREE.Group();
        hip.position.set(side * 1.8, -0.4, 1.2 - row * 1.4);
        body.add(hip);
        const upper = add(hip, new THREE.CylinderGeometry(0.22, 0.18, 2.6, 7), LEG, [side * 1.1, 0.6, 0], null, [0, 0, -side * 1.0], 0.8);
        const lower = add(hip, new THREE.CylinderGeometry(0.17, 0.08, 3.4, 7), LEG, [side * 2.3, -1.6, 0], null, [0, 0, side * 0.25], 0.8);
        legs.push({ hip, upper, lower, side, row });
      }
      g.position.copy(pos);
      g.rotation.y = yaw;
      b.scene.add(g);
      let mood = 'idle', t = 0;
      const tick = () => {
        if (b.disposed || !g.parent) return false;
        t += 1 / 60;
        const step = mood === 'flinch' ? 8 : 1.4;
        legs.forEach((L, i) => (L.hip.rotation.x = Math.sin(t * step + i * 1.7) * (mood === 'flinch' ? 0.25 : 0.08)));
        body.position.y = 3.2 + Math.sin(t * 1.3) * 0.08 + (mood === 'flinch' ? -0.4 : 0);
        head.rotation.x = mood === 'eat' ? 0.5 + Math.sin(t * 9) * 0.15 : Math.sin(t * 0.9) * 0.1;
        head.rotation.y = mood === 'flinch' ? Math.sin(t * 20) * 0.2 : Math.sin(t * 0.6) * 0.25;
        return true;
      };
      b.onTick(tick);
      const h = {
        group: g,
        headPos: () => head.getWorldPosition(new V3()),
        setPos(p, y) {
          g.position.copy(p);
          if (y !== undefined) g.rotation.y = y;
        },
        mood(x) {
          mood = x;
        },
        dispose() {
          if (!g.parent) return;
          b.scene.remove(g);
          g.traverse((o) => o.isMesh && o.geometry.dispose());
        },
      };
      m.onDispose(h.dispose);
      return h;
    },
    /**
     * THE VAMPA BEAST: a giant worm that hunts by the ground's tremor. A real combat object (the FR.armour
     * pattern): it tunnels toward its prey under a moving furrow of grit, rises with a red ring under it (the
     * tell), lunges, sways over the ground for a few seconds (hit its head then: it is a lockable target with
     * its own health), and dives again. opts: hp (6000), target() → the fighter it hunts, damage (900).
     * Returns { hp, maxHp, state, head (the prop), done, stop() }; emits 'wormLunge' { hit }, 'wormDown'.
     */
    worm(m, opts = {}) {
      const b = m.battle, st = b.stage, T = SL.Toon;
      const W = { hp: opts.hp || 6000, maxHp: opts.hp || 6000, state: 'under', t: 0, done: false, lunges: 0, hits: 0 };
      const SKIN = 0xb8a86a, BAND = 0x6a5a3a, MOUTH = 0x3a1010, TOOTH = 0xf0e8d0;
      const gy = (x, z) => (st.hasGround ? st.heightAt(x, z) : 0);
      // the head: a prop the player can lock on to and hit
      const start = opts.at ? opts.at.clone() : new V3(20, 0, 20);
      const pr = st.addProp({ kind: 'worm', pos: new V3(start.x, gy(start.x, start.z) - 6, start.z), r: 2.1, hp: 1e9, id: 'vampaWorm' });
      pr.lockable = true;
      pr.rocky = false;
      pr.static = true;
      const head = new THREE.Group();
      pr.group.add(head);
      const sk = new THREE.Mesh(new THREE.SphereGeometry(2.1, 18, 12), T.mat(SKIN));
      sk.scale.set(1, 1, 1.25);
      T.addOutline(sk, 1.6);
      head.add(sk);
      const mouth = new THREE.Mesh(new THREE.CircleGeometry(1.3, 18), new THREE.MeshBasicMaterial({ color: MOUTH }));
      mouth.position.z = 2.62;
      head.add(mouth);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 5), T.mat(TOOTH));
        tooth.position.set(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 2.45);
        tooth.rotation.set(Math.PI / 2, 0, 0);
        tooth.lookAt(new V3(0, 0, 2.6));
        head.add(tooth);
      }
      // the body: rings following the head down into the ground
      const segs = [];
      const segGeo = new THREE.SphereGeometry(1, 14, 10);
      for (let i = 0; i < 12; i++) {
        const s = new THREE.Mesh(segGeo, T.mat(i % 3 === 1 ? BAND : SKIN));
        const r = 1.9 - i * 0.05;
        s.scale.setScalar(r);
        T.addOutline(s, 1.2);
        b.scene.add(s);
        segs.push(s);
      }
      let hole = start.clone(), aim = start.clone(), from = start.clone(), dir = new V3(0, 0, 1);
      const lerpArc = (k) => {
        // the head's place on the arc out of the hole: up, over and toward the aim
        const p = hole.clone().lerp(aim, k * 0.6);
        p.y = gy(p.x, p.z) + Math.sin(Math.min(1, k) * Math.PI * 0.85) * 9;
        return p;
      };
      let k = 0;
      const place = () => {
        pr.group.position.copy(pr.pos);
        // the rings: from the head back down the arc into the hole
        for (let i = 0; i < segs.length; i++) {
          const u = Math.max(0, k - (i + 1) * 0.07);
          const p = u > 0 ? lerpArc(u) : hole.clone().setY(gy(hole.x, hole.z) - 2);
          segs[i].position.copy(p);
          segs[i].visible = W.state !== 'under' && u > 0;
        }
        const look = pr.pos.clone().sub(segs[0].position);
        if (look.lengthSq() > 0.01) {
          head.rotation.order = 'YXZ';
          head.rotation.set(-Math.atan2(look.y, Math.hypot(look.x, look.z)), Math.atan2(look.x, look.z), 0);
        }
      };
      const offD = b.on('propDamaged', (e) => {
        if (e.prop !== pr || W.done) return;
        if (W.state === 'under') return;
        W.hp = Math.max(0, W.hp - e.amount);
        W.hits++;
        b.vfx.sparks(pr.pos, 0xe8d890, 6, 4, 0.06);
        if (W.state === 'sway' && e.amount > 700) W.t = Math.max(W.t, 120); // a heavy blow cuts the sway short: it dives
        if (W.hp <= 0) {
          W.done = true;
          W.state = 'down';
          b.emit('wormDown', { worm: W });
        }
      });
      const hunt = () => (opts.target ? opts.target() : b.player);
      const hook = () => {
        if (W.state === 'down' || W.state === 'stopped') return;
        if (b.inputLocked) return;
        const p = hunt();
        if (!p) return;
        W.t++;
        if (W.state === 'under') {
          pr.invulnerable = true;
          pr.lockable = false;
          // a furrow of grit racing toward the prey
          const to = p.pos.clone().setY(0);
          dir = to.sub(hole.clone().setY(0));
          const d = dir.length();
          if (d > 0.1) dir.normalize();
          hole.addScaledVector(dir, Math.min(d, 0.32));
          if (b.frame % 4 === 0) b.vfx.dust(new V3(hole.x, gy(hole.x, hole.z) + 0.2, hole.z), 1.2, 4, st.def.dust || 0x9a8a5a);
          pr.pos.set(hole.x, gy(hole.x, hole.z) - 6, hole.z);
          k = 0;
          if ((d < 7 && W.t > 90) || W.t > 300) {
            // it comes up a few strides off, never under his feet: the arc has to be seen
            const off = hole.clone().setY(0).sub(p.pos.clone().setY(0));
            if (off.length() < 6.5) {
              if (off.lengthSq() < 0.01) off.set(1, 0, 0);
              hole = p.pos.clone().setY(0).addScaledVector(off.normalize(), 6.5);
            }
            W.state = 'rise';
            W.t = 0;
            aim = p.pos.clone();
            from = hole.clone();
            b.emit('telegraph', { pos: new V3(aim.x, gy(aim.x, aim.z), aim.z), radius: 3.4, frames: 46 });
            // the player's lens and blows go to it (a lockable target, like any other)
            if (p.isPlayer && SL.Targeting && p.lockProp !== pr) SL.Targeting.lock(b, p, { prop: pr, kind: 'prop' }, true);
            b.vfx.ring(new V3(aim.x, gy(aim.x, aim.z) + 0.2, aim.z), 3.4, 0xff4a2a, 0.75, new V3(0, 1, 0));
            b.cameraTraumaAt(hole, 0.3);
            b.sfx('rumble', null, { at: hole, vol: 0.9 });
          }
        } else if (W.state === 'rise') {
          pr.invulnerable = false;
          pr.lockable = true;
          k = Math.min(1, W.t / 46);
          pr.pos.copy(lerpArc(k));
          if (W.t === 1) {
            b.vfx.dust(new V3(hole.x, gy(hole.x, hole.z) + 0.3, hole.z), 3, 16, st.def.dust || 0x9a8a5a);
            b.vfx.debrisBurst(new V3(hole.x, gy(hole.x, hole.z) + 0.5, hole.z), 10, st.def.terrain.dirt, 8, 0.25);
            b.sfx('roar', null, { at: hole, pitch: 0.4, vol: 1 });
          }
          if (W.t >= 46) {
            // the lunge: the head comes down on where the ring was
            W.state = 'lunge';
            W.t = 0;
            W.lunges++;
          }
        } else if (W.state === 'lunge') {
          const kk = Math.min(1, W.t / 12);
          const top = lerpArc(1), down = new V3(aim.x, gy(aim.x, aim.z) + 1.4, aim.z);
          pr.pos.copy(top.lerp(down, kk * kk));
          if (W.t === 12) {
            const hit = p.alive && p.pos.distanceTo(down) < 3.6 && !p.invuln && p.state !== 'dodge';
            if (hit) p.takeHit(null, { type: 'explosion', damage: opts.damage || 900, knock: 'heavy', knockSpeed: 20, hitstun: 26, impact: 3, dir: p.pos.clone().sub(down).setY(0.4).normalize(), point: down.clone(), name: 'Vampa beast' });
            st.crater(new V3(down.x, gy(down.x, down.z), down.z), 2.6, 0.6, null);
            b.cameraTraumaAt(down, 0.5);
            b.sfx('groundImpact', null, { at: down, vol: 1 });
            b.emit('wormLunge', { hit });
          }
          if (W.t >= 22) {
            W.state = 'sway';
            W.t = 0;
          }
        } else if (W.state === 'sway') {
          // up over the ground, swaying, open to blows
          const base = lerpArc(0.85);
          pr.pos.copy(base).add(new V3(Math.sin(W.t * 0.05) * 1.6, Math.sin(W.t * 0.08) * 0.5, Math.cos(W.t * 0.04) * 1.2));
          k = 0.85;
          if (W.t % 80 === 40) b.sfx('growl', null, { at: pr.pos, pitch: 0.45, vol: 0.8 });
          if (W.t > (opts.sway || 200)) {
            W.state = 'dive';
            W.t = 0;
          }
        } else if (W.state === 'dive') {
          k = Math.max(0, 0.85 - W.t / 30);
          pr.pos.copy(lerpArc(k));
          if (W.t >= 30) {
            W.state = 'under';
            W.t = 0;
            hole = new V3(pr.pos.x, 0, pr.pos.z);
            b.vfx.dust(new V3(hole.x, gy(hole.x, hole.z) + 0.3, hole.z), 2, 10, st.def.dust || 0x9a8a5a);
          }
        }
        place();
      };
      m.tickHooks.push(hook);
      place();
      W.head = pr;
      W.segs = segs;
      W.headGroup = head;
      // the story takes it from here: freeze it where it is (exposed, out of the ground)
      W.hold = () => {
        W.state = 'stopped';
        pr.invulnerable = true;
      };
      W.stop = () => {
        W.state = 'stopped';
        K.unhook(m, hook);
        offD();
      };
      W.dispose = () => {
        W.stop();
        for (const s of segs) b.scene.remove(s);
        segGeo.dispose();
        pr.group.visible = false;
        pr.alive = false;
      };
      m.onDispose(W.dispose);
      return W;
    },
    /** THE CREDITS: the film's last title cards, one after the other (gameplay time: they wait for nobody). */
    *credits(m, cards) {
      for (const c of cards) {
        m.title(c[0], c[1], c[2] || '', c[3] || 3);
        yield* m.cine((c[3] || 3) + 0.2);
      }
    },
  });

  /* ---------------- film poses ---------------- */
  const PO = SL.data.poses;
  // the coat coming off: shrugged back off the shoulders, arms swept back
  PO.v_coatOff = (t) => {
    const s = Math.min(1, t * 1.6);
    return {
      root: { y: 0 }, spine: [-4, 0, 0], chest: [-10 * s, 0, 0], head: [-4, 0, 0],
      shoulderL: [30 * s, 0, 30 + 20 * s], elbowL: [-30, 0, 0], shoulderR: [30 * s, 0, -30 - 20 * s], elbowR: [-30, 0, 0],
      thighL: [-2, 0, 8], kneeL: [3, 0, 0], thighR: [-2, 0, -8], kneeR: [3, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // a plain, steady walk (Paragus leading his son out across the snow)
  PO.bb_walk = (t) => {
    const ph = t * 5.5, s = Math.sin(ph);
    return {
      root: { y: Math.abs(Math.cos(ph)) * 0.02 - 0.01 }, spine: [2, s * 3, 0], chest: [0, s * 4, 0], head: [0, -s * 3, 0],
      shoulderL: [s * 22, 0, 8], elbowL: [-16, 0, 0], shoulderR: [-s * 22, 0, -8], elbowR: [-16, 0, 0],
      thighL: [-s * 26, 0, 4], kneeL: [8 + Math.max(0, s) * 30, 0, 0], thighR: [s * 26, 0, -4], kneeR: [8 + Math.max(0, -s) * 30, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // hands in his jacket pockets, rocking on his heels in the cold, interested
  PO.g_pockets = (t) => {
    const b = Math.sin(t * 2.4);
    return {
      root: { y: b * 0.006 }, spine: [2, 0, 0], chest: [2, 0, 0], head: [-4, 0, b * 3],
      shoulderL: [6, 0, 18], elbowL: [-34, 0, 0], shoulderR: [6, 0, -18], elbowR: [-34, 0, 0],
      thighL: [-2, 0, 10], kneeL: [4, 0, 0], thighR: [-2, 0, -10], kneeR: [4, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // braced against a shockwave: low, forearms crossed before the face, the heels dug in
  PO.v_braced = (t) => {
    const s = Math.sin(t * 40) * 1.5;
    return {
      root: { y: -0.2, rx: 14 }, spine: [12, 0, s * 0.4], chest: [10, 0, 0], head: [8, 0, 0],
      shoulderL: [-84, -28, 40], elbowL: [-104, 0, 0], shoulderR: [-84, 28, -40], elbowR: [-104, 0, 0],
      thighL: [-44, 0, 22], kneeL: [62, 0, 0], thighR: [16, 0, -22], kneeR: [30, 0, 0], footR: [-20, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  /* ----- Goku's warm-up (part 4): the bounce, the loosening, the stance, the launch ----- */
  // light on his toes, hopping side to side like a boxer coming into the ring, hands loose
  PO.g_bounce = (t) => {
    const ph = t * 7.5, h = Math.abs(Math.sin(ph)), s = Math.sin(ph * 0.5);
    return {
      root: { y: -0.03 + h * 0.07, rz: s * 3 }, hips: [0, s * 6, 0], spine: [4, 0, 0], chest: [2, -s * 4, 0], head: [-2, s * 4, 0],
      shoulderL: [-26, 0, 16], elbowL: [-64, 0, 0], shoulderR: [-26, 0, -16], elbowR: [-64, 0, 0],
      thighL: [-10 - h * 6, 0, 9 + s * 4], kneeL: [16 + h * 12, 0, 0], footL: [-16, 0, 0], thighR: [-10 - (1 - h) * 6, 0, -9 + s * 4], kneeR: [16 + (1 - h) * 12, 0, 0], footR: [-16, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // still bouncing: the shoulders rolling, the wrists shaken out, the neck rolled round
  PO.g_loosen = (t) => {
    const ph = t * 7.5, h = Math.abs(Math.sin(ph)), r = t * 3.2, w = Math.sin(t * 26) * 14;
    return {
      root: { y: -0.03 + h * 0.06 }, spine: [2, 0, 0], chest: [Math.sin(r) * 6, Math.cos(r) * 5, 0], neck: [Math.sin(r * 1.3) * 10, 0, Math.cos(r * 1.3) * 10], head: [Math.sin(r * 1.3) * 12, 0, Math.cos(r * 1.3) * 14],
      shoulderL: [-40 + Math.sin(r) * 20, Math.cos(r) * 10, 30], elbowL: [-50 + w * 0.5, 0, 0], handL: [w, 0, 0], shoulderR: [-40 - Math.sin(r) * 20, -Math.cos(r) * 10, -30], elbowR: [-50 - w * 0.5, 0, 0], handR: [-w, 0, 0],
      thighL: [-10 - h * 6, 0, 9], kneeL: [16 + h * 12, 0, 0], footL: [-16, 0, 0], thighR: [-10 - (1 - h) * 6, 0, -9], kneeR: [16 + (1 - h) * 12, 0, 0], footR: [-16, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // the Turtle School stance: side-on, knees deep, the left arm out with the fingers loosely curled, the right
  // fist pulled back to the hip
  PO.g_turtleStance = (t) => {
    const b = Math.sin(t * 2.4);
    return {
      root: { y: -0.16 + b * 0.005, rx: 6 }, hips: [0, -36, 0], spine: [6, 10, 0], chest: [4, 16, 0], head: [-4, -26, 0],
      shoulderL: [-84, -8, 14], elbowL: [-22, 0, 0], handL: [-10, 0, 0], shoulderR: [18, 0, -22], elbowR: [-104, 0, 0],
      thighL: [-40, 24, 22], kneeL: [52, 0, 0], footL: [-14, 0, 0], thighR: [24, -22, -18], kneeR: [46, 0, 0], footR: [-22, 0, 0],
      hands: ['open', 'fist'],
    };
  };
  // the boot dug in, the weight driven down onto the back foot, leaning into the launch
  PO.g_bootDig = { root: { y: -0.36, rx: 28 }, hips: [0, -10, 0], spine: [24, 0, 0], chest: [16, 0, 0], head: [-34, 0, 0], shoulderL: [30, 0, 30], elbowL: [-50, 0, 0], shoulderR: [30, 0, -30], elbowR: [-50, 0, 0], thighL: [-70, 0, 12], kneeL: [100, 0, 0], footL: [-20, 0, 0], thighR: [20, 0, -12], kneeR: [70, 0, 0], footR: [40, 0, 0], hands: ['fist', 'fist'] };
  // the sprint, low over the ice: the body nearly flat, the arms swept back
  PO.g_sprintLow = (t) => {
    const s = Math.sin(t * 16);
    return {
      root: { y: -0.12, rx: 42 }, spine: [16, s * 4, 0], chest: [8, 0, 0], head: [-46, 0, 0],
      shoulderL: [50, 0, 20], elbowL: [-30, 0, 0], shoulderR: [50, 0, -20], elbowR: [-30, 0, 0],
      thighL: [-50 + s * 40, 0, 6], kneeL: [40 + Math.max(0, s) * 50, 0, 0], thighR: [-50 - s * 40, 0, -6], kneeR: [40 + Math.max(0, -s) * 50, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  /* ----- Goku against the Wrathful Broly (part 4): palms, low kicks, feints ----- */
  PO.g_palmW = { root: { y: -0.06, rx: 2 }, hips: [0, -20, 0], spine: [2, -16, 0], chest: [2, -22, 0], head: [-4, 18, 0], shoulderL: [-60, 0, 16], elbowL: [-70, 0, 0], shoulderR: [14, 0, -30], elbowR: [-112, 0, 0], handR: [-40, 0, 0], thighL: [-20, 10, 10], kneeL: [24, 0, 0], thighR: [12, -10, -10], kneeR: [18, 0, 0], hands: ['fist', 'open'] };
  PO.g_palm = { root: { y: -0.08, rx: 6 }, hips: [0, 22, 0], spine: [6, 18, 0], chest: [6, 24, 0], head: [-6, -22, 0], shoulderL: [-30, 0, 26], elbowL: [-90, 0, 0], shoulderR: [-88, 10, -6], elbowR: [-6, 0, 0], handR: [-64, 0, 0], thighL: [-30, 10, 12], kneeL: [32, 0, 0], thighR: [16, -10, -12], kneeR: [12, 0, 0], hands: ['fist', 'open'] };
  PO.g_palmBoth = { root: { y: -0.1, rx: 8 }, spine: [8, 0, 0], chest: [8, 0, 0], head: [-8, 0, 0], shoulderL: [-86, -14, 8], elbowL: [-8, 0, 0], handL: [-64, 0, 0], shoulderR: [-86, 14, -8], elbowR: [-8, 0, 0], handR: [-64, 0, 0], thighL: [-34, 6, 14], kneeL: [40, 0, 0], thighR: [16, -6, -14], kneeR: [16, 0, 0], hands: ['open', 'open'] };
  PO.g_lowKickW = { root: { y: -0.08, rx: -4 }, hips: [0, -26, 0], spine: [-2, -14, 0], chest: [-2, -18, 0], head: [-6, 22, 0], shoulderL: [-50, 0, 30], elbowL: [-80, 0, 0], shoulderR: [-30, 0, -30], elbowR: [-90, 0, 0], thighL: [-6, 8, 10], kneeL: [22, 0, 0], thighR: [-20, -10, -30], kneeR: [60, 0, 0], hands: ['fist', 'fist'] };
  PO.g_lowKick = { root: { y: -0.16, rx: -8 }, hips: [0, 30, 0], spine: [-6, 20, 0], chest: [-6, 24, 0], head: [-2, -28, 0], shoulderL: [-40, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -50], elbowR: [-60, 0, 0], thighL: [-14, 10, 14], kneeL: [40, 0, 0], thighR: [-36, -20, -38], kneeR: [6, 0, 0], footR: [20, 0, 0], hands: ['fist', 'fist'] };
  PO.g_feintW = { root: { y: -0.05 }, hips: [0, 14, 0], spine: [2, 12, 0], chest: [2, 18, 0], head: [-4, -14, 0], shoulderL: [-74, 0, 10], elbowL: [-40, 0, 0], shoulderR: [-26, 0, -26], elbowR: [-110, 0, 0], thighL: [-16, 8, 10], kneeL: [22, 0, 0], thighR: [10, -8, -10], kneeR: [16, 0, 0], hands: ['open', 'fist'] };

  /* ----- the Blue (part 5): down in the snow, up again ----- */
  // on his hands and knees in the snow, the arms trembling, the head down, breathing hard
  PO.g_kneesSnow = (t) => {
    const s = Math.sin(t * 30) * 1.4, br = Math.sin(t * 5) * 3;
    return {
      root: { y: -0.58, rx: 64 }, spine: [10 + br, 0, 0], chest: [6, 0, 0], neck: [10, 0, 0], head: [-4, 0, 0],
      shoulderL: [-70 + s, 0, 10], elbowL: [-10, 0, 0], handL: [-60, 0, 0], shoulderR: [-70 - s, 0, -10], elbowR: [-10, 0, 0], handR: [-60, 0, 0],
      thighL: [-24, 0, 10], kneeL: [100, 0, 0], footL: [30, 0, 0], thighR: [-24, 0, -10], kneeR: [100, 0, 0], footR: [30, 0, 0],
      hands: ['open', 'open'],
    };
  };
  // getting up: one knee, a fist pushing off it, the head coming up
  PO.g_riseSlow = (t) => {
    const s = Math.sin(t * 24) * 1.2, br = Math.sin(t * 5) * 2;
    return {
      root: { y: -0.4, rx: 14 }, spine: [12 + br, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0],
      shoulderL: [-40 + s, 0, 12], elbowL: [-60, 0, 0], shoulderR: [-20, 0, -16], elbowR: [-30, 0, 0],
      thighL: [-80, 0, 8], kneeL: [92, 0, 0], thighR: [16, 0, -8], kneeR: [110, 0, 0], footR: [40, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  /* ----- the epilogue (part 9) ----- */
  PO.g_handsHips = (t) => {
    const b = Math.sin(t * 1.6);
    return {
      root: { y: b * 0.004 }, spine: [-2, 0, 0], chest: [-4, 0, 0], head: [-4, 0, b * 2],
      shoulderL: [-6, 18, 36], elbowL: [-94, 0, 0], shoulderR: [-6, -18, -36], elbowR: [-94, 0, 0],
      thighL: [-2, 0, 10], kneeL: [3, 0, 0], thighR: [-2, 0, -10], kneeR: [3, 0, 0],
      hands: ['fist', 'fist'],
    };
  };
  // rubbing the back of his neck, sheepish
  PO.g_neckRub = (t) => {
    const s = Math.sin(t * 9) * 6;
    return {
      root: { y: 0 }, spine: [2, 0, 0], chest: [0, 6, 0], head: [6, 0, -6],
      shoulderR: [-150, -30, -30], elbowR: [-120 + s, 0, 0], shoulderL: [-6, 0, 10], elbowL: [-14, 0, 0],
      thighL: [-2, 0, 8], kneeL: [3, 0, 0], thighR: [-2, 0, -8], kneeR: [3, 0, 0],
      hands: ['fist', 'open'],
    };
  };
  // a thumb to his own chest, turned half back over the shoulder, the grin
  PO.g_thumbChest = { root: { y: 0 }, hips: [0, 30, 0], spine: [0, 16, 0], chest: [-2, 20, 0], head: [-4, -30, 0], shoulderR: [-40, -50, -10], elbowR: [-120, 0, 0], shoulderL: [-6, 0, 12], elbowL: [-20, 0, 0], thighL: [-4, 6, 8], kneeL: [4, 0, 0], thighR: [4, -6, -8], kneeR: [4, 0, 0], hands: ['fist', 'thumb'] };
  /* ----- Vegeta, God (part 3): the sway, the catch ----- */
  PO.v_swayL = { root: { y: -0.04, rz: 10 }, hips: [0, 8, 0], spine: [0, 6, 10], chest: [0, 8, 12], head: [0, 0, 14], shoulderL: [-14, 0, 22], elbowL: [-40, 0, 0], shoulderR: [-14, 0, -22], elbowR: [-40, 0, 0], thighL: [-6, 0, 14], kneeL: [10, 0, 0], thighR: [4, 0, -6], kneeR: [6, 0, 0], hands: ['fist', 'fist'] };
  PO.v_swayR = SL.Anim && SL.Anim.mirror ? SL.Anim.mirror(PO.v_swayL) : PO.v_swayL;
  // a fist caught in the open left hand, held there, the body already turning round it
  PO.v_catch = { root: { y: -0.04 }, hips: [0, 20, 0], spine: [2, 16, 0], chest: [2, 20, 0], head: [-4, -10, 0], shoulderL: [-90, -6, 10], elbowL: [-14, 0, 0], handL: [-50, 0, 0], shoulderR: [10, 0, -24], elbowR: [-100, 0, 0], thighL: [-14, 8, 12], kneeL: [16, 0, 0], thighR: [10, -8, -12], kneeR: [12, 0, 0], hands: ['open', 'fist'] };
  // Paragus, dead: slumped back over a rock, the arms fallen open (no wound shown)
  PO.pg_slump = { root: { y: -0.62, rx: -48 }, spine: [-14, 0, 0], chest: [-10, 0, 0], head: [-30, 12, 0], shoulderL: [10, 0, 50], elbowL: [-14, 0, 0], shoulderR: [16, 0, -56], elbowR: [-10, 0, 0], thighL: [-70, 0, 14], kneeL: [70, 0, 0], thighR: [-60, 0, -10], kneeR: [60, 0, 0], hands: ['open', 'open'] };
  // Frieza's act: both hands thrown up in theatrical horror
  PO.fz_horror = { root: { y: 0, rx: -6 }, spine: [-6, 0, 0], chest: [-10, 0, 0], head: [-8, 0, 0], shoulderL: [-150, 0, 30], elbowL: [-30, 0, 0], shoulderR: [-150, 0, -30], elbowR: [-30, 0, 0], thighL: [6, 0, 10], kneeL: [10, 0, 0], thighR: [-10, 0, -10], kneeR: [14, 0, 0], hands: ['open', 'open'] };
  // Frieza alone with the monster: a hand up in front of him, trembling
  PO.fz_tremble = (t) => {
    const s = Math.sin(t * 40) * 3;
    return { root: { y: -0.03, rx: -8 }, spine: [-6, 0, 0], chest: [-8, 0, s * 0.3], head: [8, 0, 0], shoulderR: [-70 + s, 0, -8], elbowR: [-50, 0, 0], handR: [-40 + s * 2, 0, 0], shoulderL: [-20, 0, 26], elbowL: [-60, 0, 0], thighL: [8, 0, 10], kneeL: [14, 0, 0], thighR: [-12, 0, -10], kneeR: [16, 0, 0], hands: ['fist', 'open'] };
  };
  // Cheelai, the wish: both arms flung up to the dragon
  PO.ch_wish = { root: { y: 0.02, rx: -10 }, spine: [-10, 0, 0], chest: [-12, 0, 0], head: [-26, 0, 0], shoulderL: [-160, 0, 26], elbowL: [-10, 0, 0], shoulderR: [-160, 0, -26], elbowR: [-10, 0, 0], thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0], hands: ['open', 'open'] };
  /* ----- Gogeta (part 8) ----- */
  // arms folded, leaning back a hand's width from a fist that grazes past: "futile"
  PO.gg_leanBack = { root: { y: -0.02, rx: -14 }, spine: [-10, 0, 0], chest: [-8, 0, 0], head: [6, 0, 0], shoulderL: [-20, -66, 10], elbowL: [-98, 0, 0], shoulderR: [-24, 66, -10], elbowR: [-92, 0, 0], thighL: [6, 4, 9], kneeL: [10, 0, 0], thighR: [-10, -5, -10], kneeR: [14, 0, 0], hands: ['fist', 'fist'] };
  // the weave: the torso turned and dropped, a blast going past under the arm
  PO.gg_weaveL = { root: { y: -0.08, rz: 8 }, hips: [0, 24, 0], spine: [6, 22, 8], chest: [4, 26, 10], head: [-4, -26, 6], shoulderL: [-24, 0, 50], elbowL: [-60, 0, 0], shoulderR: [-30, 0, -20], elbowR: [-80, 0, 0], thighL: [-16, 8, 12], kneeL: [22, 0, 0], thighR: [10, -8, -12], kneeR: [14, 0, 0], hands: ['fist', 'fist'] };
  PO.gg_weaveR = SL.Anim && SL.Anim.mirror ? SL.Anim.mirror(PO.gg_weaveL) : PO.gg_weaveL;
  // the punisher stance: knees deep, both fists drawn back, a sphere of light in each palm
  PO.gg_punishStance = (t) => {
    const s = Math.sin(t * 20) * 1.2;
    return { root: { y: -0.22, rx: 10 }, spine: [10, 0, 0], chest: [6, 0, s * 0.3], head: [-12, 0, 0], shoulderL: [30, 0, 40], elbowL: [-80, 0, 0], handL: [-50, 0, 0], shoulderR: [30, 0, -40], elbowR: [-80, 0, 0], handR: [-50, 0, 0], thighL: [-50, 16, 24], kneeL: [70, 0, 0], thighR: [10, -16, -24], kneeR: [40, 0, 0], hands: ['open', 'open'] };
  };
  // the low dash: arms crossed at the waist, trailing light, nearly flat over the ground
  PO.gg_lowDash = { root: { y: -0.1, rx: 46 }, spine: [16, 0, 0], chest: [8, 0, 0], head: [-50, 0, 0], shoulderL: [20, -40, 10], elbowL: [-40, 0, 0], shoulderR: [20, 40, -10], elbowR: [-40, 0, 0], thighL: [-30, 0, 6], kneeL: [60, 0, 0], thighR: [20, 0, -6], kneeR: [40, 0, 0], hands: ['open', 'open'] };
  // the X: both wrists crossed over the chest, a sphere in each palm against the vest
  PO.gg_xArms = (t) => {
    const s = Math.sin(t * 24) * 1;
    return { root: { y: -0.02, rx: 6 }, spine: [6, 0, 0], chest: [8, 0, 0], head: [-10, 0, 0], shoulderL: [-70, -50, 6 + s], elbowL: [-100, 0, 0], handL: [-30, 0, 0], shoulderR: [-70, 50, -6 - s], elbowR: [-100, 0, 0], handR: [-30, 0, 0], thighL: [-30, 0, 10], kneeL: [50, 0, 0], thighR: [-10, 0, -10], kneeR: [30, 0, 0], hands: ['open', 'open'] };
  };
  // the X flung open: both arms thrown out, palms first
  PO.gg_xOpen = { root: { y: 0, rx: 10 }, spine: [8, 0, 0], chest: [10, 0, 0], head: [-14, 0, 0], shoulderL: [-90, 0, 40], elbowL: [-6, 0, 0], handL: [-60, 0, 0], shoulderR: [-90, 0, -40], elbowR: [-6, 0, 0], handR: [-60, 0, 0], thighL: [-30, 0, 10], kneeL: [50, 0, 0], thighR: [-10, 0, -10], kneeR: [30, 0, 0], hands: ['open', 'open'] };
  // the Kamehameha, both hands cupped at the right hip — and thrust out
  PO.kame_hip = (t) => {
    const s = Math.sin(t * 30) * 1;
    return { root: { y: -0.1, rx: 4 }, hips: [0, 30, 0], spine: [4, 26, 0], chest: [2, 34, s * 0.3], head: [-8, -46, 0], shoulderL: [-30, 30, 30], elbowL: [-100, 0, 0], handL: [-60, 0, 0], shoulderR: [10, 0, -30], elbowR: [-90, 0, 0], handR: [-60, 0, 0], thighL: [-40, 14, 22], kneeL: [56, 0, 0], thighR: [20, -14, -20], kneeR: [30, 0, 0], hands: ['open', 'open'] };
  };
  PO.kame_fire = { root: { y: -0.08, rx: 8 }, hips: [0, -10, 0], spine: [8, -6, 0], chest: [8, -6, 0], head: [-6, 4, 0], shoulderL: [-90, -18, 4], elbowL: [-6, 0, 0], handL: [-70, 0, 0], shoulderR: [-90, 18, -4], elbowR: [-6, 0, 0], handR: [-70, 0, 0], thighL: [-40, 10, 22], kneeL: [52, 0, 0], thighR: [24, -10, -20], kneeR: [24, 0, 0], hands: ['open', 'open'] };

  // Frieza watching from the edge of it all: one hand on the hip, the other turned up before his chest, amused
  PO.fz_watch = (t) => {
    const b = Math.sin(t * 1.4);
    return {
      root: { y: b * 0.004 }, hips: [0, -6, 4], spine: [-2, 4, 0], chest: [-4, 4, 0], head: [-2, -6, 4],
      shoulderL: [-14, 0, 48], elbowL: [-96, 0, 0], shoulderR: [-34, 0, -22], elbowR: [-62, 0, 0], handR: [-40, 0, 0],
      thighL: [-2, 4, 8], kneeL: [4, 0, 0], thighR: [4, -6, -10], kneeR: [10, 0, 0],
      hands: ['fist', 'open'],
    };
  };
})();
