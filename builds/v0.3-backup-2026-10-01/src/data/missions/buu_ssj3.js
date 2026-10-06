/*
 * CHAPTER 11 — BUU SAGA: BUYING TIME
 * Mission "The Third Level" (canon; played as Goku). Goku stalls Majin Buu in a city while the
 * boys are taught to fuse, shows him Super Saiyan 3 — and pays for it — and Babidi learns what
 * happens to a wizard who shouts at Buu.
 *
 *   CITY    (scene)      Babidi's voice over a city; Buu turning people into sweets; a tower
 *                         coming down; Goku suddenly in the square
 *   DELAY   (checkpoint) Super Saiyan 2 against Buu among the buildings: keep him on you — every
 *                         blast that misses takes a building (the optional objective counts them)
 *   ASCEND                the third level, pushed through by holding Charge: the city shakes,
 *                         the sky goes, lightning finds the towers, and a silence before it lands
 *   THIRD    (checkpoint) Super Saiyan 3: overwhelming, and it burns ki every second. Blow him
 *                         apart twice — or run dry trying (the story goes on either way)
 *   LIMIT    (scene)      "This body won't hold it for long." He tells Buu to wait, and goes
 *   BABIDI   (scene)      the wizard shouts at the wrong creature
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  const DELAY_SECONDS = 26;

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(0, 10), startKi: 100 });
    const buu = b.spawn({ charId: 'majin_buu', team: 1, pos: at(0, -6), startKi: 160, tags: { boss: true, priority: true } });
    const babidi = b.spawn({ charId: 'babidi', team: 1, pos: at(9, -12) });
    const civilians = [];
    for (let i = 0; i < 5; i++) {
      const c = b.spawn({ charId: 'civilian', team: 0, pos: at(-6 + i * 3, 16 + (i % 2) * 2.5) });
      K.watcher(c, 'guard', 'shock');
      civilians.push(c);
    }
    goku.lockedForms = { kaioken: true, ssj3: true };
    K.toForm(goku, 'ssj2');
    goku.setHidden(true); // he arrives in the square with Instant Transmission
    buu.controller = K.scripted();
    buu.mech.maxReforms = Infinity;
    K.hover(b, buu, buu.pos, 7);
    K.watcher(babidi, 'bb_cast', 'grin');
    // the tower Buu brings down in the opening: the nearest building to the square
    let tower = null;
    for (const o of b.stage.obstacles) if (o.building && o.alive && (!tower || Math.hypot(o.x, o.z) < Math.hypot(tower.x, tower.z))) tower = o;
    b.story = { goku, buu, babidi, civilians, tower };
  }

  function faceUp(b) {
    const S = b.story;
    K.faceTo(S.goku, S.buu.pos);
    K.faceTo(S.buu, S.goku.pos);
    K.faceTo(S.babidi, S.goku.pos);
  }

  function fight(m, opts = {}) {
    const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
    if (b.player !== g) b.switchPlayer(g, { force: true });
    g.target = buu;
    buu.target = g;
    buu.controller = new SL.AIController(b, { difficulty: 'normal' });
    g.setState('free');
    buu.setState('free');
    m.lock(false);
    b.aiLocked = false;
  }

  function cityState(b) {
    const S = b.story;
    S.goku.setHidden(false);
    for (const c of S.civilians) if (c.model.setStone) c.model.setStone(true, 'candy');
    if (S.tower && S.tower.alive) b.stage.destroyPillar(S.tower, { quiet: true });
    b.stage.setMood(0.25, 0x2a1030, 1);
  }

  const P = {};

  P.city = {
    id: 'city',
    run: function* (m) {
      const b = m.battle;
      m.lock(true);
      faceUp(b);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'ssj3_city');
    },
  };

  /** Keep him on you. The city is what pays for every miss. */
  P.delay = {
    id: 'delay',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      cityState(b);
      K.place(g, K.ground(b, new V3(0, 0, 8)));
      K.place(buu, K.ground(b, new V3(0, 0, -6)));
      faceUp(b);
      K.toForm(g, 'ssj2');
      g.lockedForms = { kaioken: true, ssj3: true };
      g.hp = g.hpMax;
      g.ki = 100;
      g.cannotDie = true;
      g.damagePlan = [{ level: 1, below: 0.6 }];
      buu.hp = buu.hpMax;
      buu.damageDealtMul = 0.5;
      m.music('finale', 5);
      m.objective('delay', 'Keep him on you', { icon: 'clock', target: DELAY_SECONDS });
      m.objective('city', 'Keep the city standing', { icon: 'guard', optional: true });
      let fallen = 0, t = 0;
      const offB = b.on('buildingDown', () => {
        fallen++;
        m.failObjective('city');
      });
      fight(m);
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        m.progress('delay', Math.min(DELAY_SECONDS, Math.floor(t)));
      };
      m.tickHooks.push(hook);
      yield () => t >= DELAY_SECONDS || g.hpFrac < 0.35;
      K.unhook(m, hook);
      offB();
      m.complete('delay');
      if (!fallen) m.complete('city');
      m.flags.buildingsDown = fallen;
      m.qteParts.push(fallen ? 0.5 : 1);
    },
  };

  P.ascend = {
    id: 'ascend',
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (buu.mech.apart) yield () => !buu.mech.apart;
      buu.controller = K.scripted();
      g.setHidden(false); // entered straight from the Developer Menu, he has not arrived yet
      K.place(g, K.ground(b, new V3(0, 0, 7)));
      K.place(buu, K.ground(b, new V3(0, 0, -6)));
      faceUp(b);
      yield* SL.Cinema.play(m, 'ssj3_offer');
      buu.setState('scripted', { pose: 'bu_sit', expression: 'grin' });
      g.hp = Math.max(g.hp, g.hpMax * 0.7);
      g.ki = 100;
      m.objective('ascend', 'Go even further', { icon: 'transform' });
      m.shot((t, out) => {
        const c = g.chest();
        const toB = buu.pos.clone().sub(g.pos).setY(0).normalize();
        const side = new V3(-toB.z, 0, toB.x);
        K.camAt(out, c.clone().addScaledVector(toB, 5).addScaledVector(side, 2.2).add(new V3(0, -0.6, 0)), c.clone().add(new V3(0, 0.6, 0)), 54);
      }, 60, { cut: true, blendIn: 0 });
      // the city answers the power: lights, then the ground, then the sky
      const shake = (k) => {
        for (const o of b.stage.obstacles) {
          if (!o.alive || !o.building || Math.hypot(o.x - g.pos.x, o.z - g.pos.z) > 70) continue;
          if (b.frame % 7 === 0) b.vfx.debrisBurst(new V3(o.x, o.h * (0.3 + k * 0.5), o.z), 3, o.color, 6, 0.2);
        }
      };
      yield* SL.data.cinematics.ascend(m, {
        fighter: g,
        form: 'ssj3',
        witness: buu,
        seconds: 6,
        label: 'Hold — all the way',
        meter: 'SUPER SAIYAN 3',
        line: 'goku_ssj3',
        music: 6,
        dust: false, // pavement: rubble, not sand clouds (330 frames of dust buried him)
        beats: [
          { at: 0.2, run: () => b.stage.setMood(0.5, 0x0a0a18, 1.5) },
          { at: 0.4, run: () => { shake(0.4); b.sfx('rumble', g, { vol: 1.1, dur: 4 }); } },
          { at: 0.6, run: () => { shake(0.6); b.vfx.skyBolt(g.pos.clone().add(new V3(6, 0, -4)), 60); b.vfx.skyBolt(g.pos.clone().add(new V3(-8, 0, 3)), 60); } },
          { at: 0.8, run: () => { shake(0.9); b.stage.crater(g.pos, 6, 0.8, null); b.stage.setMood(0.82, 0x05050c, 0.8); } },
        ],
        onReady: () => m.endShot(),
      });
      m.complete('ascend');
      g.lockedForms = { kaioken: true };
    },
  };

  /** The third level: overwhelming, and it drinks his ki. */
  P.third = {
    id: 'third',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, buu = S.buu;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      cityState(b);
      if (buu.mech.apart) yield () => !buu.mech.apart;
      K.toForm(g, 'ssj3');
      g.lockedForms = { kaioken: true };
      g.ki = Math.max(g.ki, 100);
      g.cannotDie = true;
      g.damageDealtMul = 1.1;
      g.damagePlan = [{ level: 2, below: 0.5 }];
      buu.hp = Math.max(buu.hp, buu.hpMax * 0.8);
      buu.reformTo = 0.62;
      buu.mech.breakIdx = 0;
      buu.damageDealtMul = 0.4;
      buu.damageTakenMul = 1.25;
      b.stage.clearMood(1.5);
      m.music('finale', 6);
      m.objective('apart', 'Blow him apart — twice', { icon: 'fist', target: 2 });
      m.prompt('ssj3Ki', 'charge', 'Charge — the form is burning your ki', { when: () => g.ki < 35 && g.form.id === 'ssj3', until: () => g.ki > 60 });
      let aparts = 0, dry = false;
      const offA = b.on('buuApart', (e) => {
        if (e.fighter === buu) m.progress('apart', ++aparts);
      });
      const offX = b.on('formExhausted', (e) => {
        if (e.fighter === g) dry = true;
      });
      fight(m);
      yield () => aparts >= 2 || dry || g.formIndex === 0;
      offA();
      offX();
      m.flags.ssj3Aparts = aparts;
      m.flags.ssj3RanDry = dry || g.formIndex === 0;
      if (aparts < 2) m.failObjective('apart');
      m.qteParts.push(aparts / 2);
      m.lock(true);
      K.clearCombat(b);
      buu.controller = K.scripted();
      if (buu.mech.apart) yield () => !buu.mech.apart;
      buu.setState('scripted', { pose: 'bu_idle', expression: 'grin' });
      faceUp(b);
      yield* SL.Cinema.play(m, 'ssj3_limit');
      yield* SL.Cinema.play(m, 'ssj3_babidi');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'THE THIRD LEVEL', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_ssj3',
    canon: true,
    chapter: 'CHAPTER 11 · BUU SAGA',
    title: 'The Third Level',
    subtitle: 'Earth · Age 774 · buying time',
    character: 'goku',
    stage: 'satan_city',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Goku has one day on Earth and a monster to stall. He shows Buu something he has been saving — and it costs more than he has.',
    rewards: ['Goku: Super Saiyan 3', 'Super Saiyan 3 in Free Battle'],
    setup,
    phases: [P.city, P.delay, P.ascend, P.third, P.after],
  };

  SL.data.missions[def.id] = def;
})();
