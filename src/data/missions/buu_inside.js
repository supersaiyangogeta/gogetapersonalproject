/*
 * CHAPTER 13 — BUU SAGA: VEGITO
 * Mission "Inside Buu" (canon; played as Super Vegito, then as Vegeta). Vegito could end Buuhan with
 * one blast — and everybody inside him with it. So he lets himself be eaten.
 *
 *   TRAP     (scene)       Buuhan on his knees; Vegito lowers his aura, folds his arms, and all but
 *                          asks for it; the sheet torn off Buuhan's shoulder, sliding round behind
 *                          him, rearing up — and just before it closes, a sphere of ki (a cue: Guard)
 *                          "...hook, line and sinker." Buuhan, laughing, invincible.
 *   INSIDE   (checkpoint)  the inside of Buu: the barrier drops, the air bends — the Potara give out.
 *                          A flash: Goku and Vegeta, two again. The broken earring, crushed in a fist.
 *                          "Now let's go find our sons!"
 *   SEARCH   (checkpoint)  as Vegeta: find the pods — Gohan, Goten, Trunks, Piccolo — while Buu's body
 *                          spits at you and his voice tells you to get out
 *   PODS     (scene)       Buuhan's face grows out of the wall; tear them free (a cue: Heavy); the fat
 *                          Buu in his own pod — "Leave that one!" — "Who cares?" — everything heaves
 *   OUT      (scene)       out through the steam; outside, the huge body shrinking, and something
 *                          small and much worse standing up in it
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const VK = SL.data.vegitoKit;

  const IN = {
    searchSeconds: 150, // after this the pods are found anyway
    podReach: 3.2,
    spitEvery: 7,
  };
  const HERE = new V3(0, 0, 2);
  // the pods inside: who is in each, where
  const PODS = [
    { who: 'gohan', pos: new V3(-14, 0, -8) },
    { who: 'goten', pos: new V3(12, 0, -12) },
    { who: 'trunks', pos: new V3(18, 0, 6) },
    { who: 'piccolo', pos: new V3(-18, 0, 12) },
    { who: 'fat', pos: new V3(0, 0, -26) },
  ];

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(-0.8, 2), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(0.8, 2), startKi: 100 });
    const bh = b.spawn({ charId: 'buuhan', team: 1, pos: at(0, -4), startKi: 240, tags: { boss: true } });
    const inner = b.spawn({ charId: 'buuhan', team: 1, pos: at(0, -40), startKi: 100 });
    const gohan = b.spawn({ charId: 'adult_gohan', team: 0, pos: at(-30, -30), wardrobe: { outfit: 'ag_ultimate', hair: 'hair_gohan_ultimate' } });
    const goten = b.spawn({ charId: 'goten', team: 0, pos: at(-30, -30) });
    const trunks = b.spawn({ charId: 'kid_trunks', team: 0, pos: at(-30, -30) });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(-30, -30) });
    const fat = b.spawn({ charId: 'majin_buu', team: 0, pos: at(-30, -30) });
    for (const f of [bh, inner, gohan, goten, trunks, piccolo, fat]) K.watcher(f, 'idle', 'calm');
    for (const f of [inner, gohan, goten, trunks, piccolo, fat]) f.setHidden(true);
    K.toForm(gohan, 'ultimate');
    for (const f of [goku, vegeta, bh, inner]) f.cannotDie = true;
    bh.mech.maxReforms = Infinity;
    goku.lockedForms = { ssj3: true, kaioken: true };
    vegeta.lockedForms = { majin: true };
    b.story = { goku, vegeta, bh, inner, gohan, goten, trunks, piccolo, fat, vegito: null, owned: false };
  }

  /** Vegito, fused and super (the state the last mission left him in). */
  function fused(m) {
    const b = m.battle, S = b.story;
    if (S.vegito) return S.vegito;
    const h = SL.Fusion.fuse(b, S.goku, S.vegeta, 'vegito', { silent: true, hpFrac: 1, form: 'ssj' });
    S.fusion = h;
    S.vegito = h.fused;
    S.vegito.cannotDie = true;
    return S.vegito;
  }

  function own(m) {
    const b = m.battle, S = b.story;
    if (S.owned) return;
    S.owned = true;
    fused(m);
    SL.data.princeMission.canyonSet(m);
    S.sheet = VK.creeper(m, { path: [new V3(), new V3(0, 0, 1)], size: 0.2 });
    S.sheet.hide();
    S.barrier = VK.barrier(m, S.vegito);
  }

  /** The inside: the stage, the set, the pods and who is in them. */
  function goInside(m) {
    const b = m.battle, S = b.story;
    if (S.innards) return;
    K.clearCombat(b);
    b.changeStage('buu_inside');
    m.endShot();
    S.innards = VK.innards(m, PODS.map((p) => ({ pos: K.ground(b, p.pos), who: p.who })));
    S.innards.pods.forEach((pod, i) => {
      const f = S[PODS[i].who];
      f.setHidden(false);
      f.setPosition(pod.pos.clone().add(new V3(0, -f.height * 0.45, 0)));
      f.grounded = false;
      K.watcher(f, 'podCurl', 'ko');
      pod.fighter = f;
    });
    S.bh.setHidden(true);
    S.bh.untargetable = S.bh.intangible = true;
    let t = 0;
    m.tickHooks.push(() => {
      t += 1 / 60;
      S.innards.pulse(t);
    });
  }

  const P = {};

  P.trap = {
    id: 'trap',
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, v = S.vegito, bh = S.bh;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      K.place(v, K.ground(b, HERE));
      K.place(bh, K.ground(b, HERE.clone().add(new V3(0, 0, -5))));
      K.faceTo(v, bh.pos);
      K.faceTo(bh, v.pos);
      yield* SL.Cinema.play(m, 'in_trap');
    },
  };

  P.inside = {
    id: 'inside',
    checkpoint: true,
    run: function* (m) {
      own(m);
      m.lock(true);
      m.clearObjectives();
      goInside(m);
      yield* SL.Cinema.play(m, 'in_split');
    },
  };

  /** Vegeta, searching his enemy's insides for his son. */
  P.search = {
    id: 'search',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      goInside(m);
      // restaged: two again
      if (S.fusion && S.fusion.active) SL.Fusion.defuse(b, S.fusion, { silent: true, to: S.vegeta });
      S.vegito.setHidden && S.vegito.alive && S.vegito.setHidden(true);
      const g = S.goku, ve = S.vegeta;
      for (const f of [g, ve]) {
        f.setHidden(false);
        f.untargetable = f.intangible = false;
        VK.earOff(f);
      }
      if (!S.vegetaHalo) S.vegetaHalo = SL.Cinema.halo(b, ve);
      K.place(ve, K.ground(b, HERE));
      K.place(g, K.ground(b, HERE.clone().add(new V3(1.4, 0, 1))));
      if (b.player !== ve) b.switchPlayer(ve, { force: true });
      K.watcher(g, 'idle', 'calm');
      ve.untargetable = ve.intangible = false;
      ve.target = null;
      ve.lockMode = 'free';
      ve.setState('free');
      m.music('vision', 3);
      m.objective('pods', 'Find them inside Buu', { icon: 'target', target: 4 });
      m.limits({ transform: false, ult: false });
      m.lock(false);
      b.aiLocked = true;
      const found = (S.found = new Set());
      let t = 0, spit = IN.spitEvery;
      const pods = S.innards.pods;
      const lines = {
        gohan: ['vegeta', 'Kakarot! Your son — he\'s in here.'],
        goten: ['goku', 'Goten!'],
        trunks: ['vegeta', '...Trunks. Hang on, boy.'],
        piccolo: ['goku', 'Piccolo, too. They\'re all alive!'],
      };
      const hook = () => {
        t += 1 / 60;
        // Goku follows, a step behind and to the side
        const want = ve.pos.clone().addScaledVector(ve.forward.clone().setY(0).normalize(), -1.6).add(new V3(1.2, 0, 0));
        const d = want.clone().sub(g.pos).setY(0);
        if (d.length() > 0.6) {
          g.setPosition(K.ground(b, g.pos.clone().addScaledVector(d.normalize(), Math.min(d.length(), 9 / 60))));
          K.faceTo(g, want.clone().add(d));
          if (g.sd.pose !== 'run') g.setState('scripted', { pose: 'run', expression: 'calm' });
        } else if (g.sd.pose !== 'idle') g.setState('scripted', { pose: 'idle', expression: 'calm' });
        // Buu's body does not like guests
        spit -= 1 / 60;
        if (spit <= 0) {
          spit = IN.spitEvery;
          const a = b.frame * 0.7;
          const from = new V3(Math.cos(a) * 34, 6, Math.sin(a) * 34);
          b.projectiles.spawnBlast(S.bh, from, ve.chest().sub(from), { kind: 'ball', speed: 34, radius: 0.4, damage: 300, homing: 0.4, color: 0xff7ab8, core: 0xffe0f0, explode: 1.6, knock: 'push', knockSpeed: 10, impact: 1, life: 3 });
          b.sfx('acidSpit', null, { at: from, vol: 0.7 });
          if (b.frame % 3 === 0) m.say('buuhan', U.pick(['What are you doing in there?! GET OUT!', 'I can FEEL you crawling around in there!', 'Get out of me!']), 2.2, { style: 'shout' });
        }
        if (b.frame % 180 === 0) b.camera.addTrauma(0.25);
        for (let i = 0; i < 4; i++) {
          const pod = pods[i];
          if (found.has(i)) continue;
          if (b.frame % 30 === i) b.vfx.flash(pod.pos, 1.2, 0xffd0e8, 0.3, SL.Toon.tex.glow);
          if (Math.hypot(pod.pos.x - ve.pos.x, pod.pos.z - ve.pos.z) < IN.podReach) {
            found.add(i);
            m.progress('pods', found.size);
            const l = lines[PODS[i].who];
            m.say(l[0], l[1], 2.4);
            b.sfx('learn', ve, { vol: 0.5 });
          }
        }
      };
      m.tickHooks.push(hook);
      yield () => found.size >= 4 || t > IN.searchSeconds || b.skipRequested;
      K.unhook(m, hook);
      m.complete('pods');
      m.limits(null);
      m.flags.podsFound = found.size;
      m.flags.searchSeconds = Math.round(t);
      m.lock(true);
      K.clearCombat(b);
      yield* SL.Cinema.play(m, 'in_pods');
      yield* SL.Cinema.play(m, 'in_out');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'INSIDE BUU', 'Next: something worse is waking up', 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_inside',
    canon: true,
    chapter: 'CHAPTER 13 · BUU SAGA',
    title: 'Inside Buu',
    subtitle: 'Nowhere anybody should be · Age 774',
    character: 'vegito',
    stage: 'rocky_canyon',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'The only way to save everybody Buu has eaten is to be eaten too. Vegito has a plan. The Potara have other ideas.',
    rewards: ['Story: the Potara breaks', 'Story: the pods'],
    setup,
    phases: [P.trap, P.inside, P.search, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.insideBuu = { IN, PODS, HERE };
})();
