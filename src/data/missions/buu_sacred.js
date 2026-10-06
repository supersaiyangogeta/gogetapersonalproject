/*
 * CHAPTER 14 — BUU SAGA: KID BUU (Buu Saga priority 11, 2026-10-02)
 * Mission "Number One" (canon; played as Goku, then Vegeta, then Good Buu). The Sacred World of the
 * Kai: the survivors of a planet that is not there any more — and Kid Buu, who followed them.
 *
 *   ARRIVE    (scene)       the survivors; a purple flash in the sky; "Let me have the first round";
 *                           straight to Super Saiyan 3
 *   GOKU *    (scene+play+scene) the round's beats (sw_round: the snot-bubble nap, the kick through the ridge,
 *                           the rubber grapple and the headbutt); then Super Saiyan 3 against Kid Buu, played:
 *                           the form burns ki every second, his body grows back faster than anything; worn
 *                           down (a story floor) or blown apart, the round ends on the point-blank
 *                           Kamehameha by Instant Transmission (sw_pointblank, the player's cue) — and he
 *                           grows back, cackling; or it ends when the third level runs dry
 *   ASK       (scene)       guttering in the gold: "I need one full minute"; "I'll buy you your minute"
 *   MINUTE *  (play)        VEGETA'S ONE MINUTE — a real countdown, owned by the mission brain: the fight,
 *                           Vegeta hurt, Vegeta DOWN (sw_overwhelm), Vegeta UP ("The Saiyan Prince...
 *                           VEGETA!", sw_prince), the COMEBACK (hook, gut, hammer, barrage on cues, all
 *                           landing), Buu growing back, the rest of the minute. Power gap; story floors.
 *   NUMBERONE (scene)       the minute up; Super Saiyan 3 caves in; the stomp; "You are Number One!"
 *                           (Mr. Satan, Good Buu and the Spirit Bomb are the next mission: buu_spiritbomb)
 *   PLAN      (scene)       "Use the Spirit Bomb" — the Dragon Balls of Namek (priority 12 takes it from there)
 *   AFTER                   the chapter card
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // minute: the countdown; downAt: Vegeta's story floor (the beat where he goes down); downBy: the beat
  // happens by then even if he is still standing; kidOnVegeta: Kid Buu's damage on him (raised once he
  // is hurt and again after the comeback); vegetaGap: what Vegeta's blows keep (a power gap)
  const SW = { minute: 60, kidDealt: 0.5, kidOnVegeta: 0.28, vegetaGap: 0.3, downAt: 0.3, downBy: 22 };

  function setup(battle) {
    const b = battle;
    const at = (x, z) => K.ground(b, new V3(x, 0, z));
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(0, 6), startKi: 100 });
    const vegeta = b.spawn({ charId: 'vegeta', team: 0, pos: at(1.6, 7), startKi: 100 });
    const kid = b.spawn({ charId: 'kid_buu', team: 1, pos: at(0, -6), startKi: 220, tags: { boss: true, priority: true } });
    const kai = b.spawn({ charId: 'kibitoshin', team: 0, pos: at(-3.4, 9.5) });
    const elder = b.spawn({ charId: 'elder_kai', team: 0, pos: at(-2.2, 10.4) });
    const dende = b.spawn({ charId: 'dende', team: 0, pos: at(-4.6, 10.8) });
    const satan = b.spawn({ charId: 'mr_satan', team: 0, pos: at(-5.8, 10.2) });
    const fat = b.spawn({ charId: 'majin_buu', team: 0, pos: at(-30, -30) });
    for (const f of [vegeta, kai, elder, dende, satan, fat]) {
      f.controller = K.scripted();
      f.untargetable = f.intangible = true;
      f.cannotDie = true;
    }
    kid.controller = K.scripted();
    kid.cannotDie = true;
    kid.mech.maxReforms = Infinity;
    kid.setHidden(true);
    fat.setHidden(true);
    goku.cannotDie = true;
    goku.lockedForms = { kaioken: true };
    for (const f of [goku, vegeta, kai, elder, dende, satan]) K.faceTo(f, at(0, -6));
    b.story = { goku, vegeta, kid, kai, elder, dende, satan, fat };
  }

  function brawl(m, hero, kid, opts) {
    const b = m.battle;
    if (b.player !== hero) b.switchPlayer(hero, { force: true });
    hero.untargetable = hero.intangible = false;
    kid.setHidden(false);
    kid.untargetable = kid.intangible = false;
    kid.controller = new SL.AIController(b, { difficulty: 'hard' });
    kid.damageDealtMul = opts.kidDealt;
    hero.target = kid;
    kid.target = hero;
    hero.setState('free');
    kid.setState('free');
    m.lock(false);
    b.aiLocked = false;
    m.music(opts.song || 'kid_buu', opts.music || 6);
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      yield* SL.Cinema.play(m, 'sw_arrive');
    },
  };

  /** Super Saiyan 3 against the original: it burns his ki, and the little one keeps growing back. */
  P.goku = {
    id: 'goku',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, g = S.goku, kid = S.kid;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      // Goku and Kid Buu on the field; Vegeta on the rise to one side, watching; the survivors far off
      m.cast(
        {
          active: [g, kid],
          support: [{ f: S.vegeta, at: new V3(13, 0, 9), pose: 'armsCrossed', face: 'angry' }],
          background: [S.kai, S.elder, S.dende, S.satan],
          hidden: [S.fat],
        },
        { centre: new V3(0, 0, 0), clear: 34 }
      );
      if (kid.mech.apart) yield () => !kid.mech.apart;
      K.toForm(g, 'ssj3');
      // the round's opening beats: the nap, the ridge kick, the rubber grapple (the owner's sheet)
      if (b.player !== g) b.switchPlayer(g, { force: true });
      kid.controller = K.scripted();
      yield* SL.Cinema.play(m, 'sw_round');
      g.ki = g.kiMax;
      g.hp = Math.max(g.hp, g.hpMax * 0.8);
      g.damageDealtMul = 1.15;
      m.space(g, 'ground', { pos: new V3(0, 0, 5), face: new V3(0, 0, -5) });
      m.space(kid, 'air', { pos: new V3(0, 0, -5), height: 2.2, face: new V3(0, 0, 5) });
      kid.hp = kid.hpMax;
      kid.reformTo = 0.7;
      kid.mech.breakIdx = 0;
      brawl(m, g, kid, { kidDealt: SW.kidDealt });
      m.objective('apart', 'Blow him apart', { icon: 'fist', target: 1 });
      m.objective('tells', 'Read him: dodge three of his tricks', { icon: 'dodge', optional: true, target: 3 });
      // readable chaos: every trick is announced; a player who dodges the tell gets out of it
      m.prompt('kbTell', 'dodge', 'He screams before every trick — Dodge', { when: () => kid.state === 'scripted' && kid.controller && kid.controller.kid && kid.controller.kid.trick });
      let aparts = 0, dry = false, read = 0;
      const offA = b.on('buuApart', (e) => {
        if (e.fighter === kid) m.progress('apart', ++aparts);
      });
      const offX = b.on('formExhausted', (e) => {
        if (e.fighter === g) dry = true;
      });
      let armed = false, dodged = false;
      const offTell = b.on('kidBuuTell', (e) => {
        if (e.fighter === kid) (armed = true), (dodged = false);
      });
      const dodgeHook = () => {
        if (armed && (g.state === 'dodge' || g.state === 'vanish')) dodged = true;
      };
      m.tickHooks.push(dodgeHook);
      const offT = b.on('kidBuuTrick', (e) => {
        if (e.fighter !== kid) return;
        if (armed && (dodged || g.state === 'dodge' || g.state === 'vanish')) m.progress('tells', Math.min(3, ++read));
        armed = false;
      });
      // worn down to here, the round goes to the point-blank Kamehameha
      const sfr = m.storyFight({ floors: [{ f: kid, at: 0.45 }] });
      // the round ends when he is blown apart or worn down, when the third level runs dry, or when Goku is beaten down
      yield () => aparts >= 1 || sfr.floored(kid) || dry || g.form.id !== 'ssj3' || g.hp <= g.hpMax * 0.12;
      sfr.off();
      // however the round went, it ends on the point-blank Kamehameha (the round's own last beat in the canon)
      const finisher = true;
      offA();
      offX();
      offT();
      offTell();
      m.tickHooks.splice(m.tickHooks.indexOf(dodgeHook), 1);
      if (read >= 3) m.complete('tells');
      else m.failObjective('tells');
      m.complete('apart');
      m.flags.gokuRound = { aparts, dry: dry || g.form.id !== 'ssj3', beaten: g.hp <= g.hpMax * 0.12 };
      m.lock(true);
      K.clearCombat(b);
      kid.controller = K.scripted();
      if (kid.mech.apart) yield () => !kid.mech.apart;
      if (finisher) yield* SL.Cinema.play(m, 'sw_pointblank');
      yield 0.4;
    },
  };

  P.ask = {
    id: 'ask',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      // the conversation is the three of them; the survivors are far off by the Kai
      m.cast({ background: [S.kai, S.elder, S.dende, S.satan], hidden: [S.fat] }, { centre: new V3(0, 0, 1), clear: 30 });
      K.toForm(S.goku, 'ssj3');
      for (const f of [S.goku, S.vegeta, S.kid]) {
        f.setHidden(false);
        f.controller = K.scripted();
        f.untargetable = f.intangible = true;
      }
      m.space(S.goku, 'ground', { pos: new V3(0, 0, 6), face: new V3(0, 0, -5) });
      m.space(S.vegeta, 'ground', { pos: new V3(1.8, 0, 6.6), face: new V3(0, 0, 6) });
      m.space(S.kid, 'ground', { pos: new V3(0, 0, -5), face: new V3(0, 0, 6) });
      S.kid.setState('scripted', { pose: 'kb_idle', expression: 'grin' });
      yield* SL.Cinema.play(m, 'sw_ask');
    },
  };

  /** A camera for the comeback: positions and look points re-read every frame. */
  function cam(m, from, look, fov, seconds) {
    m.shot((t, out) => K.camAt(out, from(t), look(t), fov), seconds);
  }

  /** One staged blow of the comeback: it lands for real (damage, the impact, the hitstop, a shake). */
  function blow(m, v, kid, frac, impact, vPose, kidPose) {
    const b = m.battle;
    const p = kid.chest();
    const hit = { type: 'melee', damage: 1, impact, dir: v.dirTo(kid) };
    kid._applyDamage(Math.round(kid.hpMax * frac), v, hit, p);
    b.hitEffects(v, kid, hit, p, impact);
    kid.flash = 1;
    b.cameraTraumaAt(p, 0.25 + impact * 0.1);
    b.slowmo(0.3, 0.3);
    v.setState('scripted', { pose: vPose, expression: 'shout', speed: 26, aura: 1 });
    kid.setState('scripted', { pose: kidPose, expression: 'hurt', speed: 30 });
  }

  /**
   * THE COMEBACK — story-controlled (the owner: "Vegeta refuses to stay down"). The player throws each
   * blow on a cue; if he does not, it is thrown for him a moment later, so the sequence always plays.
   * Every blow lands for real: the hook that wrenches Buu's head round, the fist in the gut and the
   * purple spit, the double hammer from above that drives him down into the rock, and the barrage into
   * the hole — "Die! Die! DIE!" — until the crater is smoke and fire. Then the smoke, and the pink
   * vapour pulling itself back together, grinning: what he does does not last, and he does it anyway.
   */
  function* comeback(m) {
    const b = m.battle, S = b.story, v = S.vegeta, kid = S.kid;
    m.lock(true);
    K.clearCombat(b);
    kid.controller = K.scripted();
    kid.storyNoSell = null; // the gap is off: these land
    kid.storyFloor = { frac: 0.3, reached: true }; // hurt, never taken apart here
    const dir = kid.pos.clone().sub(v.pos).setY(0);
    if (dir.lengthSq() < 0.01) dir.set(0, 0, -1);
    dir.normalize();
    const side = new V3(-dir.z, 0, dir.x);
    m.space(v, 'ground', { face: kid.pos, pose: 'vk_glare', expr: 'angry' });
    m.space(kid, 'ground', { pos: v.pos.clone().addScaledVector(dir, 3.4), face: v.pos, pose: 'kb_idle', expr: 'angry' });
    let pressed = 0;
    const press = function* (key, label) {
      const r = yield* m.cue(key, label, { auto: 2.4, slow: 0.4 });
      if (r.pressed) pressed++;
    };

    // 1 — THE HOOK: he is gone, and in Buu's face
    cam(m, () => v.chest().addScaledVector(dir, -1.6).addScaledVector(side, 0.6).add(new V3(0, 0.25, 0)), () => kid.chest(), 40, 60);
    yield* press('heavy', 'Left hook');
    b.vfx.afterimage(v.pos, v.height, 0xffe25a);
    b.sfx('vanish', v, { pitch: 0.9 });
    m.space(v, 'ground', { pos: kid.pos.clone().addScaledVector(dir, -1.05), face: kid.pos });
    blow(m, v, kid, 0.05, 4, 'punchL', 'kb_headTwist');
    m.space(kid, 'slide', { dir, distance: 1.6, seconds: 0.3, endPose: 'kb_headTwist', expr: 'hurt' });
    cam(m, () => kid.chest().addScaledVector(side, 2.1).add(new V3(0, 0.15, 0)), () => kid.chest().lerp(v.chest(), 0.4), 42, 1.1);
    yield* m.cine(1.1);

    // 2 — THE GUT: the fist buried to the wrist; he spits purple
    yield* press('heavy', 'Into the gut');
    b.vfx.afterimage(v.pos, v.height, 0xffe25a);
    m.space(v, 'ground', { pos: kid.pos.clone().addScaledVector(dir, -0.95), face: kid.pos });
    blow(m, v, kid, 0.05, 4, 'punchR', 'kb_gutDouble');
    const mouth = kid.headPos().addScaledVector(dir, -0.15);
    b.vfx.dust(mouth, 0.5, 10, 0x9a3cc8);
    b.vfx.flash(mouth, 0.8, 0xb060e0, 0.15, SL.Toon.tex.glow);
    m.say('kid_buu', 'GWAH!', 1);
    cam(m, () => kid.chest().addScaledVector(side, -1.8).addScaledVector(dir, 0.4).add(new V3(0, -0.2, 0)), () => kid.chest(), 38, 1.1);
    yield* m.cine(1.1);

    // 3 — THE HAMMER: up over him, both fists, and down through the rock
    yield* press('heavy', 'Hammer him down');
    const top = kid.pos.clone().addScaledVector(dir, -0.5);
    m.space(v, 'flight', { to: top.clone().setY(top.y + 2.6), seconds: 0.18, pose: 'hammerWind', endPose: 'hammerWind' });
    m.space(kid, 'air', { height: 1.6, pose: 'tumble', expr: 'hurt' });
    cam(m, () => kid.pos.clone().addScaledVector(side, 5.5).add(new V3(0, 1.2, 0)), () => kid.pos.clone().add(new V3(0, 1.2, 0)), 48, 2.2);
    yield* m.cine(0.3);
    blow(m, v, kid, 0.08, 5, 'hammer', 'smashed');
    m.say('vegeta', 'HAAAA!', 0.9, { style: 'shout' });
    const hole = m.space(kid, 'groundImpact', { pos: kid.pos.clone(), radius: 3.8, depth: 2.2, seconds: 0.22, endPose: 'knockdownFace', expr: 'ko', shake: 0.9 });
    yield () => hole.done();
    b.stage.crater(kid.pos, 2.4, 1.2, null); // three layers of rock: deeper in the middle
    m.space(kid, 'ground', {});
    yield* m.cine(0.9);

    // 4 — THE BARRAGE: over the hole, everything he has left
    const pit = kid.pos.clone();
    m.space(v, 'air', { pos: pit.clone().addScaledVector(dir, -2.2), height: 5.5, face: pit, pose: 'vk_barrage', expr: 'shout' });
    v.aura.target = 1;
    cam(m, () => pit.clone().addScaledVector(dir, -9).addScaledVector(side, 3).add(new V3(0, 0.6, 0)), () => v.chest().lerp(pit, 0.5), 50, 60);
    yield* press('blast', 'Barrage');
    let n = 0;
    const said = [];
    const fire = () => {
      n++;
      const hand = v.handPos(n % 2 ? 'L' : 'R');
      const at = pit.clone().add(new V3(Math.sin(n * 2.3) * 1.4, 0.2, Math.cos(n * 1.7) * 1.4));
      for (let i = 1; i <= 5; i++) b.vfx.trail(hand.clone().lerp(at, i / 5), 0xffd040, 0.35, 0.18);
      if (n % 2 === 0) b.vfx.explosion(at, 1.4, 0xffc040, { smoke: true });
      if (n % 2 === 0) b.sfx('kiBlast', null, { at, vol: 0.8 });
      b.camera.addTrauma(0.05);
      if (n % 6 === 0) kid._applyDamage(Math.round(kid.hpMax * 0.012), v, { type: 'ki', impact: 1 }, at);
      const sec = n / 15;
      if (sec > 0.1 && !said[0]) (said[0] = 1), m.say('vegeta', 'Die!', 0.7, { style: 'shout' });
      if (sec > 0.9 && !said[1]) (said[1] = 1), m.say('vegeta', 'Die!', 0.7, { style: 'shout' });
      if (sec > 1.8 && !said[2]) (said[2] = 1), m.say('vegeta', 'DIE!!!', 1.2, { style: 'shout' });
    };
    const fireHook = () => b.frame % 4 === 0 && fire();
    m.tickHooks.push(fireHook);
    cam(m, () => pit.clone().addScaledVector(side, 7).add(new V3(0, 2.4, 0)), () => pit.clone().lerp(v.pos, 0.35), 52, 3);
    yield* m.cine(2.8);
    K.unhook(m, fireHook);
    b.vfx.explosion(pit.clone().add(new V3(0, 0.6, 0)), 4, 0xffb040, { smoke: true });
    b.vfx.dust(pit, 5, 30, 0x4a4040);
    b.sfx('explosionBig', null, { at: pit, vol: 1.2 });
    b.cameraTraumaAt(pit, 0.7);
    yield* m.cine(1.2);

    // the smoke: pink vapour out of it, pulling itself back together, grinning
    const rim = pit.clone().addScaledVector(dir, 3.6);
    rim.y = SL.Staging.groundY(b, rim.x, rim.z);
    kid.setHidden(true);
    cam(m, () => rim.clone().addScaledVector(dir, -5).addScaledVector(side, 2.5).add(new V3(0, 1.4, 0)), () => rim.clone().add(new V3(0, 0.8, 0)), 42, 2.4);
    const gather = () => b.frame % 2 === 0 && b.vfx.streamInward(rim.clone().add(new V3(0, 0.8, 0)), 2.6, 0xff8ac8, 3, 0.2, 0.45);
    m.tickHooks.push(gather);
    b.sfx('regrow', null, { at: rim, vol: 1 });
    yield* m.cine(1.2);
    K.unhook(m, gather);
    kid.setHidden(false);
    m.space(kid, 'ground', { pos: rim, face: v.pos, pose: 'kb_laugh', expr: 'grin' });
    b.vfx.flash(kid.chest(), 1.6, 0xff9ad0, 0.25, SL.Toon.tex.glow);
    m.say('kid_buu', 'Hehehehehe!', 1.4);
    yield* m.cine(1.2);
    // and the prince comes down to meet it again
    const land = m.space(v, 'landing', { to: rim.clone().addScaledVector(dir, -4), seconds: 0.6, endPose: 'vk_battered', face: rim });
    cam(m, () => v.chest().addScaledVector(dir, -2.2).addScaledVector(side, 1).add(new V3(0, 0.2, 0)), () => v.chest().lerp(kid.chest(), 0.5), 42, 2.2);
    yield () => land.done();
    m.say('vegeta', 'Tch... Still standing, are you?', 2, { style: 'quiet' });
    yield* m.cine(1.8);
    kid.storyFloor = null;
    m.flags.comeback = { pressed };
  }

  /**
   * VEGETA'S ONE MINUTE — the mission brain owns its turning points (the owner, 2026-10-02):
   *   NORMAL FIGHT     real gameplay; the countdown runs only while it is being fought
   *   VEGETA DAMAGED   under 60%: the clothes go, the monster smells it and presses harder
   *   VEGETA DOWN      at the story floor — or at SW.downBy seconds if Vegeta is still standing — Buu
   *                    takes him apart (sw_overwhelm). The AI cannot end the fight before this beat
   *   VEGETA RECOVERS  sw_prince: fingers in the rock, up, "The Saiyan Prince... VEGETA!"
   *   THE COMEBACK     four heavy blows on cues (hook, gut, hammer, barrage) — always delivered
   *   THE STORY        Buu grows back; the rest of the minute is fought; Vegeta cannot fall before it ends
   * Who is in the shot: Vegeta and Kid Buu on the field (ground), Goku charging behind them, the
   * survivors far off (Staging.cast).
   */
  P.minute = {
    id: 'minute',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, v = S.vegeta, g = S.goku, kid = S.kid;
      m.lock(true);
      m.clearObjectives();
      K.clearCombat(b);
      if (kid.mech.apart) yield () => !kid.mech.apart;
      K.toForm(g, 'ssj3');
      K.toForm(v, 'ssj2');
      v.lockedForms = { majin: true };
      v.cannotDie = true;
      v.hp = v.hpMax;
      v.ki = v.kiMax;
      m.cast(
        {
          active: [v, kid],
          support: [{ f: g, at: new V3(0, 0, 17), pose: 'charge', face: 'grit' }],
          background: [S.kai, S.elder, S.dende, S.satan],
          hidden: [S.fat],
        },
        { centre: new V3(0, 0, 0), clear: 34 }
      );
      m.space(v, 'ground', { pos: new V3(0, 0, 3), face: new V3(0, 0, -3) });
      m.space(kid, 'ground', { pos: new V3(0, 0, -3), face: new V3(0, 0, 3) });
      m.space(g, 'ground', { pos: new V3(0, 0, 17), face: new V3(0, 0, 0) });
      g.setState('scripted', { pose: 'charge', expression: 'grit', aura: 0.8 });
      kid.hp = Math.max(kid.hp, kid.hpMax * 0.8);
      let t = 0, hits = 0, said = 0, counting = true;
      const offD = b.on('damage', (e) => {
        if (e.attacker === v && e.target === kid) m.progress('hits', Math.min(20, ++hits));
      });
      const hook = () => {
        // behind him the whole time: Kakarot in the gold, charging, the ground lifting
        g.ki = g.kiMax;
        if (b.frame % 10 === 0) b.vfx.streamInward(g.chest(), 3 + (t / SW.minute) * 4, 0xffe25a, 2, 0.16, 0.4);
        if (!counting || b.inputLocked) return;
        t += 1 / 60;
        m.progress('minute', Math.min(SW.minute, Math.floor(t)));
        g.setState('scripted', { pose: 'charge', expression: 'grit', aura: 0.6 + (t / SW.minute) * 0.4 });
        if (t > 40 && said === 0) {
          said = 1;
          m.say('goku', '(Just a little more... hold on, Vegeta...)', 2.4, { style: 'quiet' });
        }
      };
      m.tickHooks.push(hook);

      // NORMAL FIGHT → VEGETA DAMAGED → VEGETA DOWN
      brawl(m, v, kid, { kidDealt: SW.kidOnVegeta, song: 'desperate' });
      let gapOff = m.powerGap(kid, { from: [v], mul: SW.vegetaGap, lines: [{ at: 4, who: 'kid_buu', line: 'Hehehe!' }] });
      m.objective('minute', 'Hold him off — one minute', { icon: 'clock', target: SW.minute });
      m.objective('hits', 'Make him notice you: land twenty blows', { icon: 'fist', optional: true, target: 20 });
      let down = false, damaged = false;
      let sf = m.storyFight({
        floors: [{ f: v, at: SW.downAt, onFloor: () => (down = true) }, { f: kid, at: 0.35 }],
        fighters: [v, kid],
        space: 'ground',
        aggression: [{ f: kid, value: 0.9 }],
      });
      const worse = () => {
        if (damaged || v.hpFrac >= 0.6) return;
        damaged = true;
        if (v.setDamage) v.setDamage(1, { burst: true });
        kid.damageDealtMul = SW.kidOnVegeta * 1.5; // he smells it: harder
        m.say('vegeta', 'Is that... all you\'ve got, you pink freak?!', 2.2, { style: 'shout' });
      };
      m.tickHooks.push(worse);
      yield () => down || t >= SW.downBy;
      K.unhook(m, worse);
      counting = false;
      sf.off();
      gapOff();
      m.lock(true);
      K.clearCombat(b);
      kid.controller = K.scripted();
      if (kid.mech.apart) yield () => !kid.mech.apart;
      v.hp = Math.min(v.hp, Math.ceil(v.hpMax * SW.downAt));
      m.flags.vegetaDownBy = down ? 'floor' : 'clock'; // the beat plays either way
      yield* SL.Cinema.play(m, 'sw_overwhelm');
      yield* SL.Cinema.play(m, 'sw_prince');
      yield* comeback(m);

      // THE STORY GOES ON: what is left of the minute, the monster twice as angry
      m.endShot();
      brawl(m, v, kid, { kidDealt: SW.kidOnVegeta * 1.3, song: 'vegeta_theme' });
      gapOff = m.powerGap(kid, { from: [v], mul: SW.vegetaGap });
      sf = m.storyFight({
        floors: [{ f: v, at: 0.1 }, { f: kid, at: 0.3 }],
        fighters: [v, kid],
        space: 'ground',
        aggression: [{ f: kid, value: 1 }],
        ease: { foe: kid, hero: v, below: 0.3, min: 0.5 },
      });
      m.say('vegeta', 'Come on! What are you waiting for?! I\'m right here!', 2.6, { style: 'shout' });
      counting = true;
      yield () => t >= SW.minute;
      K.unhook(m, hook);
      offD();
      sf.off();
      gapOff();
      m.complete('minute');
      if (hits >= 20) m.complete('hits');
      else m.failObjective('hits');
      m.flags.minuteSurvived = true;
      m.flags.minuteHits = hits;
      m.lock(true);
      K.clearCombat(b);
      kid.controller = K.scripted();
      if (kid.mech.apart) yield () => !kid.mech.apart;
      yield 0.4;
    },
  };

  P.numberone = {
    id: 'numberone',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      // Vegeta on the ground, the monster over him, Kakarot far off on his knees; Mr. Satan hidden behind a rock
      m.cast({ support: [S.goku, S.vegeta, S.kid], background: [S.kai, S.elder, S.dende], hidden: [S.fat] }, { centre: S.vegeta.pos.clone(), supportClear: 0.1, clear: 34 });
      S.satan.setHidden(true);
      for (const f of [S.goku, S.vegeta, S.kid]) f.setHidden(false);
      if (S.goku.pos.distanceTo(S.vegeta.pos) < 10) m.space(S.goku, 'ground', { pos: S.vegeta.pos.clone().add(new V3(0, 0, 14)), face: S.vegeta.pos });
      yield* SL.Cinema.play(m, 'sw_numberone');
    },
  };

  P.plan = {
    id: 'plan',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      // both of them on the field even when the story starts here
      m.cast({ support: [S.kid, S.vegeta, S.goku, S.dende, S.kai], background: [S.elder], hidden: [S.fat, S.satan] }, { centre: S.vegeta.pos.clone(), supportClear: 0.1, clear: 34 });
      // Dende and the Kai have to be in the conversation: by Kakarot, not out at the edge
      if (S.dende.pos.distanceTo(S.goku.pos) > 6) m.space(S.dende, 'ground', { pos: S.goku.pos.clone().add(new V3(-1.6, 0, 1.2)), face: S.goku.pos });
      if (S.kai.pos.distanceTo(S.goku.pos) > 6) m.space(S.kai, 'ground', { pos: S.goku.pos.clone().add(new V3(-2.8, 0, 0.2)), face: S.goku.pos });
      yield* SL.Cinema.play(m, 'sw_plan');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.endShot();
      m.title(m.def.chapter, 'NUMBER ONE', 'Next: the Super Spirit Bomb', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'buu_sacred',
    canon: true,
    chapter: 'CHAPTER 14 · BUU SAGA',
    title: 'Number One',
    subtitle: 'The Sacred World of the Kai · Age 774',
    character: 'goku',
    stage: 'kai_world',
    parTime: 420,
    rules: { allowTransform: true, allowUltimates: true },
    blurb: 'There is no Earth left to protect, and he followed them anyway. Goku needs a minute. Vegeta gives him one.',
    rewards: ['Story: Vegeta\'s minute', 'Story: the Spirit Bomb plan'],
    setup,
    phases: [P.arrive, P.goku, P.ask, P.minute, P.numberone, P.plan, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.sacredWorld = { SW };
})();
