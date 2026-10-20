/*
 * CHAPTER 19 · FUTURE TRUNKS — "The Sword of Hope" (canon; played as Future Trunks). The owner's moveset roadmap §8.18,
 * mission 5 (roadmap #36 the Sword of Hope, #64 scene 4 Zeno's erasure). The last of the saga: Trunks' rage, the
 * blade made of everyone's hope, and the end of his timeline. Lines are paraphrased and written for this project.
 *
 *   RAGE *     (staged)  Half-Corrupted Fused Zamasu over the ruins, blades of light raining on the city; Trunks has
 *                        lost too much — Super Saiyan Rage
 *   FIGHT *    (played)  Super Saiyan Rage Trunks against Half-Corrupted Fused Zamasu; the Sword of Hope is his
 *                        Ultimate (optional goal: land it). Zamasu is immortal: the stretch ends at his floor, or when
 *                        Trunks is worn down. A boss in three stages by his bar (2026-10-19): his own regeneration;
 *                        then the blades of judgment (marks at Trunks' feet, columns of light, the buildings beside
 *                        them come down; he recovers after: the opening); then he stops to mend (a heavy blow breaks
 *                        it and he reels; optional goal: break it twice)
 *   HOPE       (staged)  the energy of everyone left alive rises out of the ruins into the raised sword; a towering
 *                        blade of blue-and-gold light; the leap, and the vertical cut that takes him in two (two halves
 *                        drifting apart, nothing graphic: K.cutInTwo)
 *   ERASURE    (staged)  his essence fills the sky — a vast purple apparition of him over the whole city; Goku presses
 *                        the button; Future Zeno appears, raises his hands, and the timeline goes white as the Time
 *                        Machine leaves
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const PZ = SL.data.poses;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  const TU = {
    zamasuFloor: 0.5, trunksFloor: 0.25, zamasuTaken: 0.55, zamasuDealt: 0.6,
    // ponytail: provisional (2026-10-19, the owner's next batch) — the immortal god as a boss in three stages by his bar:
    // from 0.88 the blades of judgment (a call every 7 s: marks at Trunks' feet, columns of light, the buildings beside
    // a column take 4,000); from 0.74 he stops to mend every 9 s (3 s rooted, up to +12 %, never past 0.86) unless a
    // heavy blow knocks him out of it (then he reels 1.5 s and his own regeneration is held off 8 s). Early on his bar
    // because the stretch can also end with Trunks worn down (the bot is worn down near 0.74). The owner judges
    boss: { judgeAt: 0.88, judgeFirst: 60, judgeEvery: 420, mendAt: 0.74, mendFirst: 45, mendEvery: 540, mendFrames: 180, mendHeal: 0.12, mendCap: 0.86, reel: 90, noRegen: 480, wreck: 7, wreckDamage: 4000, breaks: 2 },
  };
  const SPOT = { trunks: [0, -6], zamasu: [0, 9], goku: [-3, -12], vegeta: [-1, -13], machine: [-7, -14], zeno: [3, -10] };
  const at = (b, k, lift = 0) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const PURPLE = 0x8a3aff, HOPE_BLUE = 0x7ac8ff, HOPE_GOLD = 0xffe08a;

  // Future Zeno: both little arms raised high, quite still (hands are [left, right])
  PZ.zn_erase = PZ.zn_erase || {
    hands: ['open', 'open'],
    root: { y: 0 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-16, 0, 0],
    shoulderL: [-150, 0, 26], elbowL: [-10, 0, 0], shoulderR: [-150, 0, -26], elbowR: [-10, 0, 0],
    thighL: [-2, 0, 5], kneeL: [3, 0, 0], thighR: [-2, 0, -5], kneeR: [3, 0, 0],
  };

  // Trunks gripping the sword before him in both fists, the blade up past his face, the arms trembling with what is
  // left in them (the Sword of Hope's opening close-up; a research draft — the Gemini research, not checked against
  // the footage). Hands are [left, right]; the left fist under the right on the grip.
  PZ.ft_hopeGrip = PZ.ft_hopeGrip || ((t) => {
    const s = Math.sin(t * 23) * 1.6, c = Math.cos(t * 19) * 1.2;
    return {
      root: { y: -0.03 }, spine: [2, 0, 0], chest: [2, 0, 0], head: [-6, 0, 0],
      shoulderR: [-40 + c, 0, 40], elbowR: [-70 + s, 0, 0], handR: [-30, 0, 0], shoulderL: [-30 - c, 0, -40], elbowL: [-60 - s, 0, 0],
      thighL: [-18, 6, 10], kneeL: [22, 0, 0], thighR: [10, -6, -10], kneeR: [18, 0, 0],
      hands: ['fist', 'fist'],
    };
  });

  function setup(b) {
    const S = (b.story = {});
    S.trunks = b.spawn({ charId: 'future_trunks', team: 0, player: true, pos: at(b, 'trunks'), startKi: 100 });
    S.trunks._playerController = S.trunks.controller;
    S.fz = b.spawn({ charId: 'fused_zamasu', team: 1, pos: at(b, 'zamasu'), startKi: 100 });
    S.goku = b.spawn({ charId: 'goku', team: 0, pos: at(b, 'goku'), startKi: 50 });
    S.vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(b, 'vegeta'), startKi: 50 });
    S.zeno = b.spawn({ charId: 'zeno', team: 0, pos: at(b, 'zeno'), startKi: 0 });
    for (const f of Object.values(S)) f.cannotDie = true;
    for (const f of [S.goku, S.vegeta, S.zeno]) bench(f, true);
    K.faceTo(S.trunks, S.fz.pos);
    K.faceTo(S.fz, S.trunks.pos);
    return S;
  }

  /** Out of the fight: nobody can reach them, they reach nobody. */
  function bench(f, hidden) {
    f.controller = K.scripted();
    f.untargetable = f.intangible = true;
    f.setHidden(hidden);
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
  }

  /** His essence over the whole sky: a vast, see-through purple copy of him looming over the city. */
  function skyFace(m, f) {
    const b = m.battle;
    const src = f.model.root;
    src.updateMatrixWorld(true);
    const clone = src.clone(true);
    const mats = [];
    clone.traverse((o) => {
      if (!o.isMesh) return;
      if (o.userData.isOutline) {
        o.visible = false;
        return;
      }
      const mat = o.material.clone();
      mat.transparent = true;
      mat.opacity = 0;
      mat.depthWrite = false;
      mat.fog = false;
      if (mat.color) mat.color.lerp(new THREE.Color(PURPLE), 0.55);
      o.material = mat;
      o.castShadow = false;
      mats.push(mat);
    });
    clone.visible = true; // he is hidden by now (cut in two); his copy in the sky is not
    const holder = new THREE.Group();
    clone.position.set(0, 0, 0);
    holder.add(clone);
    holder.position.set(0, -150, 420); // the head some 360 m up: the whole sky over the towers
    holder.scale.setScalar(320);
    holder.rotation.y = Math.PI;
    b.scene.add(holder);
    const out = {
      holder,
      set(k) {
        for (const mt of mats) mt.opacity = 0.45 * k;
      },
      dispose() {
        b.scene.remove(holder);
        for (const mt of mats) mt.dispose();
        mats.length = 0;
      },
    };
    m.onDispose(out.dispose);
    return out;
  }

  /** The Sword of Hope's blade of light: a tall glowing column from the hilt (set(from, dir) every tick). */
  function bigBlade(m, len = 15) {
    const b = m.battle;
    const mk = (r0, r1, color, opacity) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, len, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    const outer = mk(0.18, 0.42, HOPE_BLUE, 0.75), core = mk(0.07, 0.16, 0xffffff, 0.95);
    const g = new THREE.Group();
    outer.position.y = core.position.y = len / 2;
    g.add(outer, core);
    b.scene.add(g);
    const out = {
      set(from, dir) {
        g.position.copy(from);
        g.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.clone().normalize());
        outer.material.color.setHex(b.frame % 8 < 4 ? HOPE_BLUE : HOPE_GOLD);
      },
      dispose() {
        if (!g.parent) return;
        b.scene.remove(g);
        for (const o of [outer, core]) {
          o.geometry.dispose();
          o.material.dispose();
        }
      },
    };
    m.onDispose(out.dispose);
    return out;
  }

  /**
   * THE BLADES OF JUDGMENT (FIGHT, stage two; the mission's own pattern — RAGE shows them raining on the city, here they
   * come down on Trunks): the shared K.judgment on the engine's telegraphed 'eruption' — he raises both arms, three
   * marks flash at Trunks' feet, columns of light come down on them. Fly or dash clear; he recovers after it.
   */
  const BLADES = {
    id: 'fzBladeRain', name: 'Blades of Judgment', count: 3, interval: 14, delay: 50, radius: 2.4, damage: 800, knockSpeed: 22,
    // recovery counts from the last mark (the engine's): 130 leaves ~80 frames after the last column to punish him
    columnHeight: 8, lead: 0.4, recovery: 130, poses: { cast: 'fz2_raise' },
    color: 0xff7ac8, flashColor: 0xffd0ec, markColor: 0xff4ab0, skyBolt: 0xffa0e0,
  };

  /** What is left of the city comes down where the light does: buildings beside a column take the blow (the stage's own collapse). */
  function wreckNear(b, pos) {
    const T = TU.boss;
    let n = 0;
    for (const o of b.stage.obstacles || []) {
      if (!o.alive || !o.building) continue;
      const d = Math.hypot(o.x - pos.x, o.z - pos.z) - o.r;
      if (d > T.wreck) continue;
      const dir = new V3(pos.x - o.x, 0, pos.z - o.z).normalize();
      b.stage.damagePillar(o, T.wreckDamage * (1 - (Math.max(0, d) / T.wreck) * 0.5), new V3(o.x + dir.x * o.r, Math.min(o.h * 0.5, 6), o.z + dir.z * o.r));
      n++;
    }
    return n;
  }

  /**
   * MENDING (FIGHT, stage three; the mission's own rule for his immortality): every so often, when he is free, he stops
   * where he stands and the corruption knits him — hunched (`fz2_mend`), purple light pulsing out of him, his bar
   * climbing. Light blows land but do not stop it (storyArmor 1); a heavy blow or anything else that knocks him out of
   * it breaks it: a burst of purple, he reels (the opening), and his body's own regeneration is held off for a while.
   * Emits 'zamasuMend' { stage: 'start' | 'broken' | 'done' }. Returns { mending(), stats, off() }.
   */
  function mendPattern(m, fz, tr) {
    const b = m.battle, T = TU.boss;
    const stats = { mends: 0, broken: 0, healed: 0 };
    let wait = T.mendFirst, cur = null, noRegen = 0, reel = false, gone = false;
    const end = (broken) => {
      const c = cur;
      cur = null;
      fz.storyArmor = c.armor;
      fz.controller = c.ctl;
      if (broken) {
        stats.broken++;
        noRegen = T.noRegen;
        reel = true;
        b.vfx.explosion(fz.chest(), 1.6, PURPLE, {});
        b.vfx.ring(fz.chest(), 5, 0xc080ff, 0.4);
        b.sfx('guardBreak', fz, { pitch: 0.8 });
        if (stats.broken === 1) m.say('fused_zamasu', 'What...? It will not close!', 1.8, { style: 'shout' });
      } else if (fz.state === 'scripted') fz.setState('free');
      b.emit('zamasuMend', { fighter: fz, stage: broken ? 'broken' : 'done' });
      wait = T.mendEvery;
    };
    const hook = () => {
      if (noRegen > 0) {
        noRegen--;
        if (fz.mech && fz.mech.calm > 0) fz.mech.calm = 0;
      }
      // the opening: once the blow that broke it has played out, he reels
      if (reel && fz.state === 'free') {
        reel = false;
        if (fz.alive) fz.setState('stagger', { frames: T.reel });
      }
      if (cur) {
        cur.n++;
        if (!fz.alive || fz.state !== 'scripted') return end(true);
        const add = Math.min((fz.hpMax * T.mendHeal) / T.mendFrames, Math.max(0, fz.hpMax * T.mendCap - fz.hp));
        fz.hp += add;
        stats.healed += add;
        if (cur.n % 4 === 0) b.vfx.sparks(fz.chest().add(new V3(U.rand(-0.4, 0.4), U.rand(-0.6, 0.5), U.rand(-0.4, 0.4))), PURPLE, 3, 3, 0.1);
        if (cur.n % 24 === 0) b.vfx.ring(fz.chest(), 2.6, 0xc080ff, 0.3);
        if (cur.n >= T.mendFrames) end(false);
        return;
      }
      if (--wait > 0) return;
      if (fz.state !== 'free' || !fz.alive || fz.hidden || !tr.alive) {
        wait = 20;
        return;
      }
      cur = { n: 0, armor: fz.storyArmor, ctl: fz.controller };
      fz.controller = K.scripted();
      fz.storyArmor = Math.max(fz.storyArmor || 0, 1);
      K.pose(fz, 'fz2_mend', 'grit', 10);
      stats.mends++;
      b.vfx.flash(fz.chest(), 2.4, PURPLE, 0.25, SL.Toon.tex.glow);
      b.sfx('drain', fz, { vol: 0.8, pitch: 0.6 });
      b.emit('zamasuMend', { fighter: fz, stage: 'start' });
    };
    m.tickHooks.push(hook);
    const off = () => {
      if (gone) return;
      gone = true;
      K.removeHook(m, hook);
      if (cur) {
        fz.storyArmor = cur.armor;
        fz.controller = cur.ctl;
        cur = null;
      }
    };
    m.onDispose(off);
    return { mending: () => !!cur, stats, off };
  }

  /** Trunks' block over Goku and Vegeta (P.rage's opening; skip-safe: a skip lands with them benched again). */
  function* block(m, st) {
    const b = m.battle, S = b.story, tr = S.trunks, fz = S.fz, g = S.goku, v = S.vegeta;
    const fw = new V3(0, 0, 1);
    const down = K.ground(b, at(b, 'trunks').clone().addScaledVector(fw, 3));
    for (const [f, dx, pose] of [[g, -1.2, 'lieBack'], [v, 1.2, 'knockdownFace']]) {
      f.setHidden(false);
      K.toForm(f, 'base');
      K.place(f, K.ground(b, down.clone().add(new V3(dx, 0, 0))), Math.PI);
      f.setState('scripted', { pose, expression: 'hurt', speed: 10, aura: 0 });
    }
    // the god down over them, the blade of light raised
    const over = down.clone().addScaledVector(fw, 2.4).add(new V3(0, 1.2, 0));
    fz.grounded = false;
    fz.setPosition(over);
    K.faceTo(fz, down);
    K.pose(fz, 'punchWindR', 'wicked', 12);
    m.shot((t, o) => {
      o.pos.copy(down).add(new V3(5.5, 1.4, -2.5));
      o.look.copy(down.clone().lerp(over, 0.5));
      o.fov = 52;
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('fused_zamasu', 'Your fusion is spent. Now the two of you are finished.', 2.6);
    let n = 0;
    yield () => {
      n++;
      if (!b.skipRequested && n % 3 === 0) b.vfx.flash(fz.handPos('R'), 0.6 + n / 50, 0xfff0d0, 0.1, SL.Toon.tex.glow);
      return n >= 60 || b.skipRequested;
    };
    // the blade comes down — and Trunks is there, his sword across it
    K.pose(fz, 'punchR', 'shout', 30);
    if (!b.skipRequested) b.vfx.afterimage(tr.pos, tr.height, 0xffe080);
    K.place(tr, K.ground(b, down.clone().addScaledVector(fw, 1)), 0);
    K.faceTo(tr, fz.pos);
    K.sheathe(tr, false);
    K.pose(tr, 'guard', 'angry', 30);
    const clash = tr.chest().lerp(fz.handPos('R'), 0.5).add(new V3(0, 0.4, 0));
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.2, '#fff4d8');
      b.vfx.impact(clash, 2.6, 0xfff0d0);
      b.vfx.sparks(clash, 0xfff0d0, 24, 10, 0.12);
      b.sfx('swordClang', tr, { vol: 1.2 });
      b.cameraTraumaAt(clash, 0.5);
    }
    m.flags.blocked = true;
    shot(m, { trunks: tr, fz }, { subject: 'trunks', with: 'fz', focus: 'medium', angle: 'three' }, 999);
    m.say('fused_zamasu', 'And where will you run for help next, mortal?', 2.4);
    yield* st.wait(2.4);
    m.say('future_trunks', 'I\'m fighting to save everyone — and we help each other. That\'s what being human means!', 3.4, { style: 'shout' });
    yield* st.wait(3.4);
    m.endShot();
    // back up over the city for what follows; the two of them out of the fight (they come back for the gathering)
    for (const f of [g, v]) bench(f, true);
    K.place(tr, at(b, 'trunks'), 0);
    K.faceTo(tr, at(b, 'zamasu'));
    fz.setPosition(at(b, 'zamasu', 8));
    K.faceTo(fz, tr.pos);
    K.pose(fz, 'fz2_raise', 'wicked', 6);
    K.pose(tr, 'ft_ready', 'angry', 6);
    b.skipRequested = false;
  }

  const P = {};

  P.rage = { id: 'rage', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, fz = S.fz;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    K.toForm(tr, 'ssj');
    K.toForm(fz, 'corrupted');
    tr.controller = K.scripted();
    fz.controller = K.scripted();
    K.place(tr, at(b, 'trunks'), 0);
    K.faceTo(tr, at(b, 'zamasu'));
    const high = at(b, 'zamasu', 8);
    fz.grounded = false;
    fz.setPosition(high);
    K.faceTo(fz, tr.pos);
    K.pose(fz, 'fz2_raise', 'wicked', 6);
    K.pose(tr, 'ft_ready', 'angry', 6);
    m.music('zamasu_theme', 3);
    // blades of light raining on what is left of the city
    shot(m, { fz }, { subject: 'fz', focus: 'wide', angle: 'low', room: 14 }, 999);
    m.title(CHAPTER, 'THE SWORD OF HOPE', 'Future · the last stand', 3.4);
    let n = 0;
    yield () => {
      n++;
      if (!b.skipRequested && n % 9 === 0) {
        const hit = K.ground(b, new V3(U.rand(-40, 40), 0, U.rand(-30, 50)));
        b.vfx.slash(hit.clone().add(new V3(0, 30, 0)), hit, 0xff7ac8, 0.18, 0.3);
        b.vfx.explosion(hit, 1.6, 0xff7ac8, { smoke: true });
      }
      return n >= 150 || b.skipRequested;
    };
    // THE BLOCK (2026-10-19; episode 66, documentation/FUSED_ZAMASU_EPISODES_64_67.md beat 21: Zamasu moves to finish
    // Goku and Vegeta, and Trunks blocks his ki blade with his own; the lines paraphrased): the two of them spent in the
    // street; the god over them, the blade of light raised; Trunks in front of them, his sword up — the clash of light
    yield* block(m, st);
    m.say('fused_zamasu', 'Every mortal on this planet will be judged. Not one will remain.', 3.2);
    yield* st.wait(3.2);
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'low' }, 999);
    m.say('future_trunks', 'You\'ve taken everything from me... I won\'t let you take the people who are left!', 3.4, { style: 'shout' });
    yield* st.wait(3.4);
    m.endShot();
    b.skipRequested = false;
    // the second time he sees it: Black and Zamasu watched it awaken in "Zero Mortals" (ft_zero), and the fused god remembers
    yield* SL.data.cinematics.transform(m, { fighter: tr, formIndex: K.formIndex(tr, 'rage'), witness: fz, witnessLine: 'That flame again, Trunks? We saw it the first time. A mortal\'s rage still cannot reach a god.', music: 5 });
    K.toForm(tr, 'rage');
    m.flags.rage = tr.form.id === 'rage';
    m.endShot();
    b.skipRequested = false;
  } };

  P.fight = { id: 'fight', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, fz = S.fz;
    stage(m);
    for (const f of [S.goku, S.vegeta, S.zeno]) bench(f, true);
    K.toForm(tr, 'rage');
    K.toForm(fz, 'corrupted');
    fz.setHidden(false);
    fz.untargetable = fz.intangible = tr.untargetable = tr.intangible = false;
    if (tr.pos.distanceTo(fz.pos) < 5) K.place(fz, K.ground(b, tr.pos.clone().add(new V3(0, 0, 9))), Math.PI);
    tr.hp = tr.hpMax;
    fz.hp = fz.hpMax;
    tr.ki = tr.kiMax;
    tr.controller = tr._playerController || (tr._playerController = new SL.PlayerController(b));
    b.switchPlayer(tr, { force: true, quiet: true });
    tr.target = fz;
    fz.target = tr;
    fz.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, fz.def.ai, { aggression: 0.8, defense: 0.5, transformHp: 0 }) });
    tr.setState('free');
    fz.setState('free');
    m.title(CHAPTER, 'THE SWORD OF HOPE', 'Super Saiyan Rage Trunks vs Half-Corrupted Zamasu', 2.4);
    m.objective('fight', 'Drive the immortal god back', { icon: 'fist' });
    m.objective('sword', 'Land the Sword of Hope (Ultimate)', { icon: 'target', optional: true });
    m.music('last_hope', 5);
    let sword = false;
    const offD = b.on('damage', (e) => {
      if (sword || e.attacker !== tr || e.target !== fz || tr.state !== 'rush' || !tr.sd.spec || tr.sd.spec.id !== 'swordOfHope') return;
      sword = true;
      m.complete('sword');
    });
    m.onDispose(offD);
    const sf = m.storyFight({
      floors: [{ f: fz, at: TU.zamasuFloor }], dealt: [{ f: fz, mul: TU.zamasuDealt }], taken: [{ f: fz, mul: TU.zamasuTaken }],
      ease: { foe: fz, hero: tr, below: 0.5, min: 0.5 },
      fighters: [tr, fz],
    });
    // THE BOSS (2026-10-19, the owner's next batch; MASTER_SPEC: Fused Zamasu "a huge multi-phase boss: regeneration,
    // immortality, massive energy attacks, environmental destruction"). The stages are the mission's own, keyed to his
    // bar: the immortal body (his own regeneration), then the blades of judgment (dodge, then punish the recovery; the
    // city comes down where they fall), then the mending (break it with a heavy blow)
    const T = TU.boss;
    let judgment = null, mend = null;
    m.flags.wrecked = 0;
    const offW = b.on('eruption', (e) => {
      if (e.fighter === fz) m.flags.wrecked += wreckNear(b, e.pos);
    });
    const offM = b.on('zamasuMend', (e) => {
      if (e.fighter !== fz || e.stage !== 'broken') return;
      m.flags.mendBroken = (m.flags.mendBroken || 0) + 1;
      m.progress('mend', m.flags.mendBroken);
    });
    const stages = () => {
      if (!judgment && fz.hpFrac < T.judgeAt) {
        m.flags.bladeStage = b.frame;
        m.say('fused_zamasu', 'Enough. Let the light itself pass judgment on you!', 2.4, { style: 'shout' });
        judgment = K.judgment(m, fz, tr, BLADES, { first: T.judgeFirst, every: T.judgeEvery });
      }
      if (!mend && fz.hpFrac < T.mendAt) {
        m.flags.mendStage = b.frame;
        m.say('fused_zamasu', 'Strike all you like. This body is eternal — it mends!', 2.6);
        m.objective('mend', 'Break his mending with a heavy blow', { icon: 'fist', optional: true, target: T.breaks });
        mend = mendPattern(m, fz, tr);
        m.prompt('fzMend', 'heavy', 'He is mending — HEAVY to break it', { when: () => !!mend && mend.mending(), until: () => !mend || !mend.mending() });
      }
    };
    m.tickHooks.push(stages);
    const offStages = () => {
      K.removeHook(m, stages);
      offW();
      offM();
    };
    m.onDispose(offStages);
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => sf.floored(fz) || tr.hpFrac < TU.trunksFloor || m.state !== 'running';
    K.removeHook(m, stages);
    if (mend) mend.off();
    if (judgment) {
      // no new call; the columns already marked come down in the fight, not in the scene after it
      judgment.stop();
      yield () => judgment.pending() <= 0 || m.state !== 'running';
      judgment.off();
    }
    offStages();
    if (mend) m.flags.mends = mend.stats.mends;
    offD();
    sf.off();
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    if (m.state !== 'running') return;
    m.flags.drove = sf.floored(fz);
    m.flags.swordLanded = sword;
    m.qteParts.push(m.flags.drove ? 1 : 0.5);
    m.complete('fight');
  } };

  P.hope = { id: 'hope', run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, fz = S.fz;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    tr.controller = K.scripted();
    fz.controller = K.scripted();
    K.toForm(tr, 'rage');
    K.toForm(fz, 'corrupted');
    K.place(tr, K.ground(b, tr.pos.clone()), tr.yaw);
    const fwd = () => new V3(Math.sin(tr.yaw), 0, Math.cos(tr.yaw));
    const zAt = K.ground(b, tr.pos.clone().addScaledVector(fwd(), 9));
    K.place(fz, zAt, 0);
    K.faceTo(fz, tr.pos);
    K.faceTo(tr, fz.pos);
    K.pose(fz, 'zm_idle', 'angry', 6);
    // the sword raised; everyone's energy rising out of the ruins into it
    K.pose(tr, 'ft_dropW', 'serious', 8);
    // Goku and Vegeta, spent, watching him from behind (the breakdown's survivors and Mai are not in the cast)
    for (const [f, dx] of [[S.goku, -2.2], [S.vegeta, 2.2]]) {
      bench(f, false);
      K.toForm(f, 'base');
      K.place(f, K.ground(b, tr.pos.clone().addScaledVector(fwd(), -5).add(new V3(dx, 0, 0))), 0);
      K.faceTo(f, tr.pos);
      K.pose(f, 'idle', 'serious', 6);
    }
    m.flags.watched = true;
    // the research's opening shot: low and close on both fists gripping the sword before him, the arms trembling;
    // then the sword goes up (the owner's raise, as before)
    K.pose(tr, 'ft_hopeGrip', 'grit', 14);
    m.shot((t, out) => {
      const f = fwd(), sd = new V3(f.z, 0, -f.x), h = tr.handPos('R');
      K.camAt(out, h.clone().addScaledVector(f, 1.0).addScaledVector(sd, 0.35).add(new V3(0, -0.45, 0)), h.add(new V3(0, 0.25, 0)), 44);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.flags.gripShot = true;
    yield* st.wait(1.5);
    K.pose(tr, 'ft_dropW', 'serious', 8);
    shot(m, { trunks: tr }, { subject: 'trunks', focus: 'upper', angle: 'low' }, 999);
    m.say('future_trunks', 'Everyone... lend me what you have left. All of it!', 3, { style: 'shout' });
    const motes = [];
    for (let i = 0; i < 26; i++) motes.push(K.ground(b, tr.pos.clone().add(new V3(U.rand(-45, 45), 0, U.rand(-45, 45)))));
    let n = 0;
    const tip = () => {
      const seg = K.bladeSegment(tr);
      return seg ? seg[1] : tr.handPos('R').add(new V3(0, 0.8, 0));
    };
    yield () => {
      n++;
      // halfway through: from behind Goku and Vegeta, past them to Trunks and the light rising into his sword
      if (n === 90 && !b.skipRequested) {
        m.shot((t, out) => {
          const back = tr.pos.clone().addScaledVector(fwd(), -10).add(new V3(0, 1.5, 0));
          K.camAt(out, back, tr.chest().add(new V3(0, 1.6, 0)), 60);
        }, 999, { cut: true, blendIn: 0, hold: true });
      }
      if (!b.skipRequested && n % 2 === 0) {
        const k = (n % 60) / 60, top = tip();
        for (let i = n % 4; i < motes.length; i += 4) {
          const p = motes[i].clone().lerp(top, k);
          p.y += Math.sin(k * Math.PI) * 6;
          b.vfx.flash(p, 0.5, i % 2 ? HOPE_BLUE : HOPE_GOLD, 0.12, SL.Toon.tex.glow);
        }
        if (n % 10 === 0) b.vfx.flash(top, 1 + n / 60, HOPE_GOLD, 0.15, SL.Toon.tex.glow);
      }
      return n >= 180 || b.skipRequested;
    };
    m.flags.gathered = true;
    // the towering blade of light, out along his sword
    const big = bigBlade(m);
    // straight up out of the raised sword (the pillar the PDF describes), whatever the arm is doing
    const onSword = () => big.set(tr.handPos('R'), new V3(0, 1, 0).addScaledVector(fwd(), 0.12));
    onSword();
    m.tickHooks.push(onSword);
    m.flags.blade = true;
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.3, '#e8f4ff');
      b.sfx('swordDraw', tr, { vol: 1.2 });
      const sd = new V3(fwd().z, 0, -fwd().x);
      m.shot((t, out) => K.camAt(out, tr.pos.clone().addScaledVector(fwd(), -9).addScaledVector(sd, 4).add(new V3(0, 1.2, 0)), tr.chest().add(new V3(0, 5, 0)), 64), 999, { cut: true, blendIn: 0, hold: true });
      m.say('future_trunks', 'This is the hope of everyone who\'s still alive!', 2.6, { style: 'shout' });
      yield* st.wait(2);
      // the god's answer (Roadmap Three, the owner's Gemini research — a research draft, not checked against the footage):
      // a dark sphere thrown to crush him, and the blade brought down straight through it
      K.pose(fz, 'fz2_cast', 'shout', 14);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0x5a1a8a, transparent: true, opacity: 0.8, depthWrite: false }));
      const o0 = fz.chest().addScaledVector(fwd(), -1), o1 = tr.chest().addScaledVector(fwd(), 4.5).add(new V3(0, 1.2, 0));
      orb.position.copy(o0);
      b.scene.add(orb);
      const dropOrb = () => {
        if (!orb.parent) return;
        b.scene.remove(orb);
        orb.geometry.dispose();
        orb.material.dispose();
      };
      m.onDispose(dropOrb);
      b.sfx('kiBlastBig', fz, { vol: 1.1, pitch: 0.7 });
      const sd2 = new V3(fwd().z, 0, -fwd().x);
      m.shot((t, out) => K.camAt(out, tr.pos.clone().addScaledVector(sd2, 7.5).addScaledVector(fwd(), 2.6).add(new V3(0, 1.6, 0)), tr.chest().addScaledVector(fwd(), 2.2).add(new V3(0, 1, 0)), 56), 999, { cut: true, blendIn: 0, hold: true });
      K.removeHook(m, onSword);
      n = 0;
      yield () => {
        n++;
        const k = Math.min(1, n / 26);
        orb.position.copy(o0).lerp(o1, k);
        orb.scale.setScalar(0.8 + k * 0.5);
        if (n % 3 === 0) b.vfx.flash(orb.position, 1.8, 0x9a4ad8, 0.1, SL.Toon.tex.glow);
        // the blade swings down to meet it
        const a = U.easeInOutCubic(Math.min(1, Math.max(0, (n - 12) / 14))) * 1.45;
        big.set(tr.handPos('R'), new V3(0, Math.cos(a), 0).addScaledVector(fwd(), Math.sin(a)));
        return n >= 26 || b.skipRequested;
      };
      const hitAt = orb.position.clone();
      dropOrb();
      b.vfx.slash(hitAt.clone().add(new V3(0, 3, 0)), hitAt.clone().add(new V3(0, -3, 0)), HOPE_BLUE, 0.5, 0.4);
      for (const s of [-1, 1]) b.vfx.explosion(hitAt.clone().addScaledVector(sd2, s * 2.2).addScaledVector(fwd(), -1.5), 1.4, 0x9a4ad8, { smoke: true });
      b.sfx('swordSlash', tr, { vol: 1.2 });
      b.cameraTraumaAt(hitAt, 0.6);
      m.flags.orbCut = true;
      yield* st.wait(0.9);
      m.tickHooks.push(onSword);
    }
    // the leap over him, and the cut straight down through him
    const over = fz.pos.clone().add(new V3(0, 7, 0)).addScaledVector(fwd(), -1);
    K.pose(tr, 'ft_dropW', 'shout', 20);
    const from = tr.pos.clone();
    n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeInOutCubic(Math.min(1, n / 30));
      tr.grounded = false;
      tr.setPosition(from.clone().lerp(over, k));
      tr.vel.set(0, 0, 0);
      return k >= 1;
    };
    K.faceTo(tr, fz.pos);
    K.removeHook(m, onSword);
    K.pose(tr, 'ft_drop', 'shout', 30);
    const side = new V3(fwd().z, 0, -fwd().x);
    if (!b.skipRequested) {
      m.shot((t, out) => K.camAt(out, fz.chest().addScaledVector(side, 16).add(new V3(0, 3, 0)), fz.chest().add(new V3(0, 4, 0)), 58), 999, { cut: true, blendIn: 0, hold: true });
      n = 0;
      yield () => {
        n++;
        const a = U.easeInOutCubic(Math.min(1, n / 14)) * Math.PI;
        big.set(tr.handPos('R'), new V3(0, Math.cos(a), 0).addScaledVector(fwd(), Math.sin(a)));
        return n >= 18 || b.skipRequested;
      };
    }
    big.dispose();
    if (!b.skipRequested) {
      const c = fz.chest();
      b.vfx.slash(c.clone().add(new V3(0, 13, 0)), c.clone().add(new V3(0, -2, 0)), HOPE_BLUE, 0.5, 0.8);
      b.vfx.slash(c.clone().add(new V3(0, 13, 0)), c.clone().add(new V3(0, -2, 0)), 0xffffff, 0.35, 0.3);
      b.vfx.flash(c, 3, HOPE_BLUE, 0.2, SL.Toon.tex.glow);
      b.sfx('swordSlash', fz, { vol: 1.3 });
      b.cameraTraumaAt(c, 0.9);
    }
    const cut = K.cutInTwo(b, fz, side);
    m.onDispose(() => cut.dispose());
    m.flags.cut = true;
    K.place(tr, K.ground(b, fz.pos.clone().addScaledVector(fwd(), -2)), tr.yaw);
    K.pose(tr, 'ft_finish', 'angry', 8);
    if (!b.skipRequested) {
      m.shot((t, out) => {
        const c = cut.c0;
        K.camAt(out, c.clone().addScaledVector(side, 7).add(new V3(0, 0.6, 0)), c, 48);
      }, 999, { cut: true, blendIn: 0, hold: true });
      n = 0;
      yield () => {
        n++;
        cut.set(Math.min(1.4, n / 40), 0, Math.min(0.5, n / 80));
        return n >= 90 || b.skipRequested;
      };
    }
    cut.dispose();
    m.flags.halves = true;
    m.endShot();
    b.skipRequested = false;
  } };

  P.erasure = { id: 'erasure', run: function* (m) {
    const b = m.battle, S = b.story, tr = S.trunks, fz = S.fz, g = S.goku, v = S.vegeta, z = S.zeno;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    tr.controller = K.scripted();
    fz.setHidden(true);
    fz.untargetable = fz.intangible = true;
    K.toForm(tr, 'ssj');
    K.toForm(g, 'base');
    K.toForm(v, 'base');
    K.place(tr, at(b, 'trunks'), Math.PI);
    for (const f of [g, v]) bench(f, false);
    K.place(g, at(b, 'goku'), 0);
    K.place(v, at(b, 'vegeta'), 0);
    S.machine = K.timeMachine(b, at(b, 'machine'));
    m.onDispose(() => K.propGone(b, S.machine));
    // the sky goes purple and he is all of it
    b.stage.setMood(0.7, 0x2a0a3a, 1.2);
    m.onDispose(() => b.stage.clearMood(0.1));
    const face = skyFace(m, fz);
    const sky = new V3(0, 300, 420);
    // a little in front of Trunks and to his side (from his own head the lens sat inside his hair), looking up past the towers
    const eye = at(b, 'trunks', 1).add(new V3(1.4, 0, 2.2));
    m.shot((t, out) => K.camAt(out, eye, eye.clone().lerp(sky, U.lerp(0.25, 1, U.easeInOutCubic(Math.min(1, t * 2)))), 62), 4, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      face.set(Math.min(1, n / 120));
      if (!b.skipRequested && n % 14 === 0) b.vfx.skyBolt(K.ground(b, new V3(U.rand(-60, 60), 0, U.rand(20, 120))), 60, 0xc89aff);
      // red light raining out of him on what is left of the city (adapted from the breakdown)
      // from high in the sky toward the apparition, down across the tilted-up frame onto the towers in front of Trunks
      // (kept within ~150 m: the stage fog, 60–380 m, swallows anything further)
      if (!b.skipRequested && n % 10 === 5) {
        // either side of the tower that fills the middle of the frame
        const s = n % 20 === 5 ? 1 : -1;
        const hit = K.ground(b, new V3(s * U.rand(25, 55), 0, U.rand(25, 90)));
        const from = new V3(s * U.rand(45, 75), U.rand(90, 130), U.rand(110, 150));
        b.vfx.slash(from, hit, 0xff2a3a, 0.35, 1.8);
        b.vfx.slash(from, hit, 0xffd0d0, 0.2, 0.6);
        b.vfx.explosion(hit, 2, 0xff4a4a, { smoke: true });
        m.flags.lasers = (m.flags.lasers || 0) + 1;
      }
      return n >= 150 || b.skipRequested;
    };
    face.set(1);
    m.flags.skyFace = true;
    m.say('fused_zamasu', 'You cannot cut the sky, mortals. I am this world now — I am everywhere.', 3.6, { style: 'quiet' });
    yield* st.wait(3.6);
    for (const f of [tr, g, v]) {
      K.faceTo(f, sky);
      K.pose(f, 'idle', 'shock', 6);
    }
    // the button
    shot(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    K.pose(g, 'offerPalm', 'serious', 8);
    m.say('goku', 'There\'s only one thing left... He told me to call him if I needed him.', 3.2);
    let glow = 0;
    const button = () => {
      glow++;
      if (glow % 3 === 0) b.vfx.flash(g.handPos('R'), 0.35, 0xff2a2a, 0.1, SL.Toon.tex.glow);
    };
    m.tickHooks.push(button);
    yield* st.wait(3.2);
    b.sfx('itPop', g, { vol: 1 });
    b.vfx.flash(g.handPos('R'), 1.2, 0xff4a4a, 0.25, SL.Toon.tex.glow);
    K.removeHook(m, button);
    m.flags.button = true;
    // Future Zeno
    z.setHidden(false);
    K.place(z, at(b, 'zeno'), 0);
    K.faceTo(z, sky);
    K.pose(z, 'zn_idle', 'calm', 4);
    SL.ScreenFX.flash(0.35, '#ffffff');
    b.sfx('teleport', z, { vol: 1 });
    shot(m, { zeno: z }, { subject: 'zeno', focus: 'upper', angle: 'low' }, 999);
    m.say('zeno', 'Ooh. This world looks bad. Bad things should go away.', 3);
    yield* st.wait(3);
    m.say('future_trunks', 'Everyone, to the Time Machine — now!', 2.2, { style: 'shout' });
    yield* st.wait(1.4);
    // into the machine, and up
    for (const f of [tr, g, v]) f.setHidden(true);
    K.pose(z, 'zn_erase', 'calm', 6);
    m.say('zeno', 'Erase.', 1.8);
    m.flags.zeno = true;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    sphere.position.copy(z.chest());
    b.scene.add(sphere);
    const disposeSphere = () => {
      if (!sphere.parent) return;
      b.scene.remove(sphere);
      sphere.geometry.dispose();
      sphere.material.dispose();
    };
    m.onDispose(disposeSphere);
    const m0 = S.machine.group ? S.machine.group.position.clone() : null;
    m.shot((t, out, el) => K.camAt(out, at(b, 'machine').add(new V3(14, 6, 18)), at(b, 'machine').add(new V3(0, 6 + el * 8, 0)), 60), 999, { cut: true, blendIn: 0, hold: true });
    n = 0;
    yield () => {
      n++;
      const k = Math.min(1, n / 120);
      sphere.scale.setScalar(1 + k * k * 320);
      if (m0) S.machine.group.position.copy(m0).add(new V3(0, Math.min(1, n / 70) * 16, 0));
      return n >= 120 || b.skipRequested;
    };
    b.sfx('timeWarp', null, { at: at(b, 'machine'), vol: 1.1 });
    K.propGone(b, S.machine);
    SL.ScreenFX.flash(1, '#ffffff');
    m.flags.erased = true;
    face.dispose();
    disposeSphere();
    m.endShot();
    b.skipRequested = false;
    m.fade('white', 1.2);
    yield* m.cine(1.4);
    m.title(CHAPTER, 'THE SWORD OF HOPE', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.ftHope = { TU };
  SL.data.missions.ft_hope = {
    id: 'ft_hope', canon: true, chapter: CHAPTER, title: 'The Sword of Hope', character: 'future_trunks', stage: 'future_ruins',
    subtitle: 'Future · Age 796 · the end of the timeline', parTime: 300, qteLabel: 'The last stand',
    blurb: 'Half-corrupted and immortal, Zamasu means to judge every mortal left. Trunks answers with Super Saiyan Rage and a sword made of everyone\'s hope — and then there is only one power left that can end it.',
    appearance: { future_trunks: { outfit: 'ft_super' } },
    lockForms: {
      future_trunks: SL.data.characters.future_trunks.forms.filter((x) => !['base', 'ssj', 'rage'].includes(x.id)).map((x) => x.id),
    },
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: the end of Trunks\' timeline', 'Free Battle: Super Saiyan Rage Trunks, the Sword of Hope'],
    setup,
    phases: [P.rage, P.fight, P.hope, P.erasure],
  };
})();
