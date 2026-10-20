/*
 * MOVIE: FUSION REBORN (not canon) — mission 5 of 7: "Nothing to Lose"
 * (opens once both Earth missions are cleared)
 *
 *   STRUGGLE * (play)                SSJ2 GOKU against SUPER JANEMBA (the owner's beat sheet: the third level is
 *                                    spent; the second is all he has, and it is nowhere near enough). The sword,
 *                                    the dimensional slashes, the claw through a portal — and he reads you. The
 *                                    same strike three times, a string held too long, and he comes apart into
 *                                    cubes and is behind you (Phantom Shift). Your blows barely touch him.
 *                                    Last as long as you can; the story ends it when the gold runs out.
 *   ARRIVE     (scene)               the sword raised over a beaten Goku — a gold blast — VEGETA, with a halo
 *                                    over his head; the whole exchange ("I have nothing to lose")
 *   DUO *      (play, switch)        VEGETA (Goku on the switch): two Saiyans against him at once, and it still
 *                                    is not enough — land eight clean blows and watch them do nothing. Vary
 *                                    your attacks or he punishes you for it.
 *   NEEDLES    (staged)              a storm of dimensional needles: both of them down; Goku drags the battered
 *                                    Vegeta by the arm behind the giant floating spiked rock
 *   PROPOSAL   (scene fr_proposal)   Vegeta down on one knee, clutching his bleeding shoulder; Goku standing over him,
 *                                    explaining the dance in a rush and showing every step; "Ballet!!!?", "you're
 *                                    already dead" — then Janemba hovering high over the jellybean ground, cutting
 *                                    the empty air: the cuts rain glass needles on the rock and drive them out,
 *                                    up into the air (the dance itself is the next mission, under that fire)
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const FR = SL.data.frKit;

  const VG = { struggleSeconds: 45, struggleFloor: 0.3, sjDealt: 0.45, duoHits: 10, duoMin: 20, duoSeconds: 55, gap: 0.12, heroFloor: 0.35 };
  const cpu = (b, extra) => new SL.AIController(b, Object.assign({ difficulty: SL.Settings.data.gameplay.difficulty }, extra || {}));

  function setup(battle) {
    const b = battle;
    FR.warped(b);
    const field = FR.lm(b, 'field');
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: FR.at(b, field.x, field.z + 7), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: FR.at(b, field.x - 10, field.z + 12), startKi: 100 });
    const sj = b.spawn({ charId: 'super_janemba', team: 1, pos: FR.at(b, field.x, field.z - 5), startKi: 100 });
    const yemma = b.spawn({ charId: 'king_yemma', team: 0, pos: FR.lm(b, 'yemma'), startKi: 0 });
    yemma.noCollide = true;
    K.watcher(yemma, 'ye_worry', 'shock');
    yemma.yaw = yemma.prevYaw = 0;
    K.watcher(vegeta, 'armsCrossed', 'smirk');
    vegeta.setHidden(true);
    K.watcher(sj, 'sj_idle', 'wicked');
    sj.cannotDie = true;
    FR.halo(b, goku);
    b.story = { goku, vegeta, sj, yemma };
  }

  function face(b) {
    const S = b.story, field = FR.lm(b, 'field');
    K.place(S.goku, FR.at(b, field.x, field.z + 7), Math.PI);
    K.place(S.sj, FR.at(b, field.x, field.z - 5), 0);
    K.faceTo(S.goku, S.sj.pos);
    K.faceTo(S.sj, S.goku.pos);
  }

  const P = {};

  P.struggle = {
    id: 'struggle',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, sj = S.sj;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      face(b);
      K.toForm(g, 'ssj2');
      g.ki = g.kiMax;
      g.hp = g.hpMax;
      sj.hp = sj.hpMax;
      b.switchPlayer(g, { force: true });
      sj.untargetable = false;
      sj.intangible = false;
      sj.controller = cpu(b);
      sj.target = g;
      g.target = sj;
      g.setState('free');
      sj.setState('free');
      m.title(FR.CHAPTER, 'SUPER JANEMBA', 'Goku · Super Saiyan 2', 2.8);
      m.music('super_janemba', 2);
      m.powerGap(sj, { from: [g], mul: VG.gap, beams: false });
      const fight = m.storyFight({ floors: [{ f: g, at: VG.struggleFloor }], dealt: [{ f: sj, mul: VG.sjDealt }], ease: { foe: sj, hero: g, below: 0.6, min: 0.5 } });
      m.objective('last', 'Hold out against Super Janemba', { icon: 'guard' });
      m.objective('vary', 'Do not let him read you (no Phantom Shift behind you)', { icon: 'transform', optional: true });
      m.prompt('frVary', 'light', 'He reads repeated strikes — vary your attacks', { always: true, when: () => (m.flags.phantoms || 0) > 0, until: () => false });
      const offE = b.on('phantomEvade', (e) => {
        if (e.fighter !== sj) return;
        m.flags.phantoms = (m.flags.phantoms || 0) + 1;
        m.failObjective('vary');
        if (m.flags.phantoms === 1) m.say('goku', 'Where did he— BEHIND me?!', 2, { style: 'shout' });
      });
      m.onDispose(offE);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => fight.floored(g) || t > VG.struggleSeconds || m.state !== 'running';
      K.unhook(m, clock);
      offE();
      if (m.state !== 'running') return;
      m.complete('last');
      if (!m.flags.phantoms) m.complete('vary');
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      // the gold goes out of him
      K.toForm(g, 'base');
      b.vfx.flash(g.chest(), 2, 0xfff0b0, 0.2, SL.Toon.tex.glow);
      b.sfx('capsulePop', g, { pitch: 0.6 });
      g.setDamage && g.setDamage(1);
    },
  };

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, sj = S.sj, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      if (g.formIndex !== 0) K.toForm(g, 'base');
      g.controller = K.scripted();
      sj.controller = K.scripted();
      K.place(g, FR.at(b, g.pos.x, g.pos.z), g.yaw);
      g.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      K.place(sj, FR.at(b, g.pos.x + g.forward.x * 2.2, g.pos.z + g.forward.z * 2.2), 0);
      K.faceTo(sj, g.pos);
      // Vegeta, a little way off and above, where the blast came from
      const side = new V3(sj.forward.z, 0, -sj.forward.x);
      const vp = g.pos.clone().addScaledVector(side, 7).addScaledVector(sj.forward, 3);
      K.place(v, FR.at(b, vp.x, vp.z), 0);
      K.faceTo(v, sj.pos);
      v.setHidden(true);
      yield* SL.Cinema.play(m, 'fr_vegeta_arrive');
      g.setState('scripted', { pose: 'idle', expression: 'serious' });
    },
  };

  P.duo = {
    id: 'duo',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, v = S.vegeta, sj = S.sj;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      FR.warped(b);
      v.setHidden(false);
      FR.halo(b, v);
      if (g.formIndex !== 0) K.toForm(g, 'base');
      const field = FR.lm(b, 'field');
      K.place(sj, FR.at(b, field.x, field.z - 5), 0);
      K.place(v, FR.at(b, field.x - 2.5, field.z + 6), Math.PI);
      K.place(g, FR.at(b, field.x + 2.5, field.z + 7), Math.PI);
      for (const f of [g, v]) {
        f.hp = Math.max(f.hp, f.hpMax * 0.8);
        f.ki = f.kiMax;
        f.untargetable = false;
        f.intangible = false;
        f.target = sj;
        K.faceTo(f, sj.pos);
      }
      sj.hp = sj.hpMax;
      b.switchPlayer(v, { force: true });
      b.setParty([v, g], { allyDifficulty: 'normal' });
      sj.controller = cpu(b);
      sj.target = v;
      sj.untargetable = false;
      sj.intangible = false;
      for (const f of [g, v, sj]) f.setState('free');
      m.music('super_janemba', 3);
      m.powerGap(sj, { from: [g, v], mul: VG.gap, beams: false, lines: [{ at: 4, who: 'vegeta', line: 'What...? NOTHING is getting through!', duration: 2.4, style: 'shout' }] });
      const fight = m.storyFight({ floors: [{ f: v, at: VG.heroFloor }, { f: g, at: VG.heroFloor }], dealt: [{ f: sj, mul: VG.sjDealt }] });
      m.objective('hits', 'Land clean blows on Super Janemba', { icon: 'fist', target: VG.duoHits });
      m.objective('both', 'Keep both of you standing', { icon: 'guard', optional: true });
      m.prompt('frDuoSwap', 'partyNext', 'Switch fighter', { always: true, when: () => b.player.hpFrac < 0.55 && b.partyAlive().length > 1, until: () => SL.Input.pressed('partyNext') });
      m.prompt('frDuoTf', 'transform', 'Transform', { always: true, when: () => b.player.formIndex === 0 && b.player.ki >= 50 && b.player.state === 'free', until: () => b.player.formIndex > 0 });
      let hits = 0;
      const offN = b.on('noSell', (e) => {
        if (e.fighter !== sj || (e.attacker !== g && e.attacker !== v)) return;
        hits++;
        m.progress('hits', Math.min(VG.duoHits, hits));
      });
      const offK = b.on('allyDown', () => m.failObjective('both'));
      m.onDispose(offN);
      m.onDispose(offK);
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
      };
      m.tickHooks.push(clock);
      yield () => (hits >= VG.duoHits && t > VG.duoMin) || t > VG.duoSeconds || (fight.floored(v) && fight.floored(g)) || m.state !== 'running';
      K.unhook(m, clock);
      offN();
      offK();
      if (m.state !== 'running') return;
      m.complete('hits');
      if (b.partyAlive().length === 2) m.complete('both');
      m.flags.duoHits = hits;
      // THE NEEDLES: a storm of dimensional points out of the air round them
      m.lock(true);
      K.clearCombat(b);
      b.aiLocked = true;
      for (const f of [g, v, sj]) f.controller = K.scripted();
      sj.setState('scripted', { pose: 'sj_roar', expression: 'wicked' });
      SL.Cinema.shotOn(m, { sj, goku: g }, { subject: 'sj', with: 'goku', focus: 'wide', angle: 'low' }, 999, { cut: true, blendIn: 0, hold: true });
      let n = 0;
      const storm = () => {
        n++;
        if (n % 3 !== 0 || n > 120) return;
        for (const f of [g, v]) {
          const from = f.chest().add(new V3(Math.sin(n * 1.7) * 5, 2 + Math.cos(n * 1.1) * 3, Math.cos(n * 2.3) * 5));
          b.vfx.slash(from, f.chest(), 0xff4a8a, 0.18, 0.06);
          if (n % 9 === 0) {
            b.vfx.impact(f.chest(), 2, 0xff8ac8);
            b.sfx('punchLight', f, { pitch: 1.4, vol: 0.6 });
          }
        }
        if (n % 12 === 0) SL.Dimension.portal(b, sj.chest().add(new V3(Math.sin(n) * 3, 2, Math.cos(n) * 3)), sj.forward, { radius: 0.5, life: 14, open: 3, sfx: false });
      };
      m.tickHooks.push(storm);
      b.sfx('warpShatter', sj, { vol: 1 });
      yield* m.cine(1.4);
      for (const f of [g, v]) {
        f.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
        if (f.setDamage) f.setDamage(2);
        if (f.formIndex !== 0) K.toForm(f, 'base');
      }
      b.cameraTraumaAt(g.chest(), 0.6);
      yield* m.cine(1.2);
      K.unhook(m, storm);
      // he gets to Vegeta first, an arm in each hand, and drags him away — out of Janemba's sight
      sj.setHidden(true);
      const dir = new V3(Math.sin(v.yaw + Math.PI), 0, Math.cos(v.yaw + Math.PI));
      K.place(g, FR.at(b, v.pos.x - dir.x * 1.1, v.pos.z - dir.z * 1.1), 0);
      K.faceTo(g, v.pos);
      g.setState('scripted', { pose: 'g_drag', expression: 'determined', speed: 12 });
      v.setState('scripted', { pose: 'knockdown', expression: 'hurt', speed: 8 });
      const g0 = g.pos.clone(), v0 = v.pos.clone(), back = g0.clone().sub(v0).setY(0).normalize();
      let dn = 0;
      const drag = () => {
        dn++;
        const d = Math.min(1, dn / 110) * 3.6;
        const gp = g0.clone().addScaledVector(back, d), vp = v0.clone().addScaledVector(back, d);
        K.place(g, FR.at(b, gp.x, gp.z), g.yaw);
        K.place(v, FR.at(b, vp.x, vp.z), v.yaw);
        if (dn % 14 === 0) b.vfx.dust(vp.clone(), 0.5, 3, 0xffd8f0);
      };
      m.tickHooks.push(drag);
      m.shot((t, out) => {
        const c = g.chest().lerp(v.chest(), 0.5), side = new V3(back.z, 0, -back.x);
        out.pos.copy(c).addScaledVector(side, 5.2).addScaledVector(back, 1.2).add(new V3(0, 0.6, 0));
        out.look.copy(c).add(new V3(0, -0.3, 0));
        out.fov = 46;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      m.say('goku', 'Come on, Vegeta — hang on...!', 1.8, { style: 'quiet' });
      yield* m.cine(1.9);
      K.unhook(m, drag);
      m.endShot();
      // behind the floating spiked rock, out of his sight for a moment
      m.fade('black', 0.35);
      yield* m.cine(0.4);
      const hide = FR.lm(b, 'spikeBehind');
      K.place(g, FR.at(b, hide.x + 1.2, hide.z), 0);
      K.place(v, FR.at(b, hide.x - 1.2, hide.z - 0.4), 0);
      K.faceTo(g, v.pos);
      K.faceTo(v, g.pos);
      K.place(sj, FR.at(b, hide.x + 26, hide.z + 22), 0);
      sj.setHidden(true);
      m.fade('clear', 0.6);
    },
  };

  P.proposal = {
    id: 'proposal',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      const hide = FR.lm(b, 'spikeBehind');
      if (S.goku.pos.distanceTo(hide) > 6) {
        K.place(S.goku, FR.at(b, hide.x + 1.2, hide.z), 0);
        K.place(S.vegeta, FR.at(b, hide.x - 1.2, hide.z - 0.4), 0);
        S.vegeta.setHidden(false);
        FR.halo(b, S.vegeta);
      }
      K.faceTo(S.goku, S.vegeta.pos);
      K.faceTo(S.vegeta, S.goku.pos);
      for (const f of [S.goku, S.vegeta]) f.controller = K.scripted();
      // down on one knee, the shoulder bleeding; Goku standing over him
      S.vegeta.setState('scripted', { pose: 'v_kneelShoulder', expression: 'grit', speed: 20 });
      S.vegeta.anim.play('v_kneelShoulder', 20, { snap: true });
      if (S.vegeta.setDamage) S.vegeta.setDamage(2);
      if (!S.wound) S.wound = FR.wound(b, S.vegeta, 'shoulderR');
      yield* SL.Cinema.play(m, 'fr_proposal');
      // he has found them: high over the jellybean ground, cutting the empty air — and every cut rains
      // dimensional glass needles down on the rock
      const sj = S.sj, g = S.goku, v = S.vegeta;
      sj.setHidden(false);
      sj.controller = K.scripted();
      if (sj.model.setPropFill) sj.model.setPropFill('sword', 1);
      // over the open ground on the far side from the rock (the rock never blocks him from the lens)
      const spike = FR.lm(b, 'spike');
      const open = hide.clone().sub(spike).setY(0).normalize();
      K.hover(b, sj, hide.clone().addScaledVector(open, 9), 10);
      K.faceTo(sj, hide);
      const base = g.pos.clone().lerp(v.pos, 0.5);
      const toSJ = sj.pos.clone().sub(base).setY(0).normalize(), side = new V3(toSJ.z, 0, -toSJ.x);
      m.shot((t, out) => {
        out.pos.copy(base).addScaledVector(toSJ, -2.6).addScaledVector(side, 1.3).add(new V3(0, 0.7, 0));
        out.look.copy(sj.chest()).lerp(base, 0.22);
        out.fov = 48;
      }, 999, { hold: true, cut: true, blendIn: 0 });
      for (let i = 0; i < 4; i++) {
        sj.setState('scripted', { pose: i % 2 ? 'sj_backW' : 'sj_slashW', expression: 'wicked', speed: 18 });
        yield* m.cine(0.3);
        sj.setState('scripted', { pose: i % 2 ? 'sj_back' : 'sj_slash', expression: 'wicked', speed: 40 });
        const cut = sj.chest().add(new V3(0, 0.6, 0));
        b.vfx.slash(cut.clone().add(new V3(-1.4, 0.8, 0)), cut.clone().add(new V3(1.4, -0.8, 0)), 0xff3a5a, 0.28, 0.08);
        b.sfx('swordSlash', sj, { pitch: 0.9 + i * 0.05 });
        FR.needles(b, cut, base, { count: 12, spread: 2.8 + i * 0.4 });
        b.cameraTraumaAt(base, 0.25);
        if (i === 1) {
          m.say('goku', 'He found us — MOVE!', 1.6, { style: 'shout' });
          g.setState('scripted', { pose: 'idle', expression: 'shout', speed: 14 });
          v.setState('scripted', { pose: 'idle', expression: 'angry', speed: 10 });
        }
        yield* m.cine(0.35);
      }
      // out from behind the rock and up into the air, under the fire
      for (const f of [g, v]) f.setState('scripted', { pose: 'flyForward', expression: 'determined', speed: 12 });
      const gp = g.pos.clone(), vp = v.pos.clone();
      let up = 0;
      const rise = () => {
        up++;
        const k = Math.min(1, up / 30), e = 1 - (1 - k) * (1 - k);
        g.setPosition(gp.clone().add(new V3(1.2 * e, 5 * e, 0)));
        v.setPosition(vp.clone().add(new V3(-1.2 * e, 5 * e, 0)));
        g.grounded = v.grounded = false;
        if (up % 4 === 0) FR.needles(b, sj.chest(), base, { count: 4, spread: 3.5 });
      };
      m.tickHooks.push(rise);
      b.sfx('dash', g, { vol: 0.8 });
      yield* m.cine(0.9);
      K.unhook(m, rise);
      m.fade('black', 0.5);
      yield* m.cine(0.6);
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(FR.CHAPTER, 'NOTHING TO LOSE', m.nextLine(), 4);
      yield* m.cine(4.2);
    },
  };

  const def = {
    id: 'fr_vegeta',
    movie: 'fusion_reborn',
    chapter: FR.CHAPTER,
    title: 'Nothing to Lose',
    subtitle: 'The Other World · not canon',
    character: 'vegeta',
    stage: 'other_world',
    parTime: 420,
    // the second level is open here (the owner's beat sheet); the third is spent
    lockForms: Object.assign({}, FR.LOCKS, { goku: ['kaioken', 'ssj3', 'god', 'godki'] }),
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Super Janemba cuts through space with a sword pulled out of his own head. Goku cannot touch him — and then a prince with a halo comes back from Hell to try.',
    rewards: ['Movie: Vegeta\'s return'],
    setup,
    phases: [P.struggle, P.arrive, P.duo, P.proposal, P.after],
  };

  SL.data.frVegeta = { VG };
  SL.data.missions[def.id] = def;
})();
