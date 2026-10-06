/*
 * CHAPTER 16 — BATTLE OF GODS, mission 3: "Bulma's Birthday" (canon; the Princess Bulma, GROUND: the deck).
 * Played as VEGETA.
 *
 *   PARTY     (scene)        the liner on the ocean, the party in full swing (everyone doing something: the
 *                            buffet, the tables, the boys running, Piccolo at the rail); King Kai's voice in
 *                            Vegeta's head; the god lands in a pillar of light; Vegeta bows
 *   HOST *    (play)         KEEP THE GOD FED: a gold marker over the buffet tray, gold footsteps on the deck; carry
 *                            the tray in both hands (slower) to the purple marker over Lord Beerus — three trays
 *   WATERGUN  (scene)        Goten and Trunks' water pistols; a stray shot in the god's face; the eye twitch; the
 *                            purple ki; Vegeta's panic; the leap over the crowd; THUD; the mic; "IT'S TIME FOR BINGO!"
 *   BINGO *   (rhythm)       the dance on the beat: clapping hops, the rigid spin, the squatting kicks, the panic
 *                            glance, the forced grin, the final pose — a new angle every beat; then dead silence
 *   PUDDING   (scene)        Whis finds the buffet; Buu has the pudding; "Excuse me, fat one!"; "No way! They're
 *                            all MINE!"; the licking; the silence; "YOU LICKED THEM ALL?!"; the deck jumps
 *   AFTER
 *
 * The party cast and its routines are shared with the next missions on this ship (SL.data.bogParty).
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = () => SL.data.bogKit;
  const S = (SL.data.scenes = SL.data.scenes || {});

  // WHERE EVERYONE IS AT THE PARTY (the deck: GROUND, y 0; bow at +z)
  const SPOT = {
    vegeta: [1, 9], bulma: [0.6, -6.6], chichi: [3.4, -6.4], krillin: [-5.4, 2.4], c18: [-8.6, 2.6], piccolo: [10.5, 21.5],
    gohan: [-6.4, 24.2], videl: [-9.6, 24], tien: [9.8, 27.4], yamcha: [6.2, 27.4], satan: [4.6, -12.6], buu: [-9.1, 7.2],
    goten: [2.5, 21], trunks: [-2.5, 21], beerus: [5.1, 14.6], whis: [8.9, 14.4], land: [3, 31], fight: [0, 8],
  };
  const v = (k, y = 0) => new V3(SPOT[k][0], y, SPOT[k][1]);
  const TRAY = new V3(-10.6, 1, 7.4);

  /** The party on the ship: everyone, in their places. Shared by every mission on the liner. */
  function setup(b, opts = {}) {
    const P = opts.player || 'vegeta';
    const sp = (charId, key, extra = {}) => b.spawn(Object.assign({ charId, team: 0, pos: v(key), player: charId === P }, extra));
    const s = {
      vegeta: sp('vegeta', 'vegeta'),
      goku: sp('goku', 'land'),
      bulma: sp('bulma', 'bulma'),
      chichi: sp('chichi', 'chichi'),
      trunks: sp('kid_trunks', 'trunks'),
      goten: sp('goten', 'goten'),
      gohan: sp('adult_gohan', 'gohan', { wardrobe: { outfit: 'ag_tournament' } }),
      videl: sp('videl', 'videl', { wardrobe: { outfit: 'videl_super', hair: 'hair_videl_short' } }),
      piccolo: sp('piccolo', 'piccolo'),
      krillin: sp('krillin', 'krillin'),
      c18: sp('android_18', 'c18'),
      tien: sp('tien', 'tien'),
      yamcha: sp('yamcha', 'yamcha'),
      satan: sp('mr_satan', 'satan'),
      buu: sp('majin_buu', 'buu'),
      beerus: sp('beerus', 'land', { team: 1, tags: { boss: true } }),
      whis: sp('whis', 'land'),
    };
    for (const k of Object.keys(s)) {
      const f = s[k];
      f.cannotDie = true;
      if (f !== b.player) {
        f.controller = K().scripted();
        f.untargetable = f.intangible = true;
      }
    }
    s.goku.lockedForms = { kaioken: true, god: true, godki: true };
    // Age 778: Goku is on King Kai's planet, out cold, until he comes back by Instant Transmission
    if (P !== 'goku') s.goku.setHidden(true);
    if (!opts.godsHere) {
      s.beerus.setHidden(true);
      s.whis.setHidden(true);
    }
    b.story = s;
    places(b);
    if (opts.godsHere) godsAtTable(b);
    return s;
  }

  /** Back to the party positions (and poses): a restart, or after a scene took everyone somewhere. */
  function places(b) {
    const s = b.story;
    const put = (f, key, face, pose = 'idle', expr = 'calm') => {
      if (!f || f === b.player) return;
      const p = v(key);
      SL.Staging.place(f, new V3(p.x, SL.Staging.groundY(b, p.x, p.z), p.z));
      f.storySpace = 'ground';
      K().faceTo(f, face);
      f.setState('scripted', { pose, expression: expr });
    };
    put(s.bulma, 'bulma', v('chichi'), 'idle', 'grin');
    put(s.chichi, 'chichi', v('bulma'), 'idle', 'grin');
    put(s.krillin, 'krillin', v('c18'), 'idle', 'grin');
    put(s.c18, 'c18', v('krillin'), 'armsCrossed', 'calm');
    put(s.piccolo, 'piccolo', new V3(30, 0, 22), 'armsCrossed', 'calm');
    put(s.gohan, 'gohan', v('videl'), 'idle', 'grin');
    put(s.videl, 'videl', v('gohan'), 'idle', 'grin');
    put(s.tien, 'tien', v('yamcha'), 'armsCrossed', 'calm');
    put(s.yamcha, 'yamcha', v('tien'), 'idle', 'grin');
    put(s.satan, 'satan', v('bulma'), 'idle', 'grin');
    put(s.buu, 'buu', TRAY, 'bg_eat', 'grin');
    put(s.goten, 'goten', v('trunks'), 'idle', 'grin');
    put(s.trunks, 'trunks', v('goten'), 'idle', 'grin');
  }
  function godsAtTable(b) {
    const s = b.story;
    const table = new V3(7, 0, 16);
    for (const [f, key, pose] of [[s.beerus, 'beerus', 'bg_eat'], [s.whis, 'whis', 'w_eat']]) {
      f.setHidden(false);
      const p = v(key);
      SL.Staging.place(f, new V3(p.x, 0, p.z));
      f.storySpace = 'ground';
      K().faceTo(f, table);
      f.setState('scripted', { pose, expression: 'calm' });
    }
  }

  /** THE PARTY LIVES: little routines for everybody who is not in the shot's business. */
  function life(m, opts = {}) {
    const s = m.battle.story;
    const R = [
      // the boys race up and down the middle of the deck
      { f: s.goten, steps: [{ to: [2.5, 30], speed: 5.5, pose: 'run', anim: 12 }, { to: [3, 0], speed: 5.5, pose: 'run', anim: 12 }, { pose: 'bg_cheer', expr: 'grin', seconds: 1.2 }, { to: [2.5, 21], speed: 5.5, pose: 'run', anim: 12 }] },
      { f: s.trunks, steps: [{ to: [-2.5, 30], speed: 5.8, pose: 'run', anim: 12 }, { to: [-2, 0], speed: 5.8, pose: 'run', anim: 12 }, { pose: 'bg_cheer', expr: 'grin', seconds: 1 }, { to: [-2.5, 21], speed: 5.8, pose: 'run', anim: 12 }] },
      // Buu at the buffet: eat, wander along it, eat
      { f: s.buu, steps: [{ pose: 'bg_eat', expr: 'grin', seconds: 4, face: TRAY }, { to: [-9.2, 11], speed: 1.2 }, { pose: 'bg_eat', expr: 'grin', seconds: 3, face: new V3(-11, 1, 11) }, { to: [-9.1, 7.2], speed: 1.2 }] },
      // Krillin talks, 18 rolls her eyes
      { f: s.krillin, steps: [{ pose: 'idle', expr: 'grin', seconds: 3 }, { pose: 'ez_wave', expr: 'grin', seconds: 1.6 }, { pose: 'idle', expr: 'grin', seconds: 2 }] },
      // Mr. Satan poses by the pool for nobody
      { f: s.satan, steps: [{ pose: 'victory', expr: 'grin', seconds: 2.4 }, { to: [5.5, -11.6], speed: 1.2 }, { pose: 'idle', expr: 'grin', seconds: 2 }, { to: [4.6, -12.6], speed: 1.2 }] },
      // Yamcha goes for a drink and comes back
      { f: s.yamcha, steps: [{ pose: 'idle', expr: 'grin', seconds: 4 }, { to: [-9.2, 15], speed: 1.6 }, { pose: 'bg_eat', expr: 'grin', seconds: 2.5, face: new V3(-11, 1, 15) }, { to: [6.2, 27.4], speed: 1.6 }] },
      // Chi-Chi and Bulma talk by the cake
      { f: s.chichi, steps: [{ pose: 'idle', expr: 'grin', seconds: 3.5 }, { pose: 'ez_wave', expr: 'grin', seconds: 1.4 }] },
      { f: s.bulma, steps: [{ pose: 'idle', expr: 'grin', seconds: 2.6 }, { pose: 'bg_hips', expr: 'grin', seconds: 2.4 }] },
      // Gohan and Videl, at their table
      { f: s.videl, steps: [{ pose: 'idle', expr: 'grin', seconds: 3 }, { pose: 'bg_belly', expr: 'soft', seconds: 1.4 }, { pose: 'idle', expr: 'grin', seconds: 2 }] },
    ];
    if (opts.gods) R.push({ f: s.whis, steps: [{ pose: 'w_eat', expr: 'calm', seconds: 3 }, { pose: 'w_laugh', expr: 'smirk', seconds: 1.4 }] });
    const h = K().life(m, R.filter((r) => !(opts.skip || []).includes(r.f)));
    m.onDispose(() => h.stop());
    return h;
  }

  /* ---------------------------------------------------------------- phases */
  const P = {};
  P.party = {
    id: 'party',
    run: function* (m) {
      m.lock(true);
      const h = life(m);
      yield* SL.Cinema.play(m, 'bgp_party');
      h.stop();
    },
  };

  /** Everybody turns to look at something (the god's temper, the stage): the party stops. */
  function watch(m, at, pose, face, except = []) {
    const s = m.battle.story;
    for (const k of Object.keys(s)) {
      const f = s[k];
      if (!f || !f.setState || f.hidden || except.includes(f) || f === s.beerus || f === s.whis || f === s.vegeta || f === s.goku) continue;
      SL.Cinema.turnTo({ m }, f, at, 10);
      f.setState('scripted', { pose: typeof pose === 'function' ? pose(k) : pose, expression: typeof face === 'function' ? face(k) : face, speed: 6 });
    }
  }

  /**
   * KEEP THE GOD FED (Vegeta, GROUND): the buffet has a tray ready — a gold marker over it, a gold path on the deck
   * to it; pick it up and Vegeta carries it in both hands (slower); the marker jumps to Lord Beerus' table; walk it
   * over and he takes it. Three trays, his mood on the HUD, no fighting, no flying.
   */
  const HOST = { start: 55, decay: 0.8, dish: 18, dishes: 3, seconds: 150 };
  const BUFFET = new V3(-9.3, 0, 11);
  P.host = {
    id: 'host',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, veg = s.vegeta;
      m.lock(true);
      m.clearObjectives();
      places(b);
      godsAtTable(b);
      if (b.player !== veg) b.switchPlayer(veg, { force: true });
      m.space(veg, 'ground', { pos: v('vegeta'), face: BUFFET });
      veg.target = null;
      veg.setState('free');
      // the camera starts looking the way he has to go: the buffet in front of him
      b.camera.baseYaw = Math.atan2(BUFFET.x - veg.pos.x, BUFFET.z - veg.pos.z);
      b.camera.orbitYaw = 0;
      const h = life(m, { gods: true });
      const deck = K().keepOnDeck(m, [veg]);
      m.limits({ light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, transform: false, charge: false, up: false, upPressed: false, guard: false, target: false });
      const tray = K().tray(b, BUFFET.clone().add(new V3(-1.6, 1.0, 0)));
      m.onDispose(() => tray.dispose());
      const markFood = K().marker(m, { at: () => BUFFET.clone().add(new V3(-1.4, 0, 0)), label: 'FOOD', color: 0xffd24a, height: 2.2 });
      const markGod = K().marker(m, { at: () => s.beerus.pos, label: 'LORD BEERUS', color: 0xc89aff, height: 2.9 });
      markGod.show(false);
      // carrying: the arms hold the tray out front, and he cannot run at full tilt with it
      const prevPoses = veg.anim.poses, prevScale = veg.moveScale;
      const carryOn = (on) => {
        veg.moveScale = on ? 0.62 : prevScale;
        veg.anim.poses = on ? Object.assign({}, prevPoses, { run: SL.data.poses.bg_trayWalk, idle: SL.data.poses.bg_trayIdle }) : prevPoses;
      };
      m.onDispose(() => carryOn(false));
      m.lock(false);
      b.aiLocked = true;
      m.music('peaceful', 2);
      let mood = HOST.start, delivered = 0, carrying = false, t = 0, bored = false, shown = '';
      const moodText = () => 'Lord Beerus\' mood  ·  ' + Math.round(mood) + '%';
      m.objective('dishes', 'Bring Lord Beerus food from the buffet', { icon: 'target', target: HOST.dishes });
      m.objective('mood', moodText());
      m.prompt('hostWalk', 'boost', 'Hurry', { until: () => delivered > 0 });
      m.say('vegeta', '(Food. He wants food. The buffet — NOW.)', 2.8, { style: 'quiet' });
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        mood = Math.max(5, mood - HOST.decay / 60);
        if (mood < 25 && !bored) {
          bored = true;
          s.beerus.setState('scripted', { pose: 'bg_freeze', expression: 'angry', speed: 6 });
          m.say('beerus', 'Hmm. This party is getting... boring.', 2.6);
          m.say('vegeta', '(No, no, NO!)', 1.6, { style: 'quiet' });
        }
        if (mood > 45 && bored) {
          bored = false;
          s.beerus.setState('scripted', { pose: 'bg_eat', expression: 'calm', speed: 6 });
        }
        // the way to go: gold footsteps on the deck from Vegeta to the target
        if (b.frame % 24 === 0) K().path(b, veg.pos, carrying ? s.beerus.pos : BUFFET, carrying ? 0xc89aff : 0xffd24a);
        // PICK UP
        if (!carrying && veg.pos.distanceTo(new V3(BUFFET.x - 1.4 + 1.4, 0, BUFFET.z)) < 2.4) {
          carrying = true;
          tray.carry(veg);
          carryOn(true);
          markFood.show(false);
          markGod.show(true);
          b.sfx('pickup', veg);
          m.say('vegeta', ['Here we go... carefully...', 'Another one. Don\'t spill it, don\'t spill it...', 'The last one. Smile, Vegeta. SMILE.'][Math.min(2, delivered)], 2.2, { style: 'quiet' });
        }
        // DELIVER
        if (carrying && veg.pos.distanceTo(s.beerus.pos) < 2.6) {
          carrying = false;
          carryOn(false);
          tray.put(new V3(7, 1.05, 16));
          delivered++;
          mood = Math.min(100, mood + HOST.dish + 10);
          m.progress('dishes', delivered);
          K().faceTo(s.beerus, veg.pos);
          s.beerus.setState('scripted', { pose: 'bg_eat', expression: 'grin', speed: 8 });
          b.vfx.sparks(s.beerus.headPos().add(new V3(0, 0.4, 0)), 0xffb0d8, 10, 3, 0.1);
          b.sfx('uiSelect', null, { vol: 0.8 });
          const lines = ['Mm! This is good. What is it?', 'Not bad, Vegeta. Not bad at all.', 'Earth food really is something. Whis, try this.'];
          m.say('beerus', lines[(delivered - 1) % lines.length], 2.4);
          markGod.show(false);
          if (delivered < HOST.dishes) {
            // a new tray waits at the buffet
            b.after(50, () => {
              tray.put(BUFFET.clone().add(new V3(-1.6, 1.0, 0)));
              markFood.show(true);
            });
          }
        }
        const mt = moodText();
        if (mt !== shown) {
          shown = mt;
          m.objective('mood', mt);
        }
      };
      m.tickHooks.push(hook);
      yield () => delivered >= HOST.dishes || t > HOST.seconds;
      K().unhook(m, hook);
      K().unhook(m, deck);
      h.stop();
      carryOn(false);
      markFood.dispose();
      markGod.dispose();
      m.limits(null);
      m.lock(true);
      m.flags.hostMood = Math.round(mood);
      m.flags.dishes = delivered;
      m.complete('dishes');
      m.complete('mood');
      yield* m.cine(0.4);
    },
  };

  /** THE WATER GUNS: a stray shot hits the god in the face — and Vegeta dives for the stage. */
  P.watergun = {
    id: 'watergun',
    run: function* (m) {
      const b = m.battle, s = b.story;
      m.lock(true);
      m.clearObjectives();
      // the performers on the little stage (an MC with the microphone, a dancer)
      if (!s.mc) {
        const st = b.stage.landmarks.stage || new V3(-4, 0.5, -13);
        s.mc = b.spawn({ charId: 'civilian', team: 0, pos: new V3(st.x - 0.8, 0, st.z) });
        s.dancer = b.spawn({ charId: 'civilian', team: 0, pos: new V3(st.x + 1.2, 0, st.z) });
        for (const f of [s.mc, s.dancer]) {
          f.controller = K().scripted();
          f.untargetable = f.intangible = true;
          f.cannotDie = true;
        }
      }
      yield* SL.Cinema.play(m, 'bgp_watergun');
    },
  };

  /**
   * BINGO! The dance, on the beat: twelve steps, each one a move (the clapping hop left/right, the rigid spin, the
   * squatting kicks, a panic glance at the god, the final pose) and each one cut to a new angle — the stage low,
   * his terrified face, the god's aura going out, Whis, Bulma, the crowd's jaws.
   */
  const BINGO = [
    { key: 'light', label: 'BIN-', pose: 'bg_hopL', line: 'BIN-', cam: 'wide' },
    { key: 'heavy', label: '-GO!', pose: 'bg_hopR', line: '-GO!', cam: 'stageLow' },
    { key: 'light', label: 'BIN-', pose: 'bg_hopL', line: 'BIN-', cam: 'face' },
    { key: 'heavy', label: '-GO!', pose: 'bg_hopR', line: '-GO!', cam: 'beerus' },
    { key: 'light', label: 'FUN TIME', pose: 'bg_rigidSpin', line: 'Fun time...', cam: 'medium', spin: true },
    { key: 'heavy', label: 'BINGO!', pose: 'bg_rigidSpin', line: '...BINGO!', cam: 'crowd', spin: true },
    { key: 'light', label: 'EARTH IS', pose: 'bg_kickL', line: 'Earth is...', cam: 'stageLow' },
    { key: 'heavy', label: 'A FUN', pose: 'bg_kickR', line: '...a fun...', cam: 'whis' },
    { key: 'light', label: 'PLACE', pose: 'bg_kickL', line: '...place...', cam: 'bulma' },
    { key: 'heavy', label: 'TO BE!', pose: 'bg_glance', line: '...to be!', cam: 'face', glance: true },
    { key: 'light', label: 'YEA-', pose: 'bg_hopL', line: 'YEA-', cam: 'smile', smile: true },
    { key: 'heavy', label: '-HUUH!', pose: 'bg_finalPose', line: '-HUUUH!', cam: 'final' },
  ];
  P.bingo = {
    id: 'bingo',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, s = b.story, veg = s.vegeta;
      m.lock(true);
      m.clearObjectives();
      const st = b.stage.landmarks.stage || new V3(-4, 0.5, -13);
      const spot = new V3(st.x, st.y, st.z + 0.6);
      SL.Staging.place(veg, spot);
      K().faceTo(veg, new V3(st.x, 0, 10));
      veg.model.addProp({ id: 'mic', shape: 'bottle', joint: 'handR', pos: [0, 0.02, 0.03], rot: [-0.4, 0, 0], color: 0x2a2a30, cap: 0x101012, scale: 1.3 });
      K().sweat(veg, true);
      watch(m, spot, (k) => (k === 'mc' || k === 'dancer' ? 'knockdown' : 'idle'), 'shock');
      s.beerus.aura.setStyle({ color: 0xb87aff, core: 0xf2e0ff, particles: 0xd8b8ff, speed: 1.6 });
      s.beerus.setState('scripted', { pose: 'bg_freeze', expression: 'angry', speed: 6, aura: 0.8 });
      const cast = { vegeta: veg, beerus: s.beerus, whis: s.whis, bulma: s.bulma, krillin: s.krillin, yamcha: s.yamcha, piccolo: s.piccolo, gohan: s.gohan };
      const front = new V3(st.x, 0, 10);
      const CAMS = {
        wide: { subject: 'vegeta', focus: 'wide', angle: 'front', room: 6 },
        stageLow: { subject: 'vegeta', focus: 'full', angle: 'low', side: -1 },
        medium: { subject: 'vegeta', focus: 'medium', angle: 'three' },
        face: { subject: 'vegeta', focus: 'closeup', angle: 'front' },
        smile: { subject: 'vegeta', focus: 'face', angle: 'front' },
        final: { subject: 'vegeta', focus: 'full', angle: 'front', dist: 5 },
        beerus: { subject: 'beerus', focus: 'upper', angle: 'three' },
        whis: { subject: 'whis', focus: 'upper', angle: 'three' },
        bulma: { subject: 'bulma', focus: 'upper', angle: 'front' },
        crowd: { subject: 'krillin', with: 'yamcha', focus: 'full' },
      };
      const shot = (k) => SL.Cinema.shotOn(m, cast, CAMS[k] || CAMS.wide, 1.6);
      shot('wide');
      m.music('light_battle', 4);
      let spinT = 0, anger = 1;
      const spin = () => {
        if (spinT > 0) {
          spinT -= 1 / 60;
          veg.yaw = veg.prevYaw = veg.yaw + 0.34;
          if (spinT <= 0) K().faceTo(veg, front);
        }
        // the god's aura goes out a little more with every beat
        s.beerus.setState('scripted', { pose: anger > 0.45 ? 'bg_freeze' : 'bg_tilt', expression: anger > 0.45 ? 'angry' : 'shock', speed: 6, aura: Math.max(0, anger * 0.8) });
        if (b.frame % 40 === 0) b.vfx.trail(veg.headPos().add(new V3(0.08, 0, 0.12)), 0xbfe8ff, 0.06, 0.6);
      };
      m.tickHooks.push(spin);
      const r = yield* m.rhythm(BINGO.map((x) => ({ key: x.key, label: x.label })), {
        beat: 0.78,
        window: 0.24,
        lead: 1.2,
        onBeat: (i) => {
          const x = BINGO[i];
          veg.setState('scripted', { pose: x.pose, expression: x.smile ? 'grin' : x.glance ? 'shock' : i % 3 === 2 ? 'grin' : 'shout', speed: 16 });
          if (x.spin) spinT = 0.6;
          if (x.glance) SL.Cinema.turnTo({ m }, veg, s.beerus.pos, 6);
          if (x.smile) K().blush(veg, true);
          m.say('vegeta', x.line, 0.75, { style: 'shout' });
          b.sfx('punchLight', veg, { pitch: 0.8 + (i % 2) * 0.4, vol: 0.45 });
          b.vfx.dust(veg.pos, 0.6, 3, 0xc8a070);
          anger = Math.max(0, 1 - (i + 1) / BINGO.length * 1.15);
          // the watchers react as it goes on
          if (i === 3) s.whis.setState('scripted', { pose: 'w_shock', expression: 'shock', speed: 6 });
          if (i === 7) s.whis.setState('scripted', { pose: 'w_laugh', expression: 'smirk', speed: 6 });
          if (i === 8) s.bulma.setState('scripted', { pose: 'bg_jawDrop', expression: 'shock', speed: 6 });
          if (i === 5) for (const f of [s.krillin, s.yamcha, s.piccolo, s.gohan, s.tien]) f.setState('scripted', { pose: 'bg_jawDrop', expression: 'shock', speed: 6 });
          shot(x.cam);
        },
      });
      K().unhook(m, spin);
      m.endShot();
      m.flags.bingo = Math.round(r.score * 100);
      yield* SL.Cinema.play(m, 'bgp_bingoAfter');
    },
  };

  P.pudding = K().scene('pudding', 'bgp_pudding');
  P.after = K().after('BULMA\'S BIRTHDAY');

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, p) => K().pt(ctx, n, p);

  S.bgp_party = {
    id: 'bgp_party',
    cast,
    music: { song: 'peaceful', level: 1 },
    events: [
      // the Princess Bulma on the open sea, flags up, music on the deck
      {
        call: (ctx) => {
          pt(ctx, 'ship', new V3(0, 0, 4));
        },
        cam: { from: { at: 'ship', off: [70, 34, 90] }, to: { at: 'ship', off: [46, 20, 60] }, look: { at: 'ship', off: [0, 2, 0] }, fov: 46 },
        title: { chapter: 'CHAPTER 16 · BATTLE OF GODS', title: 'BULMA\'S BIRTHDAY', subtitle: 'The Princess Bulma · Age 778', duration: 4.2 },
        sfx: { name: 'wind', vol: 0.4, pitch: 0.7 },
        hold: 4.8,
      },
      // around the deck: the people
      {
        cam: { subject: 'buu', focus: 'full', angle: 'three', side: -1 },
        say: { who: 'mr_satan', to: 'buu', line: 'Eat up, Buu! Bulma\'s paying!', duration: 2.4 },
        hold: 2.6,
      },
      {
        cam: { subject: 'krillin', with: 'c18', focus: 'full' },
        say: { who: 'krillin', to: 'c18', line: 'Isn\'t this great, 18? A cruise! Free food!', duration: 2.6 },
        hold: 2.6,
      },
      {
        cam: { subject: 'goten', focus: 'full', angle: 'three' },
        say: { who: 'kid_trunks', line: 'Last one to the front of the boat is a Saibaman!', duration: 2.4, style: 'shout' },
        hold: 2.6,
      },
      {
        cam: { subject: 'bulma', with: 'chichi', focus: 'full' },
        say: { who: 'bulma', to: 'chichi', line: 'Thirty-eight, and I\'ve never looked better. Right, Chi-Chi?', duration: 3 },
        hold: 3,
      },
      // at the rail: Vegeta, alone, sulking at the sea
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.vegeta, 'ground', { pos: new V3(11.4, 0, 6), face: new V3(40, 0, 6), pose: 'armsCrossed', expr: 'angry' });
        },
        cam: { subject: 'vegeta', focus: 'upper', angle: 'three' },
        say: { who: 'vegeta', line: 'Hmph. Parties.', duration: 1.8 },
        hold: 2,
      },
      // King Kai's voice, in his head
      {
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        sfx: { name: 'visionIn', vol: 0.6 },
        say: { who: 'king_kai', line: '(Vegeta! It\'s me, King Kai! The God of Destruction — Lord Beerus — is on his way to Earth!)', duration: 4.2, style: 'quiet' },
        hold: 4.2,
      },
      {
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        pose: [{ who: 'vegeta', pose: 'idle', face: 'shock', speed: 10 }],
        say: { who: 'king_kai', line: '(He beat Goku without even trying! Whatever he wants — give it to him! If he gets angry, he\'ll destroy the whole planet!)', duration: 4.6, style: 'quiet' },
        hold: 4.6,
      },
      {
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: 'Beerus...? HERE?!', duration: 2, style: 'shout' },
        hold: 2,
      },
      // a pillar of light on the deck
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          const L = v('land');
          s.travel = K().travel(b, L.clone());
          b.sfx('teleport', null, { pitch: 0.55, vol: 1.2, at: L });
          b.cameraTraumaAt(L, 0.35);
          s.beerus.setHidden(false);
          s.whis.setHidden(false);
          ctx.m.space(s.beerus, 'ground', { pos: L.clone().add(new V3(-0.8, 0, 0)), face: v('bulma'), pose: 'bs_idle', expr: 'calm' });
          ctx.m.space(s.whis, 'ground', { pos: L.clone().add(new V3(1.2, 0, 0.6)), face: v('bulma'), pose: 'w_idle', expr: 'calm' });
          pt(ctx, 'land', L);
          watch(ctx.m, L, 'idle', 'shock');
        },
        tick: (ctx, t) => st(ctx).travel && st(ctx).travel.set(t < 0.4 ? t / 0.4 : Math.max(0, 1 - (t - 0.4) / 1.2)),
        cam: { subject: 'beerus', focus: 'full', focus2: 'upper', angle: 'front' },
        music: { song: 'beerus_theme', level: 1 },
        hold: 2.6,
      },
      // Bulma walks up to them — facing them
      {
        space: { who: 'bulma', mode: 'ground', at: 'land', off: [0, 0, -3], face: 'beerus' },
        pose: [{ who: 'bulma', pose: 'bg_hips', face: 'smirk' }],
        cam: { subject: 'bulma', with: 'beerus', focus: 'full' },
        say: { who: 'bulma', to: 'beerus', line: 'Hey! I don\'t remember inviting you two. ...Well, anyone who shows up at my party is a guest!', duration: 4 },
        hold: 4,
      },
      {
        pose: [{ who: 'whis', pose: 'w_bow', face: 'calm' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', to: 'bulma', line: 'How kind. My name is Whis, and this is Lord Beerus. We heard there might be... food?', duration: 3.6 },
        hold: 3.6,
      },
      // Vegeta skids in and bows — TO Beerus
      {
        space: { who: 'vegeta', mode: 'ground', at: 'beerus', off: [0, 0, -2.3], face: 'beerus' },
        pose: [{ who: 'vegeta', pose: 'bg_hostBow', face: 'nervous', speed: 10 }],
        call: (ctx) => K().sweat(st(ctx).vegeta, true),
        cam: { subject: 'vegeta', with: 'beerus', focus: 'full' },
        say: { who: 'vegeta', to: 'beerus', line: 'Lord Beerus! Welcome, welcome! Please — eat, drink, anything you like!', duration: 3.4 },
        hold: 3.4,
      },
      {
        cam: { subject: 'krillin', focus: 'upper', angle: 'front' },
        pose: [{ who: 'krillin', pose: 'bg_jawDrop', face: 'shock' }],
        say: { who: 'krillin', line: 'Is Vegeta... BOWING?', duration: 2 },
        hold: 2,
      },
      {
        pose: [{ who: 'bulma', pose: 'bg_hips', face: 'shock' }],
        cam: { subject: 'bulma', focus: 'upper', angle: 'three' },
        say: { who: 'bulma', to: 'vegeta', line: 'Vegeta? You know this... cat?', duration: 2.4 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'vegeta', pose: 'bg_rub', face: 'nervous', speed: 8 }],
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three', side: -1 },
        say: { who: 'vegeta', to: 'bulma', line: '(Not NOW, woman! Smile! Everyone smile!)', duration: 2.6, style: 'quiet' },
        hold: 2.6,
      },
      // the god is hungry — and the god is bored: the first flicker of trouble
      {
        pose: [{ who: 'beerus', pose: 'bg_freeze', face: 'serious', speed: 6 }],
        call: (ctx) => SL.Cinema.turnTo(ctx, st(ctx).beerus, st(ctx).vegeta.pos),
        cam: { subject: 'beerus', focus: 'upper', angle: 'front' },
        say: { who: 'beerus', to: 'vegeta', line: 'Hm. I\'m hungry. I\'ll wait for Goku to wake up — but if I get bored, I\'ll destroy this planet.', duration: 4.4 },
        hold: 4.4,
      },
      // Vegeta: the realization
      {
        pose: [{ who: 'vegeta', pose: 'bg_panic', face: 'shock', speed: 10 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        sfx: { name: 'heartbeat', vol: 0.9 },
        say: { who: 'vegeta', line: '(...If he gets bored. Keep him fed. Keep him HAPPY.)', duration: 3, style: 'quiet' },
        hold: 3,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.travel) {
        s.travel.dispose();
        s.travel = null;
      }
      places(ctx.b);
      godsAtTable(ctx.b);
    },
  };

  /* ---------------------------------------------------------------- the water guns, the freeze, the stage dive */
  S.bgp_watergun = {
    id: 'bgp_watergun',
    cast,
    music: { song: 'light_battle', level: 2 },
    events: [
      // Beerus walks the deck, full and pleased; the boys are running about with water guns
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m;
          places(b);
          godsAtTable(b);
          const st2 = b.stage.landmarks.stage || new V3(-4, 0.5, -13);
          for (const [f, x] of [[s.mc, -0.8], [s.dancer, 1.2]]) {
            if (!f) continue;
            SL.Staging.place(f, new V3(st2.x + x, st2.y, st2.z));
            K().faceTo(f, new V3(st2.x, 0, 10));
            f.setState('scripted', { pose: x < 0 ? 'ez_wave' : 'bg_cheer', expression: 'grin', speed: 6 });
          }
          if (s.mc) s.mc.model.addProp({ id: 'mic', shape: 'bottle', joint: 'handR', pos: [0, 0.02, 0.03], rot: [-0.4, 0, 0], color: 0x2a2a30, cap: 0x101012, scale: 1.3 });
          m.space(s.beerus, 'ground', { pos: new V3(1, 0, 4), face: new V3(1, 0, -4), pose: 'bs_walk', expr: 'smirk' });
          m.space(s.goten, 'ground', { pos: new V3(-3.2, 0, 1), face: new V3(3, 0, 0), pose: 'bg_aim', expr: 'grin' });
          m.space(s.trunks, 'ground', { pos: new V3(4.4, 0, -0.2), face: new V3(-3, 0, 1), pose: 'bg_aim', expr: 'grin' });
          for (const f of [s.goten, s.trunks]) f.model.addProp({ id: 'gun', shape: 'box', joint: 'handR', pos: [0, -0.02, 0.05], size: [0.05, 0.16, 0.08], color: 0x3ab0ff });
          m.space(s.vegeta, 'ground', { pos: new V3(6.5, 0, 8), face: new V3(1, 0, 4), pose: 'idle', expr: 'calm' });
          pt(ctx, 'mid', new V3(0.6, 1.1, 0.4));
        },
        move: { who: 'beerus', at: [1, 0, 0.6], seconds: 2.2, face: 'mid' },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().squirt(b, s.goten.handPos('R'), s.trunks.chest(), true);
          if (b.frame % 2) K().squirt(b, s.trunks.handPos('R'), s.goten.chest(), true);
        },
        cam: { subject: 'goten', with: 'trunks', focus: 'full' },
        say: { who: 'goten', to: 'trunks', line: 'Take that! And that!', duration: 2, style: 'shout' },
      },
      // Trunks dodges — and the stream goes past him, straight into a god's face
      {
        call: (ctx) => {
          const s = st(ctx);
          ctx.m.space(s.trunks, 'slide', { dir: new V3(1, 0, -0.3), distance: 1.2, seconds: 0.25, endPose: 'bg_aim', expr: 'grin' });
        },
        tick: (ctx) => {
          const s = st(ctx), b = ctx.b;
          K().squirt(b, s.goten.handPos('R'), s.beerus.headPos().add(new V3(0, 0.08, 0)), true);
        },
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'shock', speed: 20 }],
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        sfx: { name: 'candyPop', vol: 0.8, pitch: 0.6 },
        hold: 1.2,
      },
      // he stops dead. The eye twitches.
      {
        music: { song: null, level: 0 },
        pose: [{ who: 'beerus', pose: 'bg_freeze', face: 'angry', speed: 6 }, { who: 'goten', pose: 'idle', face: 'shock' }, { who: 'trunks', pose: 'idle', face: 'shock' }],
        cam: { subject: 'beerus', focus: 'face', angle: 'front' },
        tick: (ctx, t) => {
          const s = st(ctx);
          if (ctx.b.frame % 3 === 0) ctx.b.vfx.trail(s.beerus.headPos().add(new V3(0.05, -0.05, 0.1)), 0xbfe8ff, 0.04, 0.4);
          ctx.b.camera.addTrauma(t > 1 ? 0.02 : 0);
        },
        sfx: { name: 'heartbeat', vol: 0.7 },
        hold: 1.8,
      },
      // the Destruction ki: purple, rising
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          s.beerus.aura.setStyle({ color: 0xb87aff, core: 0xf2e0ff, particles: 0xd8b8ff, speed: 1.6, flame: [0x8a3adf, 0xb87aff, 0x5a2a9a] });
          b.stage.setMood(0.35, 0x1a0a2a, 0.8);
          b.sfx('rumble', s.beerus, { vol: 1, pitch: 0.5 });
          watch(ctx.m, s.beerus.pos, 'idle', 'shock');
        },
        pose: [{ who: 'beerus', pose: 'bg_freeze', face: 'angry', speed: 6, aura: 0.85 }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'front' },
        tick: (ctx) => ctx.b.camera.addTrauma(0.025),
        hold: 2,
      },
      // the deck goes quiet: everybody looks
      {
        cam: { subject: 'krillin', with: 'c18', focus: 'full' },
        hold: 1.2,
      },
      // VEGETA: the eyes, the sweat, the glance, the decision
      {
        call: (ctx) => K().sweat(st(ctx).vegeta, true),
        pose: [{ who: 'vegeta', pose: 'bg_panic', face: 'shock', speed: 10 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        sfx: { name: 'heartbeat', vol: 1 },
        hold: 1.4,
      },
      {
        call: (ctx) => SL.Cinema.turnTo(ctx, st(ctx).vegeta, st(ctx).beerus.pos, 4),
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'three' },
        say: { who: 'vegeta', line: '(He\'s going to destroy the Earth. Over a water pistol.)', duration: 2.6, style: 'quiet' },
        hold: 2.4,
      },
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          const stg = b.stage.landmarks.stage || new V3(-4, 0.5, -13);
          SL.Cinema.turnTo(ctx, s.vegeta, stg, 4);
          pt(ctx, 'stagePt', stg.clone());
        },
        cam: { subject: 'vegeta', focus: 'closeup', angle: 'front', side: -1 },
        say: { who: 'vegeta', line: '(...There\'s only one thing to do.)', duration: 2, style: 'quiet' },
        hold: 2,
      },
      // THE STAGE DIVE: over the crowd in one leap
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          ctx.leap = { from: s.vegeta.pos.clone(), to: ctx.cast.stagePt.pos.clone().add(new V3(0.2, 0, 0.7)), t: 0 };
          s.vegeta.setState('scripted', { pose: 'flyForward', expression: 'shout', speed: 14 });
          b.sfx('dash', s.vegeta, { vol: 1.1 });
          pt(ctx, 'leapCam', ctx.leap.from.clone().lerp(ctx.leap.to, 0.5).add(new V3(9, 3.5, 4)));
        },
        tick: (ctx, t) => {
          const s = st(ctx), L = ctx.leap;
          const k = Math.min(1, t / 0.9);
          const p = L.from.clone().lerp(L.to, k);
          p.y += Math.sin(k * Math.PI) * 4.5;
          s.vegeta.setPosition(p);
          s.vegeta.prevPos.copy(p);
          s.vegeta.grounded = false;
          const d = L.to.clone().sub(L.from);
          s.vegeta.yaw = s.vegeta.prevYaw = Math.atan2(d.x, d.z);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(s.vegeta.chest(), 0xffffff, 0.4, 0.3);
        },
        cam: { from: { at: 'leapCam' }, look: { at: 'vegeta' }, fov: 56 },
        hold: 0.95,
      },
      // THUD
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, L = ctx.leap;
          SL.Staging.place(s.vegeta, L.to);
          s.vegeta.setState('scripted', { pose: 'bg_landHard', expression: 'grit', speed: 20 });
          b.vfx.dust(L.to, 2.2, 18, 0xc8a070);
          b.vfx.ring(L.to.clone().add(new V3(0, 0.1, 0)), 4, 0xffffff, 0.4, new V3(0, 1, 0));
          b.cameraTraumaAt(L.to, 0.8);
          b.sfx('groundImpact', s.vegeta, { vol: 1.1 });
          for (const f of [s.mc, s.dancer]) if (f) f.setState('scripted', { pose: 'stagger', expression: 'shock', speed: 10 });
        },
        cam: { subject: 'vegeta', focus: 'full', angle: 'three' },
        hold: 0.9,
      },
      // the performers shoved aside; the microphone snatched
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.mc) {
            s.mc.model.removeProp('mic');
            ctx.m.space(s.mc, 'slide', { dir: new V3(-1, 0, 0.3), distance: 1.8, seconds: 0.35, endPose: 'knockdown', expr: 'shock' });
          }
          if (s.dancer) ctx.m.space(s.dancer, 'slide', { dir: new V3(1, 0, 0.3), distance: 1.8, seconds: 0.35, endPose: 'knockdown', expr: 'shock' });
          s.vegeta.model.addProp({ id: 'mic', shape: 'bottle', joint: 'handR', pos: [0, 0.02, 0.03], rot: [-0.4, 0, 0], color: 0x2a2a30, cap: 0x101012, scale: 1.3 });
        },
        pose: [{ who: 'vegeta', pose: 'bg_shove', face: 'grit', speed: 16 }],
        cam: { subject: 'vegeta', focus: 'medium', angle: 'front' },
        sfx: { name: 'swing', vol: 0.8 },
        hold: 0.9,
      },
      // "YEEAAAHHH! IT'S TIME FOR BINGO!"
      {
        call: (ctx) => {
          const s = st(ctx);
          K().faceTo(s.vegeta, new V3(s.vegeta.pos.x, 0, 10));
        },
        pose: [{ who: 'vegeta', pose: 'bg_finalPose', face: 'shout', speed: 14 }],
        cam: { subject: 'vegeta', focus: 'upper', angle: 'low' },
        say: { who: 'vegeta', line: 'YEEAAAHHH! IT\'S TIME FOR BINGO!', duration: 2.6, style: 'shout' },
        music: { song: 'light_battle', level: 4 },
        shake: { at: 'vegeta', amount: 0.3 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      for (const f of [s.goten, s.trunks]) f.model.removeProp('gun');
      if (s.mc) s.mc.model.removeProp('mic');
      ctx.b.stage.clearMood(1);
      ctx.m.flags.waterGun = true;
    },
  };

  S.bgp_bingoAfter = {
    id: 'bgp_bingoAfter',
    cast,
    music: { song: null, level: 0 },
    events: [
      // dead silence: the final pose held, panting
      {
        pose: [{ who: 'vegeta', pose: 'bg_finalPose', face: 'grin', speed: 4 }],
        call: (ctx) => {
          const s = st(ctx);
          s.beerus.setState('scripted', { pose: 'bg_tilt', expression: 'shock', speed: 6, aura: 0 });
          s.beerus.aura.setStyle(s.beerus.form.aura);
        },
        cam: { subject: 'vegeta', focus: 'full', angle: 'front', dist: 7 },
        sfx: { name: 'wind', vol: 0.4, pitch: 0.5 },
        hold: 2,
      },
      {
        cam: { subject: 'krillin', with: 'yamcha', focus: 'full' },
        hold: 1.6,
      },
      {
        cam: { subject: 'piccolo', focus: 'upper', angle: 'front' },
        hold: 1.2,
      },
      // the god and his attendant: they just blink
      {
        cam: { subject: 'beerus', with: 'whis', focus: 'upper' },
        tick: (ctx, t) => {
          const s = st(ctx);
          const blink = Math.floor(t * 3) % 3 === 1;
          if (s.beerus.model.setExpression) s.beerus.model.setExpression(blink ? 'closed' : 'shock');
          if (s.whis.model.setExpression) s.whis.model.setExpression(blink ? 'closed' : 'shock');
        },
        hold: 1.8,
      },
      {
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        say: { who: 'beerus', to: 'vegeta', line: '...What was that?', duration: 2 },
        hold: 2,
      },
      {
        pose: [{ who: 'whis', pose: 'w_laugh', face: 'smirk' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', to: 'beerus', line: 'I believe that was... bingo, my lord.', duration: 2.6 },
        hold: 2.6,
      },
      {
        pose: [{ who: 'beerus', pose: 'bg_eat', face: 'smirk' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'beerus', line: 'Hm. Earth is a strange place. ...I\'m not angry any more.', duration: 3 },
        music: { song: 'peaceful', level: 1 },
        hold: 3,
      },
      // the arm comes down, shaking; a breath out: the planet is safe — his dignity is not
      {
        call: (ctx) => {
          K().blush(st(ctx).vegeta, true);
        },
        pose: [{ who: 'vegeta', pose: 'bg_slump', face: 'nervous', speed: 5 }],
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        say: { who: 'vegeta', line: '(...Never. Speak of this. Again.)', duration: 2.6, style: 'quiet' },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      s.vegeta.model.removeProp('mic');
      K().sweat(s.vegeta, false);
      K().blush(s.vegeta, false);
      s.beerus.aura.setStyle(s.beerus.form.aura);
      places(ctx.b);
      godsAtTable(ctx.b);
    },
  };

  /* ---------------------------------------------------------------- the pudding: do not rush it */
  S.bgp_pudding = {
    id: 'bgp_pudding',
    cast,
    music: { song: 'light_battle', level: 1 },
    events: [
      // Whis at the buffet, delighted
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          places(b);
          ctx.m.space(s.whis, 'ground', { pos: new V3(-9.2, 0, 12.4), face: new V3(-11, 1, 12.4), pose: 'w_eat', expr: 'grin' });
          ctx.m.space(s.beerus, 'ground', { pos: v('beerus'), face: s.whis.pos, pose: 'bg_eat', expr: 'calm' });
          ctx.m.space(s.buu, 'ground', { pos: v('buu'), face: new V3(-4, 0, 7), pose: 'bg_hug', expr: 'grin' });
          ctx.m.space(s.vegeta, 'ground', { pos: new V3(2, 0, 12), face: s.beerus.pos, pose: 'bg_rub', expr: 'nervous' });
          s.tray = K().pudding(b, TRAY.clone());
          s.tray.on(s.buu);
          ctx.m.onDispose(() => s.tray && s.tray.dispose());
        },
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', to: 'beerus', line: 'Lord Beerus! You simply must try this — Earth\'s cooking is extraordinary!', duration: 3.4 },
        hold: 3.4,
      },
      {
        move: { who: 'beerus', at: [-6.4, 0, 9.4], seconds: 2.6, face: 'buu' },
        pose: [{ who: 'beerus', pose: 'bs_walk', face: 'calm', speed: 7 }],
        cam: { subject: 'beerus', focus: 'full', angle: 'three' },
      },
      // he sees what Buu is holding
      {
        pose: [{ who: 'beerus', pose: 'bg_tilt', face: 'calm' }],
        cam: { subject: 'buu', focus: 'upper', angle: 'ots', over: 'beerus' },
        say: { who: 'beerus', to: 'buu', line: '...What are those?', duration: 2 },
        hold: 2.2,
      },
      {
        cam: { subject: 'buu', focus: 'closeup', angle: 'three' },
        say: { who: 'majin_buu', to: 'beerus', line: 'Pudding! Buu\'s pudding!', duration: 2 },
        hold: 2,
      },
      // politely, with both hands together
      {
        pose: [{ who: 'beerus', pose: 'bg_ask', face: 'grin', speed: 6 }],
        cam: { subject: 'beerus', with: 'buu', focus: 'full', angle: 'three' },
        say: { who: 'beerus', to: 'buu', line: 'Excuse me, fat one! Would you mind sharing just one of those pudding cups with me?', duration: 4.2 },
        hold: 4.2,
      },
      {
        cam: { subject: 'buu', focus: 'upper', angle: 'front' },
        pose: [{ who: 'buu', pose: 'bg_hug', face: 'angry', speed: 6 }],
        say: { who: 'majin_buu', to: 'beerus', line: 'No way! They\'re all MINE!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      // Vegeta, across the deck, going white
      {
        call: (ctx) => K().sweat(st(ctx).vegeta, true),
        cam: { subject: 'vegeta', focus: 'face', angle: 'front' },
        pose: [{ who: 'vegeta', pose: 'bg_panic', face: 'shock', speed: 10 }],
        sfx: { name: 'heartbeat', vol: 0.7 },
        hold: 1.6,
      },
      {
        pose: [{ who: 'beerus', pose: 'bg_ask', face: 'calm', speed: 6 }],
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        say: { who: 'beerus', to: 'buu', line: 'Just one. That\'s all I\'m asking.', duration: 2.4 },
        hold: 2.4,
      },
      // THE LICKING: every cup, one after the other, right in front of his face
      {
        pose: [{ who: 'buu', pose: 'bg_lick', face: 'grin', speed: 8 }],
        tick: (ctx, t) => {
          const s = st(ctx);
          if (!s.tray) return;
          const i = Math.floor(t / 0.42);
          if (i < s.tray.count) s.tray.lick(i);
          if (ctx.b.frame % 25 === 0) ctx.b.sfx('candyPop', s.buu, { pitch: 0.6, vol: 0.5 });
        },
        cam: { subject: 'buu', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'majin_buu', line: 'Mmm... lick... lick... lick...', duration: 3.4 },
        hold: 3.6,
      },
      {
        cam: { subject: 'beerus', focus: 'face', angle: 'front' },
        pose: [{ who: 'beerus', pose: 'bg_freeze', face: 'shock', speed: 10 }],
        hold: 1.6,
      },
      {
        cam: { subject: 'whis', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'whis', pose: 'w_shock', face: 'shock', speed: 8 }],
        say: { who: 'whis', line: 'Oh dear.', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
      // the deck notices: heads turn, the music stops
      {
        music: { song: null, level: 0 },
        call: (ctx) => watch(ctx.m, st(ctx).beerus.pos, 'idle', 'shock', [st(ctx).buu]),
        cam: { subject: 'piccolo', focus: 'upper', angle: 'three' },
        say: { who: 'piccolo', line: '...That ki.', duration: 1.6, style: 'quiet' },
        hold: 1.8,
      },
      {
        cam: { subject: 'gohan', with: 'krillin', focus: 'upper' },
        hold: 1.2,
      },
      // the eyes flash
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          b.vfx.flash(s.beerus.headPos(), 1.4, 0xd8a0ff, 0.25, SL.Toon.tex.glow);
          SL.ScreenFX.flash(0.25, '#d8b0ff');
          s.beerus.aura.setStyle({ color: 0xb87aff, core: 0xf2e0ff, particles: 0xd8b8ff, speed: 1.6, flame: [0x8a3adf, 0xb87aff, 0x5a2a9a] });
        },
        pose: [{ who: 'beerus', pose: 'bg_fury', face: 'angry', speed: 10, aura: 0.7 }],
        cam: { subject: 'beerus', focus: 'face', angle: 'front' },
        say: { who: 'beerus', to: 'buu', line: 'YOU LICKED THEM ALL?!', duration: 2.4, style: 'shout' },
        shake: { at: 'beerus', amount: 0.5 },
        hold: 2.4,
      },
      // the ki goes out across the deck and over the water
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          const c = s.beerus.pos.clone();
          b.vfx.ring(c.clone().add(new V3(0, 0.3, 0)), 42, 0xc89aff, 1.2, new V3(0, 1, 0));
          b.vfx.ring(s.beerus.chest(), 8, 0xffffff, 0.5);
          b.cameraTraumaAt(c, 1);
          b.sfx('explosionBig', s.beerus, { pitch: 0.5, vol: 1.2 });
          for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2;
            K().splash(b, new V3(Math.cos(a) * 26, 0, 8 + Math.sin(a) * 40), 2.4);
          }
          for (const f of [s.krillin, s.yamcha, s.satan, s.chichi, s.bulma]) f.setState('scripted', { pose: 'stagger', expression: 'shock', speed: 8 });
          pt(ctx, 'wide', c.clone());
        },
        cam: { from: { at: 'wide', off: [22, 14, 26] }, look: { at: 'wide', off: [0, 1, 0] }, fov: 54 },
        hold: 2.6,
      },
      {
        call: (ctx) => SL.Cinema.turnTo(ctx, st(ctx).bulma, st(ctx).beerus.pos),
        cam: { subject: 'bulma', focus: 'upper', angle: 'front' },
        say: { who: 'bulma', to: 'beerus', line: 'Hey! What is going ON over there?!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.tray) {
        s.tray.dispose();
        s.tray = null;
      }
      K().sweat(s.vegeta, false);
      ctx.m.flags.puddingLicked = true;
    },
  };

  const def = {
    id: 'bog_party',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'Bulma\'s Birthday',
    subtitle: 'The Princess Bulma · Vegeta, the host',
    character: 'vegeta',
    stage: 'cruise_liner',
    parTime: 360,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'A cruise, a buffet, a birthday — and a god who gets bored easily. Vegeta has one job: keep him happy.',
    rewards: ['Story: the party', 'Stage: The Princess Bulma'],
    setup: (b) => setup(b, { player: 'vegeta' }),
    phases: [P.party, P.host, P.watergun, P.bingo, P.pudding, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogParty = { SPOT, TRAY, setup, places, godsAtTable, life, v, HOST, watch };
})();
