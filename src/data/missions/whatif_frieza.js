/*
 * WHAT IF · CHAPTER 4 — "What if Frieza won?"   (NOT CANON) — played AS FRIEZA.
 *
 * Branches from "The Legendary Super Saiyan". In the story you know, Frieza kills Krillin to break
 * Goku, and what breaks is Frieza's universe. Here he has seen that look on a Saiyan's face before:
 *
 *   INTRO  (scene)       the Spirit Bomb did not finish him; up on the ledge, battered and finished
 *                        with games: he will take the friends first, and the monkey will watch
 *   CRUSH  (checkpoint)  PLAYED as Final Form Frieza against Piccolo, Gohan and Krillin — with Goku in
 *                        the fight too. GOKU'S RAGE climbs while he is left alone and jumps every time
 *                        one of his friends goes down; your blows on him knock it back. When it peaks
 *                        his hair starts to flicker gold: you have three and a half seconds to hit him
 *                        out of it, or the legend wakes up and the mission is lost.
 *   GOKU   (checkpoint)  the friends are down; Goku alone, Kaio-ken, and a rage that builds faster
 *   END    (scene)       the emperor over the last Saiyan; the planet dying; the Earth next
 *
 * Saved on the What-If track; canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const FIELD = new V3(0, 0, -12);
  const at = (b, x, z) => K.ground(b, FIELD.clone().add(new V3(x, 0, z)));
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });

  const WINDOW = 210; // frames to hit him out of it

  function setup(battle) {
    const b = battle;
    const cliff = SL.data.missions.namek_spirit_bomb.buildCliff(b);
    for (const o of b.stage.obstacles) {
      if (!o.alive || o.group === cliff.object) continue;
      if (Math.hypot(o.x - FIELD.x, o.z - FIELD.z) < 42 + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
    const frieza = b.spawn({ charId: 'frieza', player: true, team: 1, pos: cliff.pos.clone(), startKi: 140 });
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    frieza.lockedSlots = { transform: true };
    if (frieza.model.cutTail) frieza.model.cutTail(0.45);
    if (frieza.model.setBattered) frieza.model.setBattered(true);
    const goku = b.spawn({ charId: 'goku', team: 0, pos: at(b, 0, 11), startKi: 60, tags: { priority: true } });
    goku.lockedForms = { ssj: true };
    goku.lockedSlots = { transform: true };
    goku.formCaps = { kaioken: 4 };
    const krillin = b.spawn({ charId: 'krillin', team: 0, pos: at(b, 3.2, 9.5), startKi: 60 });
    const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: at(b, -1.8, 12), startKi: 60 });
    const piccolo = b.spawn({ charId: 'piccolo', team: 0, pos: at(b, 2, 6.5), startKi: 70 });
    if (piccolo.lockedForms) delete piccolo.lockedForms.nail;
    piccolo.applyForm(1);
    for (const f of [goku, krillin, gohan, piccolo]) {
      f.controller = K.scripted();
      f.cannotDie = true;
    }
    K.faceTo(frieza, goku.pos);
    for (const f of [goku, krillin, gohan, piccolo]) K.faceTo(f, frieza.pos);
    b.story = { frieza, goku, krillin, gohan, piccolo, cliff };
  }

  const P = {};

  P.intro = {
    id: 'intro',
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, g = S.goku, pc = S.piccolo;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      m.music('ominous', 1);
      fz.setState('scripted', { pose: 'fz_brace', expression: 'angry' });
      g.setState('scripted', { pose: 'idle', expression: 'shock' });
      shot(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 2.8);
      m.say('goku', 'No way... he\'s still standing...', 2.6, { style: 'quiet' });
      yield* m.cine(2.8);
      shot(m, { frieza: fz }, { subject: 'frieza', focus: 'upper', angle: 'low' }, 3.6);
      m.say('frieza', 'A ball of borrowed energy. THAT was your last hope?', 3.4);
      yield* m.cine(3.6);
      fz.setState('scripted', { pose: 'fz_point', expression: 'wicked' });
      shot(m, { frieza: fz }, { subject: 'frieza', focus: 'face', angle: 'three' }, 4.4);
      m.say('frieza', 'I know that look, monkey. A Saiyan wore it the day I erased your planet. He thought it would be enough, too.', 4.2);
      yield* m.cine(4.4);
      shot(m, { frieza: fz, goku: g }, { subject: 'frieza', with: 'goku', focus: 'medium' }, 3.8);
      m.say('frieza', 'So no more games. Your friends go first — and you will watch, and you will NOT get angry in time.', 3.6, { style: 'quiet' });
      yield* m.cine(3.8);
      pc.setState('scripted', { pose: 'idle', expression: 'angry' });
      shot(m, { piccolo: pc }, { subject: 'piccolo', focus: 'upper', angle: 'three' }, 2.8);
      m.say('piccolo', 'Everyone, TOGETHER! Don\'t let him pick us off!', 2.6, { style: 'shout' });
      yield* m.cine(2.8);
      m.endShot();
    },
  };

  /**
   * GOKU'S RAGE: the meter the whole What-If is about. Returns the hook state; the hook itself is
   * pushed by the phase (rate: passive gain per second).
   */
  function rageMeter(m, rate) {
    const b = m.battle, S = b.story, g = S.goku, fz = S.frieza;
    const gs = m.flags.wfRage || (m.flags.wfRage = { rage: 0, window: 0, interrupts: 0, lost: false });
    gs.window = 0;
    const ssj = g.def.forms[g.def.forms.findIndex((x) => x.id === 'ssj')];
    let brain = null;
    const offD = b.on('damage', (e) => {
      if (e.target !== g || e.attacker !== fz) return;
      if (gs.window > 0) {
        // hit out of it: the gold goes out, the meter falls back
        gs.window = 0;
        gs.rage = 40;
        gs.interrupts++;
        g.model.setForm(g.form);
        g.setRage(false);
        if (brain) g.controller = brain;
        m.complete('stop');
        b.emit('markers', { list: [] });
        m.say('frieza', U.pick(['Oh no you don\'t.', 'Not today, monkey.', 'Sit DOWN.']), 1.8);
        b.slowmo(0.4, 0.6);
        return;
      }
      gs.rage = Math.max(0, gs.rage - (e.blocked ? 1 : 3));
    });
    const hook = () => {
      if (gs.lost) return;
      if (gs.window > 0) {
        gs.window--;
        // the hair, flickering between black and gold; the lightning; the ground
        if (b.frame % 4 === 0) g.model.setForm(Math.floor(b.frame / 4) % 2 ? ssj : g.form);
        if (b.frame % 5 === 0) b.vfx.bolt(g.chest().add(new V3(U.rand(-0.7, 0.7), U.rand(-0.9, 0.9), U.rand(-0.7, 0.7))), U.rand(0.7, 1.4));
        if (b.frame % 6 === 0 && b.stage.hasGround) b.vfx.rock(g.pos.clone().add(new V3(U.rand(-4, 4), 0.1, U.rand(-4, 4))), new V3(0, U.rand(2, 6), 0), U.rand(0.1, 0.35), b.stage.rockColor);
        b.camera.addTrauma(0.015);
        if (gs.window === 0) {
          // too late
          gs.lost = true;
          g.model.setForm(ssj);
          SL.ScreenFX.flash(0.8, '#fff1a0');
          b.vfx.ring(g.chest(), 10, 0xffe25a, 0.7);
          m.say('goku', 'I said... ENOUGH!!', 2, { style: 'shout' });
          m.failObjective('stop');
          m.fail('The legend awakened');
        }
        return;
      }
      const busy = ['hitstun', 'knockback', 'knockdown', 'getup', 'stagger', 'guardBreak', 'held'].includes(g.state);
      if (!busy) gs.rage = Math.min(100, gs.rage + rate / 60);
      m.progress('rage', Math.floor(gs.rage));
      if (gs.rage >= 100) {
        // it starts: he stops fighting and the gold comes up through him
        gs.window = WINDOW;
        brain = g.controller;
        g.controller = K.scripted();
        g.setState('scripted', { pose: 'g_ssjClench', expression: 'shout' });
        g.setRage(true, 1);
        m.objective('stop', 'STOP HIM — hit Goku before he transforms!', { icon: 'transform' });
        m.say('goku', U.pick(['You... you\'ll PAY for that!', 'I won\'t... forgive you...!', 'FRIEZAAAAAA!']), 2.2, { style: 'shout' });
        b.sfx('ssjRise', g, { vol: 1.1 });
        // make sure the player SEES it: a beat of slow motion on his face, the lock on him, a marker
        fz.target = g;
        b.emit('markers', { list: [{ obj: g, icon: 'transform' }] });
        b.slowmo(0.35, 1);
        // from Frieza's side of him: what the emperor sees
        m.shot((t, out) => {
          const head = g.headPos ? g.headPos() : g.chest().add(new V3(0, 0.35, 0));
          const toF = fz.pos.clone().sub(g.pos).setY(0).normalize();
          const side = new V3(-toF.z, 0, toF.x);
          out.pos.copy(head).addScaledVector(toF, 2.3 - t * 0.4).addScaledVector(side, 0.5).add(new V3(0, 0.1, 0));
          out.look.copy(head).add(new V3(0, -0.12, 0));
          out.fov = 40;
        }, 0.9, { cut: true, blendIn: 0 });
      }
    };
    m.tickHooks.push(hook);
    const off = () => {
      offD();
      b.emit('markers', { list: [] });
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      g.model.setForm(g.form);
    };
    m.onDispose(off);
    return { gs, off, bump: (n) => (gs.rage = Math.min(100, gs.rage + n)) };
  }

  /** Frieza against all four; the friends first. */
  P.crush = {
    id: 'crush',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      const friends = [S.piccolo, S.gohan, S.krillin];
      K.place(fz, at(b, 0, -2), 0);
      K.faceTo(fz, g.pos);
      fz.setState('free');
      fz.hp = fz.hpMax;
      fz.ki = Math.max(fz.ki, 100);
      b.switchPlayer(fz, { force: true });
      const spots = [[3, 7], [-3, 8], [5, 10], [0, 11]];
      [S.piccolo, S.gohan, S.krillin, g].forEach((f, i) => {
        f.setHidden(false);
        f.untargetable = false;
        f.intangible = false;
        K.place(f, at(b, spots[i][0], spots[i][1]));
        K.faceTo(f, fz.pos);
        f.hp = f.hpMax;
        f.ki = Math.max(f.ki, 60);
        f.controller = cpu(b);
        f.target = fz;
        f.setState('free');
      });
      m.lock(false);
      b.aiLocked = false;
      m.music('frieza_theme', 5);
      m.objective('friends', 'Take his friends down first', { icon: 'skull', target: 3 });
      m.objective('rage', 'Goku\'s rage — keep it down', { icon: 'transform', target: 100 });
      m.prompt('wfHint', 'heavy', 'Hitting Goku cools his rage', { when: () => (m.flags.wfRage || {}).rage > 60, always: false });
      const R = rageMeter(m, 3);
      let down = 0;
      const shout = { piccolo: 'PICCOLO!', kid_gohan: 'GOHAN! NO!', krillin: 'KRILLIN!' };
      const fight = m.storyFight({
        floors: [
          ...friends.map((f) => ({
            f,
            at: 0.05,
            onFloor: () => {
              down++;
              m.progress('friends', down);
              K.place(f, f.pos.clone());
              f.controller = K.scripted();
              f.untargetable = f.intangible = true;
              f.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
              R.bump(34);
              m.say('goku', shout[f.def.id] || 'NO!', 1.8, { style: 'shout' });
            },
          })),
          // Goku keeps getting up while there is anybody left to get up for
          { f: g, at: 0.3 },
        ],
        dealt: friends.concat([g]).map((f) => ({ f, mul: 0.55 })),
        // they are not going down in one blow each: four of them, fighting for their lives
        taken: friends.map((f) => ({ f, mul: 0.4 })).concat([{ f: g, mul: 0.45 }]),
      });
      yield () => down >= 3 || R.gs.lost;
      fight.off();
      R.off();
      if (R.gs.lost) {
        yield 99;
        return;
      }
      m.complete('friends');
      m.say('frieza', 'And then there was one.', 2.2);
      yield 1;
    },
  };

  /** Goku alone. */
  P.goku = {
    id: 'goku',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      for (const f of [S.piccolo, S.gohan, S.krillin]) {
        f.controller = K.scripted();
        f.untargetable = f.intangible = true;
        f.setState('scripted', { pose: 'knockdown', expression: 'ko', aura: 0 });
      }
      if (fz.hp < fz.hpMax * 0.5) fz.hp = Math.round(fz.hpMax * 0.5);
      fz.setState('free');
      b.switchPlayer(fz, { force: true });
      g.untargetable = g.intangible = false;
      g.setHidden(false);
      // the last one standing: everything he has left (a Senzu's worth of stubbornness)
      g.hp = g.hpMax;
      g.ki = g.kiMax;
      g.controller = cpu(b);
      g.target = fz;
      g.setState('free');
      // the start of a checkpoint: the meter comes back where it would be, never at the edge
      if (m.flags.wfRage) m.flags.wfRage.rage = Math.min(m.flags.wfRage.rage, 60);
      m.lock(false);
      b.aiLocked = false;
      m.music('final_clash', 6);
      m.objective('last', 'Finish the last Saiyan', { icon: 'skull', target: 100 });
      m.objective('rage', 'Goku\'s rage — keep it down', { icon: 'transform', target: 100 });
      const R = rageMeter(m, 5);
      let floored = false;
      const fight = m.storyFight({ floors: [{ f: g, at: 0.06, onFloor: () => (floored = true) }], dealt: [{ f: g, mul: 0.7 }], taken: [{ f: g, mul: 0.3 }] });
      const hook = () => m.progress('last', Math.floor(U.clamp01((1 - g.hpFrac) / 0.94) * 100));
      m.tickHooks.push(hook);
      yield () => floored || R.gs.lost;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      fight.off();
      R.off();
      if (R.gs.lost) {
        yield 99;
        return;
      }
      m.complete('last');
      m.complete('rage');
      yield 0.5;
    },
  };

  P.end = {
    id: 'end',
    run: function* (m) {
      const b = m.battle, S = b.story, fz = S.frieza, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      for (const f of b.fighters) if (f !== fz) f.controller = K.scripted();
      fz.controller = K.scripted();
      K.place(g, g.pos.clone());
      g.setState('scripted', { pose: 'knockdown', expression: 'hurt', aura: 0 });
      K.place(fz, g.pos.clone().add(new V3(1.6, 0, 1.2)));
      K.faceTo(fz, g.pos);
      fz.setState('scripted', { pose: 'fz_laugh', expression: 'wicked' });
      m.music('ominous', 2);
      shot(m, { frieza: fz, goku: g }, { subject: 'frieza', with: 'goku', focus: 'medium', angle: 'low' }, 3.8);
      m.say('frieza', 'The legendary Super Saiyan. A bedtime story for monkeys.', 3.4);
      yield* m.cine(3.8);
      shot(m, { goku: g }, { subject: 'goku', focus: 'face', angle: 'high' }, 3.4);
      m.say('goku', '...Someone... will stop you... someday...', 3, { style: 'quiet' });
      yield* m.cine(3.4);
      fz.setState('scripted', { pose: 'fz_finger', expression: 'calm' });
      b.vfx.flash(fz.handPos('R'), 0.9, 0xff60a0, 0.4, SL.Toon.tex.glow);
      shot(m, { frieza: fz }, { subject: 'frieza', focus: 'closeup', angle: 'three' }, 2.4);
      m.say('frieza', 'Let them come.', 1.8, { style: 'quiet' });
      yield* m.cine(2.2);
      SL.ScreenFX.flash(0.7, '#ffffff');
      b.sfx('kiBlast', fz, { pitch: 1.6 });
      m.fade('black', 0.3);
      yield* m.cine(1.6);
      // the planet dying under him; he does not look back
      m.fade('clear', 1);
      g.setHidden(true);
      b.camera.addTrauma(0.6);
      SL.Audio.play('rumble', { vol: 1.2 });
      fz.setState('scripted', { pose: 'fz_laugh', expression: 'smirk' });
      shot(m, { frieza: fz }, { subject: 'frieza', focus: 'wide', angle: 'low', room: 8 }, 4);
      m.say('frieza', 'Now. That little blue planet they were all so fond of...', 3.6, { style: 'quiet' });
      yield* m.cine(4);
      m.endShot();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title('WHAT IF...?', 'THE EMPEROR\'S UNIVERSE', 'Frieza silences the legend before it wakes · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_frieza',
    whatIf: true,
    branchOf: 'namek_super_saiyan',
    branchPoint: 'krillin',
    chapter: 'WHAT IF · CHAPTER 4',
    title: 'What if Frieza won?',
    subtitle: 'Namek · Age 762 · Alternate timeline',
    character: 'frieza',
    stage: 'namek',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'Play as Frieza. The Spirit Bomb did not finish him — and this time he does not give Goku a reason to wake up. Take the friends down, and never let the monkey get angry enough.',
    rewards: ['Play as Final Form Frieza', 'A darker ending on Namek'],
    setup,
    phases: [P.intro, P.crush, P.goku, P.end],
  };

  SL.data.missions[def.id] = def;
})();
