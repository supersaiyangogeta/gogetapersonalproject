/*
 * WHAT IF · CHAPTER 4 — "What if Vegeta became a Super Saiyan first?"   (NOT CANON)
 *
 * Branches from "The Super Saiyan". In the story you know, Vegeta dies on Namek with tears on his face,
 * and it is Goku who reaches the legend. Here Frieza toys with the prince a moment too long:
 *
 *   FALL   (scene)      Frieza over a beaten Vegeta, a finger raised; Goku shouting; the tears; "I am the
 *                       prince... of ALL... SAIYANS!"
 *   RISE   (checkpoint) PLAYED: hold Charge to push through (SL.data.cinematics.ascend) — his own Super
 *                       Saiyan sequence (vegeta.js: the fists, the scream, the burst, the look at his fist)
 *   DUEL   (checkpoint) Super Saiyan Vegeta against Final Form Frieza: a real fight, Frieza's own boss AI,
 *                       no story damage multipliers — and a power gap when Frieza's pride breaks:
 *                       at half health his blows stop landing on the gold
 *   END    (scene)      Frieza begging; "I'm not Kakarot. I don't give second chances."; the palm; the
 *                       legend is HIS; the planet shaking under them
 *
 * Alternate transformation (Vegeta's gold, five years early), alternate ending, Vegeta's pride
 * vindicated. Saved on the What-If track; canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const shot = (m, cast, spec, secs) => SL.Cinema.shotOn(m, cast, spec, secs, { cut: true, blendIn: 0, hold: true });
  const at = (b, x, z) => K.ground(b, new V3(x, 0, z));
  const cpu = (b) => new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });

  function setup(battle) {
    const b = battle;
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: at(b, 0, 3), startKi: 100 });
    const frieza = b.spawn({ charId: 'frieza', team: 1, pos: at(b, 0, -2.5), startKi: 140, tags: { boss: true, priority: true } });
    const goku = b.spawn({ charId: 'goku', team: 0, pos: at(b, 9, 7) });
    frieza.applyForm(3);
    frieza.mech.phase = 3;
    frieza.bossPhaseCap = 3;
    frieza.controller = K.scripted();
    frieza.cannotDie = true;
    goku.controller = K.scripted();
    goku.untargetable = goku.intangible = true;
    goku.cannotDie = true;
    vegeta.cannotDie = true;
    vegeta.hp = Math.round(vegeta.hpMax * 0.3);
    vegeta.lockedForms = Object.assign({}, vegeta.lockedForms, { ssj: true });
    if (vegeta.setDamage) vegeta.setDamage(2);
    K.faceTo(vegeta, frieza.pos);
    K.faceTo(frieza, vegeta.pos);
    K.faceTo(goku, frieza.pos);
    b.story = { vegeta, frieza, goku };
  }

  const P = {};

  P.fall = {
    id: 'fall',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza, g = S.goku;
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      m.music('ominous', 1);
      v.setState('scripted', { pose: 'defeatKneel', expression: 'hurt' });
      fz.setState('scripted', { pose: 'fz_laugh', expression: 'smirk' });
      g.setState('scripted', { pose: 'stagger', expression: 'grit' });
      shot(m, { frieza: fz, vegeta: v }, { subject: 'frieza', with: 'vegeta', focus: 'full' }, 3.4);
      m.say('frieza', 'The prince of all Saiyans... on his knees in the mud. How very fitting.', 3.2);
      yield* m.cine(3.4);
      fz.setState('scripted', { pose: 'fz_finger', expression: 'wicked' });
      b.vfx.flash(fz.handPos('R'), 0.9, 0xff60a0, 0.4, SL.Toon.tex.glow);
      shot(m, { frieza: fz }, { subject: 'frieza', focus: 'upper', angle: 'low' }, 2.4);
      m.say('frieza', 'Goodbye, monkey.', 2, { style: 'quiet' });
      yield* m.cine(2.2);
      shot(m, { goku: g }, { subject: 'goku', focus: 'upper', angle: 'three' }, 1.8);
      m.say('goku', 'VEGETA! Get UP!', 1.6, { style: 'shout' });
      yield* m.cine(1.8);
      // the tears — and this time, not the end of him
      if (v.setRage) v.setRage(true, 0.7);
      v.setState('scripted', { pose: 'defeatKneel', expression: 'grit' });
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'face', angle: 'front' }, 3.2);
      m.say('vegeta', 'Kakarot\'s... pity. Frieza\'s... laughter. I was BORN to be above all of it...', 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'closeup', angle: 'low' }, 2.8);
      m.say('vegeta', 'I am the prince... of ALL... SAIYANS!!', 2.6, { style: 'shout' });
      b.cameraTraumaAt(v.chest(), 0.4);
      yield* m.cine(2.8);
      m.endShot();
    },
  };

  P.rise = {
    id: 'rise',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      fz.setState('scripted', { pose: 'fz_finger', expression: 'shock' });
      m.music('super_saiyan', 1);
      m.objective('rise', 'Hold Charge: the legend is yours', { icon: 'transform' });
      yield* SL.data.cinematics.ascend(m, {
        fighter: v,
        form: 'ssj',
        seconds: 4,
        label: 'Hold — the legend is his',
        meter: 'PRIDE',
        witness: fz,
        witnessLine: 'That hair... those eyes... it can\'t be. A SUPER SAIYAN?!',
        music: 3,
        beats: [
          { at: 0.35, run: (mm) => mm.say('vegeta', 'RRRAAAAAH!', 1.6, { style: 'shout' }) },
          { at: 0.7, run: (mm) => mm.say('goku', 'His power... it\'s exploding!', 1.8) },
        ],
      });
      if (v.setRage) v.setRage(false, 0);
      m.complete('rise');
      v.hp = Math.max(v.hp, Math.round(v.hpMax * 0.7));
      v.ki = v.kiMax;
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'low' }, 3.4);
      v.setState('scripted', { pose: 'v_tfPride', expression: 'cocky' });
      m.say('vegeta', 'So THIS is the power of the legend. And it belongs... to ME.', 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      shot(m, { goku: g }, { subject: 'goku', focus: 'closeup', angle: 'three' }, 2.2);
      m.say('goku', 'Vegeta... you did it.', 2, { style: 'quiet' });
      yield* m.cine(2.2);
      m.endShot();
    },
  };

  P.duel = {
    id: 'duel',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      // entered from this checkpoint: he is already gold
      const ssj = v.def.forms.findIndex((x) => x.id === 'ssj');
      if (v.formIndex !== ssj) {
        m.teach(v, 'form:ssj');
        v.applyForm(ssj);
        v.hp = Math.round(v.hpMax * 0.7);
        v.ki = v.kiMax;
      }
      if (b.player !== v) b.switchPlayer(v, { force: true });
      K.place(v, at(b, 0, 4), Math.PI);
      K.place(fz, at(b, 0, -4), 0);
      K.faceTo(v, fz.pos);
      K.faceTo(fz, v.pos);
      fz.controller = cpu(b);
      fz.target = v;
      v.target = fz;
      // the prince's fight: Frieza's own boss AI; when his pride breaks, so does his reach
      let gapOn = false;
      const sf = m.storyFight({
        floors: [
          {
            f: fz,
            at: 0.5,
            onFloor: () => {
              gapOn = true;
              m.say('frieza', 'Why... why won\'t you FALL?!', 2, { style: 'shout' });
              fz.storyFloor = { frac: 0.08, reached: false };
              m.powerGap(v, { from: [fz], mul: 0.15, lines: [{ at: 2, who: 'vegeta', line: 'Is that all? Is THAT what I feared all my life?', duration: 2.6 }] });
            },
          },
        ],
        fighters: [v, fz],
      });
      v.setState('free');
      fz.setState('free');
      m.music('vegeta_theme', 2);
      m.objective('frieza', 'Make Frieza pay for every year', { icon: 'fist' });
      m.lock(false);
      b.aiLocked = false;
      yield () => (gapOn && fz.hpFrac <= 0.09) || m.state !== 'running';
      sf.off();
      if (m.state !== 'running') return;
      m.complete('frieza');
      m.lock(true);
      K.clearCombat(b);
    },
  };

  P.end = {
    id: 'end',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, fz = S.frieza, g = S.goku;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      K.place(fz, at(b, fz.pos.x, fz.pos.z), fz.yaw);
      K.place(v, fz.pos.clone().addScaledVector(fz.forward.clone().setY(0).normalize(), 3), 0);
      K.faceTo(v, fz.pos);
      K.faceTo(fz, v.pos);
      fz.setState('scripted', { pose: 'fz_defeat', expression: 'shock' });
      v.setState('scripted', { pose: 'armsCrossed', expression: 'cocky' });
      m.music('final_clash', 1);
      shot(m, { frieza: fz }, { subject: 'frieza', focus: 'closeup', angle: 'high' }, 3.4);
      m.say('frieza', 'W-wait! Vegeta! I\'ll make you my right hand — a planet of your own — anything you want!', 3.2, { style: 'shout' });
      yield* m.cine(3.4);
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'low' }, 3.2);
      m.say('vegeta', 'I\'m not Kakarot, Frieza. I don\'t give second chances.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      v.setState('scripted', { pose: 'v_palmExecute', expression: 'wicked' });
      b.vfx.flash(v.handPos('R'), 1.4, 0x7fc6ff, 0.3, SL.Toon.tex.glow);
      yield* m.cine(0.6);
      SL.ScreenFX.flash(0.6, '#ffffff');
      b.vfx.explosion(fz.chest(), 4, 0xffe080, { smoke: true });
      b.sfx('explosionHuge', fz);
      b.cameraTraumaAt(fz.chest(), 0.8);
      fz.setHidden(true);
      yield* m.cine(1.2);
      v.setState('scripted', { pose: 'v_tfPride', expression: 'cocky' });
      K.faceTo(v, g.pos);
      K.faceTo(g, v.pos);
      g.setState('scripted', { pose: 'stagger', expression: 'grin' });
      shot(m, { vegeta: v, goku: g }, { subject: 'vegeta', with: 'goku', focus: 'upper' }, 3.4);
      m.say('vegeta', 'Well, Kakarot? It seems the legendary Super Saiyan... is ME.', 3.2);
      yield* m.cine(3.4);
      shot(m, { goku: g }, { subject: 'goku', focus: 'closeup', angle: 'three' }, 2.4);
      m.say('goku', 'Heh... guess so. For now.', 2.2);
      yield* m.cine(2.4);
      // the planet, giving way under them
      b.camera.addTrauma(0.6);
      SL.Audio.play('rumble', { vol: 1.2 });
      shot(m, { vegeta: v }, { subject: 'vegeta', focus: 'wide', angle: 'low', room: 8 }, 2.6);
      m.say('vegeta', 'This planet is finished. Try to keep up — rival.', 2.6, { style: 'quiet' });
      yield* m.cine(2.8);
      m.endShot();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title('WHAT IF...?', 'THE PRINCE OF ALL SAIYANS', 'Vegeta reaches the legend first · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_vegeta',
    whatIf: true,
    branchOf: 'namek_super_saiyan',
    branchPoint: 'krillin',
    chapter: 'WHAT IF · CHAPTER 4',
    title: 'What if Vegeta became a Super Saiyan first?',
    subtitle: 'Namek · Age 762 · Alternate timeline',
    character: 'vegeta',
    stage: 'namek',
    parTime: 300,
    qteLabel: 'The ascension',
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'Frieza toys with the prince one moment too long. The tears turn to rage — and it is Vegeta, not Goku, who reaches the legend on Namek.',
    rewards: ['Vegeta\'s Super Saiyan, five years early', 'An alternate ending on Namek'],
    setup,
    phases: [P.fall, P.rise, P.duel, P.end],
  };

  SL.data.missions[def.id] = def;
})();
