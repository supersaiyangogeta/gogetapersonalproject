/*
 * THE STRANGER'S KIT — shared staging for Chapter 5's opening (owner's Future Trunks rebuild,
 * 2026-09-24): Frieza's army on Earth, Future Trunks, Mecha Frieza, King Cold, Goku's return and
 * the warning. The two missions (`android_trunks`, `android_warning`) and their scenes use it.
 *
 *   staging     ground / place / faceTo / scripted / takeControl / goFight / pose / toForm
 *   props       the landed ship, the Time Machine, a Saiyan pod (stage props, see Stage.addProp)
 *   the sword   sheathe / draw (Model.setSheathed), handing it over (Model.addProp)
 *   the army    soldiers that fear him, and a FINISHER for every one he kills: a hit-stop, a tiny
 *               slow-down, a slash across the body, the body held on the blow — then it falls apart
 *               (or is vaporised by ki). The finisher is picked by the blow: cut, dash-through,
 *               aerial, ki, a sweep that takes several at once, a counter; the last one is longest.
 *   Frieza      the demonstration: moods (denial → confused → angry → desperate → terrified)
 *               driven by how often his attacks come to nothing, each with its own brain and line
 *   transform   Trunks' own Super Saiyan cinematic (stance → hand flurry → pull → roar → final),
 *               with Frieza's face cut into it
 *   effects     cutInTwo (a body split by one vertical cut: two clipped copies), dice (the pieces
 *               hanging in the air), a Supernova held in two hands, the sand map
 *
 * Presentation never touches Math.random: anything that varies uses U.mulberry32 on a seed, so a
 * seeded fight plays the same with or without the show (see tests/headless.js).
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const UP = new V3(0, 1, 0);

  const K = (SL.data.trunksKit = {});

  /* ================================================================ staging */

  K.ground = (b, v, lift = 0) => {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z) + lift;
    return p;
  };
  K.place = (f, pos, yaw) => SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air above it
  K.float = (f, pos, yaw) => {
    K.place(f, pos, yaw);
    f.grounded = false;
  };
  K.faceTo = (f, pos) => {
    const p = pos.isVector3 ? pos : pos.pos;
    f.yaw = f.prevYaw = Math.atan2(p.x - f.pos.x, p.z - f.pos.z);
  };
  K.scripted = () => ({ update: () => SL.emptyIntent() });
  K.clearCombat = (b) => {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  };
  K.clearArea = (b, center, r) => {
    if (b.stage.clearBoulders) b.stage.clearBoulders(center, r);
    for (const o of b.stage.obstacles) {
      if (!o.alive) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
  };
  K.removeHook = (m, hook) => {
    const i = m.tickHooks.indexOf(hook);
    if (i >= 0) m.tickHooks.splice(i, 1);
  };
  K.pose = (f, pose, face, speed) => {
    if (!f) return;
    f.setState('scripted', { pose, expression: face, speed });
    if (face && f.model && f.model.setExpression) f.model.setExpression(face);
  };
  K.formIndex = (f, id) => f.def.forms.findIndex((x) => x.id === id);
  K.toForm = (f, id) => {
    const i = K.formIndex(f, id);
    if (i >= 0 && f.formIndex !== i) f.applyForm(i);
  };
  K.takeControl = (b, f) => {
    f.setHidden(false);
    f.untargetable = false;
    b.switchPlayer(f, { force: true });
    f.setState('free');
  };
  K.goFight = (m, music) => {
    const b = m.battle;
    m.lock(false);
    b.aiLocked = false;
    if (music) m.music(music[0], music[1]);
  };
  /** Everything a phase may have left on a fighter, back to plain. */
  K.plain = (f) => {
    f.damageDealtMul = 1;
    f.damageTakenMul = 1;
    f.storyArmor = 0;
    f.storyEvade = null;
    f.storyBlock = null;
    f.swordWard = null;
    f.moveScale = 1;
    f.specOverrides = null;
  };
  /** A watcher: out of every fight, standing where the story put them. */
  K.watch = (f, pos, pose, face, lookAt) => {
    if (!f) return;
    f.controller = K.scripted();
    f.untargetable = true;
    f.cannotDie = true;
    K.place(f, pos);
    if (lookAt) K.faceTo(f, lookAt);
    K.pose(f, pose || 'idle', face || 'neutral');
  };

  /** A camera shot built from two points (story kind: it always plays). */
  K.camAt = (out, pos, look, fov) => {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  };

  /* ================================================================ Chapter 5's ground */

  // "The Stranger": the ship lands north of the field, the Time Machine south of it, the ridge west
  // (plain constructors: the data-integrity check loads this file with a THREE that has no methods)
  const fieldAt = (dx, dz) => new V3(dx, 0, -10 + dz);
  const FIELD = fieldAt(0, 0);
  const FRIEZA_AT = fieldAt(0, -10);
  const ARMY = 20;
  SL.data.trunksArrival = {
    FIELD,
    SHIP_AT: fieldAt(0, -40),
    FRIEZA_AT,
    COLD_AT: fieldAt(-5, -13),
    MACHINE_AT: fieldAt(9, 26),
    TRUNKS_AT: fieldAt(0, 8),
    RIDGE: fieldAt(-48, 26),
    ARMY,
    BLITZ: 4, // the first ones he cuts down before the player has control
    /** Where the army stands after it deploys: two ranks in front of Frieza, facing south. */
    rankSpot(i) {
      const row = i < 12 ? 0 : 1;
      const n = row === 0 ? 12 : ARMY - 12;
      const k = row === 0 ? i : i - 12;
      const a = -1.05 + (2.1 * (k + 0.5)) / n;
      const r = row === 0 ? 8 : 13;
      return FRIEZA_AT.clone().add(new V3(Math.sin(a) * r, 0, Math.cos(a) * r));
    },
    /** Round him, facing in (the massacre's opening ring). */
    ringSpot(centre, i, n, r) {
      const a = (i / n) * Math.PI * 2 + 0.25;
      return centre.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r));
    },
  };

  /* ================================================================ props */

  /** The Cold family's ship, landed (Stage prop 'friezaShip'); `lift` raises it off its legs for a descent. */
  K.ship = (b, pos) => {
    const pr = b.stage.addProp({ kind: 'friezaShip', pos: pos.clone(), r: 17, id: 'coldShip' });
    return pr;
  };
  K.timeMachine = (b, pos) => {
    const pr = b.stage.addProp({ kind: 'timeMachine', pos: pos.clone(), r: 1.35, id: 'timeMachine' });
    // only ever scripted: he stands and sits inside it, and close shots frame him in the cockpit
    pr.passable = true;
    return pr;
  };
  K.pod = (b, pos) => {
    const pr = b.stage.addProp({ kind: 'pod', pos: pos.clone(), r: 1.25, id: 'gokuPod' });
    pr.static = true;
    pr.lockable = false;
    pr.invulnerable = true;
    return pr;
  };
  K.propGone = (b, pr) => {
    if (!pr) return;
    pr.alive = false;
    if (pr.group) pr.group.visible = false;
  };
  /**
   * The tear in the sky Goku Black comes through (Chapter 19): a dark disc ringed by two turning bands of purple light,
   * facing `face`. Returns { set(k) (0 shut .. 1 open), dispose() }; disposed with the mission.
   */
  K.portal = (m, at, face) => {
    const b = m.battle;
    const add = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), new THREE.MeshBasicMaterial({ color: 0x14061e, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.22, 8, 48), add(0x8a3adf, 0.9));
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 8, 40), add(0xc89aff, 0.7));
    g.add(disc, ringA, ringB);
    g.position.copy(at);
    g.lookAt(face);
    g.scale.setScalar(0.01);
    b.scene.add(g);
    const spin = () => {
      ringA.rotation.z += 0.05;
      ringB.rotation.z -= 0.08;
      ringB.scale.setScalar(1 + Math.sin(b.frame * 0.3) * 0.06);
    };
    m.tickHooks.push(spin);
    const out = {
      set(v) {
        g.scale.setScalar(Math.max(0.01, U.clamp01(v)));
      },
      dispose() {
        const i = m.tickHooks.indexOf(spin);
        if (i >= 0) m.tickHooks.splice(i, 1);
        if (!g.parent) return;
        b.scene.remove(g);
        for (const o of [disc, ringA, ringB]) {
          o.geometry.dispose();
          o.material.dispose();
        }
      },
    };
    m.onDispose(out.dispose);
    return out;
  };

  /* ================================================================ the sword */

  K.sheathe = (f, on) => {
    if (!f || !f.model) return;
    f.sheathed = !!on;
    if (f.model.setSheathed) f.model.setSheathed(!!on);
  };
  /** The sword leaves his hand for somebody else's (King Cold asks to see it). */
  /** Where his blade is in the world: [the hilt end, the tip] of the sword prop (null if none). */
  K.bladeSegment = (t) => {
    const g = t.model.props && t.model.props.sword;
    if (!g) return null;
    t.object.updateMatrixWorld(true);
    const top = (g.userData.tip || 0.9) - 0.06;
    return [g.localToWorld(new V3(0, 0.096, 0)), g.localToWorld(new V3(0, top, 0))];
  };
  K.handSword = (from, to) => {
    const spec = (from.def.appearance.props || []).find((p) => p.id === 'sword');
    if (!spec || !to || !to.model || !to.model.addProp) return;
    if (from.model.setPropVisible) from.model.setPropVisible('sword', false);
    const s = to.scale || 1;
    to.model.addProp(Object.assign({}, spec, { id: 'borrowedSword', joint: 'handR', length: (spec.length || 0.9) / Math.max(0.6, s) * 0.95 }));
  };
  K.swordBack = (from, to) => {
    if (to && to.model && to.model.removeProp) to.model.removeProp('borrowedSword');
    if (from && from.model && from.model.setPropVisible) from.model.setPropVisible('sword', !from.sheathed);
  };

  /* ================================================================ the army */

  /*
   * FINISHERS, by the blow that did it. freeze: frames the body is held on the blow (the delayed
   * impact); stop: hit-stop frames on Trunks; slow: [time scale, real seconds]; vaporize: ki takes
   * the body instead of cutting it. `last` is the final soldier's.
   */
  const FINISH = {
    cut: { freeze: 14, stop: 5, slow: [0.35, 0.16], trauma: 0.3, tilt: 0.35 },
    dash: { freeze: 26, stop: 3, slow: [0.4, 0.22], trauma: 0.45, tilt: 0 },
    aerial: { freeze: 22, stop: 6, slow: [0.3, 0.22], trauma: 0.4, tilt: 1.2 },
    blast: { freeze: 6, stop: 4, slow: [0.35, 0.2], trauma: 0.5, vaporize: true },
    sweep: { freeze: 24, stop: 8, slow: [0.25, 0.3], trauma: 0.55, tilt: 0.1 },
    counter: { freeze: 8, stop: 4, slow: [0.35, 0.16], trauma: 0.35, vaporize: true },
    last: { freeze: 40, stop: 10, slow: [0.2, 0.7], trauma: 0.6, tilt: 0.6 },
  };
  K.FINISH = FINISH;

  /** Which finisher a killing blow earns. */
  K.finishKind = (b, t, j, hit) => {
    hit = hit || {};
    if (hit.deflected || (t.sd && t.sd.counter && t.state === 'attack')) return 'counter';
    if (hit.type === 'ki' || hit.type === 'beam' || hit.type === 'explosion') return 'blast';
    if (t.state === 'rush' || (t.state === 'attack' && t.sd && t.sd.kind === 'dash')) return 'dash';
    if (j.pos.y - b.stage.heightAt(j.pos.x, j.pos.z) > 1.2) return 'aerial';
    return 'cut';
  };

  /** A soldier who has just seen one of his own cut down backs off for a moment (behaviour only). */
  K.fearful = (b, inner) => ({
    update: (f) => {
      if (b.frame < (f._shakenUntil || 0) && f.alive) {
        const it = SL.emptyIntent();
        const t = f.target;
        if (t) {
          it.my = -0.7;
          it.camYaw = Math.atan2(t.pos.x - f.pos.x, t.pos.z - f.pos.z);
        }
        return it;
      }
      return inner.update(f);
    },
  });

  /** The army's bookkeeping for a stretch: pending bodies, finishers, fear. */
  K.army = (m, t, soldiers) => {
    const b = m.battle;
    const st = { t, soldiers, kills: 0, finishers: [], pending: [], splitting: [], lastKo: -99, frieza: null, bodies: [] };
    b.story.army = st;
    return st;
  };

  /** One of them is dead: pick the finisher, hold the body on the blow, slow the world a touch. */
  K.finisher = (m, st, j, hit) => {
    const b = m.battle, t = st.t;
    st.kills++;
    const left = st.soldiers.filter((s) => s.alive).length;
    let kind = K.finishKind(b, t, j, hit);
    // two or more in the same swing: a sweep, and they go together
    const now = b.frame;
    const sweep = kind !== 'blast' && kind !== 'counter' && now - st.lastKo <= 6;
    st.lastKo = now;
    if (left === 0) kind = 'last';
    else if (sweep) kind = 'sweep';
    const F = FINISH[kind];
    // the line the blade travelled: away from him, through the body
    const dir = j.pos.clone().sub(t.pos).setY(0);
    if (dir.lengthSq() < 0.01) dir.set(Math.sin(t.yaw), 0, Math.cos(t.yaw));
    dir.normalize();
    const entry = { j, kind, at: now + F.freeze, dir, tilt: F.tilt || 0, vaporize: !!F.vaporize, frame: now, hold: j.pos.clone() };
    if (sweep) {
      // the ones already waiting from this swing are held to the same beat
      for (const p of st.pending) if (now - p.frame <= 8 && !p.vaporize) {
        p.kind = 'sweep';
        p.at = Math.max(p.at, entry.at);
      }
      for (const f of st.finishers) if (now - f.frame <= 8 && f.kind !== 'blast' && f.kind !== 'counter') f.kind = 'sweep';
    }
    st.pending.push(entry);
    j.vel.set(0, 0, 0);
    j.keepBody = true;
    j.freeze = Math.max(j.freeze || 0, F.freeze);
    t.freeze = Math.max(t.freeze || 0, F.stop);
    b.slowmo(F.slow[0], F.slow[1]);
    b.camera.addTrauma(F.trauma);
    // the cut is a line of light across the body, the blow a small flash (nothing that whites out)
    const c = j.chest();
    if (!entry.vaporize) {
      const side = new V3(-dir.z, 0, dir.x);
      const a = c.clone().addScaledVector(side, 1.05).add(new V3(0, 0.3 + entry.tilt * 0.35, 0));
      const z = c.clone().addScaledVector(side, -1.05).add(new V3(0, -0.25 - entry.tilt * 0.35, 0));
      if (b.vfx.slash) {
        b.vfx.slash(a, z, 0xf4fbff, kind === 'last' ? 0.9 : 0.5, 0.12);
        // a sweep and the last one are cut twice, across
        if (kind === 'sweep' || kind === 'last') b.vfx.slash(a.clone().setY(z.y), z.clone().setY(a.y), 0xeaf4ff, kind === 'last' ? 0.9 : 0.5, 0.1);
      }
      // a short push of the lens toward the cut (a dash-through pulls it the other way)
      b.camera.fovKick = kind === 'dash' ? 6 : kind === 'last' ? -9 : -4;
      b.vfx.sparks(c, 0xe8f6ff, 10, 9, 0.08);
      b.sfx('swordSlash', j, { vol: kind === 'last' || kind === 'sweep' ? 1.3 : 1, pitch: kind === 'last' ? 0.7 : 1 });
    } else {
      b.vfx.flash(c, 1.2, 0xfff0c0, 0.12, SL.Toon.tex.glow);
      b.sfx('kiBlast', j, { vol: 1.1 });
    }
    // the rest lose their nerve for a moment, each on his own beat
    st.soldiers.forEach((o, i) => {
      if (!o.alive) return;
      if (o.distTo(t) > 16) return;
      o._shakenUntil = now + F.freeze + 24 + ((i * 17 + st.kills * 5) % 30);
    });
    st.finishers.push({ kind, frame: now, id: j.id || j.def.id, freeze: F.freeze });
    b.emit('trunksFinisher', { fighter: j, kind, frame: now, freeze: F.freeze, left });
    return kind;
  };

  /** Every tick of the stretch: bodies held on the blow are let go, split ones come apart. */
  K.armyTick = (m, st) => {
    const b = m.battle;
    for (let i = st.pending.length - 1; i >= 0; i--) {
      const p = st.pending[i];
      if (b.frame < p.at) {
        // held on the blow, exactly where it landed
        p.j.vel.set(0, 0, 0);
        if (p.hold) p.j.pos.copy(p.hold);
        continue;
      }
      st.pending.splice(i, 1);
      K.release(m, st, p);
    }
    for (let i = st.splitting.length - 1; i >= 0; i--) {
      const s = st.splitting[i];
      s.n++;
      const k = U.easeOutCubic(Math.min(1, s.n / 30));
      const sp = s.f.model && s.f.model.joints && s.f.model.joints.spine;
      if (sp) sp.position.set(s.base.x + s.off.x * k, s.base.y - 0.12 * k, s.base.z + s.off.z * k);
      if (s.n >= 30) st.splitting.splice(i, 1);
    }
  };

  /** The held body goes: it falls apart along the cut, or the ki takes it. */
  K.release = (m, st, p) => {
    const b = m.battle, j = p.j;
    const c = j.chest();
    b.camera.addTrauma(0.2);
    if (p.vaporize) {
      b.vfx.explosion(c, 1.6, 0xffe890, { smoke: true });
      b.sfx('explosionSmall', j, { vol: 1.2 });
      j.setHidden(true);
      j.vaporized = true;
      return;
    }
    // falls apart: the upper body slides off along the cut while the legs go down
    const sp = j.model && j.model.joints && j.model.joints.spine;
    if (sp) {
      const lat = p.dir.clone().multiplyScalar(0.34);
      st.splitting.push({ f: j, n: 0, base: sp.position.clone(), off: new V3(lat.x, 0, lat.z) });
      j.cutApart = true;
    }
    j.vel.copy(p.dir).multiplyScalar(p.kind === 'dash' ? 9 : 5).addScaledVector(UP, p.kind === 'aerial' ? -6 : 3);
    j.grounded = false;
    b.vfx.sparks(c, 0xffffff, 12, 10, 0.1);
    b.vfx.dust(j.pos.clone(), 1.6, 8, b.stage.def.terrain ? b.stage.def.terrain.sand : undefined);
    b.sfx('punchHeavy', j, { vol: 0.7, pitch: 0.7 });
    st.bodies.push(j);
  };

  /* ================================================================ the demonstration (Mecha Frieza) */

  /*
   * FRIEZA'S MOODS. He is genuinely trying in every one of them; what changes is what he tries.
   * profile: his brain for the mood (hooks 'none' — no boss patterns, the mood decides);
   * move: how fast he moves; line: what he says when he gets there. `after` is what sends him on:
   * attacks that came to nothing in this mood (futile), health lost (hurt) or seconds spent in the
   * mood (seconds) — never before `min` seconds, so every mood is seen.
   */
  const MOODS = {
    denial: {
      profile: { personality: 'aggressive', aggression: 0.6, defense: 0.25, ranged: 0.85, beam: 0.7, preferredRange: 9, hooks: 'none' },
      move: 1, next: 'confused', after: { futile: 4, hurt: 0.15, min: 5, seconds: 20 },
      line: 'A trick of the light. My body was rebuilt to kill Saiyans — watch.',
    },
    confused: {
      profile: { personality: 'aggressive', aggression: 1, defense: 0.15, ranged: 0.25, beam: 0.2, preferredRange: 1.8, hooks: 'none' },
      move: 1.25, next: 'angry', after: { futile: 5, hurt: 0.35, min: 6, seconds: 18 },
      line: 'Stand still! Where are you — how are you doing that?',
    },
    angry: {
      profile: { personality: 'aggressive', aggression: 0.95, defense: 0.15, ranged: 0.8, beam: 0.9, preferredRange: 6, hooks: 'none' },
      move: 1.15, next: 'desperate', after: { futile: 6, hurt: 0.6, min: 7, seconds: 20 },
      line: 'You filthy little monkey! I will take you apart piece by piece!',
    },
    desperate: { next: 'terrified' },
    terrified: {
      profile: { personality: 'adaptive', aggression: 0.05, defense: 0.95, ranged: 0.15, beam: 0, preferredRange: 22, hooks: 'none' },
      move: 0.85, line: 'Stay back — stay away from me!',
    },
  };
  K.MOODS = MOODS;
  K.MOOD_ORDER = ['denial', 'confused', 'angry', 'desperate', 'terrified'];

  /** Frieza's brain for a mood (always a fresh one, never a stale boss brain). */
  K.friezaMood = (m, fz, mood) => {
    const b = m.battle, st = b.story.demo;
    const M = MOODS[mood];
    st.mood = mood;
    st.moodAt = b.frame;
    st.moodFutile = st.futile;
    st.moods.push(mood);
    if (M.profile) fz.controller = new SL.AIController(b, { difficulty: 'hard', profile: M.profile });
    fz.moveScale = M.move || 1;
    fz.barkOverrides = { hurt: mood === 'terrified' ? 'mf_fear' : 'mf_hurt' };
    b.emit('friezaMood', { mood, fighter: fz });
  };

  /** Is it time for the next mood? */
  K.moodDue = (b, st, fz) => {
    const M = MOODS[st.mood];
    if (!M || !M.after) return false;
    const a = M.after;
    const hurt = 1 - fz.hp / fz.hpMax;
    const secs = (b.frame - st.moodAt) / 60;
    if (secs < (a.min || 0)) return false;
    return st.futile - (st.moodFutile || 0) >= a.futile || hurt >= a.hurt || secs >= a.seconds;
  };

  /* ================================================================ the transformation */

  /**
   * Trunks' Super Saiyan, staged: not Goku's scream, not Vegeta's, and no hand signs (those are the
   * Burning Attack's) — stillness, the fists, the weight, one breath, and then all at once. The engine's transform
   * state runs the form's `storySequence` (poses, lightning, rocks, hair flicker, the burst); this
   * decides the camera beat by beat and cuts to whoever should be watching. Skip-safe.
   *   opts: fighter, witness (Frieza), watchers ([{ f, line }] — faces cut in after the burst),
   *         line (spoken at the end), music
   */
  K.transform = function* (m, opts) {
    const b = m.battle, f = opts.fighter;
    const idx = K.formIndex(f, 'ssj');
    const form = f.def.forms[idx];
    const seq = form.storySequence || form.sequence;
    const witness = opts.witness && opts.witness.alive ? opts.witness : null;
    m.lock(true);
    K.clearCombat(b);
    f.vel.set(0, 0, 0);
    if (witness) K.pose(witness, 'idle', 'smirk');
    b.skipRequested = false;
    const cast = [f].concat(witness ? [witness] : []).concat((opts.watchers || []).map((w) => w.f).filter(Boolean));
    f.setState('transform', { form: Object.assign({}, form, { sequence: seq, style: 'full' }), index: idx, boss: true, noShots: true });
    // everybody in the shots keeps moving (the engine freezes all but the one transforming)
    const own = () => {
      if (b.cinematicOwners) b.cinematicOwners = cast;
    };
    const head = (x) => {
      x.model.root.updateMatrixWorld(true);
      return x.model.joints.head.getWorldPosition(new V3()).sub(x.object.position).add(x.pos);
    };
    const fwd = () => new V3(Math.sin(f.yaw), 0, Math.cos(f.yaw));
    const side = () => {
      const w = fwd();
      return new V3(w.z, 0, -w.x);
    };
    const SHOTS = [
      // 1. the feet plant: low, close to the boots, dust going out
      { at: 0, len: 44, fn: (k, out) => K.camAt(out, f.pos.clone().addScaledVector(fwd(), 2.2).addScaledVector(side(), 1.1).add(new V3(0, 0.35, 0)), f.pos.clone().add(new V3(0, 0.45, 0)), U.lerp(40, 36, k)) },
      // 2. the fists: low beside his right hand as it closes, the stillness above it
      { at: 44, len: 76, fn: (k, out) => { const h = f.model.joints.handR.getWorldPosition(new V3()); K.camAt(out, h.clone().addScaledVector(fwd(), U.lerp(1.5, 1.2, k)).addScaledVector(side(), -0.55).add(new V3(0, 0.12, 0)), h.clone().add(new V3(0, 0.22, 0)), 40); } },
      // 3. the ground gives: wide and low, the rocks lifting round him
      { at: 120, len: 30, fn: (k, out) => K.camAt(out, f.pos.clone().addScaledVector(fwd(), 7).addScaledVector(side(), 3).add(new V3(0, 0.6, 0)), f.chest().add(new V3(0, 0.6, 0)), 48) },
      // 4. the hair: his face, the colour flickering
      { at: 150, len: 34, fn: (k, out) => { const h = head(f); K.camAt(out, h.clone().addScaledVector(fwd(), U.lerp(1.3, 1.05, k)).addScaledVector(side(), 0.25), h, 40); } },
      // 5. Frieza sees it: his face
      { at: 184, len: 30, who: 'witness', fn: (k, out) => { if (!witness) return; const h = head(witness); const wf = new V3(Math.sin(witness.yaw), 0, Math.cos(witness.yaw)); K.camAt(out, h.clone().addScaledVector(wf, 1.25).add(new V3(0.2, 0.05, 0)), h, 38); } },
      // 6. the breath: circling low as the chest comes up
      { at: 214, len: 30, fn: (k, out) => { const c = f.chest(); const a = f.yaw + 0.6 + k * 0.9; K.camAt(out, new V3(c.x + Math.sin(a) * 3.4, c.y - 0.7, c.z + Math.cos(a) * 3.4), c.clone().add(new V3(0, 0.3, 0)), 46); } },
      // 7. the eruption: wide, low, the aura going up
      { at: 244, len: 40, fn: (k, out) => K.camAt(out, f.pos.clone().addScaledVector(fwd(), U.lerp(8, 10, k)).addScaledVector(side(), 2).add(new V3(0, 0.4, 0)), f.chest().add(new V3(0, 0.9, 0)), U.lerp(52, 58, k)) },
      // 8. the finished shape: a slow push toward him, gold hair, teal eyes
      { at: 284, len: 60, fn: (k, out) => K.camAt(out, f.chest().addScaledVector(fwd(), U.lerp(3.8, 2.6, U.easeInOutCubic(k))).addScaledVector(side(), 0.7).add(new V3(0, 0.25, 0)), f.chest().add(new V3(0, 0.3, 0)), U.lerp(42, 36, k)) },
    ];
    let shot = -1;
    const hook = () => {
      own();
      if (f.state !== 'transform') return;
      const fr = f.stateFrame;
      for (let i = SHOTS.length - 1; i >= 0; i--) {
        if (fr >= SHOTS[i].at) {
          if (i !== shot) {
            shot = i;
            const S = SHOTS[i];
            m.shot((k, out) => S.fn(k, out), S.len / 60, { cut: true, blendIn: 0 });
            if (S.who === 'witness' && witness) {
              witness.model.setExpression('shock');
              K.pose(witness, 'mf_recoil', 'shock', 6);
            }
          }
          break;
        }
      }
    };
    m.tickHooks.push(hook);
    yield () => f.state !== 'transform' || b.skipRequested;
    K.removeHook(m, hook);
    // skipped: the same end state as watched
    if (f.state === 'transform') {
      f._endTransform(f.sd);
    }
    if (f.formIndex !== idx) f.applyForm(idx);
    b.endCinematic();
    b.stage.clearMood(0.8);
    m.flags.trunksTransformed = true;
    b.emit('trunksTransform', { fighter: f, skipped: !!b.skipRequested });
    // the faces that saw it
    if (!b.skipRequested) {
      K.pose(f, 'ft_tfFinal', 'angry', 5);
      if (witness) {
        K.pose(witness, 'mf_recoil', 'shock', 5);
        m.shot((k, out) => {
          const h = head(witness);
          const wf = new V3(Math.sin(witness.yaw), 0, Math.cos(witness.yaw));
          K.camAt(out, h.clone().addScaledVector(wf, U.lerp(1.5, 1.1, k)).add(new V3(-0.25, 0.02, 0)), h, 36);
        }, 2.4, { cut: true, blendIn: 0 });
        if (opts.witnessLine) m.say(witness.def.id, opts.witnessLine, 2.4, { style: 'quiet' });
        yield* m.cine(2.4);
      }
      for (const w of opts.watchers || []) {
        if (b.skipRequested || !w.f) break;
        w.f.setHidden(false);
        K.pose(w.f, w.pose || 'idle', w.face || 'shock');
        m.shot((k, out) => {
          const h = head(w.f);
          const wf = new V3(Math.sin(w.f.yaw), 0, Math.cos(w.f.yaw));
          K.camAt(out, h.clone().addScaledVector(wf, U.lerp(1.6, 1.25, k)).add(new V3(0.3, 0.05, 0)), h, 38);
        }, w.seconds || 2.2, { cut: true, blendIn: 0 });
        if (w.line) m.say(w.f.def.id, w.line, w.seconds || 2.2, { style: w.style });
        yield* m.cine(w.seconds || 2.2);
        if (w.hideAfter) w.f.setHidden(true);
      }
    }
    for (const w of opts.watchers || []) if (w.hideAfter && w.f) w.f.setHidden(true);
    b.skipRequested = false;
    m.endShot();
  };

  /* ================================================================ effects */

  /**
   * One vertical cut through a body: two copies of the model, each clipped to its own side of the
   * plane, that drift apart. The body itself is hidden. Returns { halves, tick(offset), dispose }.
   * Level 1 prototype: nothing graphic, the silhouette does the work (a production .glb works the
   * same way, since it clones whatever the model is).
   */
  K.cutInTwo = (b, f, sideDir, opts = {}) => {
    if (SL.Render && SL.Render.renderer) SL.Render.renderer.localClippingEnabled = true;
    const src = f.model.root;
    src.updateMatrixWorld(true);
    // opts.any: keep the normal as given (a level cut through the waist: normal straight up);
    // opts.at: a point on the cut (default the chest)
    const n = opts.any ? sideDir.clone().normalize() : sideDir.clone().setY(0).normalize();
    const c0 = opts.at ? opts.at.clone() : f.chest();
    const halves = [];
    for (const s of [1, -1]) {
      const clone = src.clone(true);
      const normal = n.clone().multiplyScalar(s);
      const plane = new THREE.Plane(normal.clone(), -normal.dot(c0));
      const mats = [];
      clone.traverse((o) => {
        if (!o.isMesh) return;
        // no outline shells (seen from the cut they are a black hollow), and both faces drawn so the
        // cut reads as solid
        if (o.userData.isOutline) {
          o.visible = false;
          return;
        }
        const mat = o.material.clone();
        mat.side = THREE.DoubleSide;
        mat.clippingPlanes = [plane];
        o.material = mat;
        o.castShadow = false;
        mats.push(mat);
      });
      const holder = new THREE.Group();
      src.matrixWorld.decompose(holder.position, holder.quaternion, holder.scale);
      clone.position.set(0, 0, 0);
      clone.quaternion.identity();
      clone.scale.set(1, 1, 1);
      holder.add(clone);
      b.scene.add(holder);
      halves.push({ holder, plane, normal, base: holder.position.clone(), baseQ: holder.quaternion.clone(), mats, s });
    }
    f.setHidden(true);
    const cut = {
      halves,
      c0,
      /** apart: metres each half has drifted from the cut; drop: how far they have sunk */
      set(apart, drop = 0, tilt = 0) {
        for (const h of halves) {
          const off = h.normal.clone().multiplyScalar(apart).add(new V3(0, -drop, 0));
          h.holder.position.copy(h.base).add(off);
          // from the base pose every time: set() runs every tick, and a relative turn would pile up
          h.holder.quaternion.copy(h.baseQ);
          h.holder.rotateOnWorldAxis(new V3(-h.normal.z, 0, h.normal.x), tilt * h.s);
          h.plane.constant = -h.normal.dot(c0.clone().add(off));
        }
      },
      visible(on) {
        for (const h of halves) h.holder.visible = on;
      },
      dispose() {
        for (const h of halves) {
          b.scene.remove(h.holder);
          for (const mt of h.mats) mt.dispose();
        }
        halves.length = 0;
      },
    };
    return cut;
  };

  /**
   * HAKAI'S ERASURE (2026-10-19; the Goku Black arc research CS-HAK-01: "Zamasu's body does not explode ... transparent
   * purple light engulfs his skin, and his entire physical form dissolves into fine, glowing purple dust particles from
   * the feet up"). A frozen copy of the body as it stands, lit violet and a little see-through, clipped by a level plane
   * that climbs from the soles to the crown over `opts.seconds` (2.6); glowing motes come off the line as it rises. No
   * explosion, no sound of its own. The fighter is hidden and out of reach at once. Ticks itself on the mission; a skip
   * finishes it. Returns { progress() 0..1, done(), dispose() }; disposed with the mission.
   */
  K.erase = (m, f, opts = {}) => {
    const b = m.battle;
    if (SL.Render && SL.Render.renderer) SL.Render.renderer.localClippingEnabled = true;
    const color = new THREE.Color(opts.color || 0xb060ff);
    const seconds = opts.seconds || 2.6;
    const src = f.model.root;
    src.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(src);
    const y0 = box.min.y - 0.02, y1 = box.max.y + 0.02;
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
    const plane = new THREE.Plane(new V3(0, 1, 0), -y0);
    const clone = src.clone(true);
    const mats = [];
    clone.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData.isOutline) {
        o.visible = false;
        return;
      }
      const mat = o.material.clone();
      mat.clippingPlanes = [plane];
      mat.transparent = true;
      mat.opacity = 0.88;
      if (mat.emissive) mat.emissive.copy(color).multiplyScalar(0.55);
      o.material = mat;
      o.castShadow = false;
      mats.push(mat);
    });
    const holder = new THREE.Group();
    src.matrixWorld.decompose(holder.position, holder.quaternion, holder.scale);
    clone.position.set(0, 0, 0);
    clone.quaternion.identity();
    clone.scale.set(1, 1, 1);
    holder.add(clone);
    holder.userData.erased = true;
    b.scene.add(holder);
    f.setHidden(true);
    f.untargetable = f.intangible = true;
    let k = 0, gone = false;
    const R = Math.max(0.25, Math.min(0.6, Math.hypot(box.max.x - box.min.x, box.max.z - box.min.z) * 0.35));
    const hook = () => {
      if (gone) return;
      k = b.skipRequested ? 1 : Math.min(1, k + 1 / (seconds * 60));
      const h = U.lerp(y0, y1, U.easeInOutCubic ? U.easeInOutCubic(k) : k);
      plane.constant = -h;
      if (!b.skipRequested && k < 1) {
        for (let i = 0; i < 3; i++) {
          const a = Math.random() * Math.PI * 2;
          b.vfx.sparks(new V3(cx + Math.cos(a) * R, h, cz + Math.sin(a) * R), color.getHex(), 1, 1.6, 0.09);
        }
        if (b.frame % 6 === 0) b.vfx.flash(new V3(cx, h, cz), R * 3, color.getHex(), 0.12, SL.Toon.tex.glow);
      }
      if (k >= 1) api.dispose();
    };
    const api = {
      progress: () => k,
      done: () => gone,
      dispose() {
        if (gone) return;
        gone = true;
        K.removeHook(m, hook);
        b.scene.remove(holder);
        for (const mt of mats) mt.dispose();
      },
    };
    m.tickHooks.push(hook);
    m.onDispose(api.dispose);
    return api;
  };

  /**
   * JUDGMENT (2026-10-19; shared by "Vegito"'s FIGHT 2 and "The Sword of Hope"): a story boss calls the engine's
   * telegraphed 'eruption' down on `target` every so often when he is free — marks flash at the feet, then columns come
   * down on them; he recovers after it: the opening. opts: { first, every (frames), flag (m.flags counter, 'judgments') }.
   * Emits 'judgment'. Returns { stop() no more calls, pending() columns marked and not yet down, off() } — a stretch
   * waits for pending() before it ends, so none lands in the scene after it.
   */
  K.judgment = (m, caster, target, spec, opts = {}) => {
    const b = m.battle;
    const flag = opts.flag || 'judgments';
    let wait = opts.first, stopped = false, marked = 0, landed = 0;
    // his own marks only (another mission mark — the lightning bird's — can share the delay)
    const offT = b.on('telegraph', (e) => e.fighter === caster && e.frames === spec.delay && marked++);
    const offE = b.on('eruption', (e) => e.fighter === caster && landed++);
    const hook = () => {
      if (stopped || --wait > 0) return;
      if (caster.state !== 'free' || !caster.alive || !target.alive || target.hidden || !b.stage.hasGround) {
        wait = 30;
        return;
      }
      caster.target = target;
      if (SL.Techniques.eruption.start(caster, spec, 'boss')) {
        m.flags[flag] = (m.flags[flag] || 0) + 1;
        b.emit('judgment', { fighter: caster });
        wait = opts.every;
      } else wait = 30;
    };
    m.tickHooks.push(hook);
    const off = () => {
      K.removeHook(m, hook);
      offT();
      offE();
    };
    m.onDispose(off);
    return { stop: () => (stopped = true), pending: () => marked - landed, off };
  };

  /**
   * What is left of him after the flurry: small blocks in his colours, hanging where he was, turning
   * slowly. Seeded, never Math.random. Returns { pieces, tick(dt), vaporize(), dispose }.
   */
  K.dice = (b, centre, colors, opts = {}) => {
    const rng = U.mulberry32(opts.seed || 764);
    const g = new THREE.Group();
    g.name = opts.name || 'pieces';
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const pieces = [];
    const n = opts.count || 42;
    const h = opts.height || 1.5, w = opts.width || 0.6;
    for (let i = 0; i < n; i++) {
      const mat = SL.Toon.mat(colors[i % colors.length]);
      const mesh = new THREE.Mesh(geo, mat);
      const y = -h * 0.55 + rng() * h * 1.05;
      const narrow = y > h * 0.25 ? 0.55 : 1;
      mesh.position.set((rng() - 0.5) * w * narrow, y, (rng() - 0.5) * w * 0.6 * narrow);
      mesh.scale.setScalar(0.07 + rng() * 0.07);
      mesh.rotation.set(rng() * 6, rng() * 6, rng() * 6);
      mesh.castShadow = false;
      SL.Toon.addOutline(mesh, 1.2);
      g.add(mesh);
      pieces.push({ mesh, v: new V3((rng() - 0.5) * 0.5, (rng() - 0.3) * 0.25, (rng() - 0.5) * 0.5), spin: new V3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(2) });
    }
    g.position.copy(centre);
    b.scene.add(g);
    return {
      pieces,
      group: g,
      tick(dt) {
        for (const p of pieces) {
          p.mesh.position.addScaledVector(p.v, dt);
          p.v.multiplyScalar(0.985);
          p.mesh.rotation.x += p.spin.x * dt;
          p.mesh.rotation.y += p.spin.y * dt;
        }
      },
      vaporize() {
        for (const p of pieces) {
          if (!p.mesh.visible) continue;
          const wp = p.mesh.getWorldPosition(new V3());
          b.vfx.flash(wp, 0.5, 0xfff0b0, 0.14, SL.Toon.tex.glow);
          p.mesh.visible = false;
        }
      },
      dispose() {
        b.scene.remove(g);
        geo.dispose();
      },
    };
  };

  /** A Supernova held in the air: a sphere of orange light and a core; follow() sticks it to a point. */
  K.orb = (b, pos, radius, color = 0xff7a2a, core = 0xffe6a0) => {
    const g = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 16), new THREE.MeshBasicMaterial({ color: core }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
    glow.scale.setScalar(3.2);
    g.add(outer, inner, glow);
    g.position.copy(pos);
    g.scale.setScalar(radius);
    b.scene.add(g);
    let n = 0;
    return {
      group: g,
      pos: g.position,
      radius,
      set(r) {
        this.radius = r;
        g.scale.setScalar(r);
      },
      pulse() {
        n++;
        outer.material.opacity = 0.45 + Math.sin(n * 0.35) * 0.12;
        inner.rotation.y += 0.05;
      },
      dispose() {
        b.scene.remove(g);
        outer.geometry.dispose();
        inner.geometry.dispose();
        outer.material.dispose();
        inner.material.dispose();
        glow.material.dispose();
      },
    };
  };

  /**
   * THE SAND MAP: Trunks scratches the coast, the city and the island into the ground with the tip
   * of his sword while he says the date (the owner: a map or the environment, not a wall of text).
   * Lines are thin dark strips laid on the terrain; reveal(k) draws them in order (0..1).
   * `origin` is the map's centre on the ground, `yaw` which way its north faces.
   */
  K.sandMap = (b, origin, yaw) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0x3a3228 });
    const mark = new THREE.MeshBasicMaterial({ color: 0x8a1a14 });
    const geo = new THREE.BoxGeometry(1, 0.02, 1);
    // map space: x east, z south, in metres on the ground (about 3 m across)
    const coast = [[-1.6, -1.2], [-1.1, -0.9], [-0.7, -1.0], [-0.2, -0.6], [0.1, -0.1], [-0.1, 0.4], [0.3, 0.9], [0.9, 1.3]];
    const city = [[-0.75, -0.55], [-0.35, -0.55], [-0.35, -0.2], [-0.75, -0.2], [-0.75, -0.55]];
    const island = [[0.55, 0.6], [0.85, 0.5], [1.05, 0.72], [0.95, 0.98], [0.62, 0.98], [0.5, 0.8], [0.55, 0.6]];
    const route = [[-0.55, -0.2], [-0.1, 0.2], [0.35, 0.5], [0.7, 0.72]];
    const segs = [];
    const add = (pts, m, w, dash) => {
      for (let i = 0; i < pts.length - 1; i++) {
        if (dash && i % 2) continue;
        segs.push({ a: pts[i], b: pts[i + 1], m, w });
      }
    };
    add(coast, mat, 0.05);
    add(city, mat, 0.05);
    add(island, mat, 0.05);
    add(route, mat, 0.035, true);
    // the X on the island
    segs.push({ a: [0.66, 0.66], b: [0.9, 0.9], m: mark, w: 0.06 });
    segs.push({ a: [0.9, 0.66], b: [0.66, 0.9], m: mark, w: 0.06 });
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    const W = (p) => new V3(origin.x + p[0] * cos + p[1] * sin, 0, origin.z - p[0] * sin + p[1] * cos);
    for (const s of segs) {
      const a = W(s.a), z = W(s.b);
      const mid = a.clone().lerp(z, 0.5);
      mid.y = b.stage.heightAt(mid.x, mid.z) + 0.025;
      const len = a.distanceTo(z);
      const mesh = new THREE.Mesh(geo, s.m);
      mesh.position.copy(mid);
      mesh.rotation.y = Math.atan2(z.x - a.x, z.z - a.z);
      mesh.scale.set(s.w, 1, len);
      mesh.visible = false;
      g.add(mesh);
      s.mesh = mesh;
      s.tip = z.clone().setY(mid.y);
    }
    b.scene.add(g);
    return {
      group: g,
      segs,
      /** the point the sword tip is at when k of the map is drawn */
      tipAt(k) {
        const i = Math.min(segs.length - 1, Math.floor(k * segs.length));
        return segs[i].tip.clone();
      },
      reveal(k) {
        const upto = Math.round(k * segs.length);
        segs.forEach((s, i) => (s.mesh.visible = i < upto));
        return upto;
      },
      island: W([0.78, 0.78]).setY(origin.y),
      city: W([-0.55, -0.38]).setY(origin.y),
      dispose() {
        b.scene.remove(g);
        geo.dispose();
        mat.dispose();
        mark.dispose();
      },
    };
  };
})();
