/*
 * CHAPTER 6 — CELL SAGA (third mission)
 * Mission "Let Him Finish" (canon, played as Vegeta, then as Trunks).
 *
 * The one where the player is handed a fight they are winning and then has to
 * throw it away, because the character they are playing wants the perfect
 * version of the opponent more than he wants to win.
 *
 * Phases: SEMI (checkpoint: Vegeta against the semi-perfect form, and he is
 * genuinely better than it) → LET (scene `cell_takes_18`, then the staged
 * transformation into the perfect form) → PERFECT (scene `perfect_arrives`) →
 * BEATEN (checkpoint: the same Vegeta against the thing he asked for) → FLASH (Cell offers him one
 * free shot: the Final Flash, charged by the player — rebuilt 2026-10-03 to the owner's six-act sheet:
 * Super Vegeta's stance, the ground splitting and the boulders burning away, the view from space, Cell's
 * smile going, "FINAL... FLASSSSH!", the trench, the silence, the arm and the side gone) → AFTER.
 *
 * The mission never takes control away to make the point: the choice is in the
 * cutscene, the consequence is a phase the player has to play.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const FIELD = new V3(0, 0, -10);
  const SEMI_TARGET = 45;
  const SURVIVE_SECONDS = 35;

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }
  function ground(b, v, lift = 0) {
    const p = v.clone();
    p.y = b.stage.heightAt(p.x, p.z) + lift;
    return p;
  }
  function place(f, pos, yaw) {
    SL.Staging.place(f, pos, yaw); // on the terrain when the point is on it, in the air when it is above it
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  function clearArea(b, center, r) {
    for (const o of b.stage.obstacles) {
      if (!o.alive) continue;
      if (Math.hypot(o.x - center.x, o.z - center.z) < r + o.r) {
        o.alive = false;
        if (o.group) o.group.visible = false;
        if (o.segs) o.segs.forEach((sg) => (sg.visible = false));
      }
    }
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  function setup(battle) {
    const b = battle;
    clearArea(b, FIELD, 34);
    const vegeta = b.spawn({ charId: 'vegeta', player: true, team: 0, pos: ground(b, FIELD.clone().add(new V3(0, 0, 7))), startKi: 100 });
    vegeta.lockedForms = {};
    const ssj = vegeta.def.forms.findIndex((f) => f.id === 'ssj');
    if (ssj > 0) vegeta.applyForm(ssj);
    vegeta.cannotDie = true; // canon: Cell leaves him alive, which is worse
    const trunks = b.spawn({ charId: 'future_trunks', team: 0, pos: ground(b, FIELD.clone().add(new V3(8, 0, 11))), startKi: 90 });
    trunks.lockedForms = {};
    const tssj = trunks.def.forms.findIndex((f) => f.id === 'ssj');
    if (tssj > 0) trunks.applyForm(tssj);
    trunks.controller = scripted();
    trunks.untargetable = true;
    trunks.cannotDie = true;
    const a18 = b.spawn({ charId: 'android_18', team: 2, pos: ground(b, FIELD.clone().add(new V3(-8, 0, -3))), startKi: 140 });
    a18.controller = scripted();
    a18.untargetable = true;
    a18.cannotDie = true;
    const cell = b.spawn({ charId: 'cell', team: 1, pos: ground(b, FIELD.clone().add(new V3(0, 0, -7))), startKi: 140, tags: { boss: true, priority: true } });
    cell.controller = scripted();
    cell.cannotDie = true;
    const semi = cell.def.forms.findIndex((f) => f.id === 'semi_perfect');
    if (semi > 0) cell.applyForm(semi);
    cell.bossPhaseCap = 2;
    b.story = { vegeta, trunks, a18, cell };
  }

  const P = {};

  /** The half he is winning, and the mission lets him win it. */
  P.semi = {
    id: 'semi',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cell;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      b.switchPlayer(v, { force: true });
      const ssj = v.def.forms.findIndex((f) => f.id === 'ssj');
      if (ssj > 0 && v.formIndex !== ssj) v.applyForm(ssj);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 90);
      v.cannotDie = true;
      // a year in the Time Chamber: for once he is the stronger one
      v.damageDealtMul = 2.4;
      v.damageTakenMul = 0.5;
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(c, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      const semi = c.def.forms.findIndex((f) => f.id === 'semi_perfect');
      if (semi > 0 && c.formIndex !== semi) c.applyForm(semi);
      c.hp = c.hpMax;
      c.poise.value = c.poise.max;
      c.cannotDie = true;
      c.infiniteHp = false;
      c.bossPhaseCap = 2;
      c.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.75, defense: 0.45, ranged: 0.5, beam: 0.45, preferredRange: 4, hooks: 'boss' } });
      c.target = v;
      v.target = c;
      S.a18.setHidden(false);
      S.a18.untargetable = true;
      S.a18.setState('scripted', { pose: 'a17_bored', expression: 'shock' });
      v.setState('free');
      c.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('cell_theme', 5);
      m.objective('outclass', 'Show him what a year bought you', { icon: 'fist', target: SEMI_TARGET });
      m.objective('untouched', 'Lose less than a third of your health', { icon: 'guard', optional: true });
      const start = c.hp;
      let best = 0;
      const hook = () => {
        if (b.inputLocked) return;
        const taken = Math.round(((start - c.hp) / c.hpMax) * 100);
        if (taken > best) best = taken;
        m.progress('outclass', Math.min(SEMI_TARGET, Math.max(0, best)));
      };
      m.tickHooks.push(hook);
      yield () => best >= SEMI_TARGET;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('outclass');
      if (v.hpFrac >= 0.67) m.complete('untouched');
      else m.failObjective('untouched');
      m.flags.semiHurt = best;
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.4;
    },
  };

  P.let = {
    id: 'let',
    run: function* (m) {
      const b = m.battle, S = b.story, c = S.cell;
      clearCombat(b);
      for (const f of [S.vegeta, S.cell, S.a18, S.trunks]) f.controller = scripted();
      S.trunks.setHidden(false);
      place(S.trunks, ground(b, S.vegeta.pos.clone().add(new V3(4, 0, 5))), Math.PI);
      place(S.a18, ground(b, c.pos.clone().add(new V3(3, 0, 3))));
      faceTo(S.vegeta, c.pos);
      faceTo(c, S.a18.pos);
      yield* SL.Cinema.play(m, 'cell_takes_18');
      c.bossPhaseCap = 3;
      yield* SL.data.cinematics.bossTransform(m, {
        fighter: c,
        technique: 'toPerfect',
        witness: S.vegeta,
        line: 'cell_perfect',
        music: 6,
      });
      m.flags.perfect = c.form.id === 'perfect';
    },
  };

  P.perfect = {
    id: 'perfect',
    run: function* (m) {
      const b = m.battle, S = b.story;
      faceTo(S.vegeta, S.cell.pos);
      faceTo(S.cell, S.vegeta.pos);
      yield* SL.Cinema.play(m, 'perfect_arrives');
    },
  };

  /** And the consequence, played rather than described. */
  P.beaten = {
    id: 'beaten',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cell;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.switchPlayer(v, { force: true });
      const ssj = v.def.forms.findIndex((f) => f.id === 'ssj');
      if (ssj > 0 && v.formIndex !== ssj) v.applyForm(ssj);
      v.hp = v.hpMax;
      v.ki = Math.max(v.ki, 80);
      v.cannotDie = true;
      // the same man, the same year of training, and it is not the same fight
      v.damageDealtMul = 0.5;
      v.damageTakenMul = 1.1;
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(c, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      const perfect = c.def.forms.findIndex((f) => f.id === 'perfect');
      if (perfect > 0 && c.formIndex !== perfect) c.applyForm(perfect);
      c.hp = c.hpMax;
      c.poise.value = c.poise.max;
      c.cannotDie = true;
      c.infiniteHp = true; // he is not in danger, and pretending otherwise would be a lie
      c.damageDealtMul = 1.2;
      c.controller = new SL.AIController(b, { difficulty: 'hard', profile: { aggression: 0.9, defense: 0.35, ranged: 0.5, beam: 0.45, preferredRange: 3, hooks: 'boss' } });
      c.target = v;
      v.target = c;
      v.setState('free');
      c.setState('free');
      m.lock(false);
      b.aiLocked = false;
      m.music('overwhelm', 6);
      m.objective('stay', 'Stay on your feet', { icon: 'clock', target: SURVIVE_SECONDS });
      m.objective('mark', 'Mark him once, at least', { icon: 'fist', optional: true });
      let marked = 0;
      b.on('damage', (e) => {
        if (e.target === c && e.attacker === v && !e.blocked) {
          marked++;
          if (marked === 1) m.complete('mark');
        }
      });
      let t2 = 0;
      const hook = () => {
        if (b.inputLocked) return;
        t2 += 1 / 60;
        m.progress('stay', Math.min(SURVIVE_SECONDS, Math.floor(t2)));
      };
      m.tickHooks.push(hook);
      yield () => t2 >= SURVIVE_SECONDS;
      const i = m.tickHooks.indexOf(hook);
      if (i >= 0) m.tickHooks.splice(i, 1);
      m.complete('stay');
      if (!marked) m.failObjective('mark');
      m.flags.survivedSeconds = Math.round(t2);
      m.flags.markedPerfect = marked;
      m.qteParts.push(U.clamp01(v.hpFrac));
      yield 0.4;
    },
  };

  /**
   * THE FINAL FLASH (rebuilt to the owner's six-act beat sheet, 2026-10-03). Cell dares him; Super Vegeta lands
   * in the stance (ff_dare); the player holds Charge while it builds — the ground splitting, boulders floating
   * up and burning to dust, a vortex of wind, a sun in each palm; the view from space, the night side of the
   * planet lit gold; Cell's smile going; Vegeta's grin and sweat — then ff_fire.
   */
  P.flash = {
    id: 'flash',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, c = S.cell, TK = SL.data.trunksKit, BK = SL.data.buuKit;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [S.cell, S.trunks]) f.controller = scripted();
      const ssj = v.def.forms.findIndex((f) => f.id === 'ssj');
      if (ssj > 0 && v.formIndex !== ssj) v.applyForm(ssj);
      // the perfect form, whatever came before (a skip, a restart)
      const perfect = c.def.forms.findIndex((f) => f.id === 'perfect');
      if (perfect > 0 && c.formIndex !== perfect) c.applyForm(perfect);
      place(v, ground(b, FIELD.clone().add(new V3(0, 0, 6))), Math.PI);
      place(c, ground(b, FIELD.clone().add(new V3(0, 0, -6))), 0);
      S.trunks.setHidden(false);
      if (!S.trunks.pos || S.trunks.pos.distanceTo(v.pos) > 14) place(S.trunks, ground(b, v.pos.clone().add(new V3(5, 0, 4))));
      faceTo(S.trunks, c.pos);
      faceTo(v, c.pos);
      faceTo(c, v.pos);
      c.infiniteHp = true;
      yield* SL.Cinema.play(m, 'ff_dare');
      const hands = () => {
        v.model.root.updateMatrixWorld(true);
        return [v.model.joints.handL, v.model.joints.handR].map((j) => j.getWorldPosition(new V3()).sub(v.object.position).add(v.pos));
      };
      const orbs = hands().map((p) => TK.orb(b, p, 0.06, 0xffe14a, 0xffffff));
      S.ffOrbs = orbs;
      m.onDispose(() => (S.ffOrbs || []).forEach((o) => o.dispose()));
      const below = ground(b, v.pos);
      // the boulders: broken off the ground round him, floating up, burning away to dust in the heat
      const R = U.mulberry32(767);
      const T = SL.Toon;
      const rocks = [];
      for (let i = 0; i < 12; i++) {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + R() * 0.55, 0), T.mat(b.stage.rockColor || 0x6a6558));
        T.addOutline(mesh, 1.2);
        mesh.visible = false;
        b.scene.add(mesh);
        rocks.push({ mesh, a: 0, d: 3 + R() * 6, top: 3 + R() * 5, rise: 0.6 + R() * 1.1, spin: R() * 3, h: -1, wait: R() * 2 });
      }
      m.onDispose(() => rocks.forEach((r) => r.mesh.parent && r.mesh.parent.remove(r.mesh)));
      // round the sides and the back of him, never in the cone in front (where the lens is)
      const fwdA = Math.atan2(v.forward.z, v.forward.x);
      const sideAngle = () => fwdA + (Math.PI / 3 + R() * (Math.PI * 4) / 3);
      const floatRocks = (k) => {
        for (const r of rocks) {
          if (r.h < 0) {
            r.wait -= 1 / 60;
            if (r.wait > 0 || k < 0.08) continue;
            r.h = 0;
            r.a = sideAngle();
            r.mesh.visible = true;
          }
          r.h += (r.rise * (0.5 + k)) / 60;
          const p = below.clone().add(new V3(Math.cos(r.a) * r.d, 0, Math.sin(r.a) * r.d));
          p.y = b.stage.heightAt(p.x, p.z) + r.h;
          r.mesh.position.copy(p);
          r.mesh.rotation.set(r.h * r.spin, r.h * 0.7, 0);
          if (r.h >= r.top) {
            // it burns away to dust
            b.vfx.dust(p, 0.9, 6, 0xb8a888);
            b.vfx.flash(p, 0.8, 0xffd060, 0.2, T.tex.glow);
            r.mesh.visible = false;
            r.h = -1;
            r.wait = 0.4 + R() * 1.2;
          }
        }
      };
      // the camera: low, in front, the arms spread against the sky
      SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'full', angle: 'low', dist: 6.5 }, 60, { cut: true, blendIn: 0 });
      m.music('climax', 2);
      m.say('vegeta', 'HAAAAAAAAH!', 2, { style: 'shout' });
      let earth = null, earthLeft = 0;
      yield* SL.data.vegitoKit.hold(m, {
        fighter: v,
        id: 'ffCharge',
        seconds: 4.4,
        pose: 'v_ffStance',
        face: 'shout',
        label: 'Charge the Final Flash',
        meter: 'FINAL FLASH',
        tick: (k) => {
          const hp = hands();
          orbs.forEach((o, i) => {
            o.group.position.copy(hp[i]);
            o.set(0.06 + k * 0.26);
            o.pulse();
          });
          floatRocks(k);
          // the vortex: the wind dragging the dust round and in
          if (b.frame % 3 === 0) b.vfx.streamInward(v.chest(), 6 + k * 6, 0xd8ccb0, 2, 0.3, 0.6);
          if (b.frame % 4 === 0) {
            const a = b.frame * 0.21;
            b.vfx.trail(below.clone().add(new V3(Math.cos(a) * (5 + k * 4), 1 + (b.frame % 7) * 0.4, Math.sin(a) * (5 + k * 4))), 0xe8dcc0, 0.5, 0.5);
          }
          // gold and blue static round his boots and his knuckles
          if (b.frame % 5 === 0) b.vfx.bolt(v.chest().add(new V3(U.rand(-1.8, 1.8), U.rand(-1.2, 1.6), U.rand(-1.8, 1.8))), U.rand(1, 2.4), 0xfff3a0);
          if (b.frame % 6 === 0) b.vfx.bolt(v.pos.clone().add(new V3(U.rand(-0.8, 0.8), 0.1, U.rand(-0.8, 0.8))), U.rand(0.5, 1.1), 0x9ad0ff);
          // the ground splitting into fissures, out from his boots
          if (b.frame % 24 === 0 && k > 0.1) {
            const a = U.rand(0, Math.PI * 2), d = U.rand(1.5, 3 + k * 7);
            b.stage.crater(below.clone().add(new V3(Math.cos(a) * d, 0, Math.sin(a) * d)), 0.9 + k * 0.6, 0.2, null);
          }
          if (b.frame % 60 === 0) b.stage.crater(below, 2 + k * 4, 0.25, null);
          b.camera.addTrauma(0.008 + k * 0.03);
          // the view from space, while it lasts
          if (earth) {
            earth.shake();
            earth.night(Math.min(1, 0.4 + k));
            earthLeft -= 1 / 60;
            if (earthLeft <= 0) {
              earth.dispose();
              earth = null;
              SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'upper', angle: 'front' }, 60, { cut: true, blendIn: 0 });
            }
          }
        },
        beats: [
          {
            // the vortex from further off: the whole field going round him
            at: 0.22,
            run: () => SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'full', angle: 'high', dist: 15 }, 60, { cut: true, blendIn: 0 }),
          },
          {
            // III: from space, the planet's night side lit gold by what is in his hands
            at: 0.42,
            run: () => {
              earth = BK.earthView(b);
              earth.show();
              earth.night(0.6);
              earthLeft = 2.8;
              const C0 = earth.centre.clone();
              m.shot((t, out) => camAt(out, C0.clone().add(new V3(-120, 160, 980 + t * 60)), C0.clone().add(new V3(-30, 30, 0)), 34), 3, { cut: true, blendIn: 0 });
            },
          },
          {
            // IV: Cell's smile going — the sweat, the pupils to points
            at: 0.66,
            run: () => {
              if (earth) {
                earth.dispose();
                earth = null;
              }
              c.setState('scripted', { pose: 'cl_calm', expression: 'shock' });
              if (c.model.setPupilScale) c.model.setPupilScale(0.3);
              if (SL.data.cellSweat) SL.data.cellSweat(c, true);
              m.say('cell', '(If that hits me head-on... there won\'t be a single cell left to regenerate...!)', 3.4, { style: 'quiet' });
              SL.Cinema.shotOn(m, { cell: c }, { subject: 'cell', focus: 'face', angle: 'front' }, 60, { cut: true, blendIn: 0 });
            },
          },
          {
            // ...and the prince's grin getting wider, the sweat running, the arms trembling with holding it
            at: 0.86,
            run: () => {
              v.setState('scripted', { pose: 'v_ffStance', expression: 'wicked' });
              if (SL.data.cellSweat) SL.data.cellSweat(v, true);
              SL.Cinema.shotOn(m, { vegeta: v }, { subject: 'vegeta', focus: 'closeup', angle: 'front' }, 60, { cut: true, blendIn: 0 });
            },
          },
        ],
      });
      if (earth) {
        earth.dispose();
        earth = null;
      }
      for (const r of rocks) r.mesh.visible = false;
      if (c.model.setPupilScale) c.model.setPupilScale(1);
      m.flags.finalFlashCharged = true;
      yield* SL.Cinema.play(m, 'ff_fire');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of [v, S.cell, S.trunks]) f.controller = scripted();
      v.setState('scripted', { pose: 'knockdown', expression: 'hurt' });
      S.cell.setState('scripted', { pose: 'cl_calm', expression: 'smirk' });
      b.stage.setMood(0.4, 0x203828, 1.4);
      m.shot((t, out) => camAt(out, v.chest().clone().add(new V3(U.lerp(2.6, 5, t), U.lerp(1.2, 2.8, t), U.lerp(3.4, 7, t))), v.chest(), U.lerp(42, 52, t)), 4, { cut: true, blendIn: 0 });
      m.say('cell', 'You wanted me finished. I am. Thank you for that.', 3.8);
      yield* m.cine(4);
      m.shot((t, out) => camAt(out, S.trunks.chest().clone().addScaledVector(S.trunks.forward, 2.4).add(new V3(-0.8, 0.3, 0)), S.trunks.chest(), 38), 3.6, { cut: true, blendIn: 0 });
      m.say('future_trunks', 'Then we do it my way. All of us, at once.', 3.2, { style: 'quiet' });
      yield* m.cine(3.6);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.flags.perfectDone = true;
      m.title('CHAPTER 6 · CELL SAGA', 'LET HIM FINISH', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'cell_perfect',
    canon: true,
    chapter: 'CHAPTER 6 · CELL SAGA',
    title: 'Let Him Finish',
    subtitle: 'Earth · Age 767 · the fight he threw away on purpose',
    character: 'vegeta',
    stage: 'coast',
    parTime: 300,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'He is winning. He would rather not be — he wants the finished version, and he is about to get it.',
    rewards: ['Chapter 6 continues'],
    setup,
    phases: [P.semi, P.let, P.perfect, P.beaten, P.flash, P.after],
  };

  SL.data.missions[def.id] = def;
})();
