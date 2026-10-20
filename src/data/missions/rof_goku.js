/*
 * CHAPTER 17 · RESURRECTION OF F — Blue and Gold.
 * The encounter after the invasion: Goku arrives, fights Final / Full Power Frieza,
 * reveals Super Saiyan Blue, faces Golden Frieza, and exposes his stamina weakness.
 * Sorbet's visible ambush ends Goku's turn; Vegeta steps in, still in base.
 * Vegeta's duel, persistent Blue unlock, Earth destruction and Whis's rewind belong
 * to the following encounter. No movie progression is completed by this mission.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit, BK = SL.data.brolyKit, C = SL.data.cinematics;
  const CHAPTER = 'CHAPTER 17 · RESURRECTION OF F';
  const TU = {
    baseFloor: 0.62, fullFloor: 0.42, duelFloor: 0.32, staminaFloor: 0.08,
    baseDealt: 0.065, fullDealt: 0.022, goldenDealt: 0.14, trainedGokuDealt: 3,
    baseTaken: 0.7, fullTaken: 0.8, goldenTaken: 0.62,
    staminaSeconds: 35, blueHold: 3.5,
  };
  const SPOT = { goku: [0, -5], frieza: [0, 7], vegeta: [9, -12], whis: [13, -14], sorbet: [-10, 18],
    gohan: [-11, -13], piccolo: [-12, -11], krillin: [-16, -14], tien: [-19, -16] };
  const at = (b, key) => K.ground(b, new V3(SPOT[key][0], 0, SPOT[key][1]));

  // The reused Golden form adds emissive light, which leaves its white body white.
  // Recolor only this battle's model materials; keep purple accents and restore the
  // original colors when its form changes. Other campaigns' assets stay independent.
  function goldenLook(f) {
    const original = f.rofPalette || (f.rofPalette = new Map());
    for (const mat of f.model.mats.values()) {
      if (!mat.color || mat.userData.basic) continue;
      if (!original.has(mat)) original.set(mat, mat.color.clone());
      const color = original.get(mat), hsl = color.getHSL({});
      if (f.form.id === 'golden' && (mat.userData.skin || (hsl.s < 0.45 && hsl.l > 0.75))) mat.color.set(0xe8b432);
      else mat.color.copy(color);
    }
  }

  function setup(b) {
    const S = {};
    for (const key of Object.keys(SPOT)) {
      S[key] = b.spawn({ charId: key === 'gohan' ? 'adult_gohan' : key, team: ['frieza', 'sorbet'].includes(key) ? 1 : 0,
        player: key === 'goku', pos: at(b, key), startKi: 80 });
    }
    b.story = S;
    b.on('formChanged', (e) => { if (e.fighter === S.frieza) goldenLook(S.frieza); });
    S.goku._playerController = S.goku.controller;
    S.goku.lockedForms = Object.assign({}, S.goku.lockedForms, { blue: true });
    S.frieza.lockedForms = Object.assign({}, S.frieza.lockedForms, { golden: true });
    tableau(b);
    K.toForm(S.frieza, 'final');
  }

  function tableau(b) {
    const S = b.story;
    for (const key of Object.keys(SPOT)) {
      const f = S[key];
      f.setHidden(false);
      K.place(f, at(b, key), 0);
      K.faceTo(f, key === 'frieza' || key === 'sorbet' ? S.goku.pos : S.frieza.pos);
      K.watcher(f, key === 'frieza' ? 'fz_watch' : key === 'sorbet' ? 'sb_idle' : 'idle', 'serious');
      f.cannotDie = true;
    }
    S.piccolo.setState('scripted', { pose: 'knockdownFace', expression: 'ko' });
    S.gohan.setState('scripted', { pose: 'kneelGrieve', expression: 'sad' });
    K.faceTo(S.gohan, S.piccolo.pos);
    K.toForm(S.vegeta, 'base');
  }

  /** Every direct start/retry restores its own forms, cast and real player controller. */
  function stage(m, gForm, fForm) {
    const b = m.battle, S = b.story, g = S.goku, f = S.frieza;
    m.lock(true);
    m.limits(null);
    m.clearObjectives();
    m.endShot();
    K.clearCombat(b);
    tableau(b);
    if (gForm === 'blue') BK.give(g, 'blue');
    else g.lockedForms = Object.assign({}, g.lockedForms, { blue: true });
    if (fForm === 'golden') BK.give(f, 'golden');
    else f.lockedForms = Object.assign({}, f.lockedForms, { golden: true });
    K.toForm(g, gForm);
    K.toForm(f, fForm);
    g.hp = g.hpMax;
    g.ki = g.kiMax * 0.9;
    f.hp = f.hpMax;
    f.ki = f.kiMax * 0.85;
    g.cannotDie = false;
    f.cannotDie = true;
    g.untargetable = g.intangible = f.untargetable = f.intangible = false;
    b.setParty([g], {});
    // Restore the cached player controller after tableau() assigned story watchers.
    g.controller = g._playerController || (g._playerController = new SL.PlayerController(b));
    b.switchPlayer(g, { force: true, quiet: true });
    g.target = f;
    f.target = g;
    g.setState('free');
    f.setState('free');
  }

  /** Advancement requires damage dealt by the player; waiting never wins a fight. */
  function* fight(m, opts) {
    const b = m.battle, g = b.story.goku, f = b.story.frieza;
    g.untargetable = g.intangible = f.untargetable = f.intangible = false;
    g.setState('free');
    f.setState('free');
    f.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty,
      profile: Object.assign({}, f.def.ai, { transformHp: 0, aggression: opts.stamina ? 0.55 : 0.7 }) });
    const battle = m.storyFight({
      floors: [{ f, at: opts.floor }],
      // This is Goku after training with Whis; the reused base fighter has Saiyan-era numbers.
      dealt: [{ f, mul: opts.dealt }, { f: g, mul: TU.trainedGokuDealt }],
      taken: [{ f, mul: opts.taken }],
      fighters: [g, f], space: 'ground',
    });
    m.music('battle', opts.stamina ? 3 : 4);
    m.title(CHAPTER, opts.title, opts.subtitle, 2.5);
    m.objective('fight', opts.objective, { icon: 'fist' });
    // These two story stretches stay Blue until the scripted loss of guard.
    m.limits(g.form.id === 'blue' ? { revert: false } : null);
    m.lock(false);
    b.aiLocked = false;
    let elapsed = 0, warned = false;
    const drain = opts.stamina ? () => {
      if (b.inputLocked) return;
      elapsed += 1 / 60;
      const loss = Math.min(1, elapsed / TU.staminaSeconds);
      f.ki = Math.min(f.ki, f.kiMax * (0.85 - loss * 0.75));
      f.damageDealtMul = opts.dealt * (1 - loss * 0.62);
      f.damageTakenMul = opts.taken + loss * 0.6;
      if (loss > 0.5 && !warned) {
        warned = true;
        m.say('goku', 'You rushed here before you learned to keep that power. Your energy is dropping!', 4);
      }
    } : null;
    if (drain) m.tickHooks.push(drain);
    yield () => battle.floored(f) || m.state !== 'running';
    if (drain) K.unhook(m, drain);
    battle.off();
    if (m.state !== 'running') return;
    m.complete('fight');
    m.lock(true);
    b.aiLocked = true;
    K.clearCombat(b);
    K.watcher(g, 'idle', 'serious');
    K.watcher(f, 'exhausted', 'angry');
    m.flags[opts.flag] = true;
  }

  const P = {};
  P.arrival = { id: 'arrival', checkpoint: true, run: function* (m) {
    stage(m, 'base', 'final');
    yield* SL.Cinema.play(m, 'rof_goku_arrival');
  } };
  P.base = { id: 'base', checkpoint: true, run: function* (m) {
    stage(m, 'base', 'final');
    yield* fight(m, { floor: TU.baseFloor, dealt: TU.baseDealt, taken: TU.baseTaken, flag: 'baseWon',
      title: 'BACK FROM HELL', subtitle: 'Goku · base form vs Final Form Frieza', objective: 'Push Frieza to reveal his strength' });
  } };
  P.full = { id: 'full', checkpoint: true, run: function* (m) {
    stage(m, 'base', 'final');
    m.say('frieza', 'Four months of training. Let me show you what I gained.', 3.5);
    yield* C.transform(m, { fighter: m.battle.story.frieza, formIndex: K.formIndex(m.battle.story.frieza, 'full'),
      witness: m.battle.story.goku, witnessLine: 'You really have been training. Now this is getting interesting.', music: 3 });
    yield* fight(m, { floor: TU.fullFloor, dealt: TU.fullDealt, taken: TU.fullTaken, flag: 'fullWon',
      title: 'FRIEZA AT ONE HUNDRED PERCENT', subtitle: 'Goku · base form', objective: 'Overcome Frieza at full power' });
  } };
  P.blue = { id: 'blue', run: function* (m) {
    stage(m, 'base', 'full');
    const S = m.battle.story;
    K.watcher(S.frieza, 'fz_watch', 'smirk');
    m.say('goku', 'I learned to use a god\'s power as my own. And this is what happens when I go Super Saiyan with it.', 4.5);
    SL.Cinema.shotOn(m, S, { subject: 'goku', focus: 'upper', angle: 'three' }, 4.5, { cut: true });
    yield* m.cine(4.5);
    m.endShot();
    m.objective('blue', 'Reveal Super Saiyan Blue: hold Charge', { icon: 'transform' });
    yield* C.ascend(m, { fighter: S.goku, form: 'blue', witness: S.frieza, seconds: TU.blueHold,
      label: 'Hold Charge — Super Saiyan Blue', meter: 'SUPER SAIYAN BLUE', music: 4,
      witnessLine: 'Blue? You think changing your hair will save you?' });
    m.complete('blue');
  } };
  P.golden = { id: 'golden', run: function* (m) {
    stage(m, 'blue', 'full');
    const S = m.battle.story;
    SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'upper', angle: 'low' }, 3, { cut: true });
    m.say('frieza', 'A new color? How fitting. I chose gold. It seemed appropriate for someone of my stature.', 3.8);
    yield* m.cine(3.8);
    BK.give(S.frieza, 'golden');
    yield* C.transform(m, { fighter: S.frieza, formIndex: K.formIndex(S.frieza, 'golden'), witness: S.goku,
      witnessLine: 'That power is real. I\'d better take this seriously.', music: 4 });
    m.flags.goldenRevealed = true;
  } };
  P.duel = { id: 'duel', checkpoint: true, run: function* (m) {
    stage(m, 'blue', 'golden');
    yield* fight(m, { floor: TU.duelFloor, dealt: TU.goldenDealt, taken: TU.goldenTaken, flag: 'goldenWon',
      title: 'BLUE AND GOLD', subtitle: 'Super Saiyan Blue Goku vs Golden Frieza', objective: 'Fight Golden Frieza' });
  } };
  P.stamina = { id: 'stamina', checkpoint: true, run: function* (m) {
    stage(m, 'blue', 'golden');
    const S = m.battle.story;
    S.frieza.hp = S.frieza.hpMax * TU.duelFloor;
    S.goku.hp = S.goku.hpMax * 0.85;
    SL.Cinema.shotOn(m, S, { subject: 'frieza', focus: 'upper', angle: 'three' }, 2.5, { cut: true });
    K.watcher(S.frieza, 'exhausted', 'angry');
    m.say('frieza', 'Why... why is my power falling?!', 2.4);
    yield* m.cine(2.5);
    m.endShot();
    S.frieza.setState('free');
    yield* fight(m, { floor: TU.staminaFloor, dealt: TU.goldenDealt, taken: TU.goldenTaken,
      stamina: true, flag: 'staminaWon', title: 'THE COST OF GOLD', subtitle: 'Frieza cannot sustain his new form',
      objective: 'Exploit Frieza\'s fading strength — finish the duel' });
  } };
  P.ambush = { id: 'ambush', run: function* (m) {
    stage(m, 'blue', 'golden');
    m.battle.story.frieza.hp = m.battle.story.frieza.hpMax * TU.staminaFloor;
    yield* SL.Cinema.play(m, 'rof_goku_ambush');
  } };
  P.after = { id: 'after', run: function* (m) {
    stage(m, 'base', 'golden');
    yield* SL.Cinema.play(m, 'rof_goku_handoff');
    m.fade('black', 1);
    yield* m.cine(1.2);
    m.title(CHAPTER, 'GOKU\'S TURN IS OVER', 'Vegeta takes the field · Resurrection of F continues', 3.6);
    yield* m.cine(3.8);
  } };

  SL.data.rofGoku = { TU, SPOT, tableau, goldenLook };
  SL.data.missions.rof_goku = {
    id: 'rof_goku', canon: true, chapter: CHAPTER, title: 'Blue and Gold', character: 'goku', stage: 'plains',
    subtitle: 'Resurrection of F · Goku vs Frieza', parTime: 600,
    blurb: 'Goku and Vegeta return to Earth. Frieza has trained for revenge — but the Saiyans have trained with Whis.',
    appearance: { goku: { outfit: 'goku_whis' }, vegeta: { outfit: 'vegeta_whis' }, adult_gohan: { outfit: 'ag_tournament' } },
    lockForms: { goku: SL.data.characters.goku.forms.filter((f) => !['base', 'blue'].includes(f.id)).map((f) => f.id),
      vegeta: SL.data.characters.vegeta.forms.filter((f) => f.id !== 'base').map((f) => f.id) },
    rules: { allowTransform: true, allowUltimates: true },
    rewards: ['Form: Goku — Super Saiyan Blue (Free Battle)'], setup,
    phases: [P.arrival, P.base, P.full, P.blue, P.golden, P.duel, P.stamina, P.ambush, P.after],
  };
})();
