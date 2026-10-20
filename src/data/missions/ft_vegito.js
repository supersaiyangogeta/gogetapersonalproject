/*
 * CHAPTER 19 · FUTURE TRUNKS — "Vegito" (canon; played as Vegito Blue). The owner's moveset roadmap §8.18, mission 4
 * (roadmap #34 the Final Kamehameha, #33 God Slicer, #64 scene 3). Black and Zamasu put on the Potara; Goku and
 * Vegeta answer with their own. Lines are paraphrased and written for this project.
 *
 * THE ORDER IS EPISODES 64–66 (2026-10-19: documentation/FUSED_ZAMASU_EPISODES_64_67.md, from the Kanzenshuu episode
 * guides; the shots, poses and lines are the mission's own unless marked):
 *
 *   MERGE *    (staged)  Black and Zamasu put on the Potara: the pull, the light over the broken sky, the god marvelling
 *   ASSAULT *  (played)  Blue Goku and Vegeta (switch between them) against the god who toys with them: the Blades of
 *                        Judgement (marks, then columns), his Lightning of Absolution — the bird of light over him marking
 *                        one of them and striking; destroy it together; then the cue — the Saiyan Assault, a real team
 *                        rush (blows from both sides, its key blows slowed: an ADAPTATION of the owner's memory) — and he
 *                        catches the last double blow and throws them into the rubble (the episode: "he blocks them
 *                        easily and knocks them down")
 *   TURN *     (staged, a struggle, cues)  Trunks in Super Saiyan Rage and the Father-Son Galick Gun into his Holy Wrath
 *                        (no harm); the Blades of Judgement and Vegeta shielding his son; the gigantic Holy Wrath against
 *                        Goku's Kamehameha (mash: pushed back, then through it); the right side of his face and arm
 *                        swollen purple; the leg grab, Kaioken, the halo shattered; the Light of Justice; the Potara;
 *                        Vegito high in the light looking down (the owner's recollection), the drop; "Alright!" (kept as
 *                        it was); his first words (two can play at merging); Blue (blueChange); the fingers and the punch
 *   FIGHT *    (played)  Vegito Blue against Fused Zamasu in the sky (God Slicer on the wheel, opened for this mission);
 *                        ends at Zamasu's first floor (65 %) or when Vegito is worn down
 *   WRATH      (staged, a cue, a struggle, a cue)  Holy Wrath thrown down — caught (Guard) and driven back into him
 *                        (mash); he drops on Vegito and blasts him across the rubble; Vegito lies there play-acting; the
 *                        god steps in with his ki blade — the player springs it (Heavy) in the last frames of his lunge:
 *                        an impact frame, the longer Spirit Sword clean through him; a miss lands his blade and he lunges
 *                        again (after three the counter comes anyway); Vegito up on one knee with the taunt
 *   FIGHT 2 *  (played)  his tears and the change (bulkUp: the Half-Corrupted form, episode 66), and he fights heavier —
 *                        light blows do not stop him, he is slower, he grows as his bar comes down, and he calls judgment
 *                        down on Vegito (telegraphed marks, then pink columns; dodge, then punish the recovery) — down
 *                        among the ruins (ground and sky) until his floor (35 %)
 *   FINAL      (staged, cues, a struggle)  the taunt (too bulky to keep up); arms crossed, blue and gold crackling round
 *                        him, the Final Kamehameha (Ultimate), the charge held (mash) while he lumbers down at Vegito,
 *                        the release (Ultimate) straight through him and up into the sky; then the fusion runs out (Blue
 *                        burns through the Potara) and the smoke clears on him still standing (episode 66: he survives)
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.trunksKit;
  const PZ = SL.data.poses;
  const VK = () => SL.data.vegitoKit;
  const CHAPTER = 'CHAPTER 19 · FUTURE TRUNKS';
  // firstFloor: where the opening exchange in the sky ends (of his bar); zamasuFloor: where the second one does
  const TU = {
    firstFloor: 0.65, zamasuFloor: 0.35, vegitoFloor: 0.25, zamasuTaken: 0.45, zamasuDealt: 0.75,
    // ponytail: provisional (2026-10-19) — FIGHT 2's heavier god: storyArmor 1 (light blows do not stop him), 0.85 of his
    // speed, a little bigger; judgment every `every` frames after `first` (three telegraphed columns at Vegito, then a
    // recovery that is the punish window). The owner judges the numbers
    bulk: { armor: 1, move: 0.85, size: 1.1, sizeMax: 1.22, first: 240, every: 480 },
    // the Spirit Sword exchange: his wind-up, the lunge, its last 'window' frames the prompt's; after 'tries' misses the
    // counter comes anyway (the story's)
    sword: { wind: 30, lunge: 48, window: 30, tries: 3 },
    // ponytail: provisional (2026-10-19) — ASSAULT: he toys with them (his floor 70 %, a fifth of their damage, half
    // his own); the bird (24,000 — two Blue Saiyans took a 6,000 one down in 2.4 s; a mark every ~3.5 s, the bolt 0.8 s
    // later); the blades of judgment every ~6 s
    assault: { fzFloor: 0.7, fzTaken: 0.2, fzDealt: 0.5, heroFloor: 0.3, birdHp: 24000, birdLift: 7, boltFirst: 150, boltEvery: 210, boltDelay: 48, boltR: 2.4, boltDamage: 700, judgeFirst: 240, judgeEvery: 380 },
    // the Kamehameha against the gigantic Holy Wrath: pushed back the first 1.6 s whatever is pressed, then through it
    kame: { seconds: 6, pushedBack: 1.6, drain: 0.32 },
    // the Final Kamehameha's charge: fills on its own at 'fill' a second, faster with presses; 'seconds' at most
    finalCharge: { seconds: 5, fill: 0.12 },
  };
  const SPOT = { goku: [-1.6, -6], vegeta: [1.6, -6], black: [-2, 9], zamasu: [2, 9] };
  const at = (b, k, lift = 0) => K.ground(b, new V3(SPOT[k][0], 0, SPOT[k][1]), lift);
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const BLUE = 0x2a8cff, GOLD = 0xffd84a;
  // the scene's Final Kamehameha (Vegito Blue's colours): a real beam that ends on him and does no damage of its own
  const FINAL_KAME = {
    id: 'finalKameVegito', name: 'Final Kamehameha', type: 'beam', damage: [0, 0], radius: [2.4, 2.4], speed: 100, range: 160, sustain: 120,
    color: BLUE, core: 0xfff2b0, style: { rings: 3, ringColor: 0xbfe8ff, ringSpeed: 2 },
  };

  function setup(b) {
    const S = (b.story = {});
    S.goku = b.spawn({ charId: 'goku', team: 0, player: true, pos: at(b, 'goku'), startKi: 100 });
    S.vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(b, 'vegeta'), startKi: 100 });
    S.black = b.spawn({ charId: 'goku_black', team: 1, pos: at(b, 'black'), startKi: 100 });
    S.zamasu = b.spawn({ charId: 'zamasu', team: 1, pos: at(b, 'zamasu'), startKi: 100 });
    // Trunks: only for the Father-Son Galick Gun (episode65); out of the fight and out of sight everywhere else
    S.trunks = b.spawn({ charId: 'future_trunks', team: 0, pos: K.ground(b, new V3(5, 0, -8)), startKi: 100 });
    for (const f of Object.values(S)) f.cannotDie = true;
    for (const f of [S.goku, S.vegeta]) K.faceTo(f, S.black.pos);
    for (const f of [S.black, S.zamasu]) K.faceTo(f, S.goku.pos);
    S.vegeta.controller = K.scripted();
    return S;
  }

  function stage(m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    const tr = b.story && b.story.trunks;
    if (tr) {
      tr.controller = K.scripted();
      tr.untargetable = tr.intangible = true;
      tr.setHidden(true);
    }
  }

  /** Both fusions, made (or found) — watched or skipped, the same state. */
  function fuseZamasu(m) {
    const b = m.battle, S = b.story;
    if (S.fz) return S.fz;
    for (const f of [S.black, S.zamasu]) VK().earOff(f);
    S.fzHandle = SL.Fusion.fuse(b, S.black, S.zamasu, 'fused_zamasu', { silent: true, hpFrac: 1, seconds: 0 });
    S.fz = S.fzHandle.fused;
    S.fz.cannotDie = true;
    S.fz.controller = K.scripted();
    return S.fz;
  }
  function fuseVegito(m) {
    const b = m.battle, S = b.story;
    if (S.vegito) return S.vegito;
    for (const f of [S.goku, S.vegeta]) VK().earOff(f);
    // born in his base form; the mission stages his Blue (blueChange) — a checkpoint restart lands in Blue (P.fight)
    S.vgHandle = SL.Fusion.fuse(b, S.goku, S.vegeta, 'vegito', { silent: true, hpFrac: 1, seconds: 0 });
    S.vegito = S.vgHandle.fused;
    S.vegito.cannotDie = true;
    S.vegito._playerController = S.vegito.controller; // the fusion took the player's seat
    S.vegito.controller = K.scripted();
    return S.vegito;
  }

  const flat = (v) => v.clone().setY(0).normalize();
  // Trunks fires the Galick Gun in his father's own stance (the same rig: Vegeta's poses, shared)
  PZ.ft_galickCharge = PZ.ft_galickCharge || SL.data.characters.vegeta.poses.v_galickCharge;
  PZ.ft_galickFire = PZ.ft_galickFire || SL.data.characters.vegeta.poses.v_galickFire;
  // the scene's beams (real beams that end on him and do no damage of their own; the story does)
  const GALICK = (id) => ({
    id, name: 'Galick Gun', type: 'beam', damage: [0, 0], radius: [1, 1], speed: 96, range: 120, sustain: 160,
    color: 0xb44dff, core: 0xf3dcff, style: { rings: 3, ringColor: 0xe0b0ff, ringSpeed: 1.6 },
  });
  const FULL_KAME = {
    id: 'fullPowerKame', name: 'Kamehameha', type: 'beam', damage: [0, 0], radius: [1.3, 1.3], speed: 100, range: 120, sustain: 160,
    color: 0x3fb2ff, core: 0xe8f8ff, style: { rings: 4, ringColor: 0xc8ecff, ringSpeed: 1.3 },
  };
  /** Pose a fighter and hold the aura at k (a scripted state's sd.aura). */
  const poseAura = (f, pose, face, speed, k) => {
    K.pose(f, pose, face, speed);
    f.sd.aura = k;
  };

  /**
   * THE TURN, EPISODES 65–66 (2026-10-19; documentation/FUSED_ZAMASU_EPISODES_64_67.md beats 7–11, from the Kanzenshuu
   * episode guides — the order and the outcomes are the source's; every shot, pose and line is the mission's own):
   * Trunks arrives, blue-tinged (Super Saiyan Rage), and fires the Galick Gun with his father — it overwhelms the god's
   * Holy Wrath but does not harm him; the Blades of Judgement rain down and Vegeta shields his son, his armour shattering;
   * a gigantic Holy Wrath, and Goku's Kamehameha against it — pushed back, then through it at full power (a struggle:
   * the effort is the player's, the outcome the story's); the blast scars him — the right side of his face and his right
   * arm swollen and purple; Goku closes in, the god grabs his leg — Kaioken — and the ring of light behind him shatters;
   * Goku spent. Skip-safe: a skip lands on that last state.
   */
  function* episode65(m, g, v, tr, fz) {
    const b = m.battle;
    const st = SL.data.u6Kit.staged(m);
    const PURPLE = 0xb44dff, KAME = FULL_KAME.color, RED = 0xff3a5a;
    const mid0 = K.ground(b, g.pos.clone().lerp(v.pos, 0.5));
    const fw = flat(fz.pos.clone().sub(mid0)), right = new V3(-fw.z, 0, fw.x);
    const G0 = K.ground(b, mid0.clone().addScaledVector(right, 1.8));
    const V0 = K.ground(b, mid0.clone().addScaledVector(right, -0.9));
    const T0 = K.ground(b, mid0.clone().addScaledVector(right, -2.4));
    for (const [f, p] of [[g, G0], [v, V0]]) {
      f.grounded = true;
      K.place(f, p, 0);
      K.faceTo(f, fz.pos);
    }
    K.faceTo(fz, mid0);
    poseAura(g, 'defeatKneel', 'grit', 8, 0.2);
    poseAura(v, 'defeatKneel', 'angry', 8, 0.2);
    // Trunks, blue-tinged — Super Saiyan Rage (the episode: "a blue-tinged Super Saiyan form") — at his father's side
    K.toForm(tr, 'rage');
    K.sheathe(tr, true);
    tr.setHidden(false);
    tr.grounded = true;
    K.place(tr, T0, 0);
    K.faceTo(tr, fz.pos);
    if (!b.skipRequested) {
      b.vfx.afterimage(tr.pos, tr.height, 0x8ad4ff);
      b.sfx('dash', tr);
    }
    poseAura(tr, 'ft_ready', 'angry', 10, 0.6);
    shot(m, { vegeta: v, trunks: tr }, { subject: 'trunks', with: 'vegeta', focus: 'medium', angle: 'three' }, 999);
    m.say('future_trunks', 'This world belongs to the people living in it — not to you!', 2.6, { style: 'shout' });
    yield* st.wait(2.6);
    m.flags.trunksJoins = tr.form.id === 'rage';
    // the god's Holy Wrath raised over him; the Galick Gun, father and son, into it
    const sun = makeSun(m);
    const over = () => fz.chest().add(new V3(0, 3, 0));
    K.pose(fz, 'fz2_raise', 'wicked', 8);
    poseAura(v, 'v_galickCharge', 'shout', 10, 1);
    poseAura(tr, 'ft_galickCharge', 'shout', 10, 1);
    m.shot((t, o) => K.camAt(o, mid0.clone().addScaledVector(fw, -4.8).addScaledVector(right, -1.2).add(new V3(0, 0.8, 0)), fz.chest().lerp(mid0, 0.3).add(new V3(0, 1.2, 0)), 56), 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Together, Trunks — GALICK GUN!', 1.8, { style: 'shout' });
    {
      let n = 0;
      yield () => {
        n++;
        sun.set(over(), 0.3 + Math.min(1, n / 60) * 1.9);
        return n >= 60 || b.skipRequested;
      };
    }
    poseAura(v, 'v_galickFire', 'shout', 30, 1);
    poseAura(tr, 'ft_galickFire', 'shout', 30, 1);
    const beams = [];
    if (!b.skipRequested) {
      fz.intangible = true;
      for (const [f, spec] of [[v, GALICK('fatherSonGalickV')], [tr, GALICK('fatherSonGalickT')]]) {
        const ctx = { b, m };
        SL.Cinema.beam(ctx, f, fz, spec);
        const pin = () => SL.Cinema.pinBeam(ctx, 0xe0b0ff);
        m.tickHooks.push(pin);
        beams.push({ ctx, pin });
      }
      b.sfx('beamFire', v, { vol: 1.3, pitch: 0.8 });
      b.cameraTraumaAt(mid0, 0.6);
    }
    m.flags.beams = beams.length;
    // the two beams drive the sun back into him
    {
      let n = 0;
      const from = over();
      yield () => {
        n++;
        sun.set(from.clone().lerp(fz.chest(), Math.min(1, n / 70)), 2.2 - Math.min(1, n / 70) * 0.8);
        return n >= 70 || b.skipRequested;
      };
    }
    for (const x of beams) {
      K.removeHook(m, x.pin);
      if (x.ctx.beam && !x.ctx.beam.done) x.ctx.beam.dispose();
    }
    sun.dispose();
    fz.intangible = false;
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.25, '#ece0ff');
      b.vfx.explosion(fz.chest(), 4, 0xd8c8ff, { smoke: true });
      b.sfx('explosionHuge', fz, { vol: 1.1 });
      b.cameraTraumaAt(fz.chest(), 0.7);
    }
    m.flags.galick = true;
    yield* st.wait(1);
    // the smoke clears on him unharmed (the episode: it overwhelms the Holy Wrath "but does not harm him")
    K.pose(fz, 'zm_idle', 'wicked', 6);
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'low' }, 999);
    m.say('fused_zamasu', 'Father and son, side by side. Touching — and useless.', 2.6);
    yield* st.wait(2.6);
    m.flags.unharmed = true;
    // the Blades of Judgement: Vegeta steps in front of his son and takes them
    K.pose(fz, 'fz2_raise', 'shout', 12);
    const shield = K.ground(b, tr.pos.clone().addScaledVector(fw, 1.4));
    if (!b.skipRequested) b.vfx.afterimage(v.pos, v.height, 0x4ad8ff);
    K.place(v, shield, 0);
    K.faceTo(v, fz.pos);
    poseAura(v, 'v_forearmBlock', 'grit', 20, 1);
    poseAura(tr, 'ft_kneel', 'shock', 10, 0.3);
    m.shot((t, o) => K.camAt(o, shield.clone().addScaledVector(right, -5).addScaledVector(fw, -2).add(new V3(0, 1.6, 0)), shield.clone().add(new V3(0, 1.3, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegeta', 'Stay behind me, Trunks!', 1.6, { style: 'shout' });
    {
      let n = 0;
      yield () => {
        n++;
        if (!b.skipRequested && n % 6 === 0) {
          const hit = v.chest().add(new V3(U.rand(-0.4, 0.4), U.rand(-0.3, 0.6), 0)).addScaledVector(fw, 0.3);
          b.vfx.slash(hit.clone().add(new V3(U.rand(-3, 3), 18, 0)).addScaledVector(fw, 6), hit, RED, 0.16, 0.18);
          b.vfx.impact(hit, 1.4, RED);
          b.sfx('punchLight', v, { vol: 0.6, pitch: 0.8 });
          if (n % 12 === 0) b.vfx.debrisBurst(v.chest(), 4, 0xe8e4d8, 5, 0.1);
        }
        return n >= 70 || b.skipRequested;
      };
    }
    poseAura(v, 'exhausted', 'grit', 8, 0.2);
    m.say('future_trunks', 'Father!', 1.2, { style: 'shout' });
    m.flags.shielded = true;
    yield* st.wait(1.2);
    // the gigantic Holy Wrath — and Goku's Kamehameha against it
    const big = makeSun(m);
    const top = fz.chest().add(new V3(0, 6, 0));
    K.pose(fz, 'fz2_raise', 'wicked', 10);
    poseAura(g, 'g_kameCharge', 'shout', 10, 1);
    m.shot((t, o) => K.camAt(o, mid0.clone().addScaledVector(fw, -9).addScaledVector(right, 7).add(new V3(0, 3.5, 0)), mid0.clone().lerp(top, 0.55), 58), 999, { cut: true, blendIn: 0, hold: true });
    m.say('fused_zamasu', 'Enough. Be erased — mortals and Saiyans alike!', 2.4, { style: 'shout' });
    {
      let n = 0;
      yield () => {
        n++;
        big.set(top, 0.5 + Math.min(1, n / 70) * 5);
        return n >= 70 || b.skipRequested;
      };
    }
    m.say('goku', 'I won\'t give up — not ever! KAMEHAMEHAAA!', 2.2, { style: 'shout' });
    poseAura(g, 'g_kameFire', 'shout', 30, 1);
    const ctx = { b, m };
    let pin = null;
    if (!b.skipRequested) {
      fz.intangible = true;
      SL.Cinema.beam(ctx, g, fz, FULL_KAME);
      pin = () => SL.Cinema.pinBeam(ctx, 0xc8ecff);
      m.tickHooks.push(pin);
      b.sfx('beamFire', g, { vol: 1.3 });
    }
    // pushed back for a while, then through it at full power (the episode): the presses decide how fast, not whether
    const gHands = () => g.handPos('L').lerp(g.handPos('R'), 0.5);
    const near = () => gHands().lerp(top, 0.3);
    m.shot((t, o) => {
      const c = g.chest();
      K.camAt(o, c.clone().addScaledVector(right, 3.2).addScaledVector(fw, -2.6).add(new V3(0, 0.9, 0)), c.clone().lerp(big.pos, 0.45), 54);
    }, 999, { cut: true, blendIn: 0, hold: true });
    const T = TU.kame;
    const r = yield* m.struggle({
      start: 0.45, drain: T.drain, duration: T.seconds, label: 'Push through it! (mash)',
      until: (t, grip) => t > T.pushedBack && grip >= 0.97,
      // the first stretch the ball drives him back whatever he does
      override: (t, grip) => (t < T.pushedBack ? Math.max(0.12, 0.45 - (t / T.pushedBack) * 0.33) : undefined),
      onTick: (t, grip) => {
        big.set(near().lerp(top, grip), 5.5 - grip);
        if (!b.skipRequested && Math.floor(t * 60) % 8 === 0) b.vfx.ring(gHands().lerp(big.pos, 0.5), 1.6, 0x9ad8ff, 0.3, fw.clone());
        b.cameraTraumaAt(g.chest(), 0.05);
      },
    });
    m.qteParts.push(U.clamp01(r.avg * 1.3));
    m.flags.kameStruggle = true;
    if (pin) K.removeHook(m, pin);
    if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
    big.dispose();
    fz.intangible = false;
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.35, '#e8f6ff');
      b.vfx.explosion(fz.chest(), 5, 0xc8ecff, { smoke: true });
      b.vfx.ring(fz.chest(), 12, 0xffffff, 0.6, fw.clone());
      b.sfx('explosionHuge', fz, { vol: 1.2 });
      b.cameraTraumaAt(fz.chest(), 0.9);
    }
    m.flags.pierced = true;
    m.flags.fullPower = true;
    m.flags.blast = true;
    yield* st.wait(1.2);
    // the scar: the right side of his face and his right arm swollen and purple (the episode) — the growths from here on
    mutatedArm(fz, true);
    K.pose(fz, 'zm_shaken', 'hurt', 8);
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'low' }, 999);
    m.say('fused_zamasu', 'Pain...? This mortal half of me can still be hurt?', 2.8, { style: 'quiet' });
    yield* st.wait(2.8);
    m.flags.mortalSide = true;
    m.flags.swollen = true;
    // Goku closes in; the god catches his leg; Kaioken
    const grabAt = K.ground(b, fz.pos.clone().addScaledVector(fw, -1.3));
    if (!b.skipRequested) b.vfx.afterimage(g.pos, g.height, 0x4ad8ff);
    K.place(g, grabAt, 0);
    K.faceTo(g, fz.pos);
    poseAura(g, 'g_kick', 'shout', 30, 1);
    K.pose(fz, 'grab', 'wicked', 30);
    m.shot((t, o) => K.camAt(o, grabAt.clone().lerp(fz.pos, 0.5).addScaledVector(right, 4.4).add(new V3(0, 1.3, 0)), grabAt.clone().lerp(fz.pos, 0.5).add(new V3(0, 1, 0)), 48), 999, { cut: true, blendIn: 0, hold: true });
    m.say('fused_zamasu', 'Caught you.', 1.2);
    m.flags.legGrab = true;
    yield* st.wait(1.2);
    K.toForm(g, 'blueKaioken');
    poseAura(g, 'g_kaiokenFlex', 'shout', 20, 1);
    shot(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'low' }, 999);
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.15, '#ffd4d4');
      b.vfx.ring(g.chest(), 3, 0xff3a3a, 0.4);
      b.sfx('kaiokenBoom', g, { vol: 1 });
    }
    m.say('goku', 'Kaioken — everything I\'ve got!', 1.8, { style: 'shout' });
    yield* st.wait(1.8);
    m.flags.kaioken = g.form.id === 'blueKaioken';
    // free, the blur to his back, and the fist through the ring of light behind his shoulders: it shatters
    const halo = fz.chest();
    if (fz.model && fz.model.props && fz.model.props.halo) fz.model.props.halo.getWorldPosition(halo);
    const back = flat(fz.forward).negate(), hs = new V3(back.z, 0, -back.x);
    if (!b.skipRequested) b.vfx.afterimage(g.pos, g.height, 0xff6a5a);
    K.place(g, K.ground(b, fz.pos.clone().addScaledVector(back, 1.5)), 0);
    K.faceTo(g, fz.pos);
    poseAura(g, 'punchR', 'shout', 40, 1);
    K.pose(fz, 'hitBack', 'shock', 30);
    m.shot((t, o) => K.camAt(o, halo.clone().addScaledVector(hs, 3.6).addScaledVector(back, 1.4).add(new V3(0, 0.2, 0)), halo, 48), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.25, '#fff0f8');
      b.vfx.sparks(halo, 0xfff2fa, 30, 10, 0.14);
      b.vfx.sparks(halo, 0xffb8e0, 20, 7, 0.12);
      for (let i = 0; i < 14; i++) b.vfx.rock(halo, new V3(U.rand(-1, 1), U.rand(-0.5, 1), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(4, 9)), U.rand(0.05, 0.1), 0xffe8f6);
      b.vfx.ring(halo, 4, 0xffffff, 0.5, back.clone());
      b.sfx('warpShatter', fz, { vol: 1 });
      b.sfx('punchHeavy', g, { vol: 1.2 });
      b.cameraTraumaAt(halo, 0.6);
    }
    if (fz.model && fz.model.setPropVisible) fz.model.setPropVisible('halo', false);
    m.flags.haloBroken = true;
    yield* st.wait(1);
    // spent: back at Vegeta's side out of Kaioken, down on one knee; Trunks drawn back
    if (!b.skipRequested) b.vfx.afterimage(g.pos, g.height, 0xff6a5a);
    K.toForm(g, 'blue');
    K.place(g, K.ground(b, mid0.clone().addScaledVector(right, 0.9)), 0);
    K.place(v, K.ground(b, mid0.clone().addScaledVector(right, -0.9)), 0);
    for (const f of [g, v]) K.faceTo(f, fz.pos);
    poseAura(g, 'defeatKneel', 'grit', 8, 0.15);
    poseAura(v, 'exhausted', 'grit', 8, 0.15);
    K.place(tr, K.ground(b, mid0.clone().addScaledVector(right, -3.8).addScaledVector(fw, -3)), 0);
    K.faceTo(tr, fz.pos);
    poseAura(tr, 'ft_kneel', 'hurt', 8, 0);
    K.faceTo(fz, mid0);
    K.pose(fz, 'zm_idle', 'angry', 6);
    m.shot((t, o) => K.camAt(o, mid0.clone().addScaledVector(fw, -4.6).addScaledVector(right, 2.2).add(new V3(0, 1.2, 0)), fz.chest().lerp(mid0, 0.6), 52), 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Hah... hah... even that... wasn\'t enough...', 2.4, { style: 'quiet' });
    yield* st.wait(2.4);
    m.flags.drained = g.form.id === 'blue';
  }

  /** A Holy Wrath: an orange sun of light (set(pos, scale), dispose()); disposed with the mission. */
  function makeSun(m) {
    const b = m.battle;
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: 0.9, depthWrite: false }));
    b.scene.add(sun);
    let gone = false;
    const api = {
      pos: sun.position,
      set(p, s) {
        sun.position.copy(p);
        sun.scale.setScalar(s);
        if (!b.skipRequested && b.frame % 8 === 0) b.vfx.flash(p, s * 1.2, 0xffb07a, 0.12, SL.Toon.tex.glow);
      },
      dispose() {
        if (gone) return;
        gone = true;
        b.scene.remove(sun);
        sun.geometry.dispose();
        sun.material.dispose();
      },
    };
    m.onDispose(api.dispose);
    return api;
  }

  /**
   * THE LIGHTNING BIRD (episode 65, beat 5: the Lightning of Absolution — "a bird-like creature of energy" over him
   * firing lightning). A Level 1 prop of the mission's own: a body and two wings of yellow-white light flapping over the
   * god, and a stage prop under it (hp TU.assault.birdHp: blows and blasts reach it, the lock-on too); every so often a
   * mark on the ground under one of them, then lightning down on it. Returns { prop, off() }.
   */
  function lightningBird(m, fz, heroes) {
    const b = m.battle, A = TU.assault, COL = 0xfff07a;
    const add = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), add(COL, 0.8));
    body.scale.set(0.9, 0.7, 1.8);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 10), add(0xffffff, 0.9));
    head.rotation.x = Math.PI / 2;
    head.position.z = 2;
    g.add(body, head);
    const wings = [-1, 1].map((s) => {
      const w = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5, 3), add(COL, 0.6));
      w.rotation.z = (s * Math.PI) / 2;
      w.position.x = s * 2.6;
      w.scale.set(1, 1, 0.25);
      const pivot = new THREE.Group();
      pivot.add(w);
      g.add(pivot);
      return pivot;
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.6, 3), add(COL, 0.6));
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -2.4;
    g.add(tail);
    const spot = () => fz.pos.clone().add(new V3(0, A.birdLift, 0));
    const pr = b.stage.addProp({ kind: 'lightningBird', pos: spot(), r: 2.6, hp: A.birdHp, id: 'lightningBird' });
    pr.lockable = true;
    pr.name = 'Lightning Bird';
    pr.explodeColor = COL;
    pr.debrisColor = 0xfff8d0;
    pr.group.add(g);
    let n = 0, wait = A.boltFirst, mark = null, gone = false;
    const hook = () => {
      if (gone) return;
      n++;
      if (!pr.alive) return api.off();
      pr.pos.lerp(spot(), 0.03);
      pr.group.position.copy(pr.pos);
      g.rotation.y = n * 0.01;
      for (const [i, w] of wings.entries()) w.rotation.z = Math.sin(n * 0.18) * 0.5 * (i ? -1 : 1);
      if (!b.skipRequested && n % 6 === 0) b.vfx.bolt(pr.pos.clone().add(new V3(U.rand(-2, 2), U.rand(-1, 1), U.rand(-2, 2))), 1.2, COL);
      // the lightning: a mark on the ground under one of them, then the bolt
      if (mark) {
        mark.t++;
        if (mark.t % 6 === 0) b.vfx.ring(mark.at.clone().add(new V3(0, 0.1, 0)), A.boltR, COL, 0.25, new V3(0, 1, 0));
        if (mark.t >= A.boltDelay) {
          const top = pr.pos.clone();
          for (let i = 0; i < 3; i++) b.vfx.slash(top, mark.at.clone().add(new V3(U.rand(-0.3, 0.3), 0, U.rand(-0.3, 0.3))), i ? COL : 0xffffff, 0.2, 0.22);
          b.vfx.flash(mark.at.clone().add(new V3(0, 0.6, 0)), 3, COL, 0.2, SL.Toon.tex.glow);
          b.sfx('kiBlastBig', null, { at: mark.at, vol: 0.8, pitch: 1.4 });
          for (const h of heroes) {
            if (!h.alive || h.hidden || h.state === 'rush') continue;
            if (Math.hypot(h.pos.x - mark.at.x, h.pos.z - mark.at.z) < A.boltR + h.radius && h.pos.y - mark.at.y < 6) {
              h.takeHit(fz, { type: 'ki', damage: A.boltDamage, knock: 'launch', knockSpeed: 18, hitstun: 36, impact: 3, dir: new V3(0, 1, 0), point: h.chest() });
            }
          }
          b.emit('birdBolt', { at: mark.at });
          mark = null;
          wait = A.boltEvery;
        }
        return;
      }
      if (--wait > 0) return;
      const live = heroes.filter((h) => h.alive && !h.hidden && h.state !== 'rush');
      if (!live.length) return;
      const h = live[n % live.length];
      mark = { at: K.ground(b, h.pos.clone()), t: 0 };
      b.emit('telegraph', { pos: mark.at.clone(), radius: A.boltR, frames: A.boltDelay });
    };
    m.tickHooks.push(hook);
    const api = {
      prop: pr,
      off() {
        if (gone) return;
        gone = true;
        K.removeHook(m, hook);
        if (pr.group && pr.group.parent) pr.group.parent.remove(pr.group);
        pr.alive = false;
        g.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
      },
    };
    m.onDispose(api.off);
    return api;
  }

  /**
   * THE SAIYAN ASSAULT, STORY CUT (episode 65 beat 6; the blows are an adaptation, see goku.js 'saiyanAssault'): the
   * Free Battle team rush's own blows, real hits with real reactions and its slowed key impacts, minus its finale — here
   * the last double blow is the god's to catch (catchAndThrow). Started on the player's cue; returns the rush spec.
   */
  function assaultSpec() {
    const sp = SL.data.characters.goku.extras.find((x) => x.id === 'saiyanAssault');
    return Object.assign({}, sp, { hits: sp.hits.slice(0, -1), kiCost: 0, cine: null });
  }

  /** The lens through the assault: side-on to the line between the two Saiyans, all three in it; closer on a slowed blow. */
  function assaultCam(m, g, v, fz) {
    let close = 0;
    const off = m.battle.on('rushSlow', (e) => {
      if (e.fighter === g) close = Math.round(e.scale < 0.25 ? 50 : 32);
    });
    m.shot((t, o) => {
      // all three in it: aimed at the middle of their chests (Goku over him for the axe kick included)
      const cg = g.chest(), cv = v.chest();
      const c = cg.clone().add(cv).add(fz.chest()).multiplyScalar(1 / 3);
      const axis = g.pos.clone().sub(v.pos).setY(0);
      if (axis.lengthSq() < 0.01) axis.set(1, 0, 0);
      axis.normalize();
      const side = new V3(-axis.z, 0, axis.x);
      const spread = Math.max(2.5, cg.distanceTo(cv));
      const d = close > 0 ? Math.max(4.2, spread * 1.7) : Math.max(7.5, spread * 1.8);
      if (close > 0) close--;
      c.y += 0.3; // heads in, not feet
      K.camAt(o, c.clone().addScaledVector(side, d).add(new V3(0, close > 0 ? 0.2 : 1.2, 0)), c, close > 0 ? 44 : 52);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.onDispose(off);
    return off;
  }

  /**
   * THE LAST BLOW CAUGHT (episode 65 beat 6: "he blocks them easily and knocks them down"): both at him at once from
   * either side, the fist and the kick — slowed — and his open hands stop both; one flare of his light throws them into
   * the rubble. Skip-safe: a skip lands them on one knee where they were thrown.
   */
  function* catchAndThrow(m, g, v, fz) {
    const b = m.battle;
    const st = SL.data.u6Kit.staged(m);
    const CYAN = 0x4ad8ff;
    for (const f of [g, v, fz]) {
      f.controller = K.scripted();
      f.vel.set(0, 0, 0);
    }
    const c = fz.pos.clone();
    const axis = flat(g.pos.clone().sub(fz.pos).lengthSq() > 0.01 ? g.pos.clone().sub(fz.pos) : new V3(1, 0, 0));
    const side = new V3(-axis.z, 0, axis.x);
    const G1 = c.clone().addScaledVector(axis, 1.3), V1 = c.clone().addScaledVector(axis, -1.3);
    for (const [f, p] of [[g, G1], [v, V1]]) {
      f.setPosition(p);
      f.grounded = fz.grounded;
      K.faceTo(f, fz.pos);
    }
    fz.yaw = fz.prevYaw = Math.atan2(side.x, side.z);
    poseAura(g, 'g_cross', 'shout', 40, 1);
    poseAura(v, 'v_atomicKick', 'shout', 40, 1);
    K.pose(fz, 'fz2_catchBoth', 'wicked', 40);
    m.shot((t, o) => K.camAt(o, fz.chest().addScaledVector(side, 6).add(new V3(0, 0.5, 0)), fz.chest(), 46), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      b.slowmo(0.2, 0.8);
      SL.ScreenFX.flash(0.2, '#dff6ff');
      b.vfx.impact(g.handPos('R'), 2.4, CYAN);
      b.vfx.impact(v.chest().addScaledVector(axis, 0.6), 2.4, CYAN);
      b.vfx.ring(fz.chest(), 5, 0xffffff, 0.4, axis.clone());
      b.sfx('block', fz, { vol: 1.2, pitch: 0.7 });
      b.cameraTraumaAt(fz.chest(), 0.4);
    }
    m.flags.blocked = true; // both blows caught (the episode: "he blocks them easily")
    yield* st.wait(1);
    m.say('fused_zamasu', 'Is that all two mortals can do together?', 2.4, { style: 'quiet' });
    yield* st.wait(2.2);
    // one flare of his light: both thrown out into the rubble
    K.pose(fz, 'zm_light', 'wicked', 30);
    const G2 = K.ground(b, c.clone().addScaledVector(axis, 7.5)), V2 = K.ground(b, c.clone().addScaledVector(axis, -7.5));
    poseAura(g, 'tumble', 'hurt', 30, 0.2);
    poseAura(v, 'tumble', 'hurt', 30, 0.2);
    m.shot((t, o) => K.camAt(o, c.clone().addScaledVector(side, 13).add(new V3(0, 2.6, 0)), c.clone().add(new V3(0, 1, 0)), 56), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      SL.ScreenFX.flash(0.3, '#fff0f8');
      b.vfx.explosion(fz.chest(), 2.2, 0xffd8f0, { smoke: false });
      b.sfx('explosionHuge', fz, { vol: 1 });
      b.cameraTraumaAt(fz.chest(), 0.7);
    }
    {
      const a = [g.pos.clone(), v.pos.clone()];
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 30));
        [[g, a[0], G2], [v, a[1], V2]].forEach(([f, p0, p1]) => {
          f.grounded = false;
          f.vel.set(0, 0, 0);
          f.setPosition(p0.clone().lerp(p1, k).add(new V3(0, Math.sin(k * Math.PI) * 1.6, 0)));
        });
        return k >= 1;
      };
    }
    for (const [f, p, pose] of [[g, G2, 'lieBack'], [v, V2, 'knockdownFace']]) {
      f.grounded = true;
      K.place(f, p, 0);
      K.faceTo(f, fz.pos);
      poseAura(f, pose, 'hurt', 12, 0);
      if (!b.skipRequested) {
        b.stage.crater(p.clone(), 1.8, 0.4, f);
        b.vfx.dust(p.clone(), 1.5, 8);
      }
    }
    if (!b.skipRequested) b.sfx('groundImpact', g, { vol: 1 });
    m.flags.thrown = true;
    yield* st.wait(1.2);
    poseAura(g, 'defeatKneel', 'grit', 8, 0.25);
    poseAura(v, 'defeatKneel', 'angry', 8, 0.25);
    yield* st.wait(0.6);
  }

  /** Hold a body where the story puts it (in the air too) until released. Returns { release(), to(v), at }. */
  function pinAt(m, f, where) {
    const p = where.clone();
    const hook = () => {
      f.grounded = false;
      f.vel.set(0, 0, 0);
      f.setPosition(p);
    };
    hook();
    m.tickHooks.push(hook);
    const release = () => K.removeHook(m, hook);
    m.onDispose(release);
    return { release, to: (v) => p.copy(v), at: p };
  }

  /**
   * A cue answered by the body the player has now (the fusion took the player's seat; a scene keeps that body scripted
   * in between): its own controller for the length of the cue, scripted again after. Never pressed by a skip; it goes
   * ahead on its own after opts.auto seconds (mission.cue).
   */
  function* playerCue(m, f, key, label, opts) {
    const keep = f.controller;
    if (f._playerController) f.controller = f._playerController;
    const r = yield* SL.data.u6Kit.staged(m).cue(key, label, opts || {});
    f.controller = keep;
    (m.flags.cues = m.flags.cues || []).push(key + (r && r.pressed ? '' : ':auto'));
    return r;
  }

  /** The arm the Light of Divine Justice swells: the Half-Corrupted form's growths on the right arm, shown in his base form. */
  function mutatedArm(fz, on) {
    const md = fz && fz.model;
    if (!md || !md.props || !md.setPropVisible) return;
    for (const id of Object.keys(md.props)) if (/^goo/.test(id)) md.setPropVisible(id, on);
  }

  /**
   * THE LIGHT OF DIVINE JUSTICE (2026-10-19, the owner's overnight brief: the line "Light of divine justice, strike at
   * me now!" is missing). Not in the Goku Black research PDF; checked against outside sources (an episode recap: after
   * Goku's Kamehameha and Kaioken, "Zamasu powers up, drawing purple lightning", and only then do they agree to fuse;
   * the fan wikis: he calls the Light of Divine Justice down on himself, his arm swelling and his power with it, which
   * is what pushes Goku and Vegeta into the Potara). The line is the owner's wording. THE STAGING IS THE MISSION'S OWN:
   * the right arm raised to the sky, pink lightning striking it again and again, the growths spreading on it (the
   * Half-Corrupted form's arm, shown from here on), the surge. Skip-safe: a skip lands with the arm swollen.
   */
  function* lightOfJustice(m, fz, g, v) {
    const b = m.battle;
    const st = SL.data.u6Kit.staged(m);
    const PINK = 0xff5ac8;
    K.faceTo(fz, g.pos.clone().lerp(v.pos, 0.5));
    K.pose(fz, 'gb_rise', 'wicked', 10);
    // low in front of him, looking up past the raised arm into the sky
    const fw = flat(g.pos.clone().lerp(v.pos, 0.5).sub(fz.pos)), side = new V3(fw.z, 0, -fw.x);
    m.shot((t, o) => K.camAt(o, K.ground(b, fz.pos.clone()).addScaledVector(fw, 5).addScaledVector(side, 1.8).add(new V3(0, 0.4, 0)), fz.chest().add(new V3(0, 1.6, 0)), 54), 999, { cut: true, blendIn: 0, hold: true });
    m.say('fused_zamasu', 'Light of divine justice — strike at me now!', 2.6, { style: 'shout' });
    m.flags.divineJustice = true;
    yield* st.wait(1.4);
    {
      let n = 0;
      yield () => {
        n++;
        if (!b.skipRequested && n % 8 === 0) {
          const hand = fz.handPos('R');
          b.vfx.skyBolt(hand, 26, PINK);
          b.vfx.flash(hand, 1.4, PINK, 0.16, SL.Toon.tex.glow);
          b.vfx.sparks(hand, 0xffd0f0, 10, 7, 0.1);
          if (n % 16 === 0) b.sfx('lightning', fz, { vol: 1 });
          b.cameraTraumaAt(fz.chest(), 0.25);
        }
        if (n === 40) mutatedArm(fz, true);
        return n >= 72 || b.skipRequested;
      };
    }
    mutatedArm(fz, true);
    m.flags.armSwollen = true;
    // the surge: the arm down, a ring of his power over the street
    K.pose(fz, 'zm_idle', 'wicked', 6);
    if (!b.skipRequested) {
      b.vfx.ring(K.ground(b, fz.pos.clone()).add(new V3(0, 0.3, 0)), 14, PINK, 0.7, new V3(0, 1, 0));
      b.sfx('kaiokenBoom', fz, { vol: 1, pitch: 0.7 });
      b.cameraTraumaAt(fz.chest(), 0.5);
    }
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'three' }, 999);
    m.say('fused_zamasu', 'Feel it, mortals. A god\'s power only grows.', 2.4, { style: 'quiet' });
    yield* st.wait(2.4);
  }

  /**
   * VEGITO'S ENTRANCE (2026-10-19). Supported: the Potara, the light, Vegito, then his Blue at once (the research PDF, the
   * Gemini draft and an episode recap agree on that much). The owner's recollection, not found in any source available
   * here: he comes out of the light ABOVE the street, looking down at the god, and drops into the scene before the change.
   * Staged as the owner remembers it and marked so: high in the fading pillar, arms folded, chin down; from behind
   * Zamasu's shoulder, low, looking up at him (him high, the god low); then the drop and the landing. The "Alright" that
   * follows is the scene's own and is not touched.
   */
  function* vegitoEntrance(m, vg, fz, meet) {
    const b = m.battle;
    const st = SL.data.u6Kit.staged(m);
    const ground = K.ground(b, meet);
    const top = ground.clone().add(new V3(0, 7.5, 0));
    const hold = pinAt(m, vg, top);
    K.faceTo(vg, fz.pos);
    K.pose(vg, 'vg_overlook', 'cocky', 6);
    K.faceTo(fz, vg.pos);
    K.pose(fz, 'zm_idle', 'shock', 6);
    // the light breaks apart into glittering motes round him, up there (the Gemini draft's motes)
    if (!b.skipRequested) {
      b.vfx.sparks(vg.chest(), 0xdffaff, 60, 9, 0.6);
      b.vfx.sparks(vg.chest(), 0x8ae8ff, 40, 6, 0.8);
      b.vfx.ring(vg.chest(), 4, 0xdffaff, 0.5);
      m.flags.vegitoMotes = true;
    }
    const toV = flat(vg.pos.clone().sub(fz.pos)), side = new V3(toV.z, 0, -toV.x);
    // him high, the god low: from behind and below Zamasu's shoulder, up at the figure in the light
    m.shot((t, o, el) => {
      const k = U.easeInOutCubic(Math.min(1, el / 1.8));
      // narrowing as it settles on him (at 15 m he was a small figure in the pillar at a wide lens)
      K.camAt(o, fz.pos.clone().addScaledVector(toV, -2.4).addScaledVector(side, 1.1).add(new V3(0, 1.2, 0)), fz.headPos().lerp(vg.chest(), U.lerp(0.55, 0.92, k)), U.lerp(50, 30, k));
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.flags.vegitoAbove = vg.pos.y - fz.pos.y > 5;
    yield* st.wait(2);
    // the drop: down out of the light onto the street, the ground breaking where he lands
    hold.release();
    K.pose(vg, 'fall', 'cocky', 10);
    m.shot((t, o) => K.camAt(o, ground.clone().addScaledVector(side, 8.5).addScaledVector(toV, 1.5).add(new V3(0, 1.1, 0)), vg.chest(), 52), 999, { cut: true, blendIn: 0, hold: true });
    {
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeInCubic(Math.min(1, n / 22));
        vg.grounded = false;
        vg.vel.set(0, 0, 0);
        vg.setPosition(top.clone().lerp(ground, k));
        return k >= 1;
      };
    }
    vg.grounded = true;
    K.place(vg, ground, 0);
    K.faceTo(vg, fz.pos);
    K.pose(vg, 'land', 'cocky', 20);
    if (!b.skipRequested) {
      b.stage.crater(ground.clone(), 2, 0.3, vg);
      b.vfx.ring(ground.clone().add(new V3(0, 0.25, 0)), 6, 0xdff2ff, 0.5, new V3(0, 1, 0));
      // light dust: it must be gone before his "Alright" (a heavier cloud hazed that shot)
      b.vfx.dust(ground.clone(), 1.2, 5);
      b.sfx('groundImpact', vg, { vol: 1.1 });
      b.cameraTraumaAt(ground, 0.45);
    }
    m.flags.vegitoLanded = true;
    yield* st.wait(0.9);
  }

  /**
   * HIS BLUE (2026-10-19): the player's call — Transform — then the change through the shared staged transformation
   * (SL.data.cinematics.transform, the one Frieza's forms and Trunks' Rage use) with this scene's own anticipation: the
   * low crouch, the flame climbing from white, stones lifting, the lens rising with him; the engine's change and burst;
   * Zamasu's reaction (the witness); the smirk and his line. Skip-safe: lands in Blue.
   */
  function* blueChange(m, vg, fz) {
    const b = m.battle;
    const st = SL.data.u6Kit.staged(m);
    K.pose(vg, 'vg_settle', 'cocky', 6);
    m.shot((t, o) => K.camAt(o, vg.chest().add(new V3(Math.sin(vg.yaw + 0.6) * 3.6, 0.1, Math.cos(vg.yaw + 0.6) * 3.6)), vg.chest().add(new V3(0, 0.25, 0)), 44), 999, { cut: true, blendIn: 0, hold: true });
    const cue = yield* playerCue(m, vg, 'transform', 'Vegito Blue! (Transform)', { auto: 4 });
    m.flags.blueCue = !!(cue && cue.pressed);
    const toZ = flat(fz.pos.clone().sub(vg.pos)), side = new V3(toZ.z, 0, -toZ.x);
    const feet = () => K.ground(b, vg.pos.clone());
    yield* SL.data.cinematics.transform(m, {
      fighter: vg, formIndex: K.formIndex(vg, 'blue'), witness: fz, silent: true, music: 5, dust: false, rocks: false,
      witnessLine: 'That colour... a mortal shell wearing the light of a god?',
      hold: {
        pose: 'vg_power', expression: 'shout', speed: 8, seconds: 2.6, aura: [0.15, 0.85],
        // low in the street in front of him, the lens rising with the flame
        shot: (t, o, el) => K.camAt(o, feet().addScaledVector(toZ, 5.2).addScaledVector(side, 1.6).add(new V3(0, 0.35, 0)), vg.chest().add(new V3(0, U.lerp(0.1, 1.3, Math.min(1, el / 2.6)), 0)), 54),
        onFrame: (n, frames) => {
          if (n === 1) b.sfx('kiUp', vg, { vol: 1 });
          if (n === 30) b.stage.crater(feet(), 2.2, 0.15, null);
          if (n === Math.round(frames * 0.65)) b.sfx('ssjRise', vg, { vol: 0.9 });
          if (n % 7 === 0) b.vfx.ring(feet().add(new V3(0, 0.2, 0)), 1.4 + n / 50, n < frames / 2 ? 0xdff2ff : 0x8ad8ff, 0.4, new V3(0, 1, 0));
          if (n % 9 === 0) b.vfx.bolt(vg.chest().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.4, 1.2), U.rand(-0.6, 0.6))), 1.2, 0xffffff);
          // (beside and behind him only: one rising in front of the low lens filled the frame)
          if (n % 10 === 0) b.vfx.rock(feet().addScaledVector(side, U.rand(-2.5, 2.5)).addScaledVector(toZ, U.rand(-2.5, 0.5)).add(new V3(0, 0.1, 0)), new V3(0, U.rand(2, 4), 0), U.rand(0.08, 0.18), 0x6a6460);
        },
      },
      // the change: close and low to one side, the flame turning from white to cobalt
      changeShots: [{ at: 0, shot: (t, o) => K.camAt(o, vg.chest().addScaledVector(toZ, 3.2).addScaledVector(side, -1.4).add(new V3(0, -0.55, 0)), vg.chest().add(new V3(0, 0.45, 0)), 48) }],
      onFrame: (n) => {
        if (!b.skipRequested && n % 4 === 0) b.vfx.flash(vg.chest().add(new V3(U.rand(-1, 1), U.rand(0, 2), U.rand(-1, 1))), 0.6, n % 8 ? 0xbfe8ff : BLUE, 0.12, SL.Toon.tex.glow);
      },
    });
    K.toForm(vg, 'blue');
    vg.controller = K.scripted();
    fz.controller = K.scripted();
    // the reveal's last word (the scene's line, kept)
    K.pose(vg, 'vg_smirk', 'cocky', 6);
    m.shot((t, out) => K.camAt(out, vg.chest().add(new V3(Math.sin(vg.yaw) * 3, 0.2, Math.cos(vg.yaw) * 3)), vg.chest().add(new V3(0, 0.25, 0)), 40), 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegito', 'Now — Vegito Blue. Let\'s see that immortality of yours.', 2.8, { style: 'dual' });
    yield* st.wait(2.8);
  }

  /**
   * THE TWO FINGERS AND THE INTERRUPTION (2026-10-19; an episode recap: Vegito "stops Zamasu's attack with his fingers";
   * Zamasu "begins a speech about imitating gods, and Vegito interrupts him with an attack"). THE STAGING IS THE
   * MISSION'S OWN: a shaft of his light at Vegito — Guard, two fingers, it stops and is flicked away; the speech — Light,
   * the blur, the fist, and Zamasu thrown up into the sky with Vegito after him: the first played stretch begins there.
   * Both cues go ahead on their own after a few seconds (the story does not change); a skip lands in the air beside him.
   */
  function* fingersAndInterrupt(m, vg, fz) {
    const b = m.battle;
    const st = SL.data.u6Kit.staged(m);
    const toZ = flat(fz.pos.clone().sub(vg.pos)), side = new V3(toZ.z, 0, -toZ.x);
    // his light, charged in the open hand
    K.faceTo(fz, vg.pos);
    K.pose(fz, 'zm_lightW', 'angry', 12);
    K.pose(vg, 'vg_fight', 'cocky', 8);
    m.shot((t, o) => K.camAt(o, vg.chest().addScaledVector(toZ, -2.6).addScaledVector(side, 1).add(new V3(0, 0.45, 0)), fz.chest(), 48), 999, { cut: true, blendIn: 0, hold: true });
    m.say('fused_zamasu', 'Vanish, imitation!', 1.4, { style: 'shout' });
    const shaft = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe0f4, transparent: true, opacity: 0.95, depthWrite: false }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xff7ad0, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8, depthWrite: false }));
    glow.scale.setScalar(1.1);
    shaft.add(glow);
    shaft.userData.ftVegito = true; // the test finds what the scene left behind
    const gone = () => {
      if (!shaft.parent) return;
      b.scene.remove(shaft);
      shaft.geometry.dispose();
      shaft.material.dispose();
      glow.material.dispose();
    };
    m.onDispose(gone);
    b.scene.add(shaft);
    const from = fz.handPos('R'), stopAt = vg.chest().addScaledVector(toZ, 0.75);
    shaft.position.copy(from);
    let fly = 0;
    const flyHook = () => {
      fly = Math.min(1, fly + 1 / 40);
      shaft.position.copy(from.clone().lerp(stopAt, U.easeOutCubic(fly)));
    };
    m.tickHooks.push(flyHook);
    m.onDispose(() => K.removeHook(m, flyHook));
    if (!b.skipRequested) b.sfx('kiBlastBig', fz, { vol: 1, pitch: 1.2 });
    K.pose(fz, 'zm_light', 'angry', 30);
    yield* st.wait(0.25);
    yield* playerCue(m, vg, 'guard', 'Stop it — two fingers! (Guard)', { auto: 2.4, slow: 0.35 });
    K.removeHook(m, flyHook);
    // two fingers, and it stops dead at his fingertips
    K.pose(vg, 'vg_fingers', 'cocky', 30);
    const tip = () => vg.handPos('R').addScaledVector(toZ, 0.35);
    shaft.position.copy(tip());
    m.shot((t, o) => K.camAt(o, tip().addScaledVector(side, 2.2).addScaledVector(toZ, -0.4).add(new V3(0, 0.25, 0)), tip().lerp(vg.headPos(), 0.35), 40), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      b.vfx.sparks(tip(), 0xffd0f0, 18, 6, 0.1);
      b.sfx('swordClang', vg, { vol: 0.8, pitch: 1.6 });
    }
    m.flags.fingerStop = true;
    yield* st.wait(0.9);
    // flicked away: off over the rooftops, where it bursts
    const off = tip().addScaledVector(side, 14).add(new V3(0, 10, 0)), p0 = shaft.position.clone();
    {
      let n = 0;
      yield () => {
        n++;
        shaft.position.copy(p0.clone().lerp(off, Math.min(1, n / 14)));
        return n >= 14 || b.skipRequested;
      };
    }
    if (!b.skipRequested) {
      b.vfx.explosion(off, 2, 0xff9ad8, { smoke: false });
      b.sfx('explosionSmall', null, { at: off, vol: 0.7 });
    }
    gone();
    K.pose(vg, 'vg_smirk', 'cocky', 8);
    // the speech — and he does not let him finish it
    K.pose(fz, 'zm_idle', 'angry', 6);
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'three' }, 999);
    m.say('fused_zamasu', 'You mortals, dressing yourselves in a god\'s power — you are nothing but a crude imitation of—', 3.2);
    yield* st.wait(1.2);
    yield* playerCue(m, vg, 'light', 'Cut him off! (Light)', { auto: 2.6, slow: 0.5 });
    // the blur, the fist, and the god thrown up into the sky with Vegito after him
    if (!b.skipRequested) b.vfx.afterimage(vg.pos, vg.height, 0x8ad8ff);
    const hitAt = K.ground(b, fz.pos.clone().addScaledVector(toZ, -1.1));
    K.place(vg, hitAt, 0);
    K.faceTo(vg, fz.pos);
    K.pose(vg, 'vg_jab', 'shout', 40);
    K.pose(fz, 'hitHeavy', 'shock', 30);
    m.shot((t, o) => K.camAt(o, fz.chest().lerp(vg.chest(), 0.5).addScaledVector(side, 4.2).add(new V3(0, 0.6, 0)), fz.chest().lerp(vg.chest(), 0.5), 48), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      b.vfx.impact(fz.chest(), 3, 0x8ad8ff);
      b.sfx('punchHeavy', fz, { vol: 1.2 });
      b.cameraTraumaAt(fz.chest(), 0.6);
    }
    m.flags.interrupted = true;
    const z0 = fz.pos.clone(), z1 = fz.pos.clone().addScaledVector(toZ, 4).add(new V3(0, 9, 0));
    const v0 = vg.pos.clone(), v1 = z1.clone().addScaledVector(toZ, -6).add(new V3(0, -1, 0));
    K.pose(vg, 'vg_flyForward', 'cocky', 20);
    {
      let n = 0;
      yield () => {
        n++;
        const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 26));
        for (const [f, a, c] of [[fz, z0, z1], [vg, v0, v1]]) {
          f.grounded = false;
          f.vel.set(0, 0, 0);
          f.setPosition(a.clone().lerp(c, k));
        }
        return k >= 1;
      };
    }
    K.faceTo(vg, fz.pos);
    K.faceTo(fz, vg.pos);
  }

  const P = {};

  /** MERGE: Black and Zamasu put on the Potara (episode 64's end); the light; the god marvels at his body. */
  P.merge = { id: 'merge', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    const g = S.goku, v = S.vegeta, bk = S.black, z = S.zamasu;
    if (S.vegito || S.fz) return;
    K.toForm(g, 'blue');
    K.toForm(v, 'blue');
    K.toForm(bk, 'rose');
    for (const f of [g, v, bk, z]) f.controller = K.scripted();
    K.place(g, at(b, 'goku'), 0);
    K.place(v, at(b, 'vegeta'), 0);
    K.place(bk, at(b, 'black'), Math.PI);
    K.place(z, at(b, 'zamasu'), Math.PI);
    for (const f of [g, v]) K.pose(f, 'idle', 'serious', 6);
    K.pose(bk, 'gb_idle', 'smirk', 4);
    K.pose(z, 'zm_idle', 'calm', 4);
    m.music('zamasu_theme', 2);
    shot(m, { black: bk }, { subject: 'black', focus: 'upper', angle: 'three' }, 999);
    m.title(CHAPTER, 'VEGITO', 'Future · the end of the world', 3.4);
    m.say('zamasu', 'Enough games, my other self. Let us become one — and finish this.', 3.2);
    yield* st.wait(3.2);
    // the earrings, the pull, and the light swallowing the broken sky (extreme wide)
    VK().earOn(bk, -1);
    VK().earOn(z, 1);
    const sky = bk.pos.clone().lerp(z.pos, 0.5);
    m.shot((t, out) => K.camAt(out, sky.clone().add(new V3(0, 6, -60)), sky.clone().add(new V3(0, 10, 0)), 58), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      yield* VK().magnet(m, bk, z, { seconds: 1.4, lift: 1.5 });
      VK().pillar(m, sky.clone(), { height: 260, radius: 4, seconds: 2.6 });
      SL.ScreenFX.flash(0.6, '#ffe8f4');
      b.sfx('transformBurst', null, { at: sky, vol: 1.2, pitch: 0.8 });
      b.cameraTraumaAt(sky, 0.6);
    }
    const fz = fuseZamasu(m);
    K.place(fz, K.ground(b, sky), Math.PI);
    K.faceTo(fz, g.pos);
    K.pose(fz, 'zm_idle', 'wicked', 4);
    m.flags.fusedZamasu = true;
    yield* st.wait(0.9);
    // Roadmap Three, the fusion of the two Zamasu (the owner's Gemini research — a research draft, not checked against
    // the footage): the light clears and he lifts his hands before his eyes, marvelling at the body he has become
    K.pose(fz, 'lookHands', 'wicked', 5);
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'low' }, 999);
    m.flags.fzMarvels = true;
    yield* st.wait(1.6);
    K.pose(fz, 'zm_idle', 'wicked', 5);
    m.say('fused_zamasu', 'Behold — the one true god. Mortals, your time is at an end.', 3.2);
    yield* st.wait(3.2);
    m.endShot();
    b.skipRequested = false;
  } };

  /**
   * ASSAULT (played; episode 65 beats 3–6 — the order and outcomes the source's, the blows an adaptation): Super Saiyan
   * Blue Goku and Vegeta against the fused god (switch between them). He toys with them — the Blades of Judgement out of
   * the sky (marks, then columns), his Lightning of Absolution: the bird of light over him, marking one of them and
   * striking. Destroy the bird together; then the cue — the coordinated rush (the Saiyan Assault's blows from both sides,
   * its key blows slowed) — and he catches the last double blow and throws them into the rubble.
   */
  P.assault = { id: 'assault', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, A = TU.assault;
    stage(m);
    if (S.vegito) return;
    const fz = fuseZamasu(m);
    K.toForm(g, 'blue');
    K.toForm(v, 'blue');
    if (fz.model && fz.model.setPropVisible) fz.model.setPropVisible('halo', true);
    for (const f of [g, v, fz]) {
      f.setHidden(false);
      f.untargetable = f.intangible = false;
    }
    if (g.pos.distanceTo(fz.pos) < 6) K.place(g, K.ground(b, fz.pos.clone().add(new V3(-2, 0, -10))), 0);
    if (v.pos.distanceTo(fz.pos) < 6) K.place(v, K.ground(b, fz.pos.clone().add(new V3(2, 0, -10))), 0);
    g.hp = Math.max(g.hp, g.hpMax * 0.8);
    v.hp = Math.max(v.hp, v.hpMax * 0.8);
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    // whoever drives the player's seat now (the keyboard; a test's bot) is the one the cues listen to
    g._playerController = g.controller;
    b.setParty([g, v], {});
    g.target = v.target = fz;
    fz.target = g;
    fz.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, fz.def.ai, { aggression: 0.55, defense: 0.6, transformHp: 0 }) });
    for (const f of [g, v, fz]) f.setState('free');
    m.music('zamasu_theme', 4);
    m.title(CHAPTER, 'VEGITO', 'Goku and Vegeta vs Fused Zamasu', 2.4);
    m.objective('bird', 'Destroy the lightning bird over him — together', { icon: 'target' });
    m.objective('assault', 'Then strike him together', { icon: 'fist' });
    m.objective('switch', 'Fight as Vegeta (switch)', { icon: 'target', optional: true });
    const offSw = b.on('playerSwitched', (e) => e.to === v && m.complete('switch'));
    m.say('fused_zamasu', 'Kneel before the light of judgment.', 2.2);
    // he is immortal here: blows land, nothing is lost (the episodes: they are overpowered again and again)
    const sf = m.storyFight({
      floors: [{ f: fz, at: A.fzFloor }, { f: g, at: A.heroFloor }, { f: v, at: A.heroFloor }],
      dealt: [{ f: fz, mul: A.fzDealt }], taken: [{ f: fz, mul: A.fzTaken }],
      fighters: [g, v, fz],
    });
    const judgment = K.judgment(m, fz, g, JUDGMENT, { first: A.judgeFirst, every: A.judgeEvery, flag: 'assaultJudgments' });
    const bird = lightningBird(m, fz, [g, v]);
    S.hitProp = () => (bird.prop.alive ? bird.prop : null);
    // the player's lock on the bird (it flies over his head, out of the usual frame) — after a switch too; it falls back
    // on the god once the bird is gone
    const aimBird = (f) => bird.prop.alive && f && SL.Targeting.lock(b, f, { prop: bird.prop }, true);
    aimBird(b.player);
    const offAim = b.on('playerSwitched', (e) => aimBird(e.to));
    let birdDown = false;
    const offP = b.on('propDestroyed', (e) => {
      if (e.prop !== bird.prop) return;
      birdDown = true;
      m.complete('bird');
      m.flags.birdDown = true;
      b.vfx.ring(e.prop.pos, 10, 0xfff07a, 0.5);
      m.say('vegeta', 'His bird is gone. Now, Kakarot — together!', 2.2, { style: 'shout' });
    });
    const off = () => {
      offSw();
      offAim();
      offP();
      bird.off();
      judgment.off();
    };
    m.onDispose(off);
    m.limits({ revert: false });
    m.lock(false);
    b.aiLocked = false;
    yield () => birdDown || m.state !== 'running';
    // no new judgment; the columns already marked come down before the rush
    judgment.stop();
    yield () => judgment.pending() <= 0 || m.state !== 'running';
    off();
    S.hitProp = null;
    if (m.state !== 'running') return;
    // the coordinated rush: the player's cue starts it (Heavy); the blows are real — the same as the Free Battle move
    const spec = assaultSpec();
    const strikers = (m.flags.assaultStrikers = []);
    const offD = b.on('damage', (e) => {
      // the combo's blows (not the dash's contact), in order
      if (e.target === fz && (e.attacker === g || e.attacker === v) && g.state === 'rush' && g.sd.phase === 'combo') strikers.push(e.attacker === g ? 'goku' : 'vegeta');
    });
    let slows = 0;
    const offS = b.on('rushSlow', (e) => e.fighter === g && slows++);
    m.onDispose(() => {
      offD();
      offS();
    });
    let tries = 0;
    while (strikers.length < spec.hits.length - 1 && tries < 3 && m.state === 'running') {
      tries++;
      b.switchPlayer(g, { force: true, quiet: true });
      for (const f of [g, v]) {
        f.setState('free');
        f.ki = Math.max(f.ki, f.kiMax * 0.5);
      }
      // he stands there, sure of himself: open to it (episode 64: "he leaves himself open because he is immortal")
      fz.controller = K.scripted();
      K.place(fz, K.ground(b, fz.pos.clone()), fz.yaw);
      fz.setState('free');
      K.pose(fz, 'zm_idle', 'wicked', 6);
      if (g.pos.distanceTo(fz.pos) > 14 || g.pos.distanceTo(fz.pos) < 4) K.place(g, K.ground(b, fz.pos.clone().addScaledVector(flat(g.pos.clone().sub(fz.pos)), 8)), 0);
      // the starting positions: Vegeta a stride to Goku's side, the two of them facing him (the establishing shot)
      const toG = flat(g.pos.clone().sub(fz.pos));
      K.place(v, K.ground(b, g.pos.clone().addScaledVector(new V3(-toG.z, 0, toG.x), 2.4)), 0);
      K.faceTo(g, fz.pos);
      K.faceTo(v, fz.pos);
      g.target = fz;
      // the establishing shot: behind the two of them, the god beyond in the gap between them
      const hm = g.pos.clone().lerp(v.pos, 0.5);
      m.shot((t, o) => K.camAt(o, hm.clone().addScaledVector(toG, 5.5).add(new V3(0, 2.4, 0)), hm.clone().lerp(fz.chest(), 0.55).add(new V3(0, 0.6, 0)), 54), 999, { cut: true, blendIn: 0, hold: true });
      m.lock(true);
      // the shot holds a moment first: the bird's blast clears, the two of them set (skip-safe)
      yield* SL.data.u6Kit.staged(m).wait(tries === 1 ? 1.2 : 0.5);
      yield* playerCue(m, g, 'heavy', 'Together — now! (Heavy)', { auto: 3, slow: 0.5 });
      // the rush, from the player's seat
      g.controller = g._playerController;
      g.setState('rush', { spec, slot: 'x:saiyanAssault', phase: 'wind', partner: v });
      g.anim.play(spec.poses.wind, 20);
      m.flags.assaultStarted = (m.flags.assaultStarted || 0) + 1;
      const offCam = assaultCam(m, g, v, fz);
      let n = 0;
      yield () => ++n > 60 * 10 || g.state !== 'rush' || m.state !== 'running';
      offCam();
      g.controller = K.scripted();
      v.controller = K.scripted();
      if (strikers.length < spec.hits.length - 1) m.say('goku', 'Missed him! Again, Vegeta!', 1.6, { style: 'shout' });
    }
    offD();
    offS();
    m.flags.assaultSlows = slows;
    m.flags.assaultTries = tries;
    m.flags.slowRestored = !b.slow;
    sf.off();
    m.complete('assault');
    m.qteParts.push(tries <= 1 ? 1 : 0.6);
    yield* catchAndThrow(m, g, v, fz);
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    m.endShot();
    b.skipRequested = false;
  } };

  /**
   * THE TURN AND THE POTARA (staged): episode 65–66 (episode65), the Light of Justice, the earrings, Vegito out of the
   * light above the street, "Alright!", his first line, Blue, the fingers and the punch.
   */
  P.turn = { id: 'turn', checkpoint: true, run: function* (m) {
    const b = m.battle, S = b.story;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    const g = S.goku, v = S.vegeta;
    if (S.vegito) return;
    const fz = fuseZamasu(m);
    K.toForm(g, 'blue');
    K.toForm(v, 'blue');
    for (const f of [g, v, fz]) {
      f.controller = K.scripted();
      f.setHidden(false);
    }
    if (fz.model && fz.model.setPropVisible) fz.model.setPropVisible('halo', true);
    b.setParty([g], {});
    b.switchPlayer(g, { force: true, quiet: true });
    g.controller = K.scripted();
    v.controller = K.scripted();
    // where the assault left them (or, from the checkpoint, where it would)
    const f0 = K.ground(b, fz.pos.clone());
    K.place(fz, f0, fz.yaw);
    if (g.pos.distanceTo(fz.pos) < 6 || g.pos.distanceTo(fz.pos) > 20) K.place(g, K.ground(b, f0.clone().add(new V3(-1.6, 0, -9))), 0);
    if (v.pos.distanceTo(fz.pos) < 6 || v.pos.distanceTo(fz.pos) > 20 || v.pos.distanceTo(g.pos) > 6) K.place(v, K.ground(b, g.pos.clone().add(new V3(3.2, 0, 0))), 0);
    yield* episode65(m, g, v, S.trunks, fz);
    // the Light of Divine Justice (lightOfJustice): the power-up that pushes them to the Potara (episode 66)
    yield* lightOfJustice(m, fz, g, v);
    // the Potara: Goku's idea, Vegeta's oath broken (episode 66)
    shot(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 999);
    m.say('goku', 'Vegeta, the earrings! It\'s the only way!', 2.4, { style: 'shout' });
    yield* st.wait(2.4);
    shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999);
    K.pose(v, 'earringR', 'angry', 8);
    m.say('vegeta', 'Tch... Fine! But this is the very last time, Kakarot!', 2.8);
    yield* st.wait(2.8);
    VK().earOn(g, 1);
    VK().earOn(v, -1);
    const meet = g.pos.clone().lerp(v.pos, 0.5);
    // Roadmap Three, Vegito's entrance (the owner's Gemini research — a research draft): the earrings click on, a high
    // chime, and the pull
    if (!b.skipRequested) {
      b.sfx('tierUp', null, { at: meet, vol: 0.9, pitch: 2 });
      m.flags.potaraChime = true;
    }
    m.shot((t, out) => K.camAt(out, meet.clone().add(new V3(0, 3, -16)), meet.clone().add(new V3(0, 1.6, 0)), 54), 999, { cut: true, blendIn: 0, hold: true });
    if (!b.skipRequested) {
      yield* VK().magnet(m, g, v, { seconds: 1.4 });
      VK().pillar(m, meet.clone(), { radius: 1.8, seconds: 2 });
      SL.ScreenFX.flash(0.7, '#ffffff');
      b.sfx('transformBurst', null, { at: meet, vol: 1.2, pitch: 1.2 });
    }
    const vg = fuseVegito(m);
    // out of the light above the street, looking down at the god; the drop (vegitoEntrance — the owner's recollection)
    yield* vegitoEntrance(m, vg, fz, meet);
    // the light parts on him: base Vegito, the confident "here I am" stance
    K.pose(vg, 'vg_yosha', 'cocky', 8);
    m.shot((t, out) => K.camAt(out, vg.chest().add(new V3(Math.sin(vg.yaw) * 4.2, -0.4, Math.cos(vg.yaw) * 4.2)), vg.chest().add(new V3(0, 0.3, 0)), 42), 999, { cut: true, blendIn: 0, hold: true });
    m.flags.vegitoBase = vg.form.id === 'base';
    m.say('vegito', 'Alright!', 1.4, { style: 'dual' });
    yield* st.wait(1.6);
    shot(m, { vegito: vg }, { subject: 'vegito', focus: 'upper', angle: 'low' }, 999);
    // two fingers at the god, and his first words (episode 66, paraphrased: two can play at merging)
    K.pose(vg, 'vg_point', 'cocky', 6);
    m.say('vegito', 'Merging isn\'t just for gods, you know. Two can play at that game.', 3.2, { style: 'dual' });
    yield* st.wait(3.2);
    yield* blueChange(m, vg, fz);
    m.flags.vegito = vg.form.id === 'blue';
    // the two fingers, the speech cut short, and up into the sky: the first played stretch takes it from there
    yield* fingersAndInterrupt(m, vg, fz);
    m.endShot();
    b.skipRequested = false;
  } };

  /** His model at k of its own size (FIGHT 2's swell; 1 gives his size back). */
  function sizeTo(f, k) {
    const md = f.model;
    if (!md) return;
    md.root.scale.setScalar(md.baseScale * (f.form && f.form.look && f.form.look.scale ? f.form.look.scale : 1) * k);
  }

  /**
   * FIGHT 2's TURN (2026-10-19; an episode recap: after the Spirit Sword, Vegito points out he is immortal only while
   * Black's mortal body is part of him, and "Zamasu powers up into a bulkier form"). THE STAGING AND THE RULES ARE THE
   * MISSION'S OWN: Vegito's line (paraphrased), the swell (a little bigger, pink lightning), and — for the played
   * stretch that follows — a heavier god (armour, slower, judgment calls: fightPhase o.bulk). Skip-safe.
   */
  function* bulkUp(m, fz, vg) {
    const b = m.battle;
    const st = SL.data.u6Kit.staged(m);
    vg.controller = K.scripted();
    fz.controller = K.scripted();
    K.faceTo(vg, fz.pos);
    K.faceTo(fz, vg.pos);
    K.pose(vg, 'vg_fight', 'cocky', 6);
    K.pose(fz, 'zm_idle', 'angry', 6);
    shot(m, { vegito: vg }, { subject: 'vegito', focus: 'upper', angle: 'three' }, 999);
    m.say('vegito', 'You\'re not immortal any more. Part of Goku is in you now — and that half of you can be hurt.', 3.2, { style: 'dual' });
    yield* st.wait(3.2);
    // his tears (episode 66: they will purify the world; paraphrased) — and the right side spilling over (the change)
    K.pose(fz, 'zm_shaken', 'sad', 8);
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'low' }, 999);
    m.say('fused_zamasu', 'These tears are for this filthy world. My tears will wash it clean!', 3, { style: 'quiet' });
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
    yield* SL.data.cinematics.transform(m, { fighter: fz, formIndex: K.formIndex(fz, 'corrupted'), witness: vg, witnessLine: 'Heh. Look at you — you\'re coming apart at the seams.', music: 4, rocks: false });
    K.toForm(fz, 'corrupted');
    m.flags.corrupted = fz.form.id === 'corrupted';
    fz.controller = K.scripted();
    K.pose(fz, 'fz2_raise', 'shout', 10);
    shot(m, { fz }, { subject: 'fz', focus: 'medium', angle: 'low' }, 999);
    m.say('fused_zamasu', 'Silence! This body will not yield to a mortal!', 2.2, { style: 'shout' });
    let n = 0;
    yield () => {
      n++;
      sizeTo(fz, U.lerp(1, TU.bulk.size, Math.min(1, n / 50)));
      if (!b.skipRequested && n % 6 === 0) b.vfx.bolt(fz.chest().add(new V3(U.rand(-0.7, 0.7), U.rand(-0.6, 1.2), U.rand(-0.7, 0.7))), 1.5, 0xff6ad0);
      return n >= 60 || b.skipRequested;
    };
    sizeTo(fz, TU.bulk.size);
    if (!b.skipRequested) {
      b.vfx.ring(fz.chest(), 7, 0xff6ad0, 0.5);
      b.sfx('roar', fz, { vol: 1, pitch: 0.7 });
      b.cameraTraumaAt(fz.chest(), 0.5);
    }
    m.flags.bulk = true;
    m.endShot();
    b.skipRequested = false;
  }

  /**
   * JUDGMENT (FIGHT 2, the mission's own pattern on the engine's telegraphed boss technique 'eruption'): every so often,
   * when he is free, he raises his arms and three marks flash at Vegito's feet, then columns of pink lightning come down
   * on them. Fly or dash clear; he recovers after it — the opening. Returns { stop() no more calls, pending() columns
   * marked but not yet come down, off() }: the stretch waits for the pending ones before it ends, so none lands in the
   * scene after it.
   */
  const JUDGMENT = {
    id: 'fzJudgment', name: 'Judgment', count: 3, interval: 16, delay: 48, radius: 2.2, damage: 900, knockSpeed: 22,
    columnHeight: 7, lead: 0.35, recovery: 80, poses: { cast: 'fz2_raise' },
    color: 0xff6ad0, flashColor: 0xffc0ec, markColor: 0xff3aa8, skyBolt: 0xff7ad8,
  };
  // the pattern itself is shared with "The Sword of Hope" (trunks_kit.js K.judgment)
  const judgmentPattern = (m, fz, vg) => K.judgment(m, fz, vg, JUDGMENT, { first: TU.bulk.first, every: TU.bulk.every });

  /**
   * A played stretch of Vegito Blue against Fused Zamasu. o: { id, floor (of his bar), space ('air' | null), title,
   * objective, fresh (full bars, the first stretch) }.
   */
  function fightPhase(o) {
    return { id: o.id, checkpoint: true, run: function* (m) {
      const b = m.battle, S = b.story;
      stage(m);
      const fz = fuseZamasu(m), vg = fuseVegito(m);
      K.toForm(vg, 'blue');
      K.toForm(fz, 'base');
      fz.setHidden(false);
      // Goku broke the ring of light before the earrings (episode65): it stays gone, a checkpoint restart included
      if (fz.model && fz.model.setPropVisible) fz.model.setPropVisible('halo', false);
      // and the Light of Divine Justice swelled his arm before the earrings (lightOfJustice)
      mutatedArm(fz, true);
      fz.untargetable = fz.intangible = vg.untargetable = vg.intangible = false;
      if (vg.pos.distanceTo(fz.pos) < 5) K.place(fz, K.ground(b, vg.pos.clone().add(new V3(0, 0, 9))), Math.PI);
      if (o.fresh) {
        vg.hp = vg.hpMax;
        fz.hp = fz.hpMax;
      } else {
        // carried on from the first stretch (or a checkpoint restart lands where it would be)
        vg.hp = Math.max(vg.hp, vg.hpMax * 0.6);
        fz.hp = Math.min(fz.hp, fz.hpMax * TU.firstFloor);
      }
      vg.ki = Math.max(vg.ki, vg.kiMax * 0.6);
      // FIGHT 2's turn: he swells, and fights heavier (bulkUp; the rules below)
      if (o.bulk) yield* bulkUp(m, fz, vg);
      if (!vg._playerController) vg._playerController = new SL.PlayerController(b);
      vg.controller = vg._playerController;
      b.switchPlayer(vg, { force: true, quiet: true });
      vg.target = fz;
      fz.target = vg;
      fz.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty, profile: Object.assign({}, fz.def.ai, { aggression: 0.75, defense: 0.6, transformHp: 0 }) });
      vg.setState('free');
      fz.setState('free');
      m.title(CHAPTER, 'VEGITO', o.title, 2.4);
      m.objective(o.id, o.objective, { icon: 'fist' });
      m.music('vegito_theme', 5);
      const sf = m.storyFight({
        floors: [{ f: fz, at: o.floor }], dealt: [{ f: fz, mul: TU.zamasuDealt }], taken: [{ f: fz, mul: TU.zamasuTaken }],
        ease: { foe: fz, hero: vg, below: 0.5, min: 0.5 },
        fighters: [vg, fz], space: o.space,
      });
      // the heavier god (o.bulk): light blows do not stop him, he moves slower, and he calls judgment down on Vegito
      const armor0 = fz.storyArmor, move0 = fz.moveScale;
      const restore = () => {
        fz.storyArmor = armor0;
        fz.moveScale = move0;
      };
      let judgment = null;
      let grow = null;
      if (o.bulk) {
        fz.storyArmor = TU.bulk.armor;
        fz.moveScale = TU.bulk.move;
        judgment = judgmentPattern(m, fz, vg);
        m.onDispose(restore);
        // the right side keeps growing (episode 66): bigger as his bar comes down, a pulse of purple now and then
        const top = fz.hpFrac;
        grow = () => {
          const k = U.clamp01((top - fz.hpFrac) / Math.max(0.05, top - o.floor));
          sizeTo(fz, U.lerp(TU.bulk.size, TU.bulk.sizeMax, k));
          m.flags.grown = Math.max(m.flags.grown || 0, k);
          if (!b.skipRequested && b.frame % 90 === 0) b.vfx.flash(fz.chest().add(new V3(0.25, 0.3, 0)), 1.6, 0x8a3aff, 0.2, SL.Toon.tex.glow);
        };
        m.tickHooks.push(grow);
        m.onDispose(() => K.removeHook(m, grow));
      }
      m.limits({ revert: false });
      m.lock(false);
      b.aiLocked = false;
      yield () => sf.floored(fz) || vg.hpFrac < TU.vegitoFloor || m.state !== 'running';
      if (judgment) {
        // no new call; the columns already marked come down in the fight, not in the scene after it
        judgment.stop();
        yield () => judgment.pending() <= 0 || m.state !== 'running';
        judgment.off();
      }
      if (grow) K.removeHook(m, grow);
      restore();
      sf.off();
      m.lock(true);
      b.aiLocked = true;
      K.clearCombat(b);
      if (m.state !== 'running') return;
      m.flags[o.id] = sf.floored(fz);
      m.flags.overpowered = !!(m.flags.fight && m.flags.fight2);
      m.qteParts.push(sf.floored(fz) ? 1 : 0.5);
      m.complete(o.id);
    } };
  }

  // the opening exchange high over the broken towers (the breakdown: it starts in the sky)
  P.fight = fightPhase({ id: 'fight', fresh: true, floor: TU.firstFloor, space: 'air', title: 'Vegito Blue vs Fused Zamasu', objective: 'Overpower the immortal god in the sky — God Slicer is on your wheel' });

  /*
   * HOLY WRATH (staged; the supplied breakdown's beat — not checked against the episode): Zamasu raises a sun of his
   * judgment and throws it down; Vegito catches it in his hands and drives it back up into him; Zamasu comes down
   * after it and meets the Spirit Sword — the blade out of Vegito's right hand, through him (no wound shown), a taunt.
   */
  P.wrath = { id: 'wrath', run: function* (m) {
    const b = m.battle, S = b.story;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    const fz = fuseZamasu(m), vg = fuseVegito(m);
    vg.controller = K.scripted();
    fz.controller = K.scripted();
    K.toForm(vg, 'blue');
    mutatedArm(fz, true);
    if (fz.model && fz.model.setPropVisible) fz.model.setPropVisible('halo', false);
    K.place(vg, K.ground(b, vg.pos.clone()), vg.yaw);
    const fwd = new V3(Math.sin(vg.yaw), 0, Math.cos(vg.yaw));
    const high = vg.pos.clone().addScaledVector(fwd, 10).add(new V3(0, 12, 0));
    fz.grounded = false;
    fz.setPosition(high);
    fz.vel.set(0, 0, 0);
    K.faceTo(fz, vg.pos);
    K.faceTo(vg, fz.pos);
    K.pose(fz, 'fz2_raise', 'angry', 8);
    K.pose(vg, 'vg_fight', 'cocky', 6);
    // high above, looking down past him at Vegito in the street
    m.shot((t, out) => K.camAt(out, fz.chest().addScaledVector(fwd, -4).add(new V3(1.5, 4, 0)), vg.chest(), 54), 999, { cut: true, blendIn: 0, hold: true });
    m.say('fused_zamasu', 'Holy Wrath! Burn, mortal, in the light of a god!', 2.6, { style: 'shout' });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xff6a3a, transparent: true, opacity: 0.9, depthWrite: false }));
    b.scene.add(sun);
    const disposeSun = () => {
      if (!sun.parent) return;
      b.scene.remove(sun);
      sun.geometry.dispose();
      sun.material.dispose();
    };
    m.onDispose(disposeSun);
    const over = () => fz.chest().add(new V3(0, 3.2, 0));
    let n = 0;
    yield () => {
      n++;
      sun.position.copy(over());
      sun.scale.setScalar(0.3 + Math.min(1, n / 70) * 2.7);
      if (!b.skipRequested && n % 8 === 0) b.vfx.flash(sun.position, 3, 0xffb07a, 0.15, SL.Toon.tex.glow);
      return n >= 80 || b.skipRequested;
    };
    // thrown down; caught; driven back up
    K.pose(fz, 'fz2_cast', 'shout', 20);
    b.sfx('kiBlastBig', fz, { vol: 1.1, pitch: 0.7 });
    const catchAt = vg.chest().add(new V3(0, 1.4, 0)).addScaledVector(fwd, 0.6);
    const from = sun.position.clone();
    // the sun shrinks as it falls and is held above his raised hands, a little see-through, so his head and arms stay readable
    const held = catchAt.clone().add(new V3(0, 1.1, 0));
    m.shot((t, out) => K.camAt(out, vg.pos.clone().addScaledVector(fwd, -5.5).add(new V3(2.2, 0.8, 0)), vg.chest().lerp(held, 0.5), 58), 999, { cut: true, blendIn: 0, hold: true });
    // (2026-10-19) the catch is the player's: it falls slowly while the cue is up — Guard, and his hands meet it
    let fall = 0;
    const fallHook = () => {
      fall = Math.min(1, fall + 1 / 60);
      const k = U.easeInCubic(fall) * 0.85;
      sun.position.copy(from.clone().lerp(held, k));
      sun.scale.setScalar(3 - 1.7 * k);
      sun.material.opacity = 0.9 - 0.2 * k;
    };
    m.tickHooks.push(fallHook);
    m.onDispose(() => K.removeHook(m, fallHook));
    yield* playerCue(m, vg, 'guard', 'Catch it! (Guard)', { auto: 2.4, slow: 0.4 });
    K.removeHook(m, fallHook);
    sun.position.copy(held);
    sun.scale.setScalar(1.3);
    sun.material.opacity = 0.7;
    K.pose(vg, 'reachUp', 'grit', 20);
    b.cameraTraumaAt(vg.chest(), 0.6);
    b.sfx('punchHeavy', vg, { vol: 1.1, pitch: 0.7 });
    m.flags.caught = true;
    // and held: mash to drive it back up at him (the outcome is the story's; the effort is the player's)
    const top = fz.chest();
    let push = 0;
    const r = yield* m.struggle({
      start: 0.5, drain: 0.42, duration: 4, label: 'Drive it back up! (mash)', until: () => push >= 1,
      onTick: (t, grip) => {
        push = Math.min(1, push + (0.08 + grip * 0.45) / 60);
        sun.position.copy(held.clone().lerp(top, push * 0.35));
        if (!b.skipRequested && Math.floor(t * 60) % 6 === 0) b.vfx.flash(sun.position, 2.4, 0xffb07a, 0.12, SL.Toon.tex.glow);
        b.cameraTraumaAt(vg.chest(), 0.06);
      },
    });
    m.qteParts.push(U.clamp01(r.avg * 1.4));
    m.flags.wrathStruggle = true;
    m.say('vegito', 'Hah! You can have this back!', 1.8, { style: 'dual' });
    const back = sun.position.clone();
    n = 0;
    yield () => {
      n++;
      sun.position.copy(back.clone().lerp(fz.chest(), Math.min(1, n / 22)));
      return n >= 22 || b.skipRequested;
    };
    disposeSun();
    b.vfx.explosion(fz.chest(), 3, 0xff8a5a, { smoke: true });
    b.sfx('explosionBig', fz, { vol: 1.1 });
    m.flags.wrathBack = true;
    yield* spiritSwordTrap(m, st, vg, fz, fwd);
    // the blade out, and him away
    K.pose(vg, 'vg_fight', 'cocky', 8);
    K.place(vg, K.ground(b, vg.pos.clone()), vg.yaw);
    K.place(fz, K.ground(b, vg.pos.clone().addScaledVector(fwd, 9)), 0);
    K.faceTo(fz, vg.pos);
    K.pose(fz, 'zm_idle', 'angry', 6);
    m.endShot();
    b.skipRequested = false;
  } };

  /*
   * THE SPIRIT SWORD TRAP (the owner's choreography, 2026-10-17: BT-VEG-01–03, shots VEG-S01–S03 — not checked against
   * the episode). Burned by his own Holy Wrath, Zamasu drops on Vegito and blasts him across the rubble; Vegito lies on
   * his back, an arm over his eyes, groaning — play-acting. Zamasu gloats, his hand wrapped in light, and steps in, his
   * guard down. A cut with no warning: an impact frame (the picture a hard negative for an instant, both frozen) on
   * Zamasu's torso with the Spirit Sword clean through it, ki bursting out of his back; then Vegito, up on one knee,
   * the right hand raised with two fingers out and the long blade running from his wrist through the god:
   * "Oh, I'm sorry... is this hurting you? Aren't you invincible?" (the owner's line). Skip-safe: the blade and the
   * picture are put back whatever happens (onDispose too).
   */
  function* spiritSwordTrap(m, st, vg, fz, fwd) {
    const b = m.battle;
    const side = new V3(fwd.z, 0, -fwd.x);
    const sword = () => vg.model.props && vg.model.props.spiritSword;
    const reset = () => {
      SL.ScreenFX.impact(0);
      const pr = sword();
      if (pr) pr.scale.y = 1;
      if (vg.model.setPropFill) vg.model.setPropFill('spiritSword', 0);
      if (fz.model && fz.model.setPupilScale) fz.model.setPupilScale(1);
    };
    m.onDispose(reset);
    // BT-VEG-01: the god drops on him out of the smoke and blasts him back across the rubble
    const v0 = vg.pos.clone(), slideTo = K.ground(b, v0.clone().addScaledVector(fwd, -7));
    fz.grounded = false;
    K.pose(fz, 'fz2_cast', 'shout', 20);
    const dropFrom = fz.pos.clone(), dropTo = v0.clone().addScaledVector(fwd, 2.2).add(new V3(0, 1.4, 0));
    m.shot((t, out) => K.camAt(out, v0.clone().addScaledVector(side, 9).add(new V3(0, 2.2, 0)).addScaledVector(fwd, -2.5), v0.clone().addScaledVector(fwd, -2.5).add(new V3(0, 1, 0)), 50), 999, { cut: true, blendIn: 0, hold: true });
    let n = 0;
    yield () => {
      n++;
      fz.setPosition(dropFrom.clone().lerp(dropTo, U.easeInCubic(Math.min(1, n / 16))));
      fz.vel.set(0, 0, 0);
      return n >= 16 || b.skipRequested;
    };
    b.vfx.flash(vg.chest(), 2.6, 0xffe0b0, 0.2, SL.Toon.tex.glow);
    b.vfx.explosion(vg.chest(), 2, 0xff8a5a, { smoke: true });
    b.sfx('explosionSmall', vg, { vol: 1.1 });
    b.cameraTraumaAt(vg.chest(), 0.5);
    K.pose(vg, 'hitHeavy', 'hurt', 24);
    n = 0;
    yield () => {
      n++;
      const k = b.skipRequested ? 1 : U.easeOutCubic(Math.min(1, n / 30));
      vg.setPosition(K.ground(b, v0.clone().lerp(slideTo, k)));
      vg.vel.set(0, 0, 0);
      if (!b.skipRequested && n % 3 === 0) b.vfx.dust(vg.pos.clone(), 1.4, 5);
      return k >= 1;
    };
    K.place(vg, slideTo, vg.yaw);
    // spent, to look at: no aura while he lies there
    vg.setState('scripted', { pose: 'vg_feint', expression: 'hurt', speed: 10, aura: 0 });
    b.sfx('rockBreak', vg, { vol: 0.8 });
    const land = K.ground(b, slideTo.clone().addScaledVector(fwd, 4.6));
    K.place(fz, land, 0);
    K.faceTo(fz, vg.pos);
    K.pose(fz, 'zm_idle', 'wicked', 6);
    m.flags.feint = true;
    // VEG-S01: low, beside him in the rubble, pushing in slowly; he groans — and his eyes slide toward the god
    m.shot((t, out, el) => {
      // low behind his head, the god beyond him
      const k = Math.min(1, el / 2.6), c = vg.headPos();
      K.camAt(out, c.clone().addScaledVector(fwd, -U.lerp(1.7, 1.15, k)).addScaledVector(side, 1.2).add(new V3(0, 0.4, 0)), c.clone().addScaledVector(fwd, 2.4).add(new V3(0, 0.45, 0)), 46);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegito', 'Ngh... ugh...', 1.6, { style: 'quiet' });
    yield* st.wait(2.4);
    // the god over him: a hand wrapped in light, the sneer
    K.pose(fz, 'fz2_raise', 'wicked', 8);
    m.shot((t, out) => {
      const c = fz.chest();
      K.camAt(out, vg.chest().addScaledVector(fwd, 0.6).add(new V3(0, 0.15, 0)), c.clone().add(new V3(0, 0.35, 0)), 46);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('fused_zamasu', 'A fusion of mere mortals can never hope to pierce the absolute armor of a god!', 3.2, { style: 'shout' });
    n = 0;
    yield () => {
      n++;
      if (!b.skipRequested && n % 6 === 0) b.vfx.flash(fz.handPos('R'), 1.1, 0xfff0d0, 0.14, SL.Toon.tex.glow);
      return n >= 190 || b.skipRequested;
    };
    // one confident step in, the guard down
    K.pose(fz, 'zm_idle', 'wicked', 8);
    const step0 = fz.pos.clone(), step1 = K.ground(b, step0.clone().addScaledVector(fwd, -1.2));
    m.shot((t, out) => K.camAt(out, vg.pos.clone().addScaledVector(side, -5.5).addScaledVector(fwd, 1.8).add(new V3(0, 1.1, 0)), vg.pos.clone().lerp(fz.pos, 0.6).add(new V3(0, 0.9, 0)), 48), 999, { cut: true, blendIn: 0, hold: true });
    n = 0;
    yield () => {
      n++;
      fz.setPosition(step0.clone().lerp(step1, U.easeInOutCubic(Math.min(1, n / 26))));
      fz.vel.set(0, 0, 0);
      return n >= 26 || b.skipRequested;
    };
    // THE KI BLADES (2026-10-19; episode 66: "Zamasu closes in with a ki blade. Vegito counters with a longer ki blade of
    // his own"): the god draws back a hand wrapped in light and lunges with it; the counter is the player's, and only
    // late in the lunge — the prompt shows for that window alone (TU.sword). Too late and his blade lands; he steps back
    // and comes again. After TU.sword.tries the counter comes anyway (the story's)
    const SW = TU.sword;
    const lungeFrom = fz.pos.clone(), lungeTo = K.ground(b, vg.pos.clone().addScaledVector(fwd, 0.9));
    let countered = false;
    m.flags.swordTries = 0;
    m.flags.swordMisses = 0;
    while (!countered) {
      m.flags.swordTries++;
      // the wind-up: the hand drawn back, the blade of light growing out of it (no prompt: read it)
      K.place(fz, lungeFrom, fz.yaw);
      K.faceTo(fz, vg.pos);
      K.pose(fz, 'punchWindR', 'wicked', 14);
      m.shot((t, out) => K.camAt(out, vg.pos.clone().addScaledVector(side, -5.5).addScaledVector(fwd, 1.8).add(new V3(0, 1.1, 0)), vg.pos.clone().lerp(fz.pos, 0.6).add(new V3(0, 0.9, 0)), 48), 999, { cut: true, blendIn: 0, hold: true });
      n = 0;
      yield () => {
        n++;
        if (!b.skipRequested && n % 3 === 0) {
          const hp = fz.handPos('R');
          b.vfx.slash(hp, hp.clone().addScaledVector(fwd, -0.6 - n / 30).add(new V3(0, 0.2, 0)), 0xfff0d0, 0.12, 0.08);
          b.vfx.flash(hp, 0.6 + n / 40, 0xfff0d0, 0.1, SL.Toon.tex.glow);
        }
        return n >= SW.wind || b.skipRequested;
      };
      // the lunge; its last stretch is the window
      K.pose(fz, 'punchR', 'shout', 30);
      let k = 0;
      const lunge = () => {
        k = Math.min(1, k + 1 / SW.lunge);
        fz.setPosition(lungeFrom.clone().lerp(lungeTo, U.easeInCubic(k)));
        fz.vel.set(0, 0, 0);
        if (!b.skipRequested && b.frame % 2 === 0) {
          b.vfx.afterimage(fz.pos, fz.height, 0xffd0f0);
          // his blade of light out ahead of the hand, at Vegito
          const hp = fz.handPos('R');
          b.vfx.slash(hp, hp.clone().addScaledVector(flat(vg.pos.clone().sub(fz.pos)), 1.3).add(new V3(0, -0.15, 0)), 0xfff0d0, 0.1, 0.07);
        }
      };
      m.tickHooks.push(lunge);
      n = 0;
      yield () => ++n >= SW.lunge - SW.window || b.skipRequested;
      // a skip lands on the prompt (as every cue): the counter stays the player's
      const cue = m.flags.swordTries > SW.tries ? { pressed: false } : yield* playerCue(m, vg, 'heavy', 'Now — the Spirit Sword! (Heavy)', { auto: SW.window / 60, slow: 0.5 });
      K.removeHook(m, lunge);
      if (cue.pressed || m.flags.swordTries > SW.tries) {
        countered = true;
        m.flags.swordCountered = !!cue.pressed;
        m.qteParts.push(cue.pressed ? (m.flags.swordTries === 1 ? 1 : 0.7) : 0.4);
        break;
      }
      // too late: his blade lands; Vegito down again; the god steps back to try it once more
      m.flags.swordMisses++;
      fz.setPosition(lungeTo.clone());
      b.vfx.flash(vg.chest(), 2.2, 0xfff0d0, 0.18, SL.Toon.tex.glow);
      b.vfx.slash(fz.handPos('R'), vg.chest(), 0xfff0d0, 0.2, 0.12);
      b.sfx('swordSlash', vg, { vol: 1 });
      b.cameraTraumaAt(vg.chest(), 0.4);
      vg.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', speed: 30, aura: 0 });
      m.say('fused_zamasu', 'Too slow, mortal.', 1.4);
      yield* st.wait(1);
      vg.setState('scripted', { pose: 'vg_feint', expression: 'hurt', speed: 10, aura: 0 });
      b.emit('swordMiss', { tries: m.flags.swordTries });
    }
    // BT-VEG-02 / VEG-S02: no warning — up on one knee, the long blade out of his wrist and clean through the god
    vg.yaw = vg.prevYaw = Math.atan2(fz.pos.x - vg.pos.x, fz.pos.z - vg.pos.z);
    vg.setState('scripted', { pose: 'vg_kneelRaise', expression: 'cocky', speed: 40, aura: 1 });
    vg.anim.play('vg_kneelRaise', 40, { snap: true });
    const pr = sword();
    if (pr) pr.scale.y = 2.4; // ~5 m of blade (the owner: a long blade through his torso)
    if (vg.model.setPropFill) vg.model.setPropFill('spiritSword', 1);
    // held on the blade: his chest on a point 3 m along it, whatever the arm does
    const onBlade = () => {
      const p = sword();
      if (!p || !p.localToWorld) return;
      vg.model.root.updateMatrixWorld(true);
      const at = p.localToWorld(new V3(0, 3 / p.scale.y, 0)).sub(vg.object.position).add(vg.pos);
      fz.grounded = false;
      fz.setPosition(at.sub(fz.chest().sub(fz.pos)));
      fz.vel.set(0, 0, 0);
    };
    m.tickHooks.push(onBlade);
    onBlade();
    // the face must read: jerked back on the blade, eyes bulging, mouth open (snapped: the freeze holds the pose it has)
    fz.setState('scripted', { pose: 'fz2_pierced', expression: 'shock', speed: 40 });
    fz.anim.play('fz2_pierced', 40, { snap: true });
    if (fz.model.setPupilScale) fz.model.setPupilScale(0.3);
    const tvx = fz.chest().sub(vg.handPos('R')).normalize();
    // the impact frame: locked off, in front of him and to one side, so the blade crosses the frame through his middle
    // and his face is above it; the picture a hard negative, both of them frozen for an instant
    const across = new V3(-tvx.z, 0, tvx.x).normalize();
    const front = new V3(-tvx.x, 0, -tvx.z).normalize();
    const face = front.clone().negate(); // the way Vegito faces (toward the god) // level, toward Vegito: the face in frame, the blade rising through him
    m.shot((t, out) => {
      const c = fz.chest();
      K.camAt(out, c.clone().addScaledVector(front, 0.45).addScaledVector(across, 1.75).add(new V3(0, 0.3, 0)), c.clone().add(new V3(0, 0.28, 0)), 48);
    }, 999, { cut: true, blendIn: 0, hold: true });
    // two frames for the snapped poses to land before the freeze holds them
    n = 0;
    yield () => ++n >= 2 || b.skipRequested;
    const stop = Math.round(5 * SL.Settings.data.gameplay.hitStop);
    if (!st.skip.on && !b.skipRequested) {
      for (const f of [vg, fz]) f.freeze = Math.max(f.freeze || 0, stop);
      SL.ScreenFX.impact(1);
      b.cameraTraumaAt(fz.chest(), 0.55);
    }
    b.sfx('swordSlash', fz, { vol: 1.3, pitch: 0.8 });
    b.sfx('punchHeavy', fz, { vol: 1.2, pitch: 0.6 });
    m.flags.impaled = true;
    m.flags.impactFrame = !st.skip.on;
    n = 0;
    yield () => ++n >= 7 || b.skipRequested;
    SL.ScreenFX.impact(0);
    if (!st.skip.on) SL.ScreenFX.flash(0.3, '#e8f4ff');
    // ki bursting out of his back
    n = 0;
    yield () => {
      n++;
      if (!b.skipRequested && n % 4 === 0) {
        const back = fz.chest().addScaledVector(tvx, 0.45);
        b.vfx.flash(back, 1.4 + (n % 12) / 10, n % 8 ? BLUE : GOLD, 0.14, SL.Toon.tex.glow);
        b.vfx.ring(back, 0.8 + (n % 16) / 10, 0xbfe8ff, 0.3, tvx.clone());
      }
      return n >= 50 || b.skipRequested;
    };
    // BT-VEG-03 / VEG-S03: back on Vegito, eye level, the lens pivoting round as he settles on his knee; the taunt
    m.shot((t, out, el) => {
      // from his side swinging round toward his front (the face, the raised hand, the blade going up out of frame)
      const c = vg.chest(), th = 0.6 + 0.45 * U.easeInOutCubic(Math.min(1, el / 2.4));
      const p = c.clone().addScaledVector(side, Math.cos(th) * 2.9).addScaledVector(face, Math.sin(th) * 2.9).add(new V3(0, 0.45, 0));
      K.camAt(out, p, c.clone().addScaledVector(face, 0.3).add(new V3(0, 0.4, 0)), 46);
    }, 999, { cut: true, blendIn: 0, hold: true, subject: vg, face: true });
    m.say('vegito', 'Oh, I\'m sorry... is this hurting you? Aren\'t you invincible?', 3.4, { style: 'dual' });
    m.flags.lifted = true;
    yield* st.wait(3.4);
    // the god on the blade, wide: the long line of light from the kneeling man's wrist
    if (!st.skip.on) {
      m.shot((t, out) => {
        const c = vg.chest().lerp(fz.chest(), 0.5);
        K.camAt(out, c.clone().addScaledVector(side, 7).add(new V3(0, -0.6, 0)), c, 50);
      }, 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(1.4);
    }
    K.removeHook(m, onBlade);
    reset();
  }

  // the second exchange down among the ruins, until the god is on his last legs
  P.fight2 = fightPhase({ id: 'fight2', bulk: true, floor: TU.zamasuFloor, space: null, title: 'Down among the ruins', objective: 'Wear the god down — dodge his judgment, punish him after it' });

  P.final = { id: 'final', run: function* (m) {
    const b = m.battle, S = b.story;
    stage(m);
    const st = SL.data.u6Kit.staged(m);
    const fz = fuseZamasu(m), vg = fuseVegito(m);
    vg.controller = K.scripted();
    fz.controller = K.scripted();
    K.toForm(vg, 'blue');
    K.toForm(fz, 'corrupted');
    sizeTo(fz, TU.bulk.sizeMax);
    mutatedArm(fz, true);
    if (fz.model && fz.model.setPropVisible) fz.model.setPropVisible('halo', false);
    // Vegito on the street, Zamasu above the towers in front of him
    K.place(vg, K.ground(b, vg.pos.clone()), vg.yaw);
    const fwd = new V3(Math.sin(vg.yaw), 0, Math.cos(vg.yaw));
    const high = vg.pos.clone().addScaledVector(fwd, 14).add(new V3(0, 9, 0));
    fz.grounded = false;
    fz.setPosition(high);
    fz.vel.set(0, 0, 0);
    K.faceTo(fz, vg.pos);
    K.pose(fz, 'fz2_raise', 'angry', 8);
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'low' }, 999);
    m.say('fused_zamasu', 'Why...? Why will you not simply accept the judgment of a god?!', 3, { style: 'shout' });
    yield* st.wait(3);
    // the taunt (episode 66: too bulky now to keep up; paraphrased)
    shot(m, { vegito: vg }, { subject: 'vegito', focus: 'upper', angle: 'three' }, 999);
    K.pose(vg, 'vg_point', 'cocky', 8);
    m.say('vegito', 'Look at you — all that bulk, and you can\'t even keep up with me any more.', 3, { style: 'dual' });
    yield* st.wait(3);
    // (2026-10-19) the finisher is the player's: Ultimate to begin it, then the charge held (mash) while the god comes
    // down at him, then the release
    yield* playerCue(m, vg, 'ult', 'Final Kamehameha! (Ultimate)', { auto: 3 });
    // arms crossed, blue and gold crackling round him
    vg.setState('scripted', { pose: 'vg_finalCross', expression: 'shout', speed: 14, aura: 1 });
    b.sfx('beamCharge', vg, { vol: 1.2 });
    m.shot((t, out, el) => {
      const c = vg.chest();
      // round him for a moment (the arms crossed), then side-on: Vegito charging, the god coming down at him
      if (el < 1.2) {
        const a = vg.yaw + 0.5 + el * 1.2;
        K.camAt(out, new V3(c.x + Math.sin(a) * 4, c.y + 0.2, c.z + Math.cos(a) * 4), c, 46);
        return;
      }
      const z = fz.chest(), ax = flat(z.clone().sub(c)), sd = new V3(-ax.z, 0, ax.x);
      const mid = c.clone().lerp(z, 0.5);
      K.camAt(out, mid.clone().addScaledVector(sd, Math.max(7, c.distanceTo(z) * 1.05)).add(new V3(0, 1, 0)), mid, 50);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('vegito', 'FINAL...', 1.8, { style: 'dual' });
    // the charge: the presses fill it, it fills slowly on its own too; he lumbers down at Vegito the while
    const F = TU.finalCharge;
    const fzFrom = fz.pos.clone(), fzTo = vg.pos.clone().addScaledVector(fwd, 7).add(new V3(0, 4, 0));
    let n = 0;
    const rc = yield* m.struggle({
      start: 0.1, drain: -F.fill, duration: F.seconds, label: 'Charge it! (mash)', until: (t, grip) => grip >= 1,
      onTick: (t, grip) => {
        n++;
        fz.setPosition(fzFrom.clone().lerp(fzTo, Math.min(1, t / F.seconds)));
        fz.vel.set(0, 0, 0);
        if (!b.skipRequested && n % 5 === 0) {
          const col = (n / 5) % 2 ? BLUE : GOLD;
          b.vfx.ring(vg.chest(), 1.4 + grip * 2.2, col, 0.4, new V3(Math.sin(n), 1, Math.cos(n)).normalize());
          b.vfx.flash(vg.chest(), 1 + grip * 1.6, col, 0.12, SL.Toon.tex.glow);
        }
      },
    });
    m.flags.chargeGrip = rc.grip;
    m.qteParts.push(U.clamp01(rc.grip));
    m.flags.charged = true;
    // the release, on the player's word
    vg.setState('scripted', { pose: 'vg_finalCross', expression: 'shout', speed: 14, aura: 1 });
    yield* playerCue(m, vg, 'ult', 'Release it! (Ultimate)', { auto: 2, slow: 0.5 });
    m.flags.released = true;
    const ctx = { b, m };
    if (!b.skipRequested) {
      fz.intangible = true;
      vg.setState('scripted', { pose: 'vg_kameFire', expression: 'shout', speed: 20, aura: 1 });
      SL.Cinema.beam(ctx, vg, fz, FINAL_KAME);
      b.sfx('beamFire', vg, { vol: 1.5, pitch: 0.8 });
      b.sfx('kiBlastBig', vg, { vol: 1.2, pitch: 0.7 });
      b.cameraTraumaAt(vg.chest(), 0.9);
      m.say('vegito', 'KAMEHAME... HAAAA!', 2, { style: 'dual' });
      const pin = () => SL.Cinema.pinBeam(ctx, 0xbfe8ff);
      m.tickHooks.push(pin);
      // over his shoulder, then wide as it tears up through the sky
      m.shot((t, out) => K.camAt(out, vg.chest().addScaledVector(fwd, -3).add(new V3(1, 0.7, 0)), fz.chest(), 52), 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(1.2);
      m.shot((t, out) => {
        const mid = vg.chest().lerp(fz.chest(), 0.5);
        const side = new V3(fwd.z, 0, -fwd.x);
        K.camAt(out, mid.clone().addScaledVector(side, 34).add(new V3(0, -3, 0)), mid.clone().add(new V3(0, 3, 0)), 60);
      }, 999, { cut: true, blendIn: 0, hold: true });
      yield* st.wait(1.6);
      K.removeHook(m, pin);
    }
    if (ctx.beam && !ctx.beam.done) ctx.beam.dispose();
    b.vfx.explosion(fz.chest(), 5, 0xbfe8ff, { smoke: true });
    b.sfx('explosionHuge', fz, { vol: 1.1 });
    fz.intangible = false;
    m.flags.finalKame = true;
    yield* st.wait(0.8);
    // sure it is over (Roadmap Three, the owner's Gemini research — a research draft, not checked against the footage):
    // the smoke over the towers, a smirk, the shoulders rolled — and then the fusion gives out under him
    if (!b.skipRequested) {
      K.pose(vg, 'vg_shoulders', 'cocky', 6);
      m.shot((t, out) => K.camAt(out, vg.chest().addScaledVector(fwd, 2.8).add(new V3(0.7, 0.15, 0)), vg.chest().add(new V3(0, 0.15, 0)), 40), 999, { cut: true, blendIn: 0, hold: true });
      m.say('vegito', 'Hmph. Not even a speck left of your "justice".', 2.2, { style: 'dual' });
      m.flags.falseVictory = true;
      yield* st.wait(2.2);
    }
    // the fusion runs out: Blue burned through the Potara's power
    const fwdNow = fwd.clone();
    if (S.vgHandle && S.vgHandle.active) SL.Fusion.defuse(b, S.vgHandle, { to: S.goku, silent: !!b.skipRequested });
    m.flags.defused = !S.vgHandle.active;
    const g = S.goku, v = S.vegeta;
    for (const f of [g, v]) {
      f.controller = K.scripted();
      VK().earOff(f);
      K.toForm(f, 'base');
      K.faceTo(f, fz.pos);
    }
    K.pose(g, 'idle', 'shock', 6);
    K.pose(v, 'idle', 'angry', 6);
    m.shot((t, out) => {
      const c = g.chest().lerp(v.chest(), 0.5);
      K.camAt(out, c.clone().addScaledVector(fwdNow, 3.4).add(new V3(0, 0.1, 0)), c, 44);
    }, 999, { cut: true, blendIn: 0, hold: true });
    m.say('goku', 'Huh?! We split already?! The Potara\'s supposed to be permanent!', 2.8, { style: 'shout' });
    yield* st.wait(2.8);
    m.say('vegeta', 'Blue burned through it... We used up the fusion\'s power, you fool!', 3);
    yield* st.wait(3);
    // the smoke clears on him still standing (episode 66: he survives it) — the Half-Corrupted god, bigger than ever
    K.place(fz, K.ground(b, g.pos.clone().addScaledVector(fwdNow, 10)), 0);
    K.faceTo(fz, g.pos);
    K.toForm(fz, 'corrupted');
    m.flags.corrupted = fz.form.id === 'corrupted';
    m.flags.survived = fz.alive && !fz.hidden;
    fz.controller = K.scripted();
    K.pose(fz, 'zm_idle', 'wicked', 4);
    shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'three' }, 999);
    m.say('vegeta', 'He took that and he\'s still standing?!', 2.2, { style: 'shout' });
    yield* st.wait(2.2);
    shot(m, { fz }, { subject: 'fz', focus: 'upper', angle: 'low' }, 999);
    m.say('fused_zamasu', 'This body cannot be destroyed. Justice... is eternal!', 3, { style: 'shout' });
    yield* st.wait(3);
    m.endShot();
    b.skipRequested = false;
    m.fade('black', 1.1);
    yield* m.cine(1.3);
    m.title(CHAPTER, 'VEGITO', m.nextLine(), 4);
    yield* m.cine(4.2);
  } };

  SL.data.ftVegito = { TU };
  SL.data.missions.ft_vegito = {
    id: 'ft_vegito', canon: true, chapter: CHAPTER, title: 'Vegito', character: 'vegito', stage: 'future_ruins',
    subtitle: 'Future · Age 796 · two Potara fusions', parTime: 300, qteLabel: 'Against the immortal god',
    blurb: 'Black and Zamasu become one god. Goku and Vegeta answer with their own Potara — Vegito, in Blue — until Blue burns through the fusion itself.',
    lockForms: { goku: SL.data.characters.goku.forms.filter((x) => !['base', 'blue'].includes(x.id)).map((x) => x.id) },
    // the fight it was made for: Vegito Blue's God Slicer (a Free Battle technique everywhere else in the story)
    openExtras: ['godSlicer'],
    rules: { allowTransform: false, allowUltimates: true },
    rewards: ['Story: Vegito Blue against Fused Zamasu', 'Free Battle: Vegito Blue, God Slicer', 'Character: Fused Zamasu'],
    setup,
    phases: [P.merge, P.assault, P.turn, P.fight, P.wrath, P.fight2, P.final],
  };
})();
