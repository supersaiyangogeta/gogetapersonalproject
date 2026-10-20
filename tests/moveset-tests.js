// Movesets and ultimates, slice 1 (2026-10-16, planning/MOVESET_ULTIMATES_PLAN.md): the skill wheel shows the
// active form's techniques, the shared gates on extra techniques (forms, a Free Battle unlock, the story, the
// battle's ultimate rule), and technique cinematics (spec.cine): their shots, and the camera given back at once
// when the move is interrupted or misses. Runs the real engine headless (tests/headless.js).
const H = require('./headless');

module.exports = function movesetTests({ test, eq, ok }) {
  console.log('\nMovesets and ultimates: form techniques on the wheel, extra gates, technique cinematics (headless)');

  const entry = (SL, b, f, id) => SL.RadialMenu.buildEntries(f, b).find((e) => e.id === id);
  const toForm = (f, id) => f.applyForm(f.def.forms.findIndex((x) => x.id === id));
  /** Records which camera shots a battle plays, in order ('impact' = the wide shot centred on the target). */
  function spyShots(b) {
    const seen = [];
    for (const k of ['ultimateChargeShot', 'faceShot', 'pullShot', 'riseShot', 'rushTrackShot', 'reverseShot', 'wideShot', 'bombFollowShot', 'transformShot', 'handShot', 'frontShot', 'pathShot', 'perchShot', 'aimShot', 'novaShot', 'pairShot', 'swingShot']) {
      const orig = b[k].bind(b);
      b[k] = (...a) => {
        seen.push(k === 'wideShot' && a[3] ? 'impact' : k);
        return orig(...a);
      };
    }
    return seen;
  }
  /** Super Saiyan 3 Goku with Kid Buu cleared (Dragon Fist earned), full ki, in a training battle. */
  function ssj3Goku(o = {}) {
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('buu_kidbuu', { score: 1, rank: 'C' });
    const b = gg.battle(Object.assign({ p1: 'goku', p2: 'vegeta' }, o));
    toForm(b.player, 'ssj3');
    b.player.ki = b.player.kiMax;
    return { gg, SL: gg.SL, b, g: b.player };
  }

  test('the skill wheel shows the active form\'s technique (Final Form Frieza: Death Ball, not the base ultimate)', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'frieza', p2: 'goku' });
    toForm(b.player, 'final');
    eq(entry(gg.SL, b, b.player, 'ultimate').label, 'Death Ball');
  });

  test('Dragon Fist: hidden until Kid Buu is cleared, then Super Saiyan 3 only, an ultimate, never in the story', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const g = b.player;
    toForm(g, 'ssj3');
    g.ki = g.kiMax;
    ok(!entry(SL, b, g, 'x:dragonFist'), 'not offered before buu_kidbuu is cleared');
    eq(g._trySpecial('x:dragonFist'), false, 'and cannot be used');
    SL.Save.completeMission('buu_kidbuu', { score: 1, rank: 'C' });
    eq(entry(SL, b, g, 'x:dragonFist').locked, null, 'earned, in Super Saiyan 3');
    toForm(g, 'base');
    eq(entry(SL, b, g, 'x:dragonFist').locked, 'Needs Super Saiyan 3');
    eq(g._trySpecial('x:dragonFist'), false, 'not in base form');
    toForm(g, 'ssj3');
    g.ki = g.kiMax;
    b.rules.allowUltimates = false;
    eq(entry(SL, b, g, 'x:dragonFist').locked, 'Not allowed here');
    eq(g._trySpecial('x:dragonFist'), false, 'the battle\'s ultimate rule holds for an extra too');
    b.rules.allowUltimates = true;
    b.mode = 'story';
    ok(!entry(SL, b, g, 'x:dragonFist'), 'the story keeps the kit its fights were tuned with');
    b.mode = 'training';
    ok(g._trySpecial('x:dragonFist'), 'usable');
    eq(g.state, 'rush');
    eq(g.stats.ultimates, 1, 'counted as an ultimate');
  });

  test('God Bind keeps its own wording on the wheel outside the god forms', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    eq(entry(gg.SL, b, b.player, 'x:godBind').locked, 'Needs divine ki');
  });

  test('Dragon Fist landed: stance, the rush alongside, then wide on the one it hits; the dragon blow does the damage', () => {
    const { gg, b, g } = ssj3Goku({ distance: 8 });
    const shots = spyShots(b);
    const v = b.fighters[1];
    let dealt = 0;
    b.on('damage', (e) => {
      if (e.target === v) dealt += e.amount || 0;
    });
    ok(g._trySpecial('x:dragonFist'));
    const n = gg.until(b, () => g.state !== 'rush', 60 * 6);
    ok(n >= 0, 'the rush ends');
    eq(shots.join(' '), 'ultimateChargeShot rushTrackShot impact');
    ok(dealt > 4000, 'it landed (' + Math.round(dealt) + ' damage)');
    eq(g.cine, null, 'the cinematic is over');
  });

  test('an interrupted or missed Dragon Fist gives the camera back at once', () => {
    {
      const { gg, b, g } = ssj3Goku({ distance: 8 });
      ok(g._trySpecial('x:dragonFist'));
      gg.frame(b);
      ok(g.cine && b.camera.shot, 'the stance shot is playing');
      g.setState('hitstun', { frames: 30 });
      eq(g.cine, null, 'hit out of the wind-up: no cinematic');
      eq(b.camera.shot, null, 'and no shot left on a move that is over');
    }
    {
      const { gg, b, g } = ssj3Goku({ distance: 90 });
      ok(g._trySpecial('x:dragonFist'));
      gg.until(b, () => g.sd.phase === 'recover', 60 * 3);
      eq(g.sd.phase, 'recover', 'out of reach: it misses');
      eq(g.cine, null, 'missed: no cinematic');
      eq(b.camera.shot, null, 'the camera is back for the punish');
    }
  });

  test('Spirit Bomb outside the story: low behind him as it grows, then the lens rides behind it', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const g = b.player;
    const shots = spyShots(b);
    g.ki = g.kiMax;
    ok(g._trySpecial('ultimate'));
    gg.until(b, () => g.sd.released, 60 * 6);
    gg.frame(b);
    eq(shots.join(' '), 'riseShot bombFollowShot');
  });

  test('the story keeps its own camera: no technique cinematic, the Spirit Bomb\'s old charge shot', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    b.mode = 'story';
    const g = b.player;
    const shots = spyShots(b);
    g.ki = g.kiMax;
    ok(g._trySpecial('ultimate'));
    gg.step(b, 2);
    eq(g.cine, undefined, 'no cinematic in the story');
    eq(shots.join(' '), 'ultimateChargeShot');
  });

  test('Instant Kamehameha right after Instant Transmission: the lens snaps in behind the target', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const g = b.player;
    const shots = spyShots(b);
    g.followFrames = 20;
    ok(g._trySpecial('special1'));
    gg.frame(b);
    eq(shots[0], 'reverseShot');
  });

  test('SSJ4 Goku: Ultimate Dragon Fist is its own wheel ultimate; the Dragon Fist button stays', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku_ssj4', p2: 'vegeta', distance: 8 });
    const g = b.player;
    eq(g.specFor('special2').id, 'g4Dragon');
    const e = entry(SL, b, g, 'x:g4UltDragon');
    ok(e && e.locked === null, 'on the wheel, usable');
    const shots = spyShots(b);
    g.ki = g.kiMax;
    ok(g._trySpecial('x:g4UltDragon'));
    gg.until(b, () => g.state !== 'rush', 60 * 6);
    eq(shots.join(' '), 'faceShot rushTrackShot wideShot impact');
  });

  /* ------------------------------------------------------------ Vegeta (slice 2) */

  test('Big Bang Attack: up at the one-handed pose and in on the sphere, then behind him along its path; it still lands', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'vegeta', p2: 'goku', distance: 8 });
    const v = b.player, t = b.fighters[1];
    const shots = spyShots(b);
    let dealt = 0;
    b.on('damage', (e) => {
      if (e.target === t) dealt += e.amount || 0;
    });
    v.ki = v.kiMax;
    ok(v._trySpecial('special2'));
    gg.until(b, () => v.state === 'free', 60 * 3);
    gg.step(b, 90);
    eq(shots.join(' '), 'handShot pathShot');
    ok(dealt > 0, 'the ball reached him');
    eq(v.cine, null, 'over once he is free again');
  });

  test('Final Flash: circling him as it gathers, square in front as the hands meet, then wide from the side as it crosses', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'vegeta', p2: 'goku', distance: 10 });
    const v = b.player;
    const shots = spyShots(b);
    v.ki = v.kiMax;
    ok(v._trySpecial('ultimate'));
    gg.until(b, () => v.state === 'beamFire', 60 * 3);
    gg.step(b, 2);
    eq(shots.join(' '), 'transformShot frontShot wideShot');
  });

  test('an interrupted Big Bang Attack or Final Flash gives the camera back at once', () => {
    for (const [slot, when] of [['special2', (v) => v.stateFrame > 4], ['ultimate', (v) => v.state === 'beamFire']]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'vegeta', p2: 'goku', distance: 10 });
      const v = b.player;
      v.ki = v.kiMax;
      ok(v._trySpecial(slot));
      gg.until(b, () => when(v), 60 * 3);
      ok(v.cine && b.camera.shot, slot + ': a shot is playing');
      v.setState('hitstun', { frames: 30 });
      eq(v.cine, null, slot + ': no cinematic after the hit');
      eq(b.camera.shot, null, slot + ': and no shot left on it');
    }
  });

  test('a CPU\'s ordinary technique never takes the player\'s camera; its ultimate aimed at the player still does', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 10 });
    const v = b.fighters[1];
    const shots = spyShots(b);
    v.target = b.player;
    v.ki = v.kiMax;
    ok(v._trySpecial('special2'), 'the CPU throws a Big Bang Attack');
    gg.until(b, () => v.state === 'free', 60 * 3);
    eq(shots.join(' '), '', 'no shot for it');
    v.ki = v.kiMax;
    ok(v._trySpecial('ultimate'), 'then fires Final Flash at the player');
    gg.frame(b);
    eq(shots[0], 'transformShot', 'that one is shown');
  });

  /* ------------------------------------------------------------ Goku's selectable rushes (slice 3) */

  /** Goku with "Saiyan Brothers" cleared (Raditz Rush earned), full ki, in a training battle. */
  function earnedGoku(o = {}) {
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('saiyan_brothers', { score: 1, rank: 'C' });
    const b = gg.battle(Object.assign({ p1: 'goku', p2: 'vegeta' }, o));
    b.player.ki = b.player.kiMax;
    return { gg, SL: gg.SL, b, g: b.player, t: b.fighters[1] };
  }

  test('Raditz Rush: its own move, hidden until Saiyan Brothers is cleared, base body and Kaioken only, never in the story', () => {
    const G = H.create({ quiet: true, seed: 3 }).SL.data.characters.goku;
    const ids = Object.values(G.specials).map((x) => x.id).concat(G.extras.map((x) => x.id));
    eq(new Set(ids).size, ids.length, 'every Goku technique has its own id: ' + ids.join(', '));
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const g = b.player;
    g.ki = g.kiMax;
    ok(!entry(SL, b, g, 'x:raditzRush'), 'not offered before Saiyan Brothers is cleared');
    eq(g._trySpecial('x:raditzRush'), false);
    SL.Save.completeMission('saiyan_brothers', { score: 1, rank: 'C' });
    const e = entry(SL, b, g, 'x:raditzRush');
    ok(e && e.label === 'Raditz Rush' && e.locked === null, 'on the wheel, usable');
    toForm(g, 'kaioken');
    eq(entry(SL, b, g, 'x:raditzRush').locked, null, 'in Kaioken too');
    toForm(g, 'ssj');
    eq(entry(SL, b, g, 'x:raditzRush').locked, 'Not in Super Saiyan');
    g.ki = g.kiMax;
    eq(g._trySpecial('x:raditzRush'), false, 'and not usable there');
    toForm(g, 'base');
    b.mode = 'story';
    ok(!entry(SL, b, g, 'x:raditzRush'), 'the story keeps its own kit');
  });

  test('Raditz Rush landed: stance, shoulder-first rush, knee, cross, elbow, side kick, each blow with its own reaction', () => {
    const { gg, b, g, t } = earnedGoku({ distance: 8 });
    const shots = spyShots(b);
    const reactions = [], poses = [];
    const take = t.takeHit.bind(t);
    t.takeHit = (att, hit) => {
      if (att === g) reactions.push(hit.pose);
      return take(att, hit);
    };
    const play = g.anim.play.bind(g.anim);
    g.anim.play = (name, ...a) => {
      if (poses[poses.length - 1] !== name) poses.push(name);
      return play(name, ...a);
    };
    ok(g._trySpecial('x:raditzRush'));
    let knocked = false;
    gg.until(b, () => g.state !== 'rush', 60 * 4, () => {
      if (t.state === 'knockback') knocked = true;
    });
    eq(reactions.join(' '), 'hitBody hitBody hitSideR hitLight hitHeavy', 'the grab, then the four blows');
    const want = ['g_raditzW', 'g_raditzDash', 'g_raditzKnee', 'g_cross', 'g_elbow', 'g_raditzKick'];
    eq(poses.filter((p) => want.includes(p)).join(' '), want.join(' '), 'its own stance, rush and blows, in order');
    ok(knocked, 'the kick sends him away');
    eq(shots.join(' '), 'rushTrackShot wideShot impact');
    eq(g.state, 'free', 'back in the fight');
    eq(g.cine, null);
    gg.step(b, 60);
    eq(b.camera.shot, null, 'the impact shot has ended');
  });

  test('Raditz Rush missed or interrupted: the camera comes straight back and nobody is left held', () => {
    {
      const { gg, b, g, t } = earnedGoku({ distance: 90 });
      ok(g._trySpecial('x:raditzRush'));
      gg.until(b, () => g.sd.phase === 'recover', 60 * 3);
      eq(g.cine, null, 'missed: no cinematic');
      eq(b.camera.shot, null, 'missed: the camera is back');
      gg.until(b, () => g.state === 'free', 60 * 2);
      eq(g.state, 'free', 'and he recovers');
      ok(t.state !== 'held', 'the target was never caught');
    }
    {
      const { gg, b, g, t } = earnedGoku({ distance: 8 });
      ok(g._trySpecial('x:raditzRush'));
      gg.until(b, () => g.sd.phase === 'combo', 60 * 3);
      eq(t.state, 'held', 'caught');
      g.setState('hitstun', { frames: 30 });
      eq(g.cine, null, 'hit out of the combo: no cinematic');
      eq(b.camera.shot, null, 'and no shot left on it');
      ok(t.state !== 'held', 'the target is let go');
    }
  });

  /* ------------------------------------------------------------ Nappa Rush: a rush step that stands him on the target's head */

  /** Goku with "Nappa Attacks" cleared (Nappa Rush earned), full ki, in a training battle. */
  function nappaGoku(o = {}) {
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('saiyan_nappa', { score: 1, rank: 'C' });
    const b = gg.battle(Object.assign({ p1: 'goku', p2: 'nappa', distance: 8 }, o));
    b.player.ki = b.player.kiMax;
    return { gg, SL: gg.SL, b, g: b.player, t: b.fighters[1] };
  }
  /** How far his feet are from the top of the held one's head (x, z and height). */
  const offHead = (g, t) => Math.hypot(g.pos.x - t.pos.x, g.pos.y - (t.pos.y + t.height), g.pos.z - t.pos.z);
  /** Steps until he stands on the head (the hop up done). */
  const untilPerched = (gg, b, g) => gg.until(b, () => g.sd.perch && g.stateFrame - g.sd.perch.at >= 6, 60 * 3);

  test('Nappa Rush: its own move, hidden until Nappa Attacks is cleared, base body and Kaioken only, never in the story; no target, no rush', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'nappa' });
    const g = b.player;
    g.ki = g.kiMax;
    ok(!entry(SL, b, g, 'x:nappaRush'), 'not offered before Nappa Attacks is cleared');
    eq(g._trySpecial('x:nappaRush'), false);
    SL.Save.completeMission('saiyan_nappa', { score: 1, rank: 'C' });
    const e = entry(SL, b, g, 'x:nappaRush');
    ok(e && e.label === 'Nappa Rush' && e.locked === null, 'on the wheel, usable');
    eq(SL.data.characters.goku.extras.filter((x) => x.id === 'nappaRush').length, 1, 'its own id, beside Raditz Rush');
    toForm(g, 'kaioken');
    eq(entry(SL, b, g, 'x:nappaRush').locked, null, 'in Kaioken too');
    toForm(g, 'ssj');
    eq(entry(SL, b, g, 'x:nappaRush').locked, 'Not in Super Saiyan');
    g.ki = g.kiMax;
    eq(g._trySpecial('x:nappaRush'), false, 'and not usable there');
    toForm(g, 'base');
    b.mode = 'story';
    ok(!entry(SL, b, g, 'x:nappaRush'), 'the story keeps its own kit');
    b.mode = 'training';
    g.target = null;
    const ki = g.ki;
    eq(g._trySpecial('x:nappaRush'), false, 'nobody to rush: nothing happens');
    eq(g.state, 'free');
    eq(g.ki, ki, 'and no ki is spent');
  });

  test('Nappa Rush landed, on a big and a small opponent: stance, slip in, elbow, cross, on his head (feet on the crown), the stamp down, back on the ground', () => {
    for (const opp of ['nappa', 'kid_gohan']) {
      const { gg, b, g, t } = nappaGoku({ p2: opp });
      const shots = spyShots(b);
      const reactions = [], poses = [];
      const take = t.takeHit.bind(t);
      t.takeHit = (att, hit) => {
        if (att === g) reactions.push(hit.pose);
        return take(att, hit);
      };
      const play = g.anim.play.bind(g.anim);
      g.anim.play = (name, ...a) => {
        if (poses[poses.length - 1] !== name) poses.push(name);
        return play(name, ...a);
      };
      let perched = 0, worst = 0, smashed = false, stood = false;
      const tPlay = t.anim.play.bind(t.anim);
      t.anim.play = (name, ...a) => {
        if (name === 'stand' && g.sd.perch) stood = true;
        return tPlay(name, ...a);
      };
      ok(g._trySpecial('x:nappaRush'), opp + ': used');
      gg.until(b, () => g.state !== 'rush', 60 * 5, () => {
        if (g.sd.perch && g.stateFrame - g.sd.perch.at >= 6) {
          perched++;
          worst = Math.max(worst, offHead(g, t));
          if (t.state !== 'held') worst = 99;
        }
        if (t.state === 'knockback' && t.sd.knock === 'smash') smashed = true;
      });
      ok(perched >= 20, opp + ': stood on his head for the hold (' + perched + ' frames)');
      ok(worst < 0.05, opp + ': feet on the crown, from his height (' + worst.toFixed(3) + ' off), and he is held under him the whole time');
      ok(stood, opp + ': he straightens up under the feet (the head over the crown, not leaning away)');
      eq(reactions.join(' '), 'hitBody hitBody hitLight hitHeavy', opp + ': the grab, elbow, cross, then the stamp');
      const want = ['g_nappaW', 'g_nappaPass', 'g_elbow', 'g_cross', 'g_nappaPerch', 'g_nappaStomp'];
      eq(poses.filter((p) => want.includes(p)).join(' '), want.join(' '), opp + ': its own stance, pass, head-stand and finish, in order');
      ok(smashed, opp + ': stamped down into the ground');
      eq(shots.join(' '), 'rushTrackShot wideShot perchShot impact', opp + ': alongside, both, low up at the head-stand, impact');
      eq(g.state, 'free', opp + ': back in the fight');
      ok(g.grounded, opp + ': down off the head, on the ground');
      ok(t.state !== 'held', opp + ': let go');
      eq(g.cine, null);
      gg.step(b, 60);
      eq(b.camera.shot, null, opp + ': the impact shot has ended, the gameplay camera is back');
    }
  });

  test('Nappa Rush missed, interrupted on his head, or losing him there: camera straight back, nobody left held, Goku off the head', () => {
    {
      const { gg, b, g, t } = nappaGoku({ distance: 90 });
      ok(g._trySpecial('x:nappaRush'));
      gg.until(b, () => g.sd.phase === 'recover', 60 * 3);
      eq(g.cine, null, 'missed: no cinematic');
      eq(b.camera.shot, null, 'missed: the camera is back');
      gg.until(b, () => g.state === 'free', 60 * 2);
      eq(g.state, 'free', 'and he recovers');
      ok(t.state !== 'held', 'the target was never caught');
    }
    {
      const { gg, b, g, t } = nappaGoku();
      ok(g._trySpecial('x:nappaRush'));
      untilPerched(gg, b, g);
      ok(b.camera.shot, 'on his head, the low shot playing');
      g.setState('hitstun', { frames: 30 });
      eq(g.cine, null, 'hit off his head: no cinematic');
      eq(b.camera.shot, null, 'and no shot left on it');
      ok(t.state !== 'held', 'the target is let go');
      const x = g.pos.x;
      t.pos.x += 3;
      gg.frame(b);
      ok(Math.abs(g.pos.x - x) < 0.5, 'Goku is no longer pinned to the head');
    }
    {
      const { gg, b, g, t } = nappaGoku();
      ok(g._trySpecial('x:nappaRush'));
      untilPerched(gg, b, g);
      t.setState('free');
      gg.until(b, () => g.state === 'free', 60 * 3);
      eq(g.state, 'free', 'he got loose: Goku springs off and recovers');
      ok(g.grounded, 'down on the ground, not standing on air');
      ok(t.state !== 'held');
    }
  });

  /* ------------------------------------------------------------ Final Impact: Majin Vegeta's rush (slice 5) */

  const FI_GOLD = 0xffd84a;
  /** Majin Vegeta with "The Mark" cleared (Final Impact earned), full ki, in a training battle. */
  function majinVegeta(o = {}) {
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('buu_majin', { score: 1, rank: 'C' });
    const b = gg.battle(Object.assign({ p1: 'vegeta', p2: 'goku', distance: 8 }, o));
    toForm(b.player, 'majin');
    b.player.ki = b.player.kiMax;
    return { gg, SL: gg.SL, b, g: b.player, t: b.fighters[1] };
  }

  test('the skill wheel: every slot can be pointed at, whatever the number of entries (the lower-left ones could not)', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    for (let n = 2; n <= 12; n++) {
      const ents = Array.from({ length: n }, (_, i) => ({ i }));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        eq(SL.RadialMenu.pick(ents, Math.sin(a), Math.cos(a)), i, n + ' entries: pointing at slot ' + i);
      }
    }
    const five = Array.from({ length: 5 }, (_, i) => ({ i }));
    eq(SL.RadialMenu.pick(five, -0.7071, -0.7071), 3, 'down-left on a five-entry wheel (Majin Vegeta: Final Impact)');
  });

  test('Final Impact: its own move, hidden until The Mark is cleared, Majin only, never in the story; the Majin form itself stays off the transform button', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'vegeta', p2: 'goku' });
    const v = b.player;
    toForm(v, 'majin');
    v.ki = v.kiMax;
    ok(!entry(SL, b, v, 'x:finalImpact'), 'not offered before The Mark is cleared');
    eq(v._trySpecial('x:finalImpact'), false);
    SL.Save.completeMission('buu_majin', { score: 1, rank: 'C' });
    const e = entry(SL, b, v, 'x:finalImpact');
    ok(e && e.label === 'Final Impact' && e.locked === null && e.cost === 50, 'on the wheel in the Majin form, 50 ki');
    toForm(v, 'base');
    eq(entry(SL, b, v, 'x:finalImpact').locked, 'Needs Majin');
    eq(v._trySpecial('x:finalImpact'), false, 'and not usable outside it');
    toForm(v, 'majin');
    b.mode = 'story';
    ok(!entry(SL, b, v, 'x:finalImpact'), 'the story keeps its own kit');
    const ids = Object.values(SL.data.characters.vegeta.specials).map((x) => x.id).concat(SL.data.characters.vegeta.extras.map((x) => x.id));
    eq(new Set(ids).size, ids.length, 'every Vegeta technique has its own id: ' + ids.join(', '));
    // the decision of slice 5: The Mark earns the move, not a place on the transform button (the form comes after Blue in the list)
    const b2 = gg.battle({ p1: 'vegeta', p2: 'goku' });
    ok(b2.player.lockedForms && b2.player.lockedForms.majin, 'outside the story the transform button still never reaches Majin');
  });

  test('Free Battle / Training Starting Form: only forms earned outside the story (no Mastered Ultra Instinct on a new save); Majin after The Mark', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const C = SL.data.characters;
    const form = (c, id) => C[c].forms.find((f) => f.id === id);
    const start = (c, id) => SL.formStartFree(form(c, id));
    ok(start('goku', 'base') && start('goku', 'kaioken') && start('goku', 'ssj'), 'forms with no unlock are always there');
    for (const [c, id] of [['goku', 'mui'], ['goku', 'blue'], ['vegeta', 'blueEvo'], ['vegeta', 'majin'], ['vegeta', 'super_vegeta'], ['piccolo', 'nail'], ['gogeta', 'blue']]) {
      ok(!start(c, id), 'a new save does not start as ' + c + ' ' + id);
    }
    SL.Save.completeMission('top_mui', { score: 1, rank: 'C' });
    ok(start('goku', 'mui'), 'Mastered Ultra Instinct once its mission is cleared');
    SL.Save.completeMission('buu_majin', { score: 1, rank: 'C' });
    ok(start('vegeta', 'majin') && start('vegeta', 'ssj2'), 'The Mark: Majin (a starting form) and Super Saiyan 2');
    ok(!SL.formOpenFree(form('vegeta', 'majin')), 'Majin is still not a transformation outside the story');
    SL.Save.completeMission('cell_perfect', { score: 1, rank: 'C' });
    SL.Save.completeMission('namek_nail', { score: 1, rank: 'C' });
    ok(!start('vegeta', 'super_vegeta') && !start('piccolo', 'nail'), 'Super Vegeta and Fused Piccolo stay story-only, even after their missions');
    ok(!start('gogeta', 'blue'), 'a story-only form never is (another entry owns it)');
    // every mission a form waits for exists (a typo would hide the form for good)
    const bad = [];
    for (const c of Object.values(C)) for (const f of c.forms || []) for (const m of [].concat(f.freeUnlock || [], f.freeStart || [])) if (!SL.data.missions[m]) bad.push(c.id + ':' + f.id + ' -> ' + m);
    eq(bad.join(', '), '', 'unknown missions');
  });

  test('Final Impact landed, on a grown and a small opponent: charge, knee, the hand raised while the ki gathers (no blow), the point-blank shot through him', () => {
    for (const opp of ['goku', 'kid_gohan']) {
      const { gg, b, g, t } = majinVegeta({ p2: opp });
      const shots = spyShots(b);
      const hits = [], poses = [];
      const take = t.takeHit.bind(t);
      t.takeHit = (att, hit) => {
        if (att === g) hits.push(hit.pose + (hit.type === 'ki' ? ':ki' : ''));
        return take(att, hit);
      };
      const play = g.anim.play.bind(g.anim);
      g.anim.play = (name, ...a) => {
        if (poses[poses.length - 1] !== name) poses.push(name);
        return play(name, ...a);
      };
      let glows = 0, streaks = 0;
      const flash = b.vfx.flash.bind(b.vfx), slash = b.vfx.slash.bind(b.vfx);
      b.vfx.flash = (p, s, c, ...a) => {
        if (c === FI_GOLD && g.sd.aim) glows++;
        return flash(p, s, c, ...a);
      };
      b.vfx.slash = (...a) => {
        streaks++;
        return slash(...a);
      };
      ok(g._trySpecial('x:finalImpact'), opp + ': used');
      let aimed = 0, hitsAtAim = null, hurtDuringAim = false, knocked = false;
      gg.until(b, () => g.state !== 'rush', 60 * 5, () => {
        // (the shot lands on the frame the aim ends, so the check stops a frame short of it)
        if (g.sd.aim && g.stateFrame < g.sd.aim.at + g.sd.aim.frames - 1) {
          aimed++;
          if (hitsAtAim === null) hitsAtAim = hits.length;
          if (hits.length !== hitsAtAim || t.state !== 'held') hurtDuringAim = true;
        }
        if (t.state === 'knockback') knocked = true;
      });
      ok(aimed >= 20, opp + ': the hand held up at him for the beat (' + aimed + ' frames)');
      ok(!hurtDuringAim, opp + ': no blow while the ki gathers, and he stays held');
      ok(glows >= 8, opp + ': the ki gathers in the hand (' + glows + ' glows)');
      ok(streaks >= 2, opp + ': the shot goes on through him');
      eq(hits.join(' '), 'hitBody hitBody hitHeavy:ki', opp + ': the grab, the knee, then the ki shot');
      const want = ['v_majinHeavyW', 'v_majinFly', 'v_majinKnee', 'v_finalImpactAim', 'v_finalImpact'];
      eq(poses.filter((p) => want.includes(p)).join(' '), want.join(' '), opp + ': its own wind-up, charge, knee, aim and shot, in order');
      ok(knocked, opp + ': thrown away by it');
      eq(shots.join(' '), 'rushTrackShot wideShot aimShot impact', opp + ': alongside, both, tight on the hand, impact');
      eq(g.state, 'free', opp + ': back in the fight');
      ok(t.state !== 'held', opp + ': let go');
      eq(g.cine, null);
      gg.step(b, 60);
      eq(b.camera.shot, null, opp + ': the impact shot has ended, the gameplay camera is back');
    }
  });

  test('Final Impact missed, interrupted with the hand raised, or losing him there: camera straight back, nobody left held, no glow left gathering', () => {
    {
      const { gg, b, g, t } = majinVegeta({ distance: 90 });
      ok(g._trySpecial('x:finalImpact'));
      gg.until(b, () => g.sd.phase === 'recover', 60 * 3);
      eq(g.cine, null, 'missed: no cinematic');
      eq(b.camera.shot, null, 'missed: the camera is back');
      gg.until(b, () => g.state === 'free', 60 * 2);
      eq(g.state, 'free', 'and he recovers');
      ok(t.state !== 'held', 'the target was never caught');
    }
    for (const how of ['hit', 'loose']) {
      const { gg, b, g, t } = majinVegeta();
      ok(g._trySpecial('x:finalImpact'));
      gg.until(b, () => g.sd.aim && g.stateFrame - g.sd.aim.at >= 6, 60 * 3);
      ok(g.sd.aim && b.camera.shot, how + ': hand raised, the tight shot playing');
      if (how === 'hit') g.setState('hitstun', { frames: 30 });
      else t.setState('free');
      let glows = 0, shots = 0;
      const flash = b.vfx.flash.bind(b.vfx);
      b.vfx.flash = (p, s, c, ...a) => {
        if (c === FI_GOLD) glows++;
        return flash(p, s, c, ...a);
      };
      const take = t.takeHit.bind(t);
      t.takeHit = (att, hit) => {
        if (att === g) shots++;
        return take(att, hit);
      };
      gg.until(b, () => g.state === 'free', 60 * 3);
      eq(glows, 0, how + ': the gathering stops with the move');
      eq(shots, 0, how + ': no shot after it');
      ok(t.state !== 'held', how + ': nobody left held');
      eq(g.state, 'free', how + ': he recovers');
      eq(g.cine, null);
      eq(b.camera.shot, null, how + ': the camera is back');
    }
  });

  /* ------------------------------------------------------------ Majin Vegeta: Atomic Rush and Final Explosion (slice 6) */

  /** Majin Vegeta with the given missions cleared, full ki, in a training battle. */
  function majinWith(missions, o = {}) {
    const gg = H.create({ quiet: true, seed: 3 });
    for (const m of missions) gg.SL.Save.completeMission(m, { score: 1, rank: 'C' });
    const b = gg.battle(Object.assign({ p1: 'vegeta', p2: 'goku', distance: 8 }, o));
    toForm(b.player, 'majin');
    b.player.ki = b.player.kiMax;
    return { gg, SL: gg.SL, b, g: b.player, t: b.fighters[1] };
  }

  test('Atomic Rush and Final Explosion: their own moves, hidden until their missions, Majin only, never in the story; Final Explosion obeys the ultimate rule', () => {
    const { SL, b, g } = majinWith([]);
    ok(!entry(SL, b, g, 'x:atomicRush') && !entry(SL, b, g, 'x:finalExplosion'), 'not offered before Prince of Saiyans / The Prince\'s Pride');
    SL.Save.completeMission('buu_pride', { score: 1, rank: 'C' });
    SL.Save.completeMission('buu_sacrifice', { score: 1, rank: 'C' });
    const ar = entry(SL, b, g, 'x:atomicRush'), fe = entry(SL, b, g, 'x:finalExplosion');
    ok(ar && ar.locked === null && ar.cost === 45, 'Atomic Rush on the wheel, 45 ki');
    ok(fe && fe.locked === null && fe.cost === 100, 'Final Explosion on the wheel, 100 ki');
    toForm(g, 'blue');
    eq(entry(SL, b, g, 'x:finalExplosion').locked, 'Needs Majin');
    toForm(g, 'majin');
    b.rules.allowUltimates = false;
    eq(entry(SL, b, g, 'x:finalExplosion').locked, 'Not allowed here');
    g.ki = g.kiMax;
    eq(g._trySpecial('x:finalExplosion'), false, 'and not usable then');
    b.rules.allowUltimates = true;
    b.mode = 'story';
    ok(!entry(SL, b, g, 'x:atomicRush') && !entry(SL, b, g, 'x:finalExplosion'), 'the story keeps its own kit and its own sacrifice');
  });

  test('Atomic Rush landed, on a grown and a small opponent: kick, the rings pinning him (no blow), close blows, the headbutt', () => {
    for (const opp of ['goku', 'kid_gohan']) {
      const { gg, b, g, t } = majinWith(['buu_pride'], { p2: opp });
      const shots = spyShots(b);
      const hits = [], poses = [];
      const take = t.takeHit.bind(t);
      t.takeHit = (att, hit) => {
        if (att === g) hits.push(hit.pose);
        return take(att, hit);
      };
      const play = g.anim.play.bind(g.anim);
      g.anim.play = (name, ...a) => {
        if (poses[poses.length - 1] !== name) poses.push(name);
        return play(name, ...a);
      };
      let rings = 0;
      const ring = b.vfx.ring.bind(b.vfx);
      b.vfx.ring = (p, r, c, ...a) => {
        if (c === 0xffd23a) rings++;
        return ring(p, r, c, ...a);
      };
      ok(g._trySpecial('x:atomicRush'), opp + ': used');
      let bound = 0, hitsAtBind = null, hurt = false, knocked = false;
      gg.until(b, () => g.state !== 'rush', 60 * 5, () => {
        if (g.sd.bind && g.stateFrame < g.sd.bind.at + g.sd.bind.frames - 1) {
          bound++;
          if (hitsAtBind === null) hitsAtBind = hits.length;
          if (hits.length !== hitsAtBind || t.state !== 'held') hurt = true;
        }
        if (t.state === 'knockback') knocked = true;
      });
      ok(bound >= 30, opp + ': pinned for the beat (' + bound + ' frames)');
      ok(!hurt, opp + ': no blow while the rings hold him, and he stays held');
      ok(rings >= 4 * 6, opp + ': rings on both wrists and ankles, pulsing (' + rings + ')');
      eq(hits.join(' '), 'hitBody hitSideL hitLight hitSideR hitBody hitHeavy', opp + ': grab, kick, jab, hook, gut, headbutt');
      const want = ['v_majinStance', 'v_majinFly', 'v_atomicKick', 'v_atomicLoom', 'v_headbutt'];
      eq(poses.filter((p) => want.includes(p)).join(' '), want.join(' '), opp + ': its own stance, charge, kick, walk-up and headbutt, in order');
      ok(knocked, opp + ': sent away by the headbutt');
      eq(shots.join(' '), 'rushTrackShot wideShot reverseShot impact', opp + ': alongside, both, over his shoulder at Vegeta, impact');
      eq(g.state, 'free', opp + ': back in the fight');
      eq(g.cine, null);
      gg.step(b, 60);
      eq(b.camera.shot, null, opp + ': gameplay camera back');
    }
  });

  test('Atomic Rush interrupted while he is pinned: the rings stop, nobody held, camera back', () => {
    const { gg, b, g, t } = majinWith(['buu_pride']);
    ok(g._trySpecial('x:atomicRush'));
    gg.until(b, () => g.sd.bind && g.stateFrame - g.sd.bind.at >= 6, 60 * 3);
    ok(g.sd.bind && b.camera.shot, 'pinned, the shot playing');
    g.setState('hitstun', { frames: 30 });
    let rings = 0;
    const ring = b.vfx.ring.bind(b.vfx);
    b.vfx.ring = (p, r, c, ...a) => {
      if (c === 0xffd23a) rings++;
      return ring(p, r, c, ...a);
    };
    gg.until(b, () => g.state === 'free', 60 * 3);
    eq(rings, 0, 'no more rings');
    ok(t.state !== 'held', 'let go');
    eq(g.cine, null);
    eq(b.camera.shot, null, 'camera back');
  });

  test('Final Explosion: the long charge swells, the burst catches who is near and not who got away, costs half his health and all his ki, leaves him spent', () => {
    for (const dist of [8, 60]) {
      const { gg, b, g, t } = majinWith(['buu_sacrifice'], { distance: dist });
      const shots = spyShots(b);
      let caught = 0, bolts = 0;
      const take = t.takeHit.bind(t);
      t.takeHit = (att, hit) => {
        if (att === g && hit.type === 'explosion') caught++;
        return take(att, hit);
      };
      const bolt = b.vfx.bolt.bind(b.vfx);
      b.vfx.bolt = (...a) => {
        bolts++;
        return bolt(...a);
      };
      const hp0 = g.hp;
      ok(g._trySpecial('x:finalExplosion'), dist + ' m: used');
      eq(g.ki, 0, 'all his ki');
      eq(g.state, 'bossBomber');
      gg.step(b, 30);
      const early = g.aura.target;
      gg.step(b, 90);
      ok(g.aura.target > early, 'the aura swells through the charge (' + early.toFixed(2) + ' -> ' + g.aura.target.toFixed(2) + ')');
      ok(bolts >= 20, 'lightning crackles round him (' + bolts + ')');
      eq(caught, 0, 'nothing before the burst');
      gg.until(b, () => g.sd.phase !== 'charge', 60);
      eq(caught, dist < 18 ? 1 : 0, dist + ' m: ' + (dist < 18 ? 'caught' : 'got away'));
      ok(Math.abs(g.hp - Math.max(1, hp0 - g.hpMax * 0.5)) < 1, 'half his health gone');
      gg.until(b, () => g.state !== 'bossBomber', 60 * 3, () => {});
      eq(g.state, 'free', 'back after the spent pause');
      eq(shots.join(' '), 'faceShot transformShot frontShot novaShot', 'his face, round him, in front, then far off outside the burst');
      gg.step(b, 150);
      eq(b.camera.shot, null, 'gameplay camera back');
      eq(g.cine, null);
    }
  });

  test('Final Explosion cut off in the charge: no burst, no cost in health, the aura and camera back', () => {
    const { gg, b, g, t } = majinWith(['buu_sacrifice']);
    let caught = 0;
    const take = t.takeHit.bind(t);
    t.takeHit = (att, hit) => {
      if (att === g) caught++;
      return take(att, hit);
    };
    const hp0 = g.hp;
    ok(g._trySpecial('x:finalExplosion'));
    gg.step(b, 70);
    ok(b.camera.shot, 'the charge shots playing');
    g.setState('hitstun', { frames: 20 });
    eq(g.aura.target, 0, 'the swelling aura drops');
    eq(g.cine, null);
    eq(b.camera.shot, null, 'camera back at once');
    gg.step(b, 120);
    eq(caught, 0, 'no burst');
    eq(g.hp, hp0, 'no health spent');
  });

  /* ------------------------------------------------------------ rush steps that move: to / lift / beam / detonate (slice 7) */

  /**
   * One rush from the wheel, landed on an idle opponent: who it was, what each blow did, the poses and shots in order,
   * how high the held one was carried, where the attacker struck the last blow from, the beams drawn and cleared.
   */
  function runRush({ p1, p2 = 'goku', form, missions = [], id, distance = 8, onFrame, slot, seconds = 6 }) {
    const gg = H.create({ quiet: true, seed: 3 });
    for (const m of missions) gg.SL.Save.completeMission(m, { score: 1, rank: 'C' });
    const b = gg.battle({ p1, p2, distance });
    const g = b.player, t = b.fighters[1];
    if (form) toForm(g, form);
    g.ki = g.kiMax;
    const shots = spyShots(b);
    const out = { gg, b, g, t, shots, hits: [], poses: [], maxLift: 0, beams: 0, disposed: 0, lastFrom: null };
    const take = t.takeHit.bind(t);
    t.takeHit = (att, hit) => {
      if (att === g) {
        out.hits.push(hit.pose + (hit.type === 'ki' ? ':ki' : hit.type === 'explosion' ? ':boom' : ''));
        out.lastFrom = { dx: g.pos.x - t.pos.x, dy: g.pos.y - t.pos.y, dz: g.pos.z - t.pos.z, tfw: t.forward };
      }
      return take(att, hit);
    };
    const play = g.anim.play.bind(g.anim);
    g.anim.play = (name, ...a) => {
      if (out.poses[out.poses.length - 1] !== name) out.poses.push(name);
      return play(name, ...a);
    };
    const mk = b.vfx.createBeam.bind(b.vfx);
    b.vfx.createBeam = (...a) => {
      out.beams++;
      const vis = mk(...a), d = vis.dispose.bind(vis);
      vis.dispose = () => {
        out.disposed++;
        d();
      };
      return vis;
    };
    const y0 = t.pos.y;
    out.used = g._trySpecial(slot || 'x:' + id);
    gg.until(b, () => g.state !== 'rush', 60 * seconds, () => {
      if (t.state === 'held') out.maxLift = Math.max(out.maxLift, t.pos.y - y0);
      if (onFrame) onFrame(out);
    });
    return out;
  }
  const VEGETA_MOVES = [
    { id: 'princesOnslaught', form: 'base', mission: 'namek_vegeta', hits: 'hitBody hitSideL hitHeavy hitBack hitHeavy', poses: ['v_gutW', 'v_poSweep', 'uppercut', 'hammer', 'v_poKnee'], shots: 'rushTrackShot wideShot impact', lift: 2.5, from: 'above' },
    { id: 'dirtyFireworks', form: 'base', mission: 'namek_vegeta', hits: 'hitBody hitBody hitHeavy', poses: ['v_gut', 'uppercut', 'v_dirtyFireworks'], shots: 'rushTrackShot wideShot impact' },
    { id: 'godlyExecution', form: 'god', mission: 'bb_clash', hits: 'hitBody hitBody hitLight hitBody hitBack:ki', poses: ['v_godPalm', 'v_godPalm', 'v_godPalmHigh', 'v_godPalm', 'v_godShot'], shots: 'rushTrackShot wideShot impact', from: 'behind' },
    { id: 'blueGalickRush', form: 'blue', mission: 'rof_finale', hits: 'hitBody hitBody hitSideR hitHeavy hitHeavy:ki', poses: ['v_gut', 'v_elbow', 'v_spinBack', 'v_galickFire'], shots: 'rushTrackShot wideShot wideShot', lift: 2, beam: true },
    { id: 'finalGodStrike', form: 'blueEvo', mission: 'top_toppo', hits: 'hitBody hitSideR hitHeavy hitHeavy:ki', poses: ['v_hook', 'v_spinBack', 'beamFire'], shots: 'rushTrackShot wideShot impact', lift: 3, from: 'above', beam: true },
  ];

  test('Vegeta\'s era rushes: each its own move, hidden until its mission, only in its forms, never in the story', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const V = SL.data.characters.vegeta;
    const ids = Object.values(V.specials).map((x) => x.id).concat(V.extras.map((x) => x.id));
    eq(new Set(ids).size, ids.length, 'every Vegeta technique has its own id: ' + ids.join(', '));
    const b = gg.battle({ p1: 'vegeta', p2: 'goku' });
    const g = b.player;
    const cleared = new Set();
    for (const m of VEGETA_MOVES) {
      toForm(g, m.form);
      if (!cleared.has(m.mission)) ok(!entry(SL, b, g, 'x:' + m.id), m.id + ': not offered before ' + m.mission);
      cleared.add(m.mission);
      SL.Save.completeMission(m.mission, { score: 1, rank: 'C' });
      eq(entry(SL, b, g, 'x:' + m.id) && entry(SL, b, g, 'x:' + m.id).locked, null, m.id + ': on the wheel in ' + m.form);
      toForm(g, 'majin');
      ok(entry(SL, b, g, 'x:' + m.id).locked, m.id + ': not in the Majin form');
      b.mode = 'story';
      toForm(g, m.form);
      ok(!entry(SL, b, g, 'x:' + m.id), m.id + ': not in the story');
      b.mode = 'training';
    }
  });

  test('Vegeta\'s era rushes landed: their own blows and poses in order, carried up where they say so, struck from behind or above, camera back after', () => {
    for (const m of VEGETA_MOVES) {
      const r = runRush({ p1: 'vegeta', form: m.form, missions: [m.mission], id: m.id });
      ok(r.used, m.id + ': used');
      if (m.id === 'dirtyFireworks') r.gg.until(r.b, () => r.hits.length > 3, 60);
      eq(r.hits.join(' '), m.hits + (m.id === 'dirtyFireworks' ? ' hitHeavy:boom' : ''), m.id + ': its blows');
      eq(r.poses.filter((p) => m.poses.includes(p)).join(' '), m.poses.join(' '), m.id + ': its poses in order (the wind-up first)');
      eq(r.shots.join(' '), m.shots, m.id + ': its shots');
      if (m.lift) ok(r.maxLift > m.lift, m.id + ': carried up into the air (' + r.maxLift.toFixed(2) + ' m)');
      if (m.from === 'above') ok(r.lastFrom.dy > 1, m.id + ': the last blow from above (' + r.lastFrom.dy.toFixed(2) + ')');
      if (m.from === 'behind') ok(r.lastFrom.dx * r.lastFrom.tfw.x + r.lastFrom.dz * r.lastFrom.tfw.z < -0.5, m.id + ': the last blow from behind him');
      if (m.beam) ok(r.beams === 1 && r.disposed === 1, m.id + ': one beam drawn and cleared (' + r.beams + '/' + r.disposed + ')');
      eq(r.g.state, 'free', m.id + ': back in the fight');
      ok(r.t.state !== 'held', m.id + ': let go');
      r.gg.step(r.b, 90);
      eq(r.b.camera.shot, null, m.id + ': gameplay camera back');
      eq(r.g.cine, null);
    }
  });

  const GOKU_MOVES = [
    { id: 'meteorCombination', form: 'ssj2', mission: 'buu_pride', hits: 'hitBody hitSideR hitLight hitSideL hitBack hitHeavy:ki', poses: ['g_elbow', 'g_kick', 'g_spinKick', 'hammer', 'g_meteorKame'], shots: 'rushTrackShot wideShot wideShot', lift: 2.5, from: 'below', beam: true },
    { id: 'superDragonTwinFist', form: 'ssj3', mission: 'buu_kidbuu', hits: 'hitBody hitLight hitSideR hitLight hitSideL hitLight hitBody hitSideL hitHeavy hitHeavy', poses: ['g_twinKnee', 'g_sweep', 'g_twinPalms', 'g_dragonUpper'], shots: 'ultimateChargeShot rushTrackShot wideShot impact' },
    { id: 'divineRush', form: 'god', mission: 'bog_ritual', hits: 'hitBody hitBody hitLight hitLight:ki hitSideR:ki hitHeavy:ki', poses: ['g_godPalm', 'g_godShot', 'g_bind', 'g_shoulder'], shots: 'rushTrackShot wideShot reverseShot impact' },
    { id: 'godFistRush', form: 'blue', mission: 'rof_goku', hits: 'hitBody hitBody hitSideL hitBack hitHeavy:ki', poses: ['g_godFistGut', 'g_spinKick', 'hammer', 'g_kameFire'], shots: 'rushTrackShot wideShot impact', from: 'above', beam: true },
    { id: 'blueKaiokenRush', form: 'blueKaioken', mission: 'u6_goku_hit', hits: 'hitBody hitLight hitBack hitSideR hitBack hitLight hitBack hitSideL hitBody hitHeavy:ki', poses: ['g_kaiokenFlex', 'g_godFistGut', 'g_kameFire'], shots: 'rushTrackShot wideShot impact', lift: 1.5, from: 'above', beam: true },
    { id: 'divineKameRush', form: 'uiSign', mission: 'top_jiren', hits: 'hitBody hitHeavy:ki', poses: ['g_uiSlip2', 'g_kameFire'], shots: 'rushTrackShot wideShot impact', beam: true },
    { id: 'silverDragonStrike', form: 'mui', mission: 'top_mui', hits: 'hitBody hitSideR hitBack hitSideL hitHeavy', poses: ['g_cross', 'g_kick', 'g_elbow', 'g_silverHook'], shots: 'faceShot rushTrackShot wideShot impact', slashes: 16 },
  ];

  test('Goku\'s form rushes: each its own move, hidden until its mission, only in its form, never in the story; none shares an id', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const G = SL.data.characters.goku;
    const ids = Object.values(G.specials).map((x) => x.id).concat(G.extras.map((x) => x.id));
    eq(new Set(ids).size, ids.length, 'every Goku technique has its own id');
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    const g = b.player;
    for (const m of GOKU_MOVES.concat([{ id: 'angryKamehameha', form: 'ssj', mission: 'namek_end' }])) {
      toForm(g, m.form);
      ok(!entry(SL, b, g, 'x:' + m.id), m.id + ': not offered before ' + m.mission);
      SL.Save.completeMission(m.mission, { score: 1, rank: 'C' });
      eq(entry(SL, b, g, 'x:' + m.id) && entry(SL, b, g, 'x:' + m.id).locked, null, m.id + ': on the wheel in ' + m.form);
      toForm(g, 'base');
      ok(entry(SL, b, g, 'x:' + m.id).locked, m.id + ': not in the base form');
      b.mode = 'story';
      toForm(g, m.form);
      ok(!entry(SL, b, g, 'x:' + m.id), m.id + ': not in the story');
      b.mode = 'training';
    }
  });

  test('Goku\'s form rushes landed: their own blows and poses, carried up, struck from above or below, the beams drawn and cleared, camera back', () => {
    for (const m of GOKU_MOVES) {
      let slashes = 0;
      const r = runRush({ p1: 'goku', p2: 'vegeta', form: m.form, missions: [m.mission], id: m.id, onFrame: (o) => {
        if (!o.spied) {
          o.spied = true;
          const sl = o.b.vfx.slash.bind(o.b.vfx);
          o.b.vfx.slash = (a, b2, c, ...x) => {
            if (c === 0xe8eeff) slashes++;
            return sl(a, b2, c, ...x);
          };
        }
      } });
      ok(r.used, m.id + ': used');
      eq(r.hits.join(' '), m.hits, m.id + ': its blows');
      eq(r.poses.filter((p) => m.poses.includes(p)).join(' '), m.poses.join(' '), m.id + ': its poses in order');
      eq(r.shots.join(' '), m.shots, m.id + ': its shots');
      if (m.lift) ok(r.maxLift > m.lift, m.id + ': carried up (' + r.maxLift.toFixed(2) + ' m)');
      if (m.from === 'above') ok(r.lastFrom.dy > 1, m.id + ': the last blow from above (' + r.lastFrom.dy.toFixed(2) + ')');
      if (m.from === 'below') ok(r.lastFrom.dy < -0.5, m.id + ': the last blow from below (' + r.lastFrom.dy.toFixed(2) + ')');
      if (m.beam) ok(r.beams === 1 && r.disposed === 1, m.id + ': one beam drawn and cleared (' + r.beams + '/' + r.disposed + ')');
      if (m.slashes) ok(slashes >= m.slashes, m.id + ': strike-lines across him (' + slashes + ')');
      eq(r.g.state, 'free', m.id + ': back in the fight');
      ok(r.t.state !== 'held', m.id + ': let go');
      r.gg.step(r.b, 120);
      eq(r.b.camera.shot, null, m.id + ': gameplay camera back');
    }
  });

  test('Angry Kamehameha: Super Saiyan only, a quick gold wave from the one-handed stance, his face first, then wide as it crosses', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('namek_end', { score: 1, rank: 'C' });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 10 });
    const g = b.player, t = b.fighters[1];
    toForm(g, 'ssj');
    g.ki = g.kiMax;
    const shots = spyShots(b);
    let hit = 0;
    const take = t.takeHit.bind(t);
    t.takeHit = (att, h) => {
      if (att === g) hit++;
      return take(att, h);
    };
    ok(g._trySpecial('x:angryKamehameha'));
    eq(g.anim.name || g.anim.current || 'g_angryKame', 'g_angryKame');
    gg.until(b, () => g.state === 'free', 60 * 5);
    ok(hit >= 1, 'the wave lands');
    eq(shots.join(' '), 'faceShot wideShot');
    gg.step(b, 90);
    eq(b.camera.shot, null, 'camera back');
  });

  /* ------------------------------------------------------------ Gohan and Future Trunks (slice 9) */

  const GOHAN_MOVES = [
    { p1: 'teen_gohan', id: 'aerialJuggle', form: 'ssj2', mission: 'cell_gohan', hits: 'hitBody hitSideR hitSideL hitBack hitSideR hitHeavy', poses: ['tg2_stance', 'tg2_elbow', 'tg_kick', 'tg2_roundhouse'], shots: 'rushTrackShot wideShot impact', lift: 3 },
    { p1: 'teen_gohan', id: 'stomachSmash', form: 'ssj2', mission: 'cell_gohan', hits: 'hitBody hitBody hitHeavy', poses: ['tg2_stance', 'tg2_knee', 'tg2_hammer'], shots: 'rushTrackShot wideShot impact', lift: 2, from: 'above' },
    { p1: 'adult_gohan', id: 'ultimateStrike', form: 'ultimate', mission: 'buu_ultimate', hits: 'hitBody hitBody hitSideL hitBack hitHeavy hitHeavy hitHeavy:ki', poses: ['ug_stare', 'ug_gut', 'ag_kick', 'ug_elbow', 'ag_rise', 'ug_palm', 'ag_kameFire'], shots: 'faceShot rushTrackShot wideShot wideShot', lift: 2, beam: true },
    { p1: 'adult_gohan', id: 'mysticCombination', form: 'ultimate', mission: 'buu_zsword', hits: 'hitBody hitLight hitSideR hitLight hitSideL hitBody hitHeavy hitHeavy', poses: ['ug_stare', 'ag_rise', 'ug_hammer', 'ug_masenko'], shots: 'rushTrackShot wideShot wideShot impact', lift: 2.5, from: 'above', boom: true },
    { p1: 'future_trunks', id: 'swordOfHope', slot: 'ultimate', form: 'rage', mission: 'hit_contract', hits: 'hitBody hitBody hitBody hitBody hitBody hitBody', poses: ['ft_cut', 'ft_return', 'ft_spin', 'ft_rise', 'ft_drop'], shots: 'faceShot rushTrackShot wideShot impact', lift: 2, from: 'above', cut: true },
  ];

  test('Gohan\'s rushes: their own moves, hidden until their missions, only in their forms, never in the story', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    for (const m of GOHAN_MOVES.filter((x) => !x.slot)) {
      const b = gg.battle({ p1: m.p1, p2: 'goku' });
      const g = b.player;
      toForm(g, m.form);
      if (!SL.Save.missionResult(m.mission)) ok(!entry(SL, b, g, 'x:' + m.id), m.id + ': not offered before ' + m.mission);
      SL.Save.completeMission(m.mission, { score: 1, rank: 'C' });
      eq(entry(SL, b, g, 'x:' + m.id) && entry(SL, b, g, 'x:' + m.id).locked, null, m.id + ': on the wheel in ' + m.form);
      toForm(g, 'ssj');
      ok(entry(SL, b, g, 'x:' + m.id).locked, m.id + ': not in Super Saiyan');
      b.mode = 'story';
      toForm(g, m.form);
      ok(!entry(SL, b, g, 'x:' + m.id), m.id + ': not in the story');
    }
  });

  test('Gohan\'s rushes and Sword of Hope landed: their blows, poses, shots, carried up, struck from above, the wave and the great blade, camera back', () => {
    for (const m of GOHAN_MOVES) {
      let cut = 0;
      const r = runRush({ p1: m.p1, p2: 'goku', form: m.form, missions: [m.mission], id: m.slot ? null : m.id, onFrame: (o) => {
        if (!o.spied) {
          o.spied = true;
          const sl = o.b.vfx.slash.bind(o.b.vfx);
          o.b.vfx.slash = (a, b2, c, life, w, ...x) => {
            if (w >= 0.5) cut++;
            return sl(a, b2, c, life, w, ...x);
          };
        }
      }, slot: m.slot });
      if (m.boom) r.gg.until(r.b, () => r.hits.length > m.hits.split(' ').length, 90);
      ok(r.used, m.id + ': used');
      eq(r.hits.join(' '), m.hits + (m.boom ? ' hitHeavy:boom' : ''), m.id + ': its blows');
      eq(r.poses.filter((p) => m.poses.includes(p)).join(' '), m.poses.join(' '), m.id + ': its poses in order');
      eq(r.shots.join(' '), m.shots, m.id + ': its shots');
      if (m.lift) ok(r.maxLift > m.lift, m.id + ': carried up (' + r.maxLift.toFixed(2) + ' m)');
      if (m.from === 'above') ok(r.lastFrom.dy > 1, m.id + ': the last blow from above (' + r.lastFrom.dy.toFixed(2) + ')');
      if (m.beam) ok(r.beams === 1 && r.disposed === 1, m.id + ': one beam drawn and cleared');
      if (m.cut) ok(cut >= 1, m.id + ': the great blade of light comes down');
      eq(r.g.state, 'free', m.id + ': back in the fight');
      ok(r.t.state !== 'held', m.id + ': let go');
      r.gg.step(r.b, 120);
      eq(r.b.camera.shot, null, m.id + ': gameplay camera back');
    }
  });

  test('Burning Attack and the Father-Son Kamehameha outside the story: their shots; the story keeps its own camera', () => {
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'future_trunks', p2: 'goku', distance: 12 });
      const g = b.player;
      g.ki = g.kiMax;
      const shots = spyShots(b);
      ok(g._trySpecial('special1'), 'Burning Attack');
      gg.until(b, () => g.state === 'free', 60 * 4);
      eq(shots.join(' '), 'handShot pathShot', 'up at the hand signs, then along the shot');
    }
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'teen_gohan', p2: 'goku', distance: 12 });
      const g = b.player;
      toForm(g, 'ssj2');
      g.ki = g.kiMax;
      const shots = spyShots(b);
      ok(g._trySpecial('ultimate'), 'Father-Son Kamehameha');
      gg.until(b, () => g.state === 'free', 60 * 6);
      eq(shots.slice(0, 3).join(' '), 'faceShot transformShot wideShot', 'his face, round him, wide as it crosses');
      gg.step(b, 120);
      eq(b.camera.shot, null, 'camera back');
    }
  });

  /* ------------------------------------------------------------ fusions: Gogeta and Vegito (slice 10) */

  test('Blue Gogeta\'s Dimensional Shatter: hidden until The Ultimate Fusion, blows from every side while the world changes colour, back to the real field for the finish', () => {
    const gg0 = H.create({ quiet: true, seed: 3 });
    const b0 = gg0.battle({ p1: 'gogeta_blue', p2: 'goku' });
    ok(!entry(gg0.SL, b0, b0.player, 'x:dimensionalShatter'), 'not offered before bb_gogeta');
    const moods = [];
    const r = runRush({ p1: 'gogeta_blue', missions: ['bb_gogeta'], id: 'dimensionalShatter', onFrame: (o) => {
      if (!o.spied) {
        o.spied = true;
        const sm = o.b.stage.setMood.bind(o.b.stage);
        o.b.stage.setMood = (a, c, s) => {
          moods.push(a + ':' + c);
          return sm(a, c, s);
        };
      }
    } });
    ok(r.used);
    eq(r.hits.join(' '), 'hitBody hitBody hitBack hitSideL hitBack hitSideR hitHeavy:ki', 'its blows');
    eq(r.shots.join(' '), 'faceShot rushTrackShot wideShot impact', 'its shots');
    ok(new Set(moods.filter((m) => !m.startsWith('0:')).map((m) => m.split(':')[1])).size >= 3, 'three different colours of the strange world: ' + moods.join(', '));
    ok(moods[moods.length - 1].startsWith('0:'), 'back to the real field for the finish');
    eq(r.g.state, 'free');
    r.gg.step(r.b, 120);
    eq(r.b.camera.shot, null, 'camera back');
    ok(!r.b.stage.mood || r.b.stage.mood.target === 0, 'no colour left on the stage');
  });

  test('SSJ4 Gogeta: the Big Bang Bluff (gathers, fizzles into streamers, then the real blow) and the Primal Combo; the 100x Big Bang Kamehameha\'s shots', () => {
    {
      let sparks = 0;
      const r = runRush({ p1: 'gogeta_ssj4', id: 'bigBangBluff', onFrame: (o) => {
        if (!o.spied) {
          o.spied = true;
          const sp = o.b.vfx.sparks.bind(o.b.vfx);
          o.b.vfx.sparks = (p, c, ...x) => {
            if (c === 0x8aff6a) sparks++;
            return sp(p, c, ...x);
          };
        }
      } });
      ok(r.used, 'bluff used');
      eq(r.hits.join(' '), 'hitBody hitHeavy', 'only the grab and the real blow do damage');
      ok(sparks >= 2, 'the streamers out of both hands');
      eq(r.shots.join(' '), 'rushTrackShot aimShot impact');
    }
    {
      const r = runRush({ p1: 'gogeta_ssj4', id: 'primalCombo' });
      ok(r.used, 'primal used');
      eq(r.hits.join(' '), 'hitBody hitSideR hitBody hitBody hitHeavy', 'backfist, back kick, (the flick), knee, elbow drop');
      ok(r.poses.includes('gg_twoFinger'), 'the mocking flick');
      ok(r.lastFrom.dy > 1, 'the elbow dropped from above');
      r.gg.step(r.b, 90);
      eq(r.b.camera.shot, null);
    }
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'gogeta_ssj4', p2: 'goku', distance: 12 });
      const g = b.player;
      g.ki = g.kiMax;
      const shots = spyShots(b);
      ok(g._trySpecial('ultimate'));
      gg.until(b, () => g.state === 'free', 60 * 6);
      eq(shots.slice(0, 3).join(' '), 'ultimateChargeShot handShot wideShot', 'low, the hand, wide');
    }
  });

  test('Vegito: Final Kamehameha charged with the arms crossed, its own shots; the Spirit Sword\'s shots, and its blade gone the moment he is hit out of it', () => {
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'vegito', p2: 'goku', distance: 12 });
      const g = b.player;
      g.ki = g.kiMax;
      const shots = spyShots(b);
      ok(g._trySpecial('ultimate'));
      gg.step(b, 2);
      eq(g.sd.spec.poses.charge, 'vg_finalCross');
      gg.until(b, () => g.state === 'free', 60 * 6);
      eq(shots.slice(0, 3).join(' '), 'transformShot frontShot wideShot', 'round him, in front, wide');
    }
    {
      const r = runRush({ p1: 'vegito', id: null, slot: 'special1' });
      eq(r.shots.join(' '), 'rushTrackShot wideShot impact');
    }
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'vegito', p2: 'goku', distance: 8 });
      const g = b.player;
      g.ki = g.kiMax;
      let fill = null;
      const spf = g.model.setPropFill.bind(g.model);
      g.model.setPropFill = (id, k) => {
        if (id === 'spiritSword') fill = k;
        return spf(id, k);
      };
      ok(g._trySpecial('special1'));
      gg.until(b, () => g.sd.phase === 'combo', 60 * 2);
      ok(fill > 0.9, 'the blade out');
      g.setState('hitstun', { frames: 20 });
      eq(fill, 0, 'gone at once');
      eq(b.camera.shot, null, 'camera back');
    }
  });

  test('Final Flash tears a trench in the ground along its path to the impact (outside the story), once', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'vegeta', p2: 'goku', distance: 24 });
    const g = b.player;
    g.ki = g.kiMax;
    const cr = [];
    const crater = b.stage.crater.bind(b.stage);
    b.stage.crater = (p, r, ...x) => {
      cr.push(p.clone());
      return crater(p, r, ...x);
    };
    ok(g._trySpecial('ultimate'));
    gg.until(b, () => g.state === 'free', 60 * 6);
    const path = cr.filter((p) => Math.abs(p.z - g.pos.z) < 2 && p.x > g.pos.x + 1 && p.x < b.fighters[1].pos.x + 4);
    ok(path.length >= 5, 'craters along the path between them (' + path.length + ' of ' + cr.length + ')');
  });

  test('Instinct Surf (UI -Sign-): only with a beam coming at him; he rides it untouched to the shooter, flips over and fires point blank, ending the beam', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('top_jiren', { score: 1, rank: 'C' });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 22 });
    const g = b.player, v = b.fighters[1];
    toForm(g, 'uiSign');
    g.ki = g.kiMax;
    v.ki = v.kiMax;
    eq(entry(gg.SL, b, g, 'x:instinctSurf').locked, 'Needs a beam coming at you');
    eq(g._trySpecial('x:instinctSurf'), false, 'nothing to surf');
    ok(v._trySpecial('special1'), 'Vegeta fires a Galick Gun at him');
    gg.until(b, () => b.projectiles.beams.some((x) => x.owner === v && x.state !== 'fade'), 60 * 3);
    gg.step(b, 4);
    eq(entry(gg.SL, b, g, 'x:instinctSurf').locked, null, 'now it can be used');
    const shots = spyShots(b);
    let beamHit = 0, vHit = null;
    const takeG = g.takeHit.bind(g);
    g.takeHit = (att, h) => {
      if (att === v) beamHit++;
      return takeG(att, h);
    };
    const takeV = v.takeHit.bind(v);
    v.takeHit = (att, h) => {
      if (att === g) vHit = h.pose + ':' + h.type;
      return takeV(att, h);
    };
    const beam = b.projectiles.beams.find((x) => x.owner === v);
    ok(g._trySpecial('x:instinctSurf'), 'surf');
    eq(g.state, 'beamSurf');
    ok(g.intangible, 'the beam passes under him');
    gg.until(b, () => g.state !== 'beamSurf', 60 * 4);
    eq(beamHit, 0, 'the beam never touched him');
    eq(vHit, 'hitHeavy:ki', 'the point-blank shot lands');
    ok(beam.state === 'fade' || beam.done, 'his beam is over');
    eq(g.state, 'free');
    ok(!g.intangible, 'solid again');
    eq(shots.join(' '), 'rushTrackShot impact');
    gg.step(b, 90);
    eq(b.camera.shot, null, 'camera back');
  });

  test('Vegito Blue: never in the story, opens in Free Battle after The Final Battle; God Slicer\'s short blade; the Blue Final Kamehameha', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const blue = SL.data.characters.vegito.forms.find((f) => f.id === 'blue');
    ok(blue && !SL.formOpenFree(blue) && !SL.formStartFree(blue), 'not before top_finale');
    SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
    ok(SL.formOpenFree(blue) && SL.formStartFree(blue), 'opens after it');
    const st = gg.mission('buu_vegito');
    const v = st.fighters.find((f) => f.def.id === 'vegito');
    if (v) ok(v.lockedForms && v.lockedForms.blue, 'the story never offers it');
    const r = runRush({ p1: 'vegito', form: 'blue', missions: ['top_finale'], id: 'godSlicer', onFrame: (o) => {
      if (!o.spied) {
        o.spied = true;
        o.maxFill = 0;
        const spf = o.g.model.setPropFill.bind(o.g.model);
        o.g.model.setPropFill = (id, k) => {
          if (id === 'spiritSword') o.maxFill = Math.max(o.maxFill, k);
          return spf(id, k);
        };
      }
    } });
    ok(r.used, 'God Slicer used');
    eq(r.hits.join(' '), 'hitBody hitBody hitBack hitSideR hitHeavy', 'its cuts');
    ok(r.maxFill > 0.3 && r.maxFill <= 0.351, 'a short edge, not the Spirit Sword (' + r.maxFill.toFixed(2) + ')');
    const b = gg.battle({ p1: 'vegito', p2: 'goku' });
    toForm(b.player, 'blue');
    eq(b.player.resolveSpec(b.player.specFor('ultimate')).name, 'Final Kamehameha (Blue)');
    toForm(b.player, 'ssj');
    eq(b.player.resolveSpec(b.player.specFor('ultimate')).name, 'Final Kamehameha');
  });

  test('Vegito Blue\'s long rushes (the owner, plan 9.6): the Multi-Image Blitz and the Spirit Sword Drag play every step in order for over four seconds, with their impact frames, the drag\'s three ground bursts and a pillar on its circle broken; never snapped, given back when cut off, longer but not stronger; Blue and Free Battle only', () => {
    /** Per frame: the impact frames, the craters (how far from him), the most he is moved in one frame while held, the swing's reach. */
    const watch = (o) => {
      if (!o.spied) {
        o.spied = true;
        Object.assign(o, { n: 0, impacts: [], craters: [], maxStep: 0, reach: 0, prevT: o.t.pos.clone(), whip: 0 });
        const sl = o.b.vfx.slash.bind(o.b.vfx);
        o.b.vfx.slash = (...x) => (o.g.sd.swing && o.whip++, sl(...x));
        const SFX = o.gg.SL.ScreenFX, imp = SFX.impact.bind(SFX);
        SFX.impact = (k) => (o.impacts.push(k), imp(k));
        const st = o.b.stage, cr = st.crater.bind(st);
        st.crater = (p, ...a) => (o.craters.push(Math.hypot(p.x - o.t.pos.x, p.z - o.t.pos.z)), cr(p, ...a));
      }
      o.n++;
      const { g, t } = o;
      if (g.state === 'rush' && g.sd.phase === 'combo' && g.sd.hitIndex > 0) o.maxStep = Math.max(o.maxStep, t.pos.distanceTo(o.prevT));
      if (g.sd.swing) {
        o.reach = Math.max(o.reach, Math.hypot(t.pos.x - g.pos.x, t.pos.z - g.pos.z));
        o.swingFrames = (o.swingFrames || 0) + 1;
        // (the hit-stop as the drag begins holds the hooked blade a moment: only the frames the swing runs)
        if (!g.freeze && g.stateFrame > g.sd.swing.at && g.model.props.spiritSword.userData.fill.visible) o.bladeShown = true;
      }
      o.prevT.copy(t.pos);
    };
    const A = runRush({ p1: 'vegito', form: 'blue', missions: ['top_finale'], id: 'multiImageBlitz', seconds: 8, onFrame: watch });
    ok(A.used, 'Multi-Image Blitz used');
    eq(A.hits.join(' '), 'hitBody hitSideR hitHeavy hitBack ' + [0, 1, 2, 3].map(() => 'hitSideL hitSideR hitAirSpin').join(' ') + ' hitAirSpin', 'the jab and the palm at his left, the hammer from above, twelve kicks from under him, the finish');
    ok(A.n > 60 * 5.5, 'over five and a half seconds (' + (A.n / 60).toFixed(2) + ' s)');
    ok(A.lastFrom.dy < 0, 'the finish kicked up from under him');
    eq(A.impacts.join(' '), '1 0 1 0', 'two impact frames (the hammer, the finish), each one given back');
    eq(A.shots.join(' '), 'rushTrackShot wideShot pairShot pairShot pairShot wideShot', 'a shot for each phase; the finish frozen in the close one, then wide after him into the sky');
    ok(A.maxStep < 1, 'never snapped (' + A.maxStep.toFixed(2) + ' m in a frame)');
    ok(A.g.state === 'free' && A.t.state !== 'held', 'back to the fight');
    const D = runRush({ p1: 'vegito', form: 'blue', missions: ['top_finale'], id: 'spiritSwordDrag', onFrame: watch });
    ok(D.used, 'Spirit Sword Drag used');
    eq(D.hits.join(' '), 'hitBody hitBody tumble hitAirSpin', 'the hook, the drag, the cut that flings him off');
    ok(D.n > 60 * 4, 'over four seconds (' + (D.n / 60).toFixed(2) + ' s)');
    eq(D.craters.length, 3, 'on open ground: three ground bursts');
    ok(D.craters.every((d) => d < 0.1), 'each one under him, where the drag has him');
    ok(D.reach > 4.6 && D.reach < 5, 'dragged round on the end of the long blade (' + D.reach.toFixed(2) + ' m)');
    ok(D.maxStep < 1, 'carried out to the end of the blade, not snapped there (' + D.maxStep.toFixed(2) + ' m in a frame)');
    ok(!D.bladeShown && D.whip >= D.swingFrames * 10, 'through the drag the straight blade gives way to a whip of ki drawn every frame (' + D.whip + ' pieces over ' + D.swingFrames + ' frames)');
    eq(D.impacts.join(' '), '1 0', 'the impact frame on the last cut, given back');
    eq(D.shots.join(' '), 'rushTrackShot pairShot swingShot impact wideShot', 'the drag followed round, the cut, then wide after him into the sky');
    eq(D.g.model.props.spiritSword.scale.y, 1, 'the blade back to its own length');
    // a pillar on the circle goes to pieces (the bursts still play)
    {
      const gg = H.create({ quiet: true, seed: 3 });
      gg.SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
      const b = gg.battle({ p1: 'vegito', p2: 'goku', distance: 8 });
      const g = b.player, t = b.fighters[1], st = b.stage;
      const o = st.obstacles.filter((x) => x.alive && !x.fixture && x.hp < 1e8).sort((x, y) => Math.hypot(x.x, x.z) - Math.hypot(y.x, y.z))[0];
      g.setPosition(new gg.V3(o.x + 4.8, st.heightAt(o.x + 4.8, o.z), o.z));
      t.setPosition(new gg.V3(o.x + 10.8, st.heightAt(o.x + 10.8, o.z), o.z));
      g.faceTarget(100);
      toForm(g, 'blue');
      g.ki = g.kiMax;
      ok(g._trySpecial('x:spiritSwordDrag'), 'used beside a pillar');
      gg.until(b, () => g.state !== 'rush', 60 * 6);
      ok(!o.alive, 'the pillar on his circle broken');
    }
    // cut off mid-swing: he lets go, the blade and the camera are given back
    {
      const gg = H.create({ quiet: true, seed: 3 });
      gg.SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
      const b = gg.battle({ p1: 'vegito', p2: 'goku', distance: 8 });
      const g = b.player, t = b.fighters[1];
      toForm(g, 'blue');
      g.ki = g.kiMax;
      g._trySpecial('x:spiritSwordDrag');
      gg.until(b, () => !!g.sd.swing, 60 * 3);
      gg.step(b, 20);
      g.takeHit(t, { type: 'melee', damage: 400, knock: 'heavy', knockSpeed: 20, hitstun: 30, impact: 3, dir: t.forward.clone(), pose: 'hitHeavy' });
      gg.step(b, 5);
      ok(g.state !== 'rush' && t.state !== 'held', 'the rush ends and he is let go');
      eq(g.model.props.spiritSword.scale.y, 1, 'the blade back to its own length');
      ok(!g.cine && !b.camera.shot, 'the camera given back at once');
    }
    // longer, not stronger: neither deals more than his Spirit Sword rush in the same form
    const dealt = (slot) => {
      const gg = H.create({ quiet: true, seed: 3 });
      gg.SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
      const b = gg.battle({ p1: 'vegito', p2: 'goku', distance: 8, p2InfiniteHp: false });
      const g = b.player, t = b.fighters[1];
      toForm(g, 'blue');
      g.ki = g.kiMax;
      t.hpMax = t.hp = 1e6;
      ok(g._trySpecial(slot), slot + ' used');
      gg.until(b, () => g.state !== 'rush', 60 * 8);
      return 1e6 - t.hp;
    };
    const sword = dealt('special1');
    for (const id of ['multiImageBlitz', 'spiritSwordDrag']) {
      const d = dealt('x:' + id);
      ok(d > 0 && d <= sword, id + ' deals ' + Math.round(d) + ', the Spirit Sword ' + Math.round(sword));
    }
    // Blue only, earned with top_finale, never in the story
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'vegito', p2: 'goku' });
    toForm(b.player, 'blue');
    for (const id of ['multiImageBlitz', 'spiritSwordDrag']) ok(!entry(SL, b, b.player, 'x:' + id), id + ': not offered before top_finale');
    SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
    for (const id of ['multiImageBlitz', 'spiritSwordDrag']) eq(entry(SL, b, b.player, 'x:' + id).locked, null, id + ': earned, in Blue');
    toForm(b.player, 'ssj');
    for (const id of ['multiImageBlitz', 'spiritSwordDrag']) eq(entry(SL, b, b.player, 'x:' + id).locked, 'Needs Super Saiyan Blue', id + ': Blue only');
    const story = gg.mission('ft_vegito');
    for (const id of ['multiImageBlitz', 'spiritSwordDrag']) eq(story.player.extraLock(SL.data.characters.vegito.extras.find((x) => x.id === id)), 'hidden', id + ': hidden in the story');
  });

  test('the roster rush audit (2026-10-18, plan 9.8): a watched rush keeps its cinematic camera from the first shot to the finish (hit-stop used to outrun the shots: up to 34 frames of gameplay camera mid-rush in 21 rushes), and the one caught is drawn in to the blows, not yanked there in one frame', () => {
    /** Frames of a watched rush (dash and blows, not frozen) with no shot playing after the first one began; the most the held one moves in a frame. */
    const watch = (o) => {
      if (!o.spied) Object.assign(o, { spied: true, gap: 0, seen: false, maxCatch: 0, prevT: o.t.pos.clone() });
      const { g, t, b } = o;
      if (g.state === 'rush' && g.cine && g.cine.watch && ['dash', 'combo'].includes(g.sd.phase)) {
        if (b.camera.shot) o.seen = true;
        else if (o.seen && !g.freeze) o.gap++;
      }
      if (g.state === 'rush' && g.sd.phase === 'combo' && g.sd.hitIndex === 0) o.maxCatch = Math.max(o.maxCatch, t.pos.distanceTo(o.prevT));
      o.prevT.copy(t.pos);
    };
    for (const [p1, form, id, mission] of [['goku', 'ssj3', 'superDragonTwinFist', 'buu_kidbuu'], ['vegeta', 'majin', 'atomicRush', 'buu_pride'], ['vegito', 'base', 'spiritSword', null]]) {
      const r = runRush({ p1, form, id, missions: mission ? [mission] : [], slot: mission ? null : 'special1', onFrame: watch });
      ok(r.used && r.hits.length > 2, id + ' used');
      eq(r.gap, 0, id + ': no gameplay camera between its shots');
      r.gg.step(r.b, 90);
      eq(r.b.camera.shot, null, id + ': the camera given back once it is over');
    }
    // the biggest catch in the roster (Hirudegarn's claw: 1.41 m in one frame before)
    const r = runRush({ p1: 'hirudegarn', id: 'hgClaw', distance: 5, onFrame: watch });
    ok(r.used && r.hits.length === 4, 'Hirudegarn\'s claw lands its three blows');
    ok(r.maxCatch < 0.6, 'drawn in over a few frames (' + r.maxCatch.toFixed(2) + ' m in a frame at most)');
  });

  test('Prince of Saiyans: the energy rings pinning Goku, the close blows and the headbutt are staged after Babidi is thrown out; the mission still plays to the end, watched or skipped', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      let rings = 0, scene = false;
      const r = gg.playMission('buu_pride', { watch, onBattle: (b) => {
        const rg = b.vfx.ring.bind(b.vfx);
        b.vfx.ring = (p, rad, c, ...x) => {
          if (c === 0xffd23a) rings++;
          return rg(p, rad, c, ...x);
        };
        const play = gg.SL.Cinema.play;
        gg.SL.Cinema.play = function (m, id, ...x) {
          if (id === 'pride_rings') scene = true;
          return play.call(this, m, id, ...x);
        };
      } });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      ok(scene, 'the rings scene is reached');
      if (watch) ok(rings >= 40, 'the rings on his wrists and ankles (' + rings + ')');
    }
  });

  test('Future Trunks Saga, mission 1 "The Dark Goku": Chapter 19 between Universe 6 and The Assassin; the portal, the blade, the hold-off, the escape — won watched or skipped', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const chs = SL.data.story.chapters, i = chs.findIndex((c) => c.id === 'super_future');
    eq(chs[i - 1].id + ',' + chs[i + 1].id, 'super_u6,super_hit', 'the chapter between Universe 6 and The Assassin');
    ok(/^CHAPTER 19/.test(chs[i].head) && /^CHAPTER 20/.test(chs[i + 1].head), 'Chapter 19; The Assassin is now 20');
    const order = SL.data.storyOrder();
    eq(order.slice(order.indexOf('u6_goku_hit'), order.indexOf('u6_goku_hit') + 3).join(','), 'u6_goku_hit,ft_black,ft_rose');
    const un = (id) => SL.data.unlocks.find((u) => u.target === id);
    for (const id of ['goku_black', 'zamasu']) ok(JSON.stringify(un(id).condition).includes('ft_black') && /Dark Goku/.test(un(id).hint), id + ' opens after The Dark Goku (a save past The Contract keeps it)');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      let blade = 0, bolts = 0;
      const r = gg.playMission('ft_black', { watch, onBattle: (b) => {
        const sb = b.vfx.skyBolt.bind(b.vfx);
        b.vfx.skyBolt = (...a) => (bolts++, sb(...a));
        const bk = b.story && b.story.black;
        if (bk && bk.model.setPropFill) {
          const spf = bk.model.setPropFill.bind(bk.model);
          bk.model.setPropFill = (id, k) => ((blade = Math.max(blade, id === 'blackBlade' ? k : 0)), spf(id, k));
        }
      } });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      ok(r.b.story.trunks.hidden, 'Trunks is gone into the past');
      ok(r.m.flags.portal && !r.b.scene.children.some((o) => o.isGroup && o.children.some((c) => c.geometry && c.geometry.type === 'TorusGeometry' && c.geometry.parameters.radius === 3.3)), 'the portal opened, and is gone again');
      if (watch) ok(blade >= 1 && bolts >= 3, 'the blade grows out of his hand (' + blade + '), dark lightning (' + bolts + ')');
      if (watch) ok(r.m.flags.earTouch && r.m.flags.handStudy, 'Roadmap Three BLK-S01 / S02: he sets the earring straight as the lens reaches his face, then the hand study');
    }
  });

  test('Goku Black\'s Divine Scythe (Roadmap Three, the Goku Black arc research CS-SCY-01 / CLN-S01 / section 6; the overnight brief 2026-10-19): Rosé only, Free Battle after "The Divine Scythe"; the swing cuts an arc in the air (not a shot), the tear it leaves spills two smoke clones that come apart and re-form behind whoever strikes them, then go back into smoke; a knockout ends them at once; nothing left behind', () => {
    const SLOT = 'x:divineScythe';
    function duel(o = {}) {
      const gg = H.create({ quiet: true, seed: 3 });
      if (o.cleared !== false) gg.SL.Save.completeMission('ft_scythe', { score: 1, rank: 'C' });
      const b = gg.battle({ p1: 'goku_black', p2: 'goku', distance: 4 });
      const bk = b.player, v = b.fighters.find((f) => f !== bk);
      toForm(bk, o.form || 'rose');
      bk.ki = bk.kiMax;
      gg.step(b, 10);
      bk.target = v;
      v.controller = { update: () => gg.SL.emptyIntent() };
      const sp = bk.def.extras.find((x) => x.id === 'divineScythe');
      return { gg, b, bk, v, sp };
    }
    const left = (b) => b.scene.children.filter((c) => c.isGroup && c.children.some((m) => m.geometry && m.geometry.type === 'ShapeGeometry' && m.material && m.material.color && m.material.color.getHex() === 0x0c0206)).length;
    // gating
    const { SL } = H.create({ quiet: true, seed: 3 });
    const spec = SL.data.characters.goku_black.extras.find((x) => x.id === 'divineScythe');
    ok(spec && spec.forms.join() === 'rose' && spec.freeUnlock.join() === 'ft_scythe' && spec.freeOnly, 'Rosé only, Free Battle only, after "The Divine Scythe"');
    let d = duel({ cleared: false });
    eq(d.bk.extraLock(d.sp), 'hidden', 'before the mission: not on the wheel');
    d = duel({ form: 'base' });
    ok(/Ros/.test(d.bk.extraLock(d.sp) || ''), 'in the base form: needs Rosé');
    // the cast
    d = duel();
    const { gg, b, bk, v, sp } = d;
    const ev = [], hits = [];
    let booms = 0;
    b.on('scytheClones', (e) => ev.push(e.stage));
    b.on('damage', (e) => e.attacker === bk && hits.push(e.source || e.type));
    const shots = b.projectiles.list.length;
    ok(bk._trySpecial(SLOT), 'it starts');
    ok(bk.state === 'divineScythe' && bk.ki === bk.kiMax - sp.kiCost, 'in the technique; its ki paid');
    gg.until(b, () => ev.includes('start'), 200);
    ok(hits.length >= 1, 'the swing cut him (' + hits.join() + ')');
    eq(b.projectiles.list.length, shots, 'no projectile: the arc is a cut in the air');
    const clones = b.fighters.filter((f) => f.isClone);
    ok(clones.length === sp.clones && clones.every((c) => c.team === bk.team && c.form.id === 'rose' && c.model._pupilS === 0.04 && c.summonedBy === bk), 'two smoke clones: his team, Rosé, the hollow silver eyes');
    eq(left(b), 1, 'the tear hangs in the air');
    // struck: it comes apart and stands again behind the one who struck it
    const c = clones[0];
    let reform = null;
    b.on('swarmReform', (e) => (reform = e));
    v.yaw = v.prevYaw = Math.atan2(c.pos.x - v.pos.x, c.pos.z - v.pos.z);
    b.emit('damage', { target: c, attacker: v, amount: 100, type: 'melee' });
    gg.step(b, 3);
    ok(c.hidden && c.untargetable, 'struck: it comes apart into smoke');
    gg.step(b, sp.reform + 2);
    ok(reform && reform.clone === c && reform.by === v && !c.hidden, 'and stands again, behind the one who struck it');
    // their time runs out: back into smoke, gone from the fight, the tear closed
    gg.step(b, Math.round(sp.cloneSeconds * 60) + 60);
    ok(ev.includes('end') && !b.fighters.some((f) => f.isClone), 'their time out: gone from the fight');
    eq(left(b), 0, 'the tear closed and gone');
    eq(gg.errors.length, 0, 'no engine errors');
    // a knockout while they are out: they go at once and the fight is decided
    {
      const d2 = duel();
      d2.bk._trySpecial(SLOT);
      const e2 = [];
      d2.b.on('scytheClones', (e) => e2.push(e.stage));
      d2.gg.until(d2.b, () => e2.includes('start'), 200);
      d2.v.alive = false;
      d2.b.onKO(d2.v, d2.bk);
      ok(e2.includes('end') && d2.b.fighters.filter((f) => f.isClone).every((f) => !f.alive), 'a knockout: the clones end at once');
      d2.gg.step(d2.b, 3);
      ok(!d2.b.fighters.some((f) => f.isClone), 'and are out of the fight a tick later');
      eq(d2.b.phase, 'ko', 'the fight is decided (the clones never count for a team)');
      eq(d2.gg.errors.length, 0, 'knockout: no engine errors');
    }
    // hit out of the wind-up: nothing of it left
    {
      const d3 = duel();
      d3.bk._trySpecial(SLOT);
      d3.gg.step(d3.b, 8);
      d3.bk.takeHit(d3.v, { type: 'melee', damage: 300, knock: 'flinch', hitstun: 20, impact: 1, dir: d3.v.dirTo(d3.bk), point: d3.bk.chest() });
      d3.gg.step(d3.b, 30);
      ok(d3.bk.state !== 'divineScythe' && !d3.b.fighters.some((f) => f.isClone), 'interrupted: no swing, no clones');
      const blades = d3.b.scene.children.filter((o) => o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.045).length;
      eq(blades, 0, 'and the scythe gone');
    }
  });

  test('Future Trunks\' Mafuba in Free Battle (Roadmap Three, the Goku Black arc research CS-MAF-01 / section 6; the overnight brief 2026-10-19): after "The Divine Scythe"; the jar, the wind, the catch (a guard does not stop it, a dodge does, nobody out of reach); the quick-time pull — Light presses bring him in faster; sealed, no talisman, the burst: hurt, his ki and most of his stamina gone; nothing left behind', () => {
    const SLOT = 'x:mafuba';
    function duel(o = {}) {
      const gg = H.create({ quiet: true, seed: 3 });
      if (o.cleared !== false) gg.SL.Save.completeMission('ft_scythe', { score: 1, rank: 'C' });
      const b = gg.battle({ p1: 'future_trunks', p2: 'goku', distance: o.distance || 6 });
      const tr = b.player, v = b.fighters.find((f) => f !== tr);
      tr.ki = tr.kiMax;
      gg.step(b, 10);
      tr.target = v;
      v.controller = { update: () => gg.SL.emptyIntent() };
      const ev = [];
      b.on('mafuba', (e) => ev.push(e.stage));
      const sp = tr.def.extras.find((x) => x.id === 'mafuba');
      return { gg, b, tr, v, ev, sp };
    }
    const props = (b) => b.scene.children.filter((c) => c.isGroup && c.children.some((m) => m.geometry && (m.geometry.type === 'LatheGeometry' || m.geometry.type === 'TorusGeometry'))).length;
    // gating
    const { SL } = H.create({ quiet: true, seed: 3 });
    const spec = SL.data.characters.future_trunks.extras.find((x) => x.id === 'mafuba');
    ok(spec && spec.freeUnlock.join() === 'ft_scythe' && spec.freeOnly && !spec.forms, 'Free Battle only, after "The Divine Scythe", any form');
    let d = duel({ cleared: false });
    eq(d.tr.extraLock(d.sp), 'hidden', 'before the mission: not on the wheel');
    // the whole of it, with nobody pressing
    const run = (mash) => {
      const x = duel();
      const ki0 = x.tr.ki;
      ok(x.tr._trySpecial(SLOT), 'it starts');
      ok(x.tr.state === 'mafuba' && x.tr.ki === ki0 - x.sp.kiCost, 'its ki paid');
      if (mash) x.tr.controller = { update: () => Object.assign(x.gg.SL.emptyIntent(), { light: x.b.frame % 4 < 2 }) };
      let lockAt = -1, sealAt = -1, held = 0, small = 1, meter = 0, hidden = 0;
      x.b.on('struggle', (e) => e.active && meter++);
      for (let i = 0; i < 600 && !x.ev.includes('burst'); i++) {
        x.gg.step(x.b, 1);
        if (lockAt < 0 && x.ev.includes('lock')) lockAt = x.b.frame;
        if (sealAt < 0 && x.ev.includes('seal')) sealAt = x.b.frame;
        if (x.v.state === 'held') held++;
        if (x.v.hidden) hidden++;
        small = Math.min(small, x.v.model.root.scale.x / x.v.model.baseScale);
      }
      x.vKi = x.v.ki;
      x.vSt = x.v.stamina / x.v.staminaMax;
      x.pull = sealAt - lockAt;
      x.held = held;
      x.small = small;
      x.meter = meter;
      x.hidden = hidden;
      x.gg.step(x.b, 90);
      return x;
    };
    const a = run(false), m = run(true);
    eq(a.ev.join(','), 'start,lock,seal,burst', 'the jar, the catch, the seal, the burst');
    ok(a.held > a.sp.pullFrames * 0.8 && a.small < 0.2 && a.hidden >= a.sp.sealFrames - 2, 'held through the pull, drawn into the neck (last visible frame ' + a.small.toFixed(2) + ' of his size), sealed inside (' + a.held + ' held, ' + a.hidden + ' sealed)');
    ok(a.meter > 60, 'the quick-time meter is up while he is pulled in (' + a.meter + ' ticks)');
    ok(m.pull < a.pull * 0.7, 'mashing Light brings him in faster (' + m.pull + ' vs ' + a.pull + ' frames)');
    ok(a.vKi < 1 && a.vSt <= 0.31, 'no talisman: he comes out of it with no ki and most of his stamina gone (' + a.vKi.toFixed(1) + ', ' + a.vSt.toFixed(2) + ')');
    ok((a.v.stats.damageTaken || 0) > 3000, 'and hurt (' + Math.round(a.v.stats.damageTaken || 0) + ')');
    ok(!a.v.hidden && Math.abs(a.v.model.root.scale.x - a.v.model.baseScale) < 1e-6 && a.v.state !== 'held', 'out of it at his own size, free');
    eq(props(a.b), 0, 'the jar and the wind are gone');
    eq(a.gg.errors.length + m.gg.errors.length, 0, 'no engine errors');
    // through a guard; dodged; out of reach; interrupted
    d = duel();
    d.v.controller = { update: () => Object.assign(d.gg.SL.emptyIntent(), { guard: true }) };
    d.gg.step(d.b, 5);
    const guarding = d.v.state === 'guard';
    d.tr._trySpecial(SLOT);
    d.gg.step(d.b, 70);
    ok(guarding && d.ev.includes('lock'), 'a guard (held all the way) does not stop the catch');
    d = duel();
    d.tr._trySpecial(SLOT);
    d.gg.step(d.b, d.sp.setFrames + d.sp.stanceFrames - 2);
    d.v.invuln = 30;
    d.gg.step(d.b, 70);
    ok(d.ev.includes('miss') && !d.ev.includes('lock') && props(d.b) === 0, 'dodged: missed, nothing left');
    d = duel({ distance: 30 });
    const ki0 = d.tr.ki;
    eq(d.tr._trySpecial(SLOT), false, 'out of reach: it does not start');
    eq(d.tr.ki, ki0, 'and costs nothing');
    d = duel();
    d.tr._trySpecial(SLOT);
    d.gg.step(d.b, 6);
    d.tr.takeHit(d.v, { type: 'melee', damage: 300, knock: 'flinch', hitstun: 20, impact: 1, dir: d.v.dirTo(d.tr), point: d.tr.chest() });
    d.gg.step(d.b, 30);
    ok(d.tr.state !== 'mafuba' && !d.ev.includes('lock') && props(d.b) === 0, 'hit while setting the jar down: stopped, nothing left');
  });

  test('Beerus\' Hakai in Free Battle (2026-10-19, the Goku Black arc research CS-HAK-01): the last blow does not explode — violet light over him and dust climbing off him from the feet up, then let go; the damage is unchanged in kind', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'beerus', p2: 'goku', distance: 3 });
    const bs = b.player, v = b.fighters.find((f) => f !== bs);
    v.controller = { update: () => gg.SL.emptyIntent() };
    bs.ki = bs.kiMax;
    gg.step(b, 10);
    bs.target = v;
    let booms = 0, lights = 0, tinted = 0;
    const ex = b.vfx.explosion.bind(b.vfx);
    b.vfx.explosion = (...a) => (booms++, ex(...a));
    b.on('hakaiLight', (e) => e.fighter === v && lights++);
    ok(bs._trySpecial('ultimate'), 'Hakai starts');
    for (let i = 0; i < 360; i++) {
      gg.step(b, 1);
      if (v.model.tintAmount > 0.05) tinted++;
    }
    eq(lights, 1, 'the last blow is Hakai\'s light, once');
    eq(booms, 0, 'no explosion anywhere in it');
    ok(tinted >= 30 && tinted <= 60, 'violet light over him for under a second (' + tinted + ' frames)');
    ok(v.model.tintAmount < 0.01, 'and let go after');
    ok((v.stats.damageTaken || 0) > 5000, 'it still hurts (' + Math.round(v.stats.damageTaken || 0) + ' taken)');
    eq(b.camera.shot, null, 'camera back');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('Future Trunks Saga, "Hakai" (Roadmap Three, Goku Black arc research CS-HAK-01 / HAK-S01): between the trips, the blade over the sleeping master, the wrist caught (a cue), the silence, Hakai (a cue) — he does not explode: he comes apart from the feet up; won watched or skipped, nothing left behind', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const order = SL.data.storyOrder();
    eq(order.indexOf('ft_hakai'), order.indexOf('ft_rose') + 1, 'canon order: right after Rosé (the first trip)');
    eq(order.indexOf('ft_zero'), order.indexOf('ft_hakai') + 1, 'and right before Zero Mortals (the second)');
    const res = (ids) => (id) => (ids.includes(id) ? { completed: true } : null);
    const old = res(['ft_black', 'ft_rose', 'ft_zero', 'ft_genuine']);
    ok(!SL.data.storyLocked('ft_zero', old) && !SL.data.storyLocked('ft_genuine', old) && !SL.data.storyLocked('ft_hakai', old), 'old save (through A Genuine Saiyan): nothing it had is locked again; Hakai open');
    eq(SL.data.missions.ft_hakai.character, 'beerus');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const w = watch ? 'watched' : 'skipped';
      const s = { prog: [], booms: 0, cues: [] };
      const r = gg.playMission('ft_hakai', { watch, onBattle: (b) => {
        b.on('cueDone', (e) => s.cues.push(e.key));
        const ex = b.vfx.explosion.bind(b.vfx);
        b.vfx.explosion = (...a) => {
          const ph = b.mission && b.mission.def.phases[b.mission.phaseIndex];
          if (ph && ph.id === 'hakai') s.booms++;
          return ex(...a);
        };
        b.onTick(() => {
          const er = b.story && b.story.erasure;
          if (er && !er.done()) s.prog.push(er.progress());
          return true;
        });
      } });
      const F = r.m.flags, S = r.b.story;
      eq(r.state, 'success', w + ': won');
      eq(gg.errors.length, 0, w + ': no engine errors');
      eq(s.cues.join(','), 'light,ult', w + ': the player\'s beats — the wrist, then the word');
      ok(F.bladeRaised && F.wristCaught && F.silence && F.hakai && F.erased && F.gone, w + ': the blade raised, the wrist caught, the silence, Hakai, the erasure, gone');
      eq(s.booms, 0, w + ': he does not explode');
      if (watch) ok(s.prog.length >= 140 && s.prog.every((v, i) => i === 0 || v >= s.prog[i - 1]), w + ': the erasure climbs from the feet up, never back, for about 2.6 s (' + s.prog.length + ' frames)');
      ok(S.zamasu.hidden && S.zamasu.untargetable, w + ': Zamasu gone');
      let left = 0;
      r.b.scene.traverse((o) => o.userData && o.userData.erased && left++);
      eq(left, 0, w + ': nothing of the dissolving body left in the scene');
      eq(r.m.tickHooks.length, 0, w + ': no scene hooks left');
      eq(r.b.camera.shot, null, w + ': camera back');
    }
    // quitting halfway through the erasure: nothing left
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('ft_hakai', { startPhase: 0 });
      gg.until(b, () => b.story.erasure && b.story.erasure.progress() > 0.3, 60 * 60, () => {
        if (b.inputLocked) b.skipRequested = false;
        if (b.cue) b.mission.player.intent[b.cue.key] = true;
      });
      ok(b.story.erasure && !b.story.erasure.done(), 'mid-erasure');
      b.dispose();
      let left = 0;
      b.scene.traverse((o) => o.userData && o.userData.erased && left++);
      ok(left === 0 && b.story.erasure.done(), 'quit mid-erasure: the dissolving body is gone with the battle');
      eq(gg.errors.length, 0, 'quit mid-erasure: no engine errors');
    }
  });

  test('Future Trunks Saga, mission 2 "Rosé": after The Dark Goku; Blue Goku against Black, then Rosé; the blade, the throw through a building, back to the past — won watched or skipped', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const order = SL.data.storyOrder();
    eq(order.indexOf('ft_rose'), order.indexOf('ft_black') + 1, 'canon order: right after The Dark Goku');
    eq(SL.data.missions.ft_rose.character, 'goku');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      let downs = 0;
      const r = gg.playMission('ft_rose', { watch, onBattle: (b) => {
        b.on('buildingDown', () => downs++);
      } });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      const S = r.b.story;
      ok(r.m.flags.rose && S.black.form.id === 'rose', 'Black turned Rosé');
      ok(r.m.flags.stabbed, 'the blade');
      ok(S.goku.hidden && S.vegeta.hidden, 'Goku and Vegeta gone back to the past');
      ok(r.m.qteParts.length === 2, 'two played stretches (' + r.m.qteParts.length + ')');
      // Roadmap Three (research draft BT-BLK-02): the present-day clash opens it, then the trip to the future
      ok(r.m.flags.present && r.m.flags.presentClash, 'the present-day clash plays (or is skipped through)');
      eq(r.b.stage.def.id, 'future_ruins', 'the rest of it happens in the future');
      // Roadmap Three (research draft BT-BLK-04): the first cut fells a building across the street before the thrust
      if (watch) ok(r.m.flags.firstCut, 'the first cut, behind him, blocked');
      if (watch) ok(r.m.flags.bladeWhip, 'BLK-S04: the lens whips round after the blade');
      if (watch) ok(downs === 1 + (r.m.flags.cutBuilding ? 1 : 0) && r.m.flags.building, 'thrown through one building, plus the one the first cut fells (' + downs + ')');
      if (watch) ok(S.black.form.id === 'rose' && r.m.flags.transformed, 'the Rosé change staged');
      eq(r.b.camera.shot, null, 'camera back');
    }
  });

  /** Metres from the battle camera to the nearest building box on the ground plan (instanced box size, not the collision cylinder). */
  function lensClear(b) {
    const cam = b.camera.camera, c = cam.position, m4 = cam.matrix.clone(), p = c.clone(), s = c.clone(), q = cam.quaternion.clone();
    let best = Infinity;
    for (const o of b.stage.obstacles) {
      if (!o.alive || !o.building || !o.building.mesh) continue;
      o.building.mesh.getMatrixAt(o.building.index, m4);
      m4.decompose(p, q, s);
      best = Math.min(best, Math.hypot(Math.max(0, Math.abs(c.x - o.x) - s.x / 2), Math.max(0, Math.abs(c.z - o.z) - s.z / 2)));
    }
    return best;
  }

  test('Future Trunks Saga, "Zero Mortals" (Roadmap Three, Goku Black arc research): the confession, the rage, the Divine Lasso, Trunks\' Super Saiyan Rage, the hold, the retreat — won watched or skipped', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const order = SL.data.storyOrder();
    eq(order.indexOf('ft_zero'), order.indexOf('ft_hakai') + 1, 'canon order: right after Hakai (the second trip; Hakai added 2026-10-19 between the trips)');
    eq(SL.data.missions.ft_zero.character, 'goku');
    ok(SL.data.dialogue.speakers.goku_black === 'Goku Black' && SL.data.dialogue.speakers.zamasu === 'Zamasu' && SL.data.dialogue.speakers.fused_zamasu === 'Fused Zamasu', 'Chapter 19 subtitles name Black and Zamasu (not their ids)');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const rage = { seen: 0, armorBad: 0, kiBad: 0, after: null };
      const r = gg.playMission('ft_zero', { watch, onBattle: (b) => {
        b.onTick(() => {
          const ph = b.mission && b.mission.def.phases[b.mission.phaseIndex];
          if (ph && ph.id === 'rage' && !b.inputLocked) {
            const g = b.story.goku;
            rage.seen++;
            if (g.storyArmor !== 1) rage.armorBad++;
            if (g.ki < g.kiMax) rage.kiBad++; // sampled after the fighters' update: a spend shows here
          } else if (ph && ph.id === 'lasso' && !rage.after) {
            rage.after = { armor: b.story.goku.storyArmor, inf: b.story.goku.infiniteKi };
          }
          if (b.mission && b.mission.flags.detonation && !rage.lens && (rage.det = (rage.det || 0) + 1) > 40) rage.lens = lensClear(b);
          return true;
        });
      } });
      const w = watch ? 'watched' : 'skipped', F = r.m.flags, S = r.b.story;
      eq(r.state, 'success', w + ': the mission is won');
      eq(gg.errors.length, 0, w + ': no engine errors');
      ok(F.confession && F.silence && F.eyesUp && F.roar, w + ': BT-RAGE-01 — the confession, the silence, the eyes, the roar');
      ok(rage.seen > 0, w + ': the rage stretch is played (' + rage.seen + ' frames)');
      eq(rage.armorBad, 0, w + ': light-blow armour (storyArmor 1) on every played frame of the rage');
      eq(rage.kiBad, 0, w + ': ki locked full on every played frame of the rage, spends included (BT-RAGE-01 phase C)');
      ok(rage.after && rage.after.armor === undefined && !rage.after.inf, w + ': armour and the ki lock given back as the Divine Lasso starts');
      ok(S.goku.storyArmor === undefined && !S.goku.infiniteKi, w + ': and still given back at the end');
      if (watch) ok(F.burnOut, w + ': the bridge out of the played rage — the Blue aura sputtering as it burns out');
      ok(F.crescent && F.needles === 9 && F.pinned && F.detonation, w + ': the Divine Lasso — crescent, needles, held, detonation');
      if (watch) ok(F.glass >= 1, w + ': DL-S04 — the nearest walls throw out glass (' + F.glass + ')');
      if (watch) ok(rage.lens > 8, w + ': DL-S04 — the pulled-back lens is clear of every building (' + (rage.lens || 0).toFixed(1) + ' m to the nearest box)');
      ok(F.gokuDown && S.goku.form.id === 'base', w + ': Goku down, out of Blue');
      ok(F.trunksSteps && F.trunksRage && F.pushedBack && S.trunks.form.id === 'rage', w + ': Trunks steps in; Super Saiyan Rage; both pushed back');
      eq(S.trunks.model._pupilS || 1, 1, w + ': Trunks\' eyes given back after the awakening');
      ok(S.goku.model.face.eyes.every((e) => e.visible), w + ': Goku\'s eyes out of the shadow');
      ok(F.retreat && S.goku.hidden && S.vegeta.hidden, w + ': Vegeta takes Goku back to the past');
      eq(r.m.qteParts.length, 2, w + ': two played stretches');
      eq(r.m.tickHooks.length, 0, w + ': no scene hooks left running');
      ok(!r.b.scene.children.some((o) => o.isMesh && o.geometry && (o.geometry.type === 'ShapeGeometry' || (o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 0.022))), w + ': the crescent and the needles are gone');
      eq(r.b.camera.shot, null, w + ': camera back');
    }
    // DL-S04 from the Lasso's own start (Goku where setup puts him, near the square's centre): the pull-back must find open
    // street — the old fixed 40 m lens ended 5 m from a tower there
    const gl = H.create({ quiet: true, seed: 3 });
    const bl = gl.mission('ft_zero', { startPhase: SL.data.missions.ft_zero.phases.findIndex((p) => p.id === 'lasso') });
    let det = 0;
    gl.until(bl, () => bl.mission.flags.detonation && ++det > 40, 60 * 40);
    const lens = lensClear(bl);
    ok(det > 40 && lens > 8, 'Lasso from its start: the detonation lens is clear of every building (' + lens.toFixed(1) + ' m)');
    bl.dispose();
    // an early exit mid-rage (the player quits from the rage checkpoint): the battle is disposed and the rage state goes with it
    const gq = H.create({ quiet: true, seed: 3 });
    const bq = gq.mission('ft_zero', { startPhase: SL.data.missions.ft_zero.phases.findIndex((p) => p.id === 'rage') });
    gq.until(bq, () => !bq.inputLocked, 60 * 30);
    const gk = bq.story.goku;
    ok(!bq.inputLocked && gk.storyArmor === 1 && gk.infiniteKi === true, 'rage checkpoint: in play with the armour and the ki lock');
    bq.dispose();
    ok(gk.storyArmor === undefined && gk.infiniteKi === false, 'quit mid-rage: armour and ki lock given back on dispose');
    eq(gq.errors.length, 0, 'quit mid-rage: no engine errors');
  });

  test('Super Saiyan Rage\'s aura in two layers (Roadmap Three, Goku Black arc research): a gold flame inside a blue shell — only on Rage, gone with the form, disposed with the battle; both story missions end on it', () => {
    const { SL, THREE } = H.create({ quiet: true, seed: 3 });
    const C = (hex) => new THREE.Color(hex);
    const rage = SL.data.characters.future_trunks.forms.find((x) => x.id === 'rage');
    const outer = C(rage.aura.color), inner = rage.aura.inner && C(rage.aura.inner.color);
    ok(outer.b > outer.r && outer.b > outer.g, 'the outer shell is blue (god ki)');
    ok(inner && inner.r > inner.b && inner.g > inner.b, 'the inner shell is gold (the Super Saiyan flame)');
    ok(rage.aura.inner.scale < 0.85 && rage.aura.inner.alpha <= 0.9, 'the gold sits inside the blue and is not brighter than it is allowed to be');
    for (const f of SL.data.characters.future_trunks.forms) if (f.id !== 'rage') ok(!(f.aura && f.aura.inner), 'no other Trunks form has the gold layer: ' + f.id);
    // a battle: the layer comes on with the form and goes with it; the other fighter never gets it
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'future_trunks', p2: 'goku' });
    const tr = b.player, other = b.fighters.find((f) => f !== tr);
    toForm(tr, 'rage');
    gg.step(b, 20);
    const A = tr.aura;
    ok(A.inner && A.inner.visible && A.inner.parent === A.group, 'Rage: the inner shell is on, in the aura\'s own group (it follows him)');
    ok(A.innerMat.uniforms.uColor.value.equals(inner) && A.color.equals(outer), 'gold inside, blue outside');
    ok(A.inner.scale.x < 1 && A.inner.scale.y < 1, 'the inner shell is the tighter one');
    ok(!(other.aura.inner && other.aura.inner.visible), 'the other fighter has no gold layer');
    toForm(tr, 'ssj');
    gg.step(b, 5);
    ok(!A.inner.visible && A.innerStyle === null, 'back to Super Saiyan: the gold layer is gone');
    toForm(tr, 'rage');
    gg.step(b, 5);
    ok(A.inner.visible, 'and back with Rage');
    let disposed = false;
    const d0 = A.innerMat.dispose.bind(A.innerMat);
    A.innerMat.dispose = () => ((disposed = true), d0());
    b.dispose();
    ok(disposed && !A.group.parent, 'quitting the battle disposes both layers');
    eq(gg.errors.length, 0, 'no engine errors');
    // the story: the awakening in "Zero Mortals" and the Sword of Hope's change both end on the two layers, watched or
    // skipped; nobody else in either mission wears the gold
    for (const id of ['ft_zero', 'ft_hope']) {
      for (const watch of [true, false]) {
        const g2 = H.create({ quiet: true, seed: 3 });
        let atPlay = null;
        const r = g2.playMission(id, { watch, onBattle: (bb) => bb.onTick(() => {
          const ph = bb.mission && bb.mission.def.phases[bb.mission.phaseIndex];
          if (!atPlay && ph && (ph.id === 'hold' || ph.id === 'fight') && !bb.inputLocked) atPlay = { rage: bb.story.trunks.form.id, inner: !!(bb.story.trunks.aura.inner && bb.story.trunks.aura.inner.visible) };
          return true;
        }) });
        const w = id + ' ' + (watch ? 'watched' : 'skipped');
        eq(r.state, 'success', w + ': won');
        ok(atPlay && atPlay.rage === 'rage' && atPlay.inner, w + ': Trunks fights in Rage with the gold layer on');
        const others = r.b.fighters.filter((f) => f !== r.b.story.trunks && f.aura && f.aura.innerStyle && new THREE.Color(f.aura.innerStyle.color).equals(inner));
        eq(others.length, 0, w + ': nobody else wears the gold layer');
      }
    }
  });

  test('Goku Black\'s Divine Lasso (Roadmap Three, the Goku Black arc research DL-S01–S04, the owner\'s go-ahead): Rosé only, Free Battle after "Zero Mortals"; the crescent, the needles that hold whoever they reach (a guard does not stop them, a dodge does), the burst that smashes him down; nothing left behind', () => {
    const SLOT = 'x:divineLasso';
    const shapes = (b) => b.scene.children.filter((c) => (c.isMesh && c.geometry && c.geometry.type === 'CylinderGeometry' && c.geometry.parameters.radiusTop === 0.022) || (c.isGroup && c.children.some((m) => m.geometry && m.geometry.type === 'ShapeGeometry'))).length;
    /** A training battle: Rosé Black against `p2` standing still (o.cleared: "Zero Mortals" cleared). */
    function duel(o = {}) {
      const gg = H.create({ quiet: true, seed: 3 });
      if (o.cleared !== false) gg.SL.Save.completeMission('ft_zero', { score: 1, rank: 'C' });
      const b = gg.battle({ p1: 'goku_black', p2: o.p2 || 'goku' });
      const bk = b.player, v = b.fighters.find((f) => f !== bk);
      toForm(bk, o.form || 'rose');
      bk.ki = bk.kiMax;
      gg.step(b, 10);
      bk.target = v;
      v.controller = { update: () => gg.SL.emptyIntent() };
      const ev = [];
      b.on('divineLasso', (e) => ev.push(e.stage + (e.result ? ':' + e.result : '')));
      const sp = bk.def.extras.find((x) => x.id === 'divineLasso');
      return { gg, b, bk, v, ev, sp };
    }
    const run = (d, frames, each) => {
      for (let i = 0; i < frames; i++) {
        d.gg.step(d.b, 1);
        if (each) each(i);
      }
    };
    // gating
    const { SL } = H.create({ quiet: true, seed: 3 });
    const spec = SL.data.characters.goku_black.extras.find((x) => x.id === 'divineLasso');
    ok(spec && spec.forms.join() === 'rose' && spec.freeUnlock.join() === 'ft_zero' && spec.freeOnly, 'Rosé only, Free Battle only, after "Zero Mortals"');
    let d = duel({ cleared: false });
    eq(d.bk.extraLock(d.sp), 'hidden', 'before "Zero Mortals": not on the wheel');
    d = duel({ form: 'base' });
    ok(/Ros/.test(d.bk.extraLock(d.sp) || ''), 'in the base form: needs Rosé (' + d.bk.extraLock(d.sp) + ')');
    const lockInStory = SL.Fighter.prototype.extraLock.call({ battle: { mode: 'story', mission: { def: { id: 'ft_zero' } }, rules: { allowUltimates: true } }, form: { id: 'rose' }, def: { forms: [] } }, spec);
    eq(lockInStory, 'hidden', 'hidden in the story (Black is the CPU there; the mission stages it)');
    // the catch: the crescent, held, the burst; damage dealt; the victim smashed and free afterwards; nothing left
    d = duel();
    const seen = spyShots(d.b);
    const ki0 = d.bk.ki, hp0 = d.v.hp;
    ok(d.bk._trySpecial(SLOT), 'Rosé, after the mission: it starts');
    ok(d.bk.ki === ki0 - d.sp.kiCost && d.bk.state === 'divineLasso', 'it costs its ki; Black in the technique');
    let crescent = 0, held = 0, smashed = false;
    run(d, 220, () => {
      crescent = Math.max(crescent, d.b.scene.children.filter((c) => c.isGroup && c.visible && c.children.some((m) => m.geometry && m.geometry.type === 'ShapeGeometry')).length);
      if (d.v.state === 'held') held++;
      if (d.ev.includes('detonate') && (d.v.state === 'knockback' || d.v.state === 'knockdown')) smashed = true;
    });
    eq(d.ev.join(','), 'start,lock,detonate', 'the crescent, the catch, the burst');
    eq(seen.join(','), 'ultimateChargeShot,wideShot,faceShot,impact', 'its shots: low on the crescent, side-on for the needles, the caught face, the burst');
    ok(crescent === 1, 'the crescent shows at his hand');
    ok(Math.abs(held - d.sp.holdFrames) <= 2, 'held where he is for the hold (' + held + ' frames)');
    ok(smashed, 'smashed down by the burst');
    ok(hp0 - d.v.hp > 0, 'damage dealt (' + Math.round(hp0 - d.v.hp) + ')');
    eq(shapes(d.b), 0, 'no crescent or needle left in the scene');
    eq(d.gg.errors.length, 0, 'no engine errors');
    // a guard does not stop it (a command grab)
    d = duel();
    d.v.setState('guard');
    d.bk._trySpecial(SLOT);
    run(d, 120, () => d.v.state === 'free' && d.v.setState('guard'));
    ok(d.ev.includes('lock') && d.ev.includes('detonate'), 'through a guard: caught and burst (' + d.ev.join(',') + ')');
    // a dodge does: invulnerable as the needles arrive — they find nothing, Black recovers, no hold
    d = duel();
    d.bk._trySpecial(SLOT);
    run(d, 120, (i) => {
      if (i > d.sp.windup) d.v.invuln = 10;
    });
    ok(d.ev.some((e) => e.startsWith('miss')) && !d.ev.includes('lock'), 'dodged: the needles miss (' + d.ev.join(',') + ')');
    eq(shapes(d.b), 0, 'and nothing is left');
    // out of reach: it never starts and costs nothing
    d = duel();
    d.v.setPosition(d.bk.pos.clone().add(new d.gg.THREE.Vector3(0, 0, d.sp.range + 12)));
    const kiFar = d.bk.ki;
    ok(!d.bk._trySpecial(SLOT) && d.bk.ki === kiFar, 'out of reach: no start, no ki spent');
    // interrupted in the wind-up: Black is hit — the crescent goes with the technique
    d = duel();
    d.bk._trySpecial(SLOT);
    run(d, 12);
    d.bk.takeHit(d.v, { type: 'melee', damage: 200, knock: 'flinch', hitstun: 20, impact: 2, dir: d.v.dirTo(d.bk), point: d.bk.chest() });
    run(d, 30);
    ok(d.bk.state !== 'divineLasso' && !d.ev.includes('lock'), 'interrupted in the wind-up: no catch');
    eq(shapes(d.b), 0, 'interrupted: the crescent is gone');
    // Black hit mid-hold (another fighter): the victim goes free, the needles go
    d = duel();
    d.bk._trySpecial(SLOT);
    run(d, d.sp.windup + d.sp.flight + 6);
    ok(d.v.state === 'held', 'caught');
    d.bk.setState('stagger', { frames: 20 });
    run(d, 2);
    ok(d.v.state !== 'held', 'Black knocked out of it: the victim is free');
    eq(shapes(d.b), 0, 'and the needles are gone');
    // quitting the battle mid-hold
    d = duel();
    d.bk._trySpecial(SLOT);
    run(d, d.sp.windup + d.sp.flight + 10);
    d.b.dispose();
    eq(d.gg.errors.length, 0, 'quit mid-hold: no engine errors');
  });

  test('Future Trunks Saga, mission 3 "A Genuine Saiyan": Blue Vegeta\'s beatdown of Rosé — the face slam, the blows counted, through a wall, the collar, the Final Flash; won watched or skipped', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const order = SL.data.storyOrder();
    eq(order.indexOf('ft_genuine'), order.indexOf('ft_zero') + 1, 'canon order: right after Zero Mortals (the second trip, 2026-10-18)');
    eq(SL.data.missions.ft_genuine.character, 'vegeta');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      let downs = 0, beams = 0;
      const r = gg.playMission('ft_genuine', { watch, onBattle: (b) => {
        b.on('buildingDown', () => downs++);
        const sb = b.projectiles.spawnBeam.bind(b.projectiles);
        b.projectiles.spawnBeam = (o, spec, ...x) => (spec.id === 'finalFlashGenuine' && beams++, sb(o, spec, ...x));
      } });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      const F = r.m.flags;
      ok(F.slam && F.thrown && F.finalFlash, 'the slam, the throw, the Final Flash');
      ok(F.blows > 0, 'blows landed in the played stretch (' + F.blows + ')');
      ok(r.b.story.vegeta.form.id === 'blue' && r.b.story.black.form.id === 'rose', 'Blue against Rosé');
      if (watch) ok(downs === 1 && F.wall && F.gut >= 4 && beams === 1, 'through one wall (' + downs + '), the gut blows (' + F.gut + '), one beam (' + beams + ')');
      eq(r.b.projectiles.beams.length, 0, 'no beam left behind');
      eq(r.b.camera.shot, null, 'camera back');
    }
  });

  test('Future Trunks Saga, "The Divine Scythe" (Roadmap Three, Goku Black arc research CS-MAF-01 / MAF-S01, CS-SCY-01 / SCY-S01 / CLN-S01; episode 64\'s order, documentation/FUSED_ZAMASU_EPISODES_64_67.md): the scythe, the tear, the smoke clones that re-form behind whoever strikes them; then the Mafuba into the jar, no talisman, the green burst, and Black at Zamasu\'s side — won watched or skipped, nothing left behind', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const order = SL.data.storyOrder();
    eq(order.indexOf('ft_scythe'), order.indexOf('ft_genuine') + 1, 'canon order: right after A Genuine Saiyan (the third trip)');
    eq(order.indexOf('ft_vegito'), order.indexOf('ft_scythe') + 1, 'and right before Vegito (the two Zamasu fuse next)');
    // an old save: everything through "Vegito" cleared before this mission existed — nothing it had is locked again
    const res = (ids) => (id) => (ids.includes(id) ? { completed: true } : null);
    const old = res(['ft_black', 'ft_rose', 'ft_zero', 'ft_genuine', 'ft_vegito']);
    ok(!SL.data.storyLocked('ft_vegito', old) && !SL.data.storyLocked('ft_hope', old) && !SL.data.storyLocked('ft_scythe', old), 'old save: Vegito still open, The Sword of Hope and the new mission open');
    ok(!SL.data.storyLocked('ft_scythe', res(['ft_genuine'])) && SL.data.storyLocked('ft_scythe', res(['ft_zero'])), 'it opens after A Genuine Saiyan, not before');
    // episode 64 (the Kanzenshuu guide): the scythe, the rift and the clones first, then the Mafuba, then Black comes to him
    eq(SL.data.missions.ft_scythe.phases.map((p) => p.id).join(','), 'scythe,swarm,rift,mafuba', 'episode 64\'s order: the scythe and the swarm, the rift, then the Mafuba');
    eq(SL.data.missions.ft_scythe.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'scythe,swarm,mafuba', 'checkpoints at the scythe, the swarm and the Mafuba');
    const CHRONO = ['scythe', 'tear', 'mist', 'clones', 'cln01', 'swarm', 'rift', 'jar', 'stance', 'vortex', 'sealedIn', 'reached', 'noTalisman', 'burst', 'unsealed', 'blackJoins'];
    const left = (b) => {
      let n = 0;
      b.scene.traverse((o) => o.userData && o.userData.ftScythe && n++);
      return n;
    };
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const w = watch ? 'watched' : 'skipped';
      const s = { struggle: 0, reforms: [], blackHit: 0, blackMoved: 0, eyes: true, swarm: 0, hp: 1, mafuba: null, opening: null };
      const r = gg.playMission('ft_scythe', { watch, onBattle: (b) => {
        b.on('struggle', (e) => e.active && s.struggle++);
        // a clone standing again: where, against the one who struck it, at that moment
        b.on('swarmReform', (e) => {
          const d = e.clone.pos.clone().sub(e.by.pos).setY(0);
          s.reforms.push({ dist: d.length(), behind: d.normalize().dot(e.by.forward.clone().setY(0).normalize()), faces: e.clone.forward.clone().setY(0).normalize().dot(d.clone().negate()) });
        });
        let hover = null;
        b.onTick(() => {
          const ph = b.mission && b.mission.def.phases[b.mission.phaseIndex], S = b.story;
          // the opening on the square: Goku's seat (his HUD), Trunks out of it
          if (ph && ph.id === 'scythe' && !s.opening) s.opening = { player: b.player === S.goku, trunks: S.trunks.hidden };
          // the Mafuba's struggle: Trunks the player again, the square's cast out of the picture, the rift gone
          if (ph && ph.id === 'mafuba' && b.mission.struggling && !s.mafuba) s.mafuba = { player: b.player === S.trunks, out: [S.goku, S.vegeta, S.black].concat(S.clones).every((f) => f.hidden && f.untargetable), rift: !S.rift && !S.blackPin };
          if (!ph || ph.id !== 'swarm' || b.inputLocked) return true;
          s.swarm++;
          s.hp = Math.min(s.hp, S.goku.hpFrac);
          if (!S.black.untargetable) s.blackHit++;
          hover = hover || S.black.pos.clone();
          if (S.black.pos.distanceTo(hover) > 0.05) s.blackMoved++;
          for (const c of S.clones) if (c.model._pupilS !== 0.04 || c.form.id !== 'rose') s.eyes = false;
          return true;
        });
      } });
      const F = r.m.flags, S = r.b.story;
      eq(r.state, 'success', w + ': the mission is won');
      eq(gg.errors.length, 0, w + ': no engine errors');
      const keys = Object.keys(F);
      eq(CHRONO.filter((k) => !(k in F)).join(), '', w + ': every beat staged');
      eq(CHRONO.filter((k, i) => i > 0 && keys.indexOf(k) < keys.indexOf(CHRONO[i - 1])).join(), '', w + ': in episode 64\'s order');
      ok(s.opening && s.opening.player && s.opening.trunks, w + ': the opening is Goku\'s seat, Trunks out of it (' + JSON.stringify(s.opening) + ')');
      ok(s.mafuba && s.mafuba.player && s.mafuba.out && s.mafuba.rift, w + ': the Mafuba is Trunks\' (the player), the square\'s cast out of it, the rift gone (' + JSON.stringify(s.mafuba) + ')');
      ok(F.blackJoins && !S.black.hidden && S.black.form.id === 'rose' && S.black.pos.distanceTo(S.zamasu.pos) < 3, w + ': Black at Zamasu\'s side at the end (the fusion is next)');
      ok(F.jar && F.stance && F.vortex && F.sealedIn, w + ': CS-MAF-01 — the jar, the stance, the vortex, Zamasu drawn into the jar');
      ok(s.struggle > 30, w + ': the Mafuba is a struggle the player holds (' + s.struggle + ' ticks)');
      ok(F.reached && F.noTalisman && F.burst && F.unsealed, w + ': the lid, the hand finds no talisman, the green burst, Zamasu unsealed');
      ok(Math.abs(S.zamasu.model.root.scale.x - S.zamasu.model.baseScale) < 1e-6, w + ': Zamasu his own size again');
      ok(F.scythe && F.tear && F.mist && F.clones === TU().swarm.clones && F.cln01, w + ': CS-SCY-01 — the scythe, the tear, the mist, ' + F.clones + ' clones; CLN-S01');
      ok(s.swarm > 60 * 10, w + ': the swarm is played (' + s.swarm + ' frames)');
      ok(s.eyes, w + ': every clone in Rosé with the hollow silver eyes');
      eq(s.blackHit, 0, w + ': Black himself stays out of reach before the rift');
      eq(s.blackMoved, 0, w + ': and does not move from it');
      ok(F.dissolved >= 3 && F.reformed >= 3, w + ': struck clones come apart and re-form (' + F.dissolved + ' / ' + F.reformed + ')');
      eq(s.reforms.length, F.reformed, w + ': every re-forming seen');
      ok(s.reforms.length >= 3 && s.reforms.every((x) => x.dist > 1 && x.dist < 2.6 && x.behind < -0.9 && x.faces > 0.9), w + ': each one stands again close behind the Saiyan who struck it, facing him (' + s.reforms.map((x) => x.dist.toFixed(1) + '/' + x.behind.toFixed(2)).slice(0, 6).join(' ') + ')');
      ok(s.hp >= TU().swarm.gokuFloor - 0.02, w + ': the stretch ends at Goku\'s floor at the latest');
      ok(F.rift, w + ': the end — CLN-S01 once more');
      eq(r.m.qteParts.length, 2, w + ': two scored parts (the swarm, the Mafuba)');
      eq(r.m.tickHooks.length, 0, w + ': no scene hooks left running');
      eq(left(r.b), 0, w + ': the jar, the vortex, the scythe and the rift are gone');
      eq(r.b.camera.shot, null, w + ': camera back');
    }
    // a clone caught in a rush (held) comes apart only when the rush lets it go, and stands again behind the striker
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('ft_scythe', { startPhase: SL.data.missions.ft_scythe.phases.findIndex((p) => p.id === 'swarm') });
      gg.until(b, () => !b.inputLocked, 60 * 30);
      const g = b.story.goku, c = b.story.clones[0];
      for (const f of b.fighters) if (f !== g) f.controller = { update: () => gg.SL.emptyIntent() };
      gg.step(b, 2);
      c.setState('held');
      b.emit('damage', { target: c, attacker: g, amount: 1, type: 'melee' });
      gg.step(b, 6);
      ok(!c.hidden, 'held: not dissolved mid-rush');
      c.setState('free');
      gg.step(b, 2);
      ok(c.hidden && c.untargetable, 'let go: it comes apart into smoke, out of reach');
      gg.step(b, TU().swarm.reform + 2);
      const d = c.pos.clone().sub(g.pos).setY(0);
      ok(!c.hidden && !c.untargetable && d.length() < 2.6 && d.normalize().dot(g.forward.clone().setY(0).normalize()) < 0, 'and stands again behind him');
      ok(c.hp === c.hpMax, 'whole again');
      // quitting mid-swarm: nothing of the scene left in it
      b.dispose();
      eq(left(b), 0, 'quit mid-swarm: the rift is gone with the battle');
      eq(gg.errors.length, 0, 'quit mid-swarm: no engine errors');
    }
    // a checkpoint restart into the Mafuba, then quitting inside its struggle: Zamasu his own size, nothing left
    {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('ft_scythe', { startPhase: SL.data.missions.ft_scythe.phases.findIndex((p) => p.id === 'mafuba') });
      gg.until(b, () => b.mission.struggling, 60 * 40, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      ok(b.mission.struggling && b.story.zamasu.model.root.scale.x > 0, 'in the Mafuba\'s struggle');
      ok(b.player === b.story.trunks && b.story.goku.hidden && b.story.black.hidden && !b.story.rift, 'checkpoint restart into the Mafuba: Trunks the player, the square\'s cast and the rift out of it');
      gg.step(b, 30);
      b.dispose();
      const z = b.story.zamasu;
      ok(Math.abs(z.model.root.scale.x - z.model.baseScale) < 1e-6, 'quit mid-Mafuba: Zamasu his own size');
      eq(left(b), 0, 'quit mid-Mafuba: the jar and the vortex are gone');
      eq(gg.errors.length, 0, 'quit mid-Mafuba: no engine errors');
    }
    function TU() {
      return SL.data.ftScythe.TU;
    }
  });

  test('Future Trunks Saga, mission 4 "Vegito" (episodes 64–66 in their order, documentation/FUSED_ZAMASU_EPISODES_64_67.md): the merge; the played assault — the lightning bird, then the Saiyan Assault blow for blow (an adaptation), slowed and given back, caught and thrown; the turn; two real Potara fusions; "Alright!" as it was; Vegito Blue with God Slicer; the Spirit Sword; the change and the growth in FIGHT 2; the Final Kamehameha charged and released; the fusion runs out and he is still standing — won watched or skipped', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const order = SL.data.storyOrder();
    eq(order.indexOf('ft_vegito'), order.indexOf('ft_scythe') + 1, 'canon order: right after The Divine Scythe (the third trip, 2026-10-19)');
    const VB = SL.data.characters.vegito.forms.find((x) => x.id === 'blue');
    const GS = SL.data.characters.vegito.extras.find((x) => x.id === 'godSlicer');
    ok(VB.storyLocked && VB.freeUnlock.includes('ft_vegito') && GS.freeUnlock.includes('ft_vegito') && GS.freeOnly, 'Vegito Blue and God Slicer open in Free Battle after "Vegito" (still story-locked elsewhere)');
    const un = SL.data.unlocks.find((u) => u.target === 'fused_zamasu');
    ok(JSON.stringify(un.condition).includes('ft_vegito') && JSON.stringify(un.condition).includes('top_finale'), 'Fused Zamasu after "Vegito" (old saves keep The Final Battle)');
    eq(SL.data.missions.ft_vegito.phases.map((p) => p.id).join(','), 'merge,assault,turn,fight,wrath,fight2,final', 'the merge, the played assault, the turn, two played stretches round the Holy Wrath, the finish');
    // the verified chronology (the reference's beats 1–23 the mission stages), by the order the mission first sets each flag
    const CHRONO = ['fusedZamasu', 'birdDown', 'assaultStarted', 'blocked', 'thrown', 'trunksJoins', 'galick', 'unharmed', 'shielded', 'kameStruggle', 'pierced', 'swollen', 'legGrab', 'kaioken', 'haloBroken', 'drained', 'divineJustice', 'vegitoAbove', 'vegitoLanded', 'blueCue', 'fingerStop', 'interrupted', 'fight', 'caught', 'wrathBack', 'impaled', 'corrupted', 'fight2', 'charged', 'released', 'finalKame', 'defused', 'survived'];
    for (const watch of [true, false]) {
      const w = watch ? 'watched' : 'skipped';
      const gg = H.create({ quiet: true, seed: 3 });
      let slicer = 'unchecked', beams = 0, fusions = 0, ends = 0;
      const ep = { live: 0, ids: new Set(), haloAfterBreak: null, kaioken: 0, atFight: null };
      const seq = [], dj = [], al = [];
      const fx = { handoff: null, bulk: null, before: null, marks: 0, sizeMax: 0 };
      const as = { bolts: 0, birdPlay: null, rush: null, held: 0, combo: 0, frames: 0, cam: 0, slowMin: 1, slowAt: [], after: null };
      const r = gg.playMission('ft_vegito', { watch, onBattle: (b) => {
        b.on('fusion', () => fusions++);
        b.on('fusion', () => fusions === 2 && seq.push('vegito'));
        b.on('say', (e) => {
          if (/^Light of divine justice/.test(e.line)) dj.push(e.speakerId), seq.push('justice');
          if (e.line === 'Alright!') {
            const v = b.story.vegito;
            al.push({ base: v.form.id === 'base', ground: v.grounded, pose: v.sd && v.sd.pose, dur: e.duration });
            seq.push('alright');
          }
        });
        b.on('birdBolt', () => as.bolts++);
        b.on('rushSlow', (e) => as.slowAt.push(e.step));
        b.on('telegraph', () => {
          const ph = b.mission && b.mission.def.phases[b.mission.phaseIndex];
          if (ph && ph.id === 'fight2') fx.marks++;
        });
        // the columns of judgment come down only in the played stretches (the assault, FIGHT 2), never in a scene
        b.on('eruption', () => {
          const ph = b.mission && b.mission.def.phases[b.mission.phaseIndex];
          if (!ph || !['assault', 'fight2'].includes(ph.id) || b.inputLocked) fx.stray = (fx.stray || 0) + 1;
        });
        b.onTick(() => {
          const ph = b.mission && b.mission.def.phases[b.mission.phaseIndex], S = b.story;
          if (S.vegito && S.vegito.form.id === 'blue' && !seq.includes('blue')) seq.push('blue');
          // the assault: the bird stretch is the player's (Goku, his own controller), the bird the lock-on's
          if (ph && ph.id === 'assault' && !b.inputLocked && !as.birdPlay && S.goku) as.birdPlay = { player: b.player === S.goku, own: S.goku.controller === S.goku._playerController, prop: !!(S.hitProp && S.hitProp()), lock: !!(b.player.lockProp && b.player.lockProp.id === 'lightningBird') };
          // the rush: Goku's, from the player's seat, Vegeta held as the partner, the mission's lens on it, time slowed
          const g = S.goku, v = S.vegeta;
          if (g && g.state === 'rush' && g.sd.slot === 'x:saiyanAssault') {
            if (!as.rush) {
              as.rush = { partner: g.sd.partner === v, own: g.controller === g._playerController };
              seq.push('rush');
            }
            as.frames++;
            if (g.sd.phase === 'combo') {
              as.combo++;
              if (v.state === 'scripted' && v.sd.teamRush === g) as.held++;
            }
            if (b.camera.shot) as.cam++;
            if (b.slow) as.slowMin = Math.min(as.slowMin, b.slow.scale);
          } else if (as.rush && !as.after) as.after = { held: v.state === 'scripted' && v.sd.teamRush === g };
          if (ph && ph.id === 'fight' && !b.inputLocked && !fx.handoff) {
            const vg = S.vegito;
            fx.handoff = { player: b.player === vg, blue: vg.form.id === 'blue', own: vg.controller === vg._playerController, air: vg.pos.y - b.stage.heightAt(vg.pos.x, vg.pos.z), near: vg.pos.distanceTo(S.fz.pos), cue: b.cue, arm: S.fz.model.props.goo0 && S.fz.model.props.goo0.visible };
            fx.before = { armor: S.fz.storyArmor, move: S.fz.moveScale };
            seq.push('fight');
          }
          if (ph && ph.id === 'fight2' && !b.inputLocked) {
            // the mission's own multiplier, over the form's (the Half-Corrupted form is drawn bigger already: look.scale)
            const size = S.fz.model.root.scale.x / S.fz.model.baseScale / ((S.fz.form.look && S.fz.form.look.scale) || 1);
            if (!fx.bulk) fx.bulk = { armor: S.fz.storyArmor, move: S.fz.moveScale, size, form: S.fz.form.id };
            fx.sizeMax = Math.max(fx.sizeMax, size);
          }
          return true;
        });
        // the turn (the mission's staging of episodes 65–66): the two Galick beams in him at once, then the Kamehameha; the
        // halo gone once broken; Trunks out of the played fights
        b.onTick(() => {
          const F = b.mission && b.mission.flags, S = b.story, ph = b.mission && b.mission.def.phases[b.mission.phaseIndex];
          if (!F) return true;
          const live = b.projectiles.beams.filter((x) => /^(fatherSonGalick|fullPowerKame)/.test(x.spec && x.spec.id));
          ep.live = Math.max(ep.live, live.length);
          for (const x of live) ep.ids.add(x.spec.id);
          if (S.goku && S.goku.form.id === 'blueKaioken') ep.kaioken++;
          if (F.haloBroken && ep.haloAfterBreak === null && S.fz) ep.haloAfterBreak = S.fz.model.props.halo.visible;
          if (ph && ph.id === 'fight' && !b.inputLocked && !ep.atFight && S.fz) ep.atFight = { halo: S.fz.model.props.halo.visible, trunks: S.trunks.hidden && S.trunks.untargetable };
          return true;
        });
        b.on('fusionEnd', () => ends++);
        const sb = b.projectiles.spawnBeam.bind(b.projectiles);
        b.projectiles.spawnBeam = (o, spec, ...x) => (spec.id === 'finalKameVegito' && beams++, sb(o, spec, ...x));
        b.onTick(() => {
          const ph = b.mission && b.mission.def.phases[b.mission.phaseIndex];
          if (!ph || ph.id !== 'fight' || b.inputLocked || !b.story.vegito) return true;
          slicer = b.story.vegito.extraLock(GS);
          return false;
        });
      } });
      eq(r.state, 'success', w + ': the mission is won');
      const F = r.m.flags, S = r.b.story;
      // the chronology
      const keys = Object.keys(F);
      const missing = CHRONO.filter((k) => !(k in F));
      eq(missing.join(), '', w + ': every beat staged');
      const outOfOrder = CHRONO.filter((k, i) => i > 0 && keys.indexOf(k) < keys.indexOf(CHRONO[i - 1]));
      eq(outOfOrder.join(), '', w + ': the beats in the episodes\' order');
      eq(seq.join(','), 'rush,justice,vegito,alright,blue,fight', w + ': in order — the assault, the Light, the Potara, "Alright!", Blue, the fight');
      // ASSAULT: the bird first (the player's), then the rush on the cue
      ok(as.birdPlay && as.birdPlay.player && as.birdPlay.own && as.birdPlay.prop && as.birdPlay.lock, w + ': the bird stretch is played — Goku, his own controller, locked on the bird over the god (' + JSON.stringify(as.birdPlay) + ')');
      ok(as.bolts >= 1 && F.assaultJudgments >= 1, w + ': the bird\'s lightning and his Blades of Judgement both come down (' + as.bolts + ', ' + F.assaultJudgments + ')');
      ok(F.birdDown && !r.b.stage.props.some((p) => p.id === 'lightningBird' && p.alive) && !S.hitProp, w + ': the bird destroyed and nothing left to aim at');
      ok(as.rush && as.rush.partner && as.rush.own, w + ': the rush Goku\'s from the player\'s seat, Vegeta the partner (' + JSON.stringify(as.rush) + ')');
      eq((F.assaultStrikers || []).join(), 'goku,vegeta,goku,vegeta,goku,vegeta,goku', w + ': blow for blow, Goku and Vegeta in turn');
      ok(as.combo > 60 && as.held === as.combo && as.after && !as.after.held, w + ': Vegeta held as the partner through the blows, let go after (' + as.held + '/' + as.combo + ')');
      ok(as.cam === as.frames, w + ': the mission\'s lens on every frame of it (' + as.cam + '/' + as.frames + ')');
      eq(as.slowAt.join(), '2,4', w + ': the spinning kick and the axe kick slowed');
      ok(F.assaultSlows === 2 && as.slowMin <= 0.3 && F.slowRestored, w + ': time slowed (' + as.slowMin + ') and given back');
      ok(F.assaultTries === 1 && F.blocked && F.thrown, w + ': on the first cue; the last double blow caught, both thrown');
      // TURN (episodes 65–66)
      ok(F.trunksJoins && F.galick && F.unharmed && F.shielded && F.kameStruggle && F.pierced && F.swollen && F.legGrab && F.kaioken && F.haloBroken && F.drained, w + ': Trunks in Rage, the Galick Gun and no harm, Vegeta\'s shield, the Kamehameha through the Holy Wrath, the swelling, the leg grab, Kaioken, the halo, Goku spent');
      if (watch) ok(F.beams === 2 && ep.live === 2 && ep.ids.size === 3, 'the Father-Son Galick Gun (two beams at once), then the Kamehameha (' + ep.live + ', ' + [...ep.ids] + ')');
      if (watch) ok(ep.kaioken > 30, 'Blue Kaioken held through the strike (' + ep.kaioken + ' frames)');
      eq(ep.haloAfterBreak, false, w + ': the ring of light gone the moment it breaks');
      ok(ep.atFight && ep.atFight.halo === false && ep.atFight.trunks, w + ': in the played fight: no halo; Trunks out of sight and out of reach');
      ok(!S.fz.intangible, w + ': Zamasu solid again after the beams');
      // the Potara, "Alright!" (unchanged: once, base, landed, his stance, 1.4 s), Blue, the fingers
      eq(slicer, null, w + ': God Slicer usable in the played fight');
      ok(F.vegito && F.vegitoBase && F.fusedZamasu && fusions === 2, w + ': both Potara fusions (' + fusions + '); Vegito born in base, then Blue');
      eq(dj.join(), 'fused_zamasu', w + ': "Light of divine justice, strike at me now!" — once, Fused Zamasu\'s');
      ok(al.length === 1 && al[0].base && al[0].ground && al[0].pose === 'vg_yosha' && al[0].dur === 1.4, w + ': "Alright!" once — base Vegito, landed, in his stance, its own 1.4 s (' + JSON.stringify(al) + ')');
      ok(F.armSwollen && F.vegitoAbove && F.vegitoLanded, w + ': the arm swollen; Vegito above the god, then landed');
      eq((F.cues || []).map((c) => c.split(':')[0]).join(','), 'heavy,transform,guard,light,guard,heavy,ult,ult', w + ': the cues — the assault, Blue, two fingers, the interruption, the catch, the Spirit Sword, the Final Kamehameha and its release');
      ok(F.blueCue && F.fingerStop && F.interrupted && F.wrathStruggle, w + ': Blue on the cue; the light stopped with two fingers; the speech cut off; the Holy Wrath struggle');
      const h = fx.handoff || {};
      ok(h.player && h.blue && h.own && h.air > 2 && h.near < 12 && !h.cue && h.arm, w + ': the first played frame is the player\'s — Blue, his own controller, in the air near the god, no cue up, the arm swollen (' + JSON.stringify(h) + ')');
      // WRATH: the Spirit Sword (episode 66: his ki blade, Vegito's longer one)
      ok(F.caught && F.wrathBack && F.feint && F.impaled && F.lifted, w + ': Holy Wrath caught and driven back; the feint; the Spirit Sword through him, held on the blade');
      ok(F.swordTries === 1 && F.swordMisses === 0 && F.swordCountered, w + ': the counter pressed in his lunge, first time');
      if (watch) ok(F.impactFrame && F.falseVictory, 'the impact frame; the false victory');
      if (watch) ok(F.fzMarvels && F.vegitoMotes, 'Roadmap Three (research draft): Fused Zamasu marvels at his hands; the light round Vegito breaks into motes');
      const blade = S.vegito && S.vegito.model.props && S.vegito.model.props.spiritSword;
      ok(!blade || blade.scale.y === 1, w + ': the long blade put back to its own length');
      // FIGHT 2: the change (episode 66), then heavier, and he grows as his bar comes down
      ok(F.corrupted && fx.bulk && fx.bulk.form === 'corrupted' && fx.bulk.armor === 1 && fx.bulk.move === 0.85 && Math.abs(fx.bulk.size - 1.1) < 1e-6, w + ': FIGHT 2 — the Half-Corrupted god, armour, slower, bigger (' + JSON.stringify(fx.bulk) + ')');
      ok(F.grown > 0.5 && fx.sizeMax > 1.15 && fx.sizeMax <= 1.22 + 1e-6, w + ': growing as he is worn down (' + F.grown + ', ' + fx.sizeMax.toFixed(3) + ')');
      if (watch) ok(F.judgments >= 1 && fx.marks >= F.judgments, 'FIGHT 2: judgment called down — a telegraphed mark with every call (' + F.judgments + ' calls, ' + fx.marks + ' marks)');
      ok(!fx.stray, w + ': no column of judgment outside the played stretches (' + (fx.stray || 0) + ')');
      ok(fx.before && S.fz.storyArmor === fx.before.armor && S.fz.moveScale === fx.before.move, w + ': the armour and the speed given back after FIGHT 2');
      // FINAL: charged (mash) and released (Ultimate); the fusion runs out; he is still standing (episode 66)
      ok(F.charged && F.released && F.chargeGrip >= 0.99 && F.finalKame, w + ': the Final Kamehameha charged to the full and released (' + F.chargeGrip + ')');
      if (watch) eq(beams, 1, 'one staged beam');
      ok(F.defused && ends === 1 && !S.goku.hidden && !S.vegeta.hidden && r.b.player === S.goku, w + ': the fusion runs out — Goku and Vegeta again, Goku the player');
      ok(F.survived && S.fz.alive && !S.fz.hidden && S.fz.form.id === 'corrupted', w + ': Zamasu still standing, half-corrupted, at the end');
      eq(r.m.qteParts.length, 7, w + ': scored — the assault, the Kamehameha struggle, the fight, the Holy Wrath, the Spirit Sword, FIGHT 2, the charge');
      eq(r.b.projectiles.beams.length, 0, w + ': no beam left behind');
      // (a skip ends the mission inside the release cue's own 0.1 s tail of slow motion: mission.cue opts.slow)
      ok(!r.b.slow || (r.b.slow.scale === 0.5 && r.b.slow.t <= 0.1 + 1e-9), w + ': no slow motion left but the last cue\'s own tail (' + JSON.stringify(r.b.slow) + ')');
      eq(r.b.camera.shot, null, w + ': camera back');
      let leftover = 0;
      r.b.scene.traverse((o) => o.userData && o.userData.ftVegito && leftover++);
      eq(leftover, 0, w + ': the stopped light is gone');
    }
    // checkpoint entry into the assault: Goku the player, the bird up; a quit mid-assault leaves nothing behind
    {
      const gq = H.create({ quiet: true, seed: 3 });
      const bq = gq.mission('ft_vegito', { startPhase: SL.data.missions.ft_vegito.phases.findIndex((p) => p.id === 'assault') });
      gq.until(bq, () => !bq.inputLocked, 60 * 30);
      const bird = bq.stage.props.find((p) => p.id === 'lightningBird');
      ok(!bq.inputLocked && bq.player === bq.story.goku && bq.story.goku.form.id === 'blue' && bq.story.vegeta.form.id === 'blue' && bird && bird.alive && bq.story.hitProp() === bird, 'checkpoint restart into the assault: Blue Goku the player, Blue Vegeta beside him, the bird to hit');
      gq.step(bq, 60 * 4);
      const hooks = bq.mission.tickHooks.length;
      bq.dispose();
      ok(hooks > 0 && !bird.alive && !bird.group.parent && bq.mission.tickHooks.length === 0, 'quit mid-assault: the bird gone, no hooks left (' + hooks + ' before, ' + bq.mission.tickHooks.length + ' after)');
      eq(gq.errors.length, 0, 'assault checkpoint: no engine errors');
    }
    // checkpoint entry: FIGHT 2 with the Half-Corrupted, heavier god; a quit mid-FIGHT 2 gives the armour, the speed
    // and the size back
    {
      const gq = H.create({ quiet: true, seed: 3 });
      const bq = gq.mission('ft_vegito', { startPhase: SL.data.missions.ft_vegito.phases.findIndex((p) => p.id === 'fight2') });
      gq.until(bq, () => !bq.inputLocked, 60 * 30);
      const z = bq.story.fz;
      ok(!bq.inputLocked && z.form.id === 'corrupted' && z.storyArmor === 1 && z.moveScale === 0.85 && !z.model.props.halo.visible && bq.story.vegito.form.id === 'blue', 'checkpoint restart into FIGHT 2: the Half-Corrupted, heavier god, no halo; Vegito Blue');
      gq.step(bq, 60 * 6);
      bq.dispose();
      ok(z.storyArmor !== 1 && z.moveScale !== 0.85, 'quit mid-FIGHT 2: the armour and the speed given back (' + z.storyArmor + ', ' + z.moveScale + ')');
      eq(gq.errors.length, 0, 'FIGHT 2 checkpoint: no engine errors');
    }
    // a checkpoint restart into the first fight: the ring of light stays broken, Trunks stays out of it
    {
      const gq = H.create({ quiet: true, seed: 3 });
      const bq = gq.mission('ft_vegito', { startPhase: SL.data.missions.ft_vegito.phases.findIndex((p) => p.id === 'fight') });
      gq.until(bq, () => !bq.inputLocked, 60 * 30);
      ok(!bq.inputLocked && bq.story.fz && bq.story.fz.model.props.halo.visible === false && bq.story.trunks.hidden && bq.story.trunks.untargetable, 'checkpoint restart into the fight: no halo, no Trunks');
      ok(bq.story.fz.model.props.goo0.visible && bq.story.fz.storyArmor !== 1 && bq.story.fz.form.id === 'base', 'checkpoint restart into the fight: the arm swollen; not yet the heavier god, not yet changed');
      bq.dispose();
      eq(gq.errors.length, 0, 'checkpoint restart: no engine errors');
    }
    // elsewhere in the story God Slicer stays a Free Battle technique (a mission that does not open it)
    const lock = (def) => SL.Fighter.prototype.extraLock.call({ battle: { mode: 'story', mission: { def }, rules: { allowUltimates: true } }, form: { id: 'blue' }, def: { forms: [] } }, GS);
    eq(lock({ id: 'buu_vegito' }), 'hidden', 'hidden in another story mission');
    eq(lock({ openExtras: ['godSlicer'] }), null, 'opened by a mission that names it');
  });

  test('"Vegito": the Spirit Sword exchange (episode 66: his ki blade, Vegito\'s longer one) — no prompt in his wind-up; the prompt for the last frames of his lunge alone; too late and his blade lands and he comes again; after three misses the counter comes anyway; a press in the window counters at once', () => {
    for (const press of [false, true]) {
      const w = press ? 'pressed' : 'never pressed';
      const gg = H.create({ quiet: true, seed: 3 });
      const SL = gg.SL;
      const SW = SL.data.ftVegito.TU.sword;
      const b = gg.mission('ft_vegito', { startPhase: SL.data.missions.ft_vegito.phases.findIndex((p) => p.id === 'fight') });
      gg.until(b, () => !b.inputLocked, 60 * 30);
      // worn down: the first stretch ends there (fightPhase)
      b.story.vegito.hp = b.story.vegito.hpMax * 0.05;
      const cues = [], misses = [];
      let windCue = 0, lungeAt = -1, prevPose = null;
      b.on('cue', (e) => e.key === 'heavy' && cues.push({ wait: b.frame - lungeAt }));
      b.on('cueDone', (e) => e.key === 'heavy' && Object.assign(cues[cues.length - 1], { pressed: e.pressed, seconds: e.seconds }));
      b.on('swordMiss', (e) => misses.push(e.tries));
      gg.until(b, () => b.mission.flags.impaled || b.mission.state !== 'running', 60 * 150, () => {
        if (b.inputLocked) b.skipRequested = false;
        const fz = b.story.fz, pose = fz.sd && fz.sd.pose;
        if (pose === 'punchR' && prevPose === 'punchWindR') lungeAt = b.frame;
        prevPose = pose;
        if (b.cue && pose === 'punchWindR') windCue++;
        if (b.cue && (b.cue.key !== 'heavy' || press)) b.mission.player.intent[b.cue.key] = true;
      });
      const F = b.mission.flags;
      ok(F.impaled, w + ': the Spirit Sword through him');
      eq(windCue, 0, w + ': no prompt while he draws the blade back');
      // (the lunge's pose is seen here a frame late, and its wait counts its first frame: 2 under SW.lunge - SW.window)
      ok(cues.length && cues.every((c) => c.wait >= SW.lunge - SW.window - 2 && c.wait <= SW.lunge - SW.window), w + ': the prompt only for the last ' + SW.window + ' frames of his lunge (' + cues.map((c) => c.wait) + ')');
      if (press) {
        ok(F.swordTries === 1 && F.swordMisses === 0 && F.swordCountered && cues.length === 1 && cues[0].pressed, 'pressed in the window: countered at once');
      } else {
        eq(misses.join(), '1,2,3', 'too late three times: his blade lands each time and he comes again');
        ok(F.swordTries === SW.tries + 1 && F.swordMisses === SW.tries && F.swordCountered === false, 'then the counter comes anyway (' + F.swordTries + ' tries)');
        ok(cues.length === SW.tries && cues.every((c) => !c.pressed && Math.abs(c.seconds - SW.window / 60) < 0.05), 'each prompt goes ahead on its own after its window (' + cues.map((c) => c.seconds && c.seconds.toFixed(2)) + ')');
      }
      eq(gg.errors.length, 0, w + ': no engine errors');
    }
  });

  test('Future Trunks Saga, mission 5 "The Sword of Hope": Super Saiyan Rage; the blade of light; Zamasu cut in two; the sky apparition, the button, Zeno\'s erasure; the chapter ends before The Assassin — won watched or skipped', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const order = SL.data.storyOrder();
    const ch = SL.data.story.chapters.find((c) => c.id === 'super_future');
    eq(ch.missions.join(','), 'ft_black,ft_rose,ft_hakai,ft_zero,ft_genuine,ft_scythe,ft_vegito,ft_hope', 'the chapter: eight missions in canon order (Zero Mortals added 2026-10-18; The Divine Scythe and Hakai 2026-10-19)');
    eq(order[order.indexOf('ft_hope') + 1], 'hit_contract', 'The Assassin follows the saga');
    const rage = SL.data.characters.future_trunks.forms.find((x) => x.id === 'rage');
    ok(rage.storyBoss && rage.freeUnlock.includes('ft_hope'), 'Super Saiyan Rage (and the Sword of Hope) open in Free Battle after this mission');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const said = [];
      const r = gg.playMission('ft_hope', { watch, onBattle: (b) => b.on('say', (e) => said.push(e.speakerId + ': ' + e.line)) });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      const F = r.m.flags, S = r.b.story;
      // continuity (2026-10-18): Rage first awakens in "Zero Mortals", before this mission, in front of Black and Zamasu
      if (watch) {
        ok(order.indexOf('ft_zero') >= 0 && order.indexOf('ft_zero') < order.indexOf('ft_hope'), 'Zero Mortals (the first Rage) comes before The Sword of Hope');
        ok(said.some((l) => /^fused_zamasu: That flame again/.test(l)) && !said.some((l) => /What is this/.test(l)), 'Fused Zamasu remembers the Rage he saw awaken (not a first sight)');
      }
      ok(F.rage && F.blade && F.cut && F.halves, 'Rage, the blade, the cut in two');
      ok(F.skyFace && F.button && F.zeno && F.erased, 'the sky, the button, Zeno, the erasure');
      ok(F.watched, 'Goku and Vegeta watching the gathering');
      // episode 66–67: the fusion spent, Goku and Vegeta down, the god's blade over them — Trunks blocks it (before the Rage)
      ok(F.blocked && Object.keys(F).indexOf('blocked') < Object.keys(F).indexOf('rage'), 'Trunks blocks the blade over the spent Goku and Vegeta, before the Rage');
      if (watch) ok(said.some((l) => /^future_trunks: I'm fighting to save everyone/.test(l)), 'Trunks: we help each other (episode 67, paraphrased)');
      if (watch) ok(F.orbCut, 'the sphere Zamasu throws is cut through (Roadmap Three, research draft)');
      if (watch) ok(F.gripShot, 'Roadmap Three (research draft): low and close on his trembling hands on the raised sword');
      if (watch) ok(F.lasers > 0, 'red light raining from the sky (' + F.lasers + ')');
      ok(S.trunks.hidden && S.goku.hidden && S.vegeta.hidden, 'all three gone in the Time Machine');
      eq(r.b.camera.shot, null, 'camera back');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('Future Trunks Saga, "The Sword of Hope" as a boss fight (2026-10-19; MASTER_SPEC: Fused Zamasu "a huge multi-phase boss: regeneration, immortality, massive energy attacks, environmental destruction"): the blades of judgment from 0.88 — marks, then columns at Trunks\' feet, a recovery to punish, the buildings beside a column come down; mending from 0.74 — rooted and healing, light blows do not stop it, a heavy blow breaks it and he reels with his regeneration held off; nothing left behind; quit mid-mend clean', () => {
    const start = () => {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('ft_hope', { startPhase: 1 });
      const m = b.mission, S = b.story;
      gg.until(b, () => m.def.phases[m.phaseIndex].id === 'fight' && !b.inputLocked, 60 * 30);
      const tr = S.trunks, fz = S.fz;
      // the test holds Trunks up and still (no input): the stages are what is checked, not who wins
      const keep = () => {
        tr.hp = tr.hpMax;
      };
      return { gg, b, m, tr, fz, keep };
    };
    // stage two: the blades of judgment
    let x = start();
    const { b, m, tr, fz } = x;
    ok(!m.flags.bladeStage && !m.flags.mendStage, 'full bar: neither stage yet');
    const marks = [], cols = [], states = [];
    b.on('telegraph', (e) => e.frames === 50 && marks.push(b.frame));
    b.on('eruption', (e) => e.fighter === fz && cols.push(b.frame));
    let hurt = 0;
    b.on('damage', (e) => e.attacker === fz && e.target === tr && e.type === 'explosion' && hurt++);
    fz.hp = fz.hpMax * 0.86;
    x.gg.until(b, () => cols.length >= 3, 60 * 20, () => {
      x.keep();
      states.push(fz.state);
    });
    ok(m.flags.bladeStage > 0 && m.flags.judgments >= 1, 'below 0.88: the blades of judgment are called');
    eq(marks.length, 3, 'three marks at Trunks\' feet first');
    ok(cols.length === 3 && cols[0] - marks[0] >= 48, 'then three columns, each after its warning (' + (cols[0] - marks[0]) + ' frames)');
    ok(hurt >= 1, 'standing in them hurts (' + hurt + ')');
    let rec = 0;
    x.gg.until(b, () => fz.state !== 'bossEruption', 200, () => {
      x.keep();
      rec++;
    });
    ok(rec >= 60, 'he recovers after the last column: the opening (' + rec + ' frames)');
    // the city comes down beside a column (the stage's own collapse)
    const bld = b.stage.obstacles.filter((o) => o.alive && o.building).sort((p, q) => Math.hypot(p.x, p.z) - Math.hypot(q.x, q.z))[0];
    const hp0 = bld.hp, w0 = m.flags.wrecked;
    const V3 = x.gg.THREE.Vector3;
    const dir = new V3(-bld.x, 0, -bld.z).normalize();
    b.emit('eruption', { fighter: fz, pos: new V3(bld.x + dir.x * (bld.r + 2), 0, bld.z + dir.z * (bld.r + 2)) });
    ok(m.flags.wrecked === w0 + 1 && (bld.hp < hp0 || !bld.alive), 'a column beside a building tears into it (' + Math.round(hp0) + ' -> ' + Math.round(bld.hp) + ')');
    b.emit('eruption', { fighter: fz, pos: new V3(0, 0, 0) });
    eq(m.flags.wrecked, w0 + 1, 'one in the open square touches none');
    // stage three: the mending
    const mendEv = [];
    b.on('zamasuMend', (e) => mendEv.push(e.stage));
    fz.hp = fz.hpMax * 0.7;
    x.gg.until(b, () => mendEv.includes('start'), 60 * 20, x.keep);
    ok(m.flags.mendStage > 0 && fz.state === 'scripted' && fz.sd.pose === 'fz2_mend', 'below 0.74: he stops and mends (fz2_mend)');
    ok(m.objectives.some((o) => o.id === 'mend' && o.optional && o.target === 2), 'the optional goal: break it twice');
    const hpA = fz.hp;
    x.gg.step(b, 30, x.keep);
    ok(fz.hp > hpA, 'his bar climbs while he mends (' + ((fz.hp - hpA) / fz.hpMax * 100).toFixed(1) + ' %)');
    // a light blow lands but does not stop it
    fz.takeHit(tr, { type: 'melee', damage: 60, knock: 'flinch', hitstun: 20, impact: 1, dir: tr.dirTo(fz), point: fz.chest() });
    const f0 = b.frame;
    x.gg.until(b, () => b.frame >= f0 + 6, 60, x.keep); // simulation ticks, not rendered frames (the hit's slow motion)
    ok(fz.state === 'scripted' && !mendEv.includes('broken'), 'a light blow does not stop it');
    // a heavy one breaks it: he reels, and his own regeneration is held off
    fz.takeHit(tr, { type: 'melee', damage: 200, knock: 'smash', knockSpeed: 20, hitstun: 30, impact: 3, dir: tr.dirTo(fz), point: fz.chest() });
    x.gg.until(b, () => mendEv.includes('broken'), 60, x.keep);
    ok(mendEv.includes('broken') && m.flags.mendBroken === 1, 'a heavy blow breaks it');
    eq(m.objectives.find((o) => o.id === 'mend').count, 1, 'the goal counts it');
    let reeled = false;
    x.gg.until(b, () => (reeled = fz.state === 'stagger'), 400, x.keep);
    ok(reeled, 'and he reels once the blow has played out');
    fz.mech.calm = 10;
    x.gg.step(b, 2, x.keep);
    ok(fz.mech.calm < 0.5, 'his body\'s own regeneration held off after the break (' + fz.mech.calm.toFixed(2) + ')');
    // left alone, a mend runs its course and stops at the cap
    fz.hp = fz.hpMax * 0.85;
    mendEv.length = 0;
    x.gg.until(b, () => mendEv.includes('done') || mendEv.includes('broken'), 60 * 20, x.keep);
    eq(mendEv.join(','), 'start,done', 'untouched: the mend runs its course');
    ok(fz.hp <= fz.hpMax * 0.86 + 1, 'never past 0.86 of his bar');
    // the end of the stretch: no hooks of the boss left, the armour and the AI given back, no column after it
    fz.hp = fz.hpMax * 0.49;
    fz.takeHit(tr, { type: 'melee', damage: 50, knock: 'flinch', hitstun: 10, impact: 1, dir: tr.dirTo(fz), point: fz.chest() });
    x.gg.until(b, () => m.def.phases[m.phaseIndex].id !== 'fight', 60 * 20, x.keep);
    ok(m.flags.drove, 'his floor ends the stretch');
    eq(fz.storyArmor || 0, 0, 'his armour given back');
    const late = cols.length;
    x.gg.step(b, 120);
    eq(cols.length, late, 'no column comes down in the scene after it');
    eq(x.gg.errors.length, 0, 'engine errors: ' + x.gg.errors.slice(0, 2).join(' | '));
    // quit mid-mend: everything given back
    x = start();
    x.fz.hp = x.fz.hpMax * 0.7;
    let started = false;
    x.b.on('zamasuMend', (e) => e.stage === 'start' && (started = true));
    x.gg.until(x.b, () => started, 60 * 20, x.keep);
    const armored = x.fz.storyArmor === 1 && x.fz.controller.constructor.name === 'Object'; // the scripted stand-in
    x.b.dispose();
    ok(started && armored && (x.fz.storyArmor || 0) === 0 && x.fz.controller.constructor.name === 'AIController', 'quit mid-mend: his armour and his AI given back (' + [started, armored, x.fz.storyArmor, x.fz.controller.constructor.name].join(' ') + ')');
    eq(x.gg.errors.length, 0, 'engine errors after the quit');
  });

  test('Universe Survival, "The Park Ranger" (2026-10-19; episodes 86–87): before "Father and Son"; find the ranger, the spar (his animals: three warnings and he calls it off; hit him as his barrier drops), the poachers\' ship — the beam lifts an animal, the emitter smashed and it comes down, one carried aboard is taken; rock-paper-scissors; Android 17 against the boss; the bluff; he joins — won watched or skipped, nothing left behind', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const ch = SL.data.story.chapters.find((c) => c.id === 'super_survival');
    eq(ch.missions.join(','), 'us_ranger,us_gohan,us_frieza', 'Chapter 21: the ranger (episodes 86–87), then father and son (episode 90), then the tenth warrior (93–95, added later the same day)');
    const order = SL.data.storyOrder();
    ok(order.indexOf('us_ranger') === order.indexOf('hit_contract') + 1 && order.indexOf('us_gohan') === order.indexOf('us_ranger') + 1, 'after The Assassin, before Father and Son');
    const res = (ids) => (id) => (ids.includes(id) ? { completed: true } : null);
    ok(!SL.data.storyLocked('us_ranger', res(['hit_contract'])) && SL.data.storyLocked('us_gohan', res(['hit_contract'])), 'a new save: the ranger opens after The Assassin, Father and Son waits for it');
    ok(!SL.data.storyLocked('us_gohan', res(['hit_contract', 'us_gohan'])), 'an old save that cleared Father and Son keeps it open');
    ok(!SL.data.characters.poacher.playable && !SL.data.characters.poacher_boss.playable, 'the poachers are story enemies');
    // the whole of it, by the bot, watched and skipped
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const r = gg.playMission('us_ranger', { watch, maxSeconds: 900 });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      const F = r.m.flags, S = r.b.story;
      ok(F.found && F.raided && F.emitter && F.bossDown && F.fireworks && F.joined, 'found him, the raid, the emitter, the boss, the fireworks, he joins');
      eq(F.rps, 'a17', 'Seventeen wins the toss');
      ok(r.b.fighters.filter((f) => f.tags && ['raid', 'guard'].includes(f.tags.mission)).every((f) => f.hidden), 'no poacher left standing in the end');
      ok(!S.ship.emitter.alive && !S.ship.group.parent, 'the ship is gone');
      // home on the ground: the spot, and the ground under it (a crater from the fight may have lowered it)
      ok(S.animals.every((c) => c.object.visible && !c.lift && Math.hypot(c.pos.x - c.home.x, c.pos.z - c.home.z) < 0.01 && Math.abs(c.pos.y - r.b.stage.heightAt(c.pos.x, c.pos.z)) < 0.01), 'every animal home, on the ground');
      eq(r.b.camera.shot, null, 'camera back');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
    const at = (id) => {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('us_ranger', { startPhase: gg.SL.data.missions.us_ranger.phases.findIndex((p) => p.id === id) });
      gg.until(b, () => b.mission.def.phases[b.mission.phaseIndex].id === id && !b.inputLocked, 60 * 30);
      return { gg, b, m: b.mission, S: b.story, V3: gg.THREE.Vector3 };
    };
    // the spar: a blast of Goku's near an animal is a warning; three and he calls it off
    let x = at('spar');
    const warns = [];
    x.b.on('reserveWarning', (e) => warns.push(e.count));
    const near = (c) => new x.V3(c.pos.x + 2, c.pos.y, c.pos.z);
    x.b.emit('stageExplode', { pos: near(x.S.animals[0]), radius: 2, owner: x.S.a17 });
    x.b.emit('stageExplode', { pos: new x.V3(-80, 0, -80), radius: 2, owner: x.S.goku });
    eq(warns.length, 0, 'his own blast, or one far from the herd: no warning');
    for (let i = 0; i < 3; i++) {
      x.b.emit('stageExplode', { pos: near(x.S.animals[i]), radius: 2, owner: x.S.goku });
      x.gg.step(x.b, 40);
    }
    eq(warns.join(','), '1,2,3', 'three warnings');
    eq(x.m.state, 'failed', 'and he calls it off');
    // his barrier: a blow just as it drops is the counter
    x = at('spar');
    const a = x.S.a17, g = x.S.goku;
    let counters = 0;
    x.b.on('barrierCounter', () => counters++);
    a.ki = a.kiMax;
    ok(x.gg.SL.Techniques.barrier.start(a, a.def.specials.special2, 'boss'), 'his barrier goes up');
    x.gg.until(x.b, () => a.state !== 'barrier', 200);
    x.gg.step(x.b, 2);
    a.takeHit(g, { type: 'melee', damage: 300, knock: 'flinch', hitstun: 12, impact: 1, dir: g.dirTo(a), point: a.chest() });
    eq(counters, 1, 'hit as it drops: a counter');
    eq(x.m.objectives.find((o) => o.id === 'counter').count, 1, 'the optional goal counts it');
    // the raid: the beam warms up, then lifts what it is over; the emitter smashed, it comes down
    x = at('raid');
    const sh = x.S.ship, lifted = [];
    x.b.on('animalLifted', (e) => lifted.push(e.animal));
    x.gg.step(x.b, x.gg.SL.data.usRanger.TU.raid.warm - 20, () => (x.S.goku.hp = x.S.goku.hpMax));
    eq(lifted.length, 0, 'nothing taken up while the beam warms up');
    ok(sh.emitter.alive && sh.emitter.r > 0, 'the emitter hangs under the hull');
    x.gg.until(x.b, () => lifted.length > 0, 60 * 20, () => (x.S.goku.hp = x.S.goku.hpMax));
    const c = lifted[0], y0 = c.pos.y;
    x.gg.step(x.b, 90, () => (x.S.goku.hp = x.S.goku.hpMax));
    ok(c.pos.y > y0 + 2, 'an animal under the beam rises towards the ship (' + (c.pos.y - y0).toFixed(1) + ' m)');
    x.b.stage.damageProp(sh.emitter, 1e9, x.S.goku);
    ok(x.m.flags.emitter && x.m.objectives.find((o) => o.id === 'emitter').done, 'the emitter smashed: its objective done');
    x.gg.until(x.b, () => !c.lift, 60 * 20, () => (x.S.goku.hp = x.S.goku.hpMax));
    ok(!c.lift && Math.abs(c.pos.y - x.b.stage.heightAt(c.pos.x, c.pos.z)) < 0.05 && !c.taken, 'and the animal comes back down, on its feet');
    // one carried all the way up is taken (the optional goal fails); the end brings it home
    x = at('raid');
    const taken = [];
    x.b.on('animalTaken', (e) => taken.push(e.animal));
    x.gg.until(x.b, () => taken.length > 0, 60 * 40, () => (x.S.goku.hp = x.S.goku.hpMax));
    ok(taken.length === 1 && !taken[0].object.visible, 'carried up to the hull: taken');
    ok(x.m.objectives.find((o) => o.id === 'herd').failed, 'the optional goal fails');
    // the boss: played as Seventeen, Goku stands back
    x = at('boss');
    eq(x.b.player, x.S.a17, 'Seventeen is the player');
    ok(x.S.goku.untargetable && x.S.goku.controller.constructor.name === 'Object' && x.S.goku.state === 'scripted', 'Goku watches (benched, not an AI)');
    ok(x.m.objectives.some((o) => o.id === 'shield' && o.optional), 'the optional goal: catch their shots on the barrier');
    // quit mid-raid: the ship and the beam go, the animals are themselves again
    x = at('raid');
    x.gg.until(x.b, () => x.S.animals.some((k) => k.lift), 60 * 20, () => (x.S.goku.hp = x.S.goku.hpMax));
    const ship = x.S.ship;
    x.b.dispose();
    ok(!ship.group.parent, 'quit mid-raid: the ship gone');
    eq(x.gg.errors.length, 0, 'engine errors: ' + x.gg.errors.slice(0, 2).join(' | '));
  });

  test('Universe Survival, "The Tenth Warrior" (2026-10-19; episodes 93–95): after "Father and Son", before the Tournament; the Crone revives Frieza with his halo; the slipped fists; Golden Frieza and Goku against Universe 9\'s squad — one makes a grab for the Crone (a hit frees her; if he carries her off, a retry); the leader\'s decoy, the destruction ball squeezed small, the Death Beam; the ball on Goku (he cannot get out); the rest of the squad; the call, Beerus and Whis; one minute, the first blow through — a tie — won watched or skipped, nothing left behind', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const ch = SL.data.story.chapters.find((c) => c.id === 'super_survival');
    eq(ch.missions.join(','), 'us_ranger,us_gohan,us_frieza', 'Chapter 21: the ranger (86–87), father and son (90), the tenth warrior (93–95)');
    const order = SL.data.storyOrder();
    ok(order.indexOf('us_frieza') === order.indexOf('us_gohan') + 1 && order[order.indexOf('us_frieza') + 1] === 'top_jiren', 'after Father and Son, right before the Tournament of Power');
    const res = (ids) => (id) => (ids.includes(id) ? { completed: true } : null);
    ok(!SL.data.storyLocked('top_jiren', res(['us_gohan', 'top_jiren'])), 'an old save that cleared the Tournament\'s first match keeps it open');
    ok(['fortuneteller_baba', 'u9_assassin', 'u9_gunner', 'u9_leader'].every((id) => SL.data.characters[id] && !SL.data.characters[id].playable), 'the Crone and the assassins: story characters');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const r = gg.playMission('us_frieza', { watch, maxSeconds: 900 });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      const F = r.m.flags, S = r.b.story;
      ok(F.revived && F.punchBack && F.golden, 'revived, the slipped fists, Golden');
      ok(F.grabs >= 1 && F.saves === F.grabs, 'they went for the Crone (' + F.grabs + ') and were stopped every time');
      ok(F.ballHeld && F.leaderDown && F.trapped && F.couldNotEscape && F.restDown, 'the ball, the leader down, Goku trapped and unable to get out, the rest of the squad');
      ok(F.called && F.freed && F.tie && F.joined, 'the call, freed by Beerus, the tie, he joins');
      ok(!!S.frieza._halo, 'Frieza keeps his halo (a day pass)');
      eq(S.frieza.team, 0, 'and is on Goku\'s side again');
      ok(r.b.fighters.filter((f) => f.tags && ['squad', 'rest'].includes(f.tags.mission)).every((f) => f.hidden), 'no assassin left standing');
      ok(!S.voidBall, 'the destruction energy gone');
      eq(r.b.camera.shot, null, 'camera back');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
    const at = (id) => {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('us_frieza', { startPhase: gg.SL.data.missions.us_frieza.phases.findIndex((p) => p.id === id) });
      gg.until(b, () => b.mission.def.phases[b.mission.phaseIndex].id === id && !b.inputLocked, 60 * 30);
      return { gg, b, m: b.mission, S: b.story };
    };
    // the grab: Frieza kept out of it and Goku standing still — the one who goes for her carries her off: a retry
    let x = at('ambush');
    const keepOut = () => {
      x.S.frieza.controller = { update: () => x.gg.SL.emptyIntent() };
      x.S.goku.hp = x.S.goku.hpMax;
    };
    let grabber = null, grabbed = false;
    x.b.on('croneTarget', (e) => (grabber = e.by));
    x.b.on('croneGrabbed', () => (grabbed = true));
    x.gg.until(x.b, () => grabber, 60 * 20, keepOut);
    ok(grabber && x.b.player.target === grabber, 'one makes for the Crone, and the lock-on goes to him');
    x.gg.until(x.b, () => grabbed || x.m.state !== 'running', 60 * 20, keepOut);
    ok(grabbed, 'he reaches her and takes hold');
    x.gg.until(x.b, () => x.m.state !== 'running', 60 * 10, keepOut);
    eq(x.m.state, 'failed', 'carried off: a retry');
    ok(x.m.objectives.find((o) => o.id === 'baba').failed, 'the objective failed');
    // a hit on him makes him let go, and she floats back
    x = at('ambush');
    grabber = null;
    grabbed = false;
    let saved = 0;
    x.b.on('croneTarget', (e) => (grabber = e.by));
    x.b.on('croneGrabbed', () => (grabbed = true));
    x.b.on('cronesaved', () => saved++);
    x.gg.until(x.b, () => grabbed, 60 * 30, keepOut);
    x.gg.step(x.b, 40, keepOut);
    const baba = x.S.baba, held = baba.pos.y;
    grabber.takeHit(x.S.goku, { type: 'melee', damage: 100, knock: 'flinch', hitstun: 12, impact: 1, dir: x.S.goku.dirTo(grabber), point: grabber.chest() });
    x.gg.step(x.b, 2, keepOut);
    ok(saved === 1 && x.m.state === 'running', 'hit: he lets go');
    ok(baba.pos.y < held - 0.5, 'and she is back over the ring (' + held.toFixed(1) + ' -> ' + baba.pos.y.toFixed(1) + ')');
    // the spar: a blow on a guard does not count; the first that gets through ends it in the tie
    x = at('spar');
    const g = x.S.goku, fz = x.S.frieza;
    // he holds his guard past the Perfect Guard window, so the blow is a plain blocked one (a damage event, blocked)
    let blocked = 0;
    x.b.on('damage', (e) => e.target === fz && e.blocked && blocked++);
    fz.controller = { update: () => Object.assign(x.gg.SL.emptyIntent(), { guard: true }) };
    g.controller = { update: () => x.gg.SL.emptyIntent() };
    x.gg.step(x.b, 30);
    g.yaw = Math.atan2(fz.pos.x - g.pos.x, fz.pos.z - g.pos.z);
    fz.yaw = Math.atan2(g.pos.x - fz.pos.x, g.pos.z - fz.pos.z);
    fz.takeHit(g, { type: 'melee', damage: 200, knock: 'flinch', hitstun: 12, impact: 1, dir: g.dirTo(fz), point: fz.chest() });
    const f0 = x.b.frame;
    x.gg.until(x.b, () => x.b.frame >= f0 + 6, 60); // simulation ticks (the hit's slow motion)
    ok(blocked >= 1, 'the blow is blocked (' + blocked + ')');
    ok(!x.m.flags.firstBlow && !x.b.inputLocked, 'a blow on his guard: the minute goes on');
    fz.controller = { update: () => x.gg.SL.emptyIntent() };
    fz.setState('free');
    fz.takeHit(g, { type: 'melee', damage: 200, knock: 'flinch', hitstun: 12, impact: 1, dir: g.dirTo(fz), point: fz.chest() });
    x.gg.until(x.b, () => x.m.flags.tie, 60 * 10);
    ok(x.m.flags.firstBlow === 'goku' && x.m.flags.tie, 'the first blow through is Goku\'s — and it ends in the tie all the same');
    eq(x.gg.errors.length, 0, 'engine errors: ' + x.gg.errors.slice(0, 2).join(' | '));
  });

  test('roadmap #33, God Slicer\'s parries: Vegito Blue answers a Perfect Guard with the hand-edge blade (Light: across him; Heavy: from behind) — the edge shows for the strike and is gone after; base Vegito has no such counter', () => {
    for (const kind of ['light', 'heavy']) {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'vegito', p2: 'goku', distance: 1.6 });
      const v = b.player, o = b.fighters.find((f) => f !== v);
      ok(!(v.moveSet.counter && v.moveSet.counter.light), 'base Vegito: no counter strike');
      v.applyForm(v.def.forms.findIndex((f) => f.id === 'blue'));
      const fills = [];
      const spf = v.model.setPropFill.bind(v.model);
      v.model.setPropFill = (id, k) => (fills.push(id + ':' + k), spf(id, k));
      v.counterFrames = 45; // a Perfect Guard has just happened
      v.setState('free');
      const hp0 = o.hp;
      ok(v._startCounter(kind), kind + ': the counter starts');
      eq(v.sd.move && v.sd.move.id, kind === 'light' ? 'godSlicerParry' : 'godSlicerReverse', kind + ': the God Slicer counter');
      gg.step(b, 50);
      ok(hp0 - o.hp > 0, kind + ': it cuts him (' + Math.round(hp0 - o.hp) + ')');
      eq(fills.join(' '), 'spiritSword:0.35 spiritSword:0', kind + ': the edge out for the strike, then gone');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('roadmap #63, Gohan Beast: the form (mane, red eyes, the aura), story-locked; its Special Beam Cannon; the Super Hero film\'s "Beast" against Cell Max (a giant on the Great Ape machinery) — won watched or skipped, and Free Battle opens the form after it', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const fm = SL.data.characters.adult_gohan.forms.find((x) => x.id === 'beast');
    ok(fm && fm.storyLocked && fm.freeUnlock === 'sh_beast' && fm.look.hair.style === 'gohan_beast' && SL.data.hair.gohan_beast, 'the Beast form, its own mane, story-locked until "Beast"');
    ok(!SL.formOpenFree(fm), 'not in Free Battle before the mission');
    const sbc = fm.specials.ultimate;
    ok(sbc.pierce && sbc.oneHand && sbc.poses.charge === 'ub_sbcCharge' && sbc.cine, 'its Ultimate: the Special Beam Cannon, two fingers to the brow, with a cine');
    const cm = SL.data.characters.cell_max;
    ok(cm.giant && cm.boss && !cm.playable && cm.hitZones.find((z) => z.id === 'head').damageMul > 1.5 && !cm.hitZones.some((z) => z.id === 'tail'), 'Cell Max: a giant boss, the head his weak point, no tail');
    const mv = SL.data.story.movies.find((x) => x.id === 'super_hero');
    ok(mv && mv.missions.some((e) => e.id === 'sh_beast') && mv.unlock.missionComplete === 'top_finale', 'Movie 3, after the Tournament of Power');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const r = gg.playMission('sh_beast', { watch });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      const F = r.m.flags;
      ok(F.piccoloDown && F.beast && F.piccoloUp && F.charged && F.destroyed, 'Piccolo down, the Beast, Piccolo up, the cannon, the giant gone');
      eq(r.b.story.gohan.form.id, 'beast', 'Gohan ends it in Beast');
      eq(r.b.projectiles.beams.length, 0, 'no beam left behind');
      eq(r.b.camera.shot, null, 'camera back');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      ok(gg.SL.formOpenFree(gg.SL.data.characters.adult_gohan.forms.find((x) => x.id === 'beast')), 'Free Battle opens the Beast after the clear');
    }
  });

  test('Roadmap Three S-FRZ-01 (research draft): in the Namek confrontation, before Goku answers, a close eye-level profile of his calm face; the opening still hands over to the base fight', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.mission('namek_goku', { startPhase: 0 });
    let side = null, shotFrames = 0, offMax = 0, blinked = false;
    const pupilOff = () => {
      const p = b.story.goku.model.face.pupils[0];
      return Math.hypot(p.position.x - p.userData.home.x, p.position.y - p.userData.home.y);
    };
    gg.until(b, () => b.mission.def.phases[b.mission.phaseIndex].id !== 'open', 60 * 40, () => {
      if (b.mission.flags.calmEyes && side === null && b.camera.shot) {
        const g = b.story.goku, c = b.camera.camera.position, f = g.forward.clone().setY(0).normalize();
        const to = c.clone().sub(g.headPos()).setY(0).normalize();
        side = Math.abs(f.dot(to)); // 0 = square to his side (profile), 1 = in front or behind
      }
      // the 1.6 s shot: the eyes held off to one side and low, then round to Frieza; no blink
      if (b.mission.flags.calmEyes && shotFrames < 90) {
        shotFrames++;
        offMax = Math.max(offMax, pupilOff());
        if (b.story.goku.model.blinkT > 0) blinked = true;
      }
    });
    ok(b.mission.flags.calmEyes, 'the calm-eyes close-up plays');
    ok(side !== null && side < 0.5, 'in profile (' + (side === null ? 'none' : side.toFixed(2)) + ')');
    ok(offMax > 0.008, 'the eyes start turned away (' + (offMax * 1000).toFixed(1) + ' mm off straight ahead)');
    ok(b.mission.flags.eyesMeet, 'and come round to meet Frieza\'s');
    ok(!blinked, 'unblinking through the shot');
    eq(pupilOff(), 0, 'the eyes are straight ahead again after the scene');
    // skipped in the middle of the shot, while the eyes are still turned away
    const g2 = H.create({ quiet: true, seed: 3 });
    const b2 = g2.mission('namek_goku', { startPhase: 0 });
    let n2 = 0, off2 = 0;
    g2.until(b2, () => b2.mission.def.phases[b2.mission.phaseIndex].id !== 'open', 60 * 40, () => {
      if (b2.mission.flags.calmEyes && ++n2 === 12) b2.skipRequested = true;
    });
    const p2 = b2.story.goku.model.face.pupils[0];
    off2 = Math.hypot(p2.position.x - p2.userData.home.x, p2.position.y - p2.userData.home.y);
    eq(off2, 0, 'skipped mid-shot: the eyes are straight ahead again');
    b2.dispose();
    eq(g2.errors.length, 0, 'skipped: no engine errors');
    eq(b.mission.def.phases[b.mission.phaseIndex].id, 'base', 'on to the base fight');
    b.dispose();
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Roadmap Three S-FRZ-03 (research draft): in the first Kaioken rush the cross snaps Frieza\'s head aside and the kick lands, each cut close beside him at a Dutch angle on a flash, his head in frame; watched or skipped, the Kaioken is lit and the climb follows', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const M = gg.SL.data.missions.namek_goku;
      const b = gg.mission('namek_goku', { startPhase: M.phases.findIndex((p) => p.id === 'kaioken') });
      let tilted = 0, inFrame = 0, snapped = false;
      gg.until(b, () => M.phases[b.mission.phaseIndex].id !== 'kaioken', 60 * 60, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        const n = b.mission.flags.kaiokenDutch || 0;
        if (!n || n > 2 || Math.abs(b.camera.roll || 0) < 0.2) return;
        tilted++;
        const cam = b.camera.camera;
        cam.updateMatrixWorld();
        const p = b.story.frieza.headPos().project(cam);
        if (Math.abs(p.x) < 0.95 && Math.abs(p.y) < 0.95 && p.z < 1) inFrame++;
        if (b.story.frieza.anim.name === 'hitSideR') snapped = true;
      });
      const w = watch ? 'watched' : 'skipped';
      if (watch) {
        eq(b.mission.flags.kaiokenDutch, 2, 'two cuts: the cross and the kick');
        ok(tilted >= 10, 'held tilted for the blows (' + tilted + ' frames)');
        ok(inFrame / tilted > 0.9, 'his head in frame (' + inFrame + '/' + tilted + ')');
        ok(snapped, 'his head snaps aside on the cross');
      }
      ok(b.mission.flags.kaiokenShown, w + ': the Kaioken is lit');
      eq(M.phases[b.mission.phaseIndex].id, 'rising', w + ': on to the climb');
      b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors');
    }
  });

  test('Roadmap Three GC-S03 / GC-S04 (research draft): the regrowth seen low from the foot of the vapour, the lens tilting up it; the forfeit line on a push-in; the Cell Games still play on, watched or skipped', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const M = gg.SL.data.missions.cell_games;
      let low = 0, lowN = 0, pitch0 = null, pitch1 = null, d0 = null, d1 = null, sayAt = null;
      const r = gg.playMission('cell_games', { startPhase: M.phases.findIndex((p) => p.id === 'kame'), watch, maxSeconds: 300, onBattle: (b) => {
        b.on('say', (e) => {
          if (/I give up/.test(e.line || '')) sayAt = b.frame;
        });
        b.onTick(() => {
          const m = b.mission, ph = m && M.phases[m.phaseIndex], cam = b.camera.camera;
          if (!ph) return true;
          if (ph.id === 'regrow' && b.story.cell.hidden && b.camera.shot) {
            const dir = new gg.THREE.Vector3();
            cam.getWorldDirection(dir);
            const p = Math.asin(dir.y) * 57.3;
            if (pitch0 === null) pitch0 = p;
            pitch1 = p;
            lowN++;
            if (cam.position.y - b.stage.heightAt(cam.position.x, cam.position.z) < 0.7) low++;
          }
          if (sayAt !== null) {
            const d = cam.position.distanceTo(b.story.goku.headPos());
            if (b.frame === sayAt + 2) d0 = d;
            if (b.frame === sayAt + 150) d1 = d;
          }
          return true;
        });
      } });
      const w = watch ? 'watched' : 'skipped';
      eq(r.state, 'success', w + ': the Cell Games play on');
      if (watch) {
        ok(lowN > 60 && low / lowN > 0.9, 'GC-S03: low at the foot of the vapour (' + low + '/' + lowN + ')');
        ok(pitch1 - pitch0 > 20, 'and tilting up it (' + Math.round(pitch0) + '° → ' + Math.round(pitch1) + '°)');
        ok(d0 !== null && d1 !== null && d1 < d0 - 0.08, 'GC-S04: the push-in on "I give up" (' + (d0 || 0).toFixed(2) + ' → ' + (d1 || 0).toFixed(2) + ' m)');
      }
      r.b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors');
    }
  });

  test('Roadmap Three GS-S03 / B-TR-04 / SAC-S01 (research drafts): the SSJ2 column from low, pulling hard back; Gohan\'s eyes held low, then snapped up; Cell\'s laughing face pushed in on, blue crackle over the swelling; the missions still end, watched or skipped', () => {
    for (const watch of [true, false]) {
      const w = watch ? 'watched' : 'skipped';
      // Gohan: the column and the eyes
      const gg = H.create({ quiet: true, seed: 3 });
      const MG = gg.SL.data.missions.cell_gohan;
      let pillarAt = null, low0 = null, far1 = 0, eyesLow = false;
      const r = gg.playMission('cell_gohan', { startPhase: MG.phases.findIndex((p) => p.id === 'sixteen'), watch, maxSeconds: 300, onBattle: (b) => {
        const VK = gg.SL.data.vegitoKit, pil = VK.pillar;
        VK.pillar = function (...a) {
          if (pillarAt === null) pillarAt = b.frame;
          return pil.apply(this, a);
        };
        b.onTick(() => {
          const cam = b.camera.camera, g = b.story.gohan;
          if (pillarAt !== null && b.frame === pillarAt + 2) low0 = cam.position.y - b.stage.heightAt(cam.position.x, cam.position.z);
          if (pillarAt !== null && b.frame < pillarAt + 110) far1 = Math.max(far1, cam.position.distanceTo(g.pos));
          const p = g.model.face.pupils[0];
          if (p.position.y - p.userData.home.y < -0.003) eyesLow = true;
          return true;
        });
      } });
      eq(r.state, 'success', w + ': Gohan\'s mission ends');
      if (watch) {
        ok(low0 !== null && low0 < 0.7, 'GS-S03: the column from low on the stone (' + (low0 === null ? 'none' : low0.toFixed(2)) + ' m up)');
        ok(far1 > 20, 'and pulling hard back (' + far1.toFixed(1) + ' m)');
        ok(eyesLow && r.m.flags.gohanEyesSnap, 'B-TR-04: the eyes held low, then snapped up onto Cell');
      }
      const p = r.b.story.gohan.model.face.pupils[0];
      eq(p.position.y - p.userData.home.y, 0, w + ': his eyes straight ahead after the scene');
      r.b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors (Gohan)');
      // Cell's laugh
      const g2 = H.create({ quiet: true, seed: 3 });
      const MB = g2.SL.data.missions.cell_goodbye;
      let sayAt = null, d0 = null, d1 = null;
      const r2 = g2.playMission('cell_goodbye', { startPhase: MB.phases.findIndex((q) => q.id === 'bloat'), watch, maxSeconds: 300, onBattle: (b) => {
        b.on('say', (e) => {
          if (/Touch me and I explode/.test(e.line || '') && sayAt === null) sayAt = b.frame;
        });
        b.onTick(() => {
          if (sayAt === null) return true;
          const d = b.camera.camera.position.distanceTo(b.story.cell.headPos());
          if (b.frame === sayAt + 2) d0 = d;
          if (b.frame === sayAt + 250) d1 = d;
          return true;
        });
      } });
      eq(r2.state, 'success', w + ': the goodbye ends');
      if (watch) {
        ok(d0 !== null && d1 !== null && d1 < d0 - 0.1, 'SAC-S01: the push-in on his laughing face (' + (d0 || 0).toFixed(2) + ' → ' + (d1 || 0).toFixed(2) + ' m)');
        ok((r2.m.flags.bloatBolts || 0) >= 20, 'blue crackle over the swelling (' + r2.m.flags.bloatBolts + ')');
      }
      r2.b.dispose();
      eq(g2.errors.length, 0, w + ': no engine errors (Cell)');
    }
  });

  test('Roadmap Three MUI-S01 / B-MUI-03 (research draft): in the stillness the lens pushes in on his eyes, shut, then open on a chime; watched or skipped, the countering phase follows', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const M = gg.SL.data.missions.top_mui;
      const b = gg.mission('top_mui', { startPhase: M.phases.findIndex((p) => p.id === 'stillness') });
      let shut = false, nearest = 9;
      gg.until(b, () => M.phases[b.mission.phaseIndex].id !== 'stillness', 60 * 40, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        const g = b.story.goku;
        if (g.sd && g.sd.expression === 'closed') shut = true;
        if (shut && !b.mission.flags.muiEyesOpen) return;
        if (shut && b.mission.flags.muiEyesOpen && b.story.goku.sd.expression === 'calm') nearest = Math.min(nearest, b.camera.camera.position.distanceTo(gg.SL.Cinema.body(g).face));
      });
      const w = watch ? 'watched' : 'skipped';
      if (watch) {
        ok(shut && b.mission.flags.muiEyesOpen, 'the eyes shut, then open');
        ok(nearest < 0.7, 'an extreme close-up on them (' + nearest.toFixed(2) + ' m)');
      }
      eq(M.phases[b.mission.phaseIndex].id, 'counter', w + ': on to the countering phase');
      b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors');
    }
  });

  test('roadmap #24, the lake in "The Emperor\'s True Power": a lake dug into Namek, Goku deep under it, two Kamehameha decoys (two cues), the double-foot stomp into the shore; the water and the screen are put back — watched or skipped', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const M = SL.data.missions.namek_goku;
    eq(M.phases.map((p) => p.id).join(','), 'open,base,lake,kaioken,rising,after', 'the lake between the base fight and the Kaioken');
    const brains = require('../tools/mission_brains');
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('namek_goku', { startPhase: M.phases.findIndex((p) => p.id === 'lake') });
      let cues = 0, below = null;
      b.on('cue', () => cues++);
      const lvl = b.stage.def.water.level;
      brains.attach(gg.SL, b, 'namek_goku', {});
      gg.until(b, () => b.mission.def.phases[b.mission.phaseIndex].id !== 'lake' || b.mission.state !== 'running', 60 * 120, () => {
        if (below === null && b.mission.flags.inLake) below = b.story.goku.pos.y;
        if (b.inputLocked && !watch) b.skipRequested = true;
      });
      const F = b.mission.flags;
      eq(b.mission.def.phases[b.mission.phaseIndex].id, 'kaioken', (watch ? 'watched' : 'skipped') + ': on to the Kaioken');
      ok(F.inLake && below < lvl - 2, 'Goku deep under the water line (' + (below && below.toFixed(1)) + ' < ' + lvl + ')');
      ok(F.decoys === 2 && F.pillars >= 4 && F.surfaced && F.stomp, 'two decoys, the columns of water (' + F.pillars + '), up out of the spray, the stomp');
      eq(cues, 2, 'two cues');
      if (watch) ok(F.underwaterShots > 0, 'shots from under the surface (' + F.underwaterShots + ')');
      if (watch) ok(F.breachShot, 'Roadmap Three S-FRZ-02: the breach seen low from the water line');
      eq(b.stage.water.material.side, 0, 'the water plane drawn from above only again (FrontSide)');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('the Namek finale\'s brush-off: the shots burst on Goku as he walks through them, the big one is swatted away; the mission still plays to the end, watched or skipped', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      let bursts = 0, swat = 0;
      const r = gg.playMission('namek_super_saiyan', { watch, onBattle: (b) => {
        const ex = b.vfx.explosion.bind(b.vfx);
        b.vfx.explosion = (p, rad, c, o) => {
          if (c === 0xc86aff) rad > 2 ? swat++ : bursts++;
          return ex(p, rad, c, o);
        };
      } });
      eq(r.state, 'success', (watch ? 'watched' : 'skipped') + ': the mission is won');
      if (watch) ok(bursts >= 8 && swat === 1, 'the bursts on him (' + bursts + ') and one swat (' + swat + ')');
    }
  });

  test('Dirty Fireworks cut off before the fingers go up: no burst; a beam cut off mid-shot is cleared at once', () => {
    {
      const r = runRush({ p1: 'vegeta', form: 'base', missions: ['namek_vegeta'], id: 'dirtyFireworks', onFrame: (o) => {
        if (o.g.state === 'rush' && o.g.sd.detonate && o.g.stateFrame >= o.g.sd.detonate.due - 20) o.g.setState('hitstun', { frames: 30 });
      } });
      r.gg.step(r.b, 90);
      ok(!r.hits.some((h) => /boom/.test(h)), 'no burst: ' + r.hits.join(' '));
      eq(r.b.camera.shot, null, 'camera back');
    }
    {
      const r = runRush({ p1: 'vegeta', form: 'blue', missions: ['rof_finale'], id: 'blueGalickRush', onFrame: (o) => {
        if (o.g.state === 'rush' && o.g.sd.beamFx && o.g.stateFrame >= o.g.sd.beamFx.at + 5) o.g.setState('hitstun', { frames: 30 });
      } });
      ok(r.beams === 1 && r.disposed === 1, 'the beam is gone with the move (' + r.beams + '/' + r.disposed + ')');
    }
  });

  test('schema: a rush step\'s to, a beam that is not the last ki blow, and a detonation longer than the recovery are reported', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const V = SL.data.characters.vegeta;
    eq(SL.Schema.validateCharacter(V).join('; '), '');
    const po = V.extras.find((x) => x.id === 'princesOnslaught'), bg = V.extras.find((x) => x.id === 'blueGalickRush'), df = V.extras.find((x) => x.id === 'dirtyFireworks');
    const bad = Object.assign({}, V, { extras: [
      Object.assign({}, po, { hits: po.hits.map((h, i) => (i === 2 ? Object.assign({}, h, { to: 'under' }) : h)) }),
      Object.assign({}, bg, { hits: bg.hits.slice().reverse() }),
      Object.assign({}, df, { recovery: 20 }),
    ] });
    const p = SL.Schema.validateCharacter(bad).join('; ');
    ok(/to must be behind/.test(p) && /a beam is the last blow/.test(p) && /detonate needs/.test(p), p);
  });

  /* ------------------------------------------------------------ tag partner (2v2) and the team rush */

  /** A battle like Free Battle / Training with a partner (team 0, CPU ally, a party) and optionally a second opponent. */
  function teamBattle(gg, o) {
    const SL = gg.SL, V3 = gg.THREE.Vector3;
    const fighters = [
      { charId: o.p1, player: true, team: 0, pos: new V3(-4, 0, 0), cannotDie: !!o.cannotDie },
      { charId: o.cpu || 'vegeta', team: 1, pos: new V3(4, 0, 0), dummy: o.dummy || 'idle', cannotDie: !!o.cannotDie, infiniteHp: !!o.cpuInfHp },
    ];
    if (o.partner) fighters.push({ charId: o.partner, team: 0, pos: new V3(-6, 0, o.partnerZ || 3), difficulty: 'normal', cannotDie: !!o.cannotDie, dummy: o.partnerDummy });
    if (o.cpu2) fighters.push({ charId: o.cpu2, team: 1, pos: new V3(6, 0, 3), dummy: 'idle', cannotDie: !!o.cannotDie });
    const b = new SL.Battle({ mode: o.mode || 'training', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 100 }, fighters, onEnd: () => {} });
    if (o.partner) b.setParty(b.fighters.filter((f) => f.team === 0));
    b.start();
    for (const f of b.fighters) {
      f.setPosition(f.pos.clone().setY(b.stage.heightAt(f.pos.x, f.pos.z)));
      f.grounded = true;
    }
    const p = b.player, t = b.fighters[1];
    p.target = t;
    p.faceTarget(100);
    return { b, p, t, ally: o.partner ? b.fighters[2] : null };
  }

  test('2v2: a partner is a party member you can switch to; the battle ends only when a whole side is down', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { b, p, ally } = teamBattle(gg, { p1: 'goku', partner: 'piccolo', cpu: 'vegeta', cpu2: 'nappa', mode: 'free' });
    eq(b.fighters.length, 4);
    eq(b.party.length, 2, 'you and your partner');
    ok(!ally.isPlayer && ally.controller instanceof gg.SL.AIController, 'the partner fights as a CPU ally');
    gg.until(b, () => b.phase === 'fight', 60 * 10);
    ok(b.switchPlayer(ally), 'switch to the partner');
    eq(b.player, ally);
    const [o1, o2] = b.fighters.filter((f) => f.team === 1);
    o1.takeHit(ally, { type: 'melee', damage: 1e7, knock: 'heavy', knockSpeed: 20, impact: 3, dir: ally.forward });
    gg.step(b, 30);
    ok(!o1.alive && o2.alive, 'one opponent down');
    ok(b.phase === 'fight', 'the fight goes on while the other still stands');
    o2.takeHit(ally, { type: 'melee', damage: 1e7, knock: 'heavy', knockSpeed: 20, impact: 3, dir: ally.forward });
    gg.step(b, 10);
    ok(b.result && b.result.winnerTeam === 0 && b.result.won, 'both down: your side wins');
  });

  for (const lead of ['goku', 'frieza']) {
    test('Unlikely Alliance led by ' + lead + ': only with the partner at your side; both strike in turn from either side of him, the partner is let go after, camera back', () => {
      const gg = H.create({ quiet: true, seed: 3 });
      gg.SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
      const other = lead === 'goku' ? 'frieza' : 'goku';
      const { b, p, t, ally } = teamBattle(gg, { p1: lead, partner: other, cpu: 'vegeta', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
      toForm(p, lead === 'goku' ? 'blue' : 'golden');
      p.ki = p.kiMax;
      toForm(ally, other === 'goku' ? 'blue' : 'golden');
      ally.setState('free');
      eq(entry(gg.SL, b, p, 'x:unlikelyAlliance').locked, null, 'on the wheel with the partner beside you');
      ally.setPosition(ally.pos.clone().setX(ally.pos.x + 80));
      ok(/at your side/.test(entry(gg.SL, b, p, 'x:unlikelyAlliance').locked || ''), 'not with the partner far away');
      ally.setPosition(ally.pos.clone().setX(ally.pos.x - 80));
      const shots = spyShots(b);
      const strikers = [];
      const take = t.takeHit.bind(t);
      t.takeHit = (att, h) => {
        strikers.push(att.def.id);
        return take(att, h);
      };
      let farSide = 0, scripted = 0;
      ok(p._trySpecial('x:unlikelyAlliance'), 'used');
      gg.until(b, () => p.state !== 'rush', 60 * 6, () => {
        if (p.sd.partnerOn) {
          scripted++;
          const a = p.pos.clone().sub(t.pos).setY(0), c = ally.pos.clone().sub(t.pos).setY(0);
          if (a.dot(c) < 0) farSide++;
        }
      });
      const L = lead, O = other;
      // the grab, then each step's striker; the last step: the partner's shot, then the leader's
      const want = lead === 'goku' ? [L, O, L, O, O, O, L, O, L] : [L, L, O, L, L, L, O, O, L];
      eq(strikers.join(' '), want.join(' '), 'who strikes each blow');
      // (the frames at contact, before he is set on the far side, are allowed)
      ok(scripted > 40 && farSide >= scripted - 6, 'the partner on the far side of him through the rush (' + farSide + '/' + scripted + ')');
      eq(ally.state === 'scripted', false, 'the partner is let go');
      eq(shots.join(' '), 'rushTrackShot wideShot impact');
      gg.step(b, 90);
      eq(b.camera.shot, null, 'camera back');
    });
  }

  for (const lead of ['goku', 'vegeta']) {
    test('The Saiyan Charge led by ' + lead + ' (Roadmap Three, the Goku Black arc research CS-CHG-01 / CHG-S01, section 5\'s Blue Dual Charge): only with the other in Blue at your side; the same stance side by side, the charge flown together (Goku on the right), the two hooks, both at once; the partner let go, camera back', () => {
      const gg = H.create({ quiet: true, seed: 3 });
      const other = lead === 'goku' ? 'vegeta' : 'goku';
      const SLOT = 'x:saiyanCharge';
      {
        const g0 = H.create({ quiet: true, seed: 3 });
        const t0 = teamBattle(g0, { p1: lead, partner: other, cpu: 'zamasu', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
        toForm(t0.p, 'blue');
        toForm(t0.ally, 'blue');
        ok(!entry(g0.SL, t0.b, t0.p, SLOT) && t0.p.extraLock(t0.p.def.extras.find((x) => x.id === 'saiyanCharge')) === 'hidden', 'before "Vegito": not on the wheel');
      }
      gg.SL.Save.completeMission('ft_vegito', { score: 1, rank: 'C' });
      const { b, p, t, ally } = teamBattle(gg, { p1: lead, partner: other, cpu: 'zamasu', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
      toForm(p, 'blue');
      p.ki = p.kiMax;
      toForm(ally, 'base');
      ally.setState('free');
      ok(/Blue/.test(entry(gg.SL, b, p, SLOT).locked || ''), 'not with the partner out of Blue (' + entry(gg.SL, b, p, SLOT).locked + ')');
      toForm(ally, 'blue');
      ally.setState('free');
      eq(entry(gg.SL, b, p, SLOT).locked, null, 'on the wheel with the other in Blue beside you');
      const shots = spyShots(b);
      const strikers = [];
      const take = t.takeHit.bind(t);
      t.takeHit = (att, h) => {
        strikers.push(att.def.id);
        return take(att, h);
      };
      // Goku on the right: the side the partner keeps, from the leader's own right ((-fw.z, 0, fw.x))
      const partnerRight = lead === 'vegeta';
      let wind = 0, windSide = 0, windAura = 0, dash = 0, dashBeside = 0, combo = 0, sameSide = 0;
      ok(p._trySpecial(SLOT), 'used');
      gg.until(b, () => p.state !== 'rush', 60 * 6, () => {
        const sd = p.sd;
        if (!sd.partnerOn) return;
        const fw = p.forward.clone().setY(0).normalize(), right = new gg.THREE.Vector3(-fw.z, 0, fw.x);
        const off = ally.pos.clone().sub(p.pos).setY(0);
        if (sd.phase === 'wind') {
          wind++;
          if ((off.dot(right) > 1) === partnerRight && Math.abs(off.dot(right)) > 1) windSide++;
          if (p.aura.target >= 0.95 && ally.aura.target >= 0.95) windAura++;
        } else if (sd.phase === 'dash') {
          dash++;
          if (Math.abs(off.length() - 1.5) < 0.2 && (off.dot(right) > 0) === partnerRight) dashBeside++;
        } else if (sd.phase === 'combo') {
          combo++;
          const a = p.pos.clone().sub(t.pos).setY(0), c = ally.pos.clone().sub(t.pos).setY(0);
          if (a.dot(c) > 0) sameSide++;
        }
      });
      ok(wind > 20 && windSide >= wind - 1, 'the wind-up side by side, Goku on the right (' + windSide + '/' + wind + ')');
      ok(windAura >= wind - 2, 'both auras up in the wind-up (' + windAura + '/' + wind + ')');
      ok(dash > 0 && dashBeside === dash, 'the charge flown together, a stride apart (' + dashBeside + '/' + dash + ')');
      ok(combo > 30 && sameSide >= combo - 6, 'the blows from the same side of him, not the far side (' + sameSide + '/' + combo + ')');
      const L = lead, O = other;
      // the catch, the leader's hook, the partner's hook; the last step: the partner's blow, then the leader's
      eq(strikers.join(' '), [L, L, O, O, L].join(' '), 'who strikes each blow');
      eq(ally.state === 'scripted', false, 'the partner is let go');
      eq(shots.join(' '), 'pairShot rushTrackShot reverseShot impact', 'the two in the stance, the track, over his shoulder at the two of them, the impact');
      gg.step(b, 90);
      eq(b.camera.shot, null, 'camera back');
      eq(gg.errors.length, 0, 'no engine errors');
    });
  }

  test('The Saiyan Charge: the partner hit out of the wind-up — nobody is caught, the partner fights on, nothing held', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('ft_vegito', { score: 1, rank: 'C' });
    const { b, p, t, ally } = teamBattle(gg, { p1: 'goku', partner: 'vegeta', cpu: 'zamasu', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
    toForm(p, 'blue');
    toForm(ally, 'blue');
    ally.setState('free');
    p.ki = p.kiMax;
    ok(p._trySpecial('x:saiyanCharge'), 'used');
    gg.step(b, 10);
    ok(ally.state === 'scripted' && p.sd.partnerOn, 'the partner at his side');
    ally.takeHit(t, { type: 'melee', damage: 100, knock: 'heavy', knockSpeed: 20, hitstun: 30, impact: 3, dir: t.dirTo(ally), point: ally.chest() });
    let held = 0;
    gg.until(b, () => p.state !== 'rush', 60 * 4, () => {
      if (t.state === 'held') held++;
    });
    eq(held, 0, 'nobody caught without him');
    ok(ally.state !== 'scripted', 'the partner is his own again');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('The Saiyan Assault (2026-10-19; episode 65 beat 6 "they attack Zamasu directly" — the blows, their order and the slow motion an ADAPTATION of the owner\'s memory): hidden before "Vegito"; Blue Goku with Blue Vegeta only; blow for blow from both sides of him, the partner on the far side; the spinning kick, the axe kick and the last double blow slowed, time given back; the partner let go, camera back', () => {
    const SLOT = 'x:saiyanAssault';
    {
      const g0 = H.create({ quiet: true, seed: 3 });
      const t0 = teamBattle(g0, { p1: 'goku', partner: 'vegeta', cpu: 'zamasu', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
      toForm(t0.p, 'blue');
      toForm(t0.ally, 'blue');
      ok(!entry(g0.SL, t0.b, t0.p, SLOT) && t0.p.extraLock(t0.p.def.extras.find((x) => x.id === 'saiyanAssault')) === 'hidden', 'before "Vegito": not on the wheel');
    }
    const gg = H.create({ quiet: true, seed: 3 });
    gg.SL.Save.completeMission('ft_vegito', { score: 1, rank: 'C' });
    const { b, p, t, ally } = teamBattle(gg, { p1: 'goku', partner: 'vegeta', cpu: 'zamasu', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
    p.ki = p.kiMax;
    toForm(ally, 'blue');
    ally.setState('free');
    const inBase = entry(gg.SL, b, p, SLOT);
    ok(!inBase || inBase.locked, 'not for base Goku');
    toForm(p, 'blue');
    p.ki = p.kiMax;
    toForm(ally, 'base');
    ally.setState('free');
    ok(/Blue/.test(entry(gg.SL, b, p, SLOT).locked || ''), 'not with Vegeta out of Blue (' + entry(gg.SL, b, p, SLOT).locked + ')');
    toForm(ally, 'blue');
    ally.setState('free');
    eq(entry(gg.SL, b, p, SLOT).locked, null, 'on the wheel with Blue Vegeta beside you');
    const shots = spyShots(b);
    const strikers = [], slows = [];
    const take = t.takeHit.bind(t);
    t.takeHit = (att, h) => {
      strikers.push(att.def.id);
      return take(att, h);
    };
    b.on('rushSlow', (e) => slows.push(e.step + '@' + e.scale));
    let beside = 0, farSide = 0, above = 0;
    ok(p._trySpecial(SLOT), 'used');
    gg.until(b, () => p.state !== 'rush', 60 * 8, () => {
      if (p.sd.phase !== 'combo' || !p.sd.partnerOn) return;
      const k = p.sd.hitIndex, a = p.pos.clone().sub(t.pos).setY(0), c = ally.pos.clone().sub(t.pos).setY(0);
      // the blows from the side (the knee to the spinning back kick): the two of them on opposite sides of him
      if (k >= 1 && k <= 4) {
        beside++;
        if (a.dot(c) < 0) farSide++;
      }
      // the axe kick: Goku straight over him
      if (k === 5 && a.length() < 0.6 && p.pos.y > t.pos.y + 0.5) above++;
    });
    // the contact, then each step's striker; the last step: Vegeta's kick, then Goku's fist
    eq(strikers.join(' '), 'goku goku vegeta goku vegeta goku vegeta goku vegeta goku', 'who strikes each blow');
    ok(beside > 60 && farSide === beside, 'blow for blow from either side of him (' + farSide + '/' + beside + ')');
    ok(above > 10, 'Goku over him for the axe kick (' + above + ' frames)');
    eq(slows.join(' '), '2@0.3 4@0.25 7@0.2', 'the spinning kick, the axe kick and the last blow slowed');
    eq(ally.state === 'scripted', false, 'the partner is let go');
    eq(shots.join(' '), 'rushTrackShot wideShot impact', 'the track, wide on the blows, the impact');
    gg.step(b, 90);
    ok(!b.slow, 'time given back');
    eq(b.camera.shot, null, 'camera back');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('Unlikely Alliance: the partner hit out of it ends the rush (nobody held, partner free); a partner taken out before contact means no rush', () => {
    {
      const gg = H.create({ quiet: true, seed: 3 });
      gg.SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
      const { b, p, t, ally } = teamBattle(gg, { p1: 'goku', partner: 'frieza', cpu: 'vegeta', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
      toForm(p, 'blue');
      toForm(ally, 'golden');
      p.ki = p.kiMax;
      ok(p._trySpecial('x:unlikelyAlliance'));
      gg.until(b, () => p.sd.partnerOn && p.sd.hitIndex >= 2, 60 * 3);
      ally.setState('hitstun', { frames: 30 });
      gg.until(b, () => p.state !== 'rush', 60 * 3);
      ok(t.state !== 'held', 'let go');
      eq(p.state, 'free');
      gg.step(b, 90);
      eq(b.camera.shot, null);
    }
    {
      const gg = H.create({ quiet: true, seed: 3 });
      gg.SL.Save.completeMission('top_finale', { score: 1, rank: 'C' });
      const { b, p, t, ally } = teamBattle(gg, { p1: 'goku', partner: 'frieza', cpu: 'vegeta', cannotDie: true, cpuInfHp: true, partnerDummy: 'idle' });
      toForm(p, 'blue');
      toForm(ally, 'golden');
      p.ki = p.kiMax;
      ok(p._trySpecial('x:unlikelyAlliance'));
      ally.setState('knockdown', { frames: 120 });
      gg.until(b, () => p.state !== 'rush', 60 * 3);
      ok(t.state !== 'held', 'nobody is held');
      ok(ally.state !== 'scripted', 'the partner was never pulled in');
    }
  });

  test('CPU (shared task): a CPU uses the wheel rushes it has earned outside the story, and none in the story', () => {
    for (const mode of ['training', 'story']) {
      const gg = H.create({ quiet: true, seed: 3 });
      for (const m of ['buu_majin', 'buu_pride']) gg.SL.Save.completeMission(m, { score: 1, rank: 'C' });
      const b = gg.battle({ p1: 'goku', p2: 'vegeta', distance: 12, dummy: 'cpu', p2InfiniteHp: true });
      b.mode = mode;
      const v = b.fighters[1];
      toForm(v, 'majin');
      const used = new Set();
      gg.until(b, () => false, 60 * 50, () => {
        v.ki = v.kiMax;
        if (v.state === 'rush' && v.sd.spec && /^(finalImpact|atomicRush)$/.test(v.sd.spec.id)) used.add(v.sd.spec.id);
      });
      if (mode === 'training') ok(used.size >= 1, 'the CPU used a wheel rush in Training: ' + [...used].join(', '));
      else eq(used.size, 0, 'and none in the story');
    }
  });

  test('audio (shared task): a sound that fails keeps no voice; at the cap everyday blows give way and finishers still play; a suspended context is woken', () => {
    const fs = require('fs'), vm = require('vm'), path = require('path');
    const root = path.resolve(__dirname, '..');
    const ctx = { console, Math, JSON, Date, setTimeout: () => 0, clearTimeout() {}, performance: { now: () => 0 } };
    ctx.window = ctx;
    ctx.document = { createElement: () => ({}) };
    vm.createContext(ctx);
    for (const f of ['src/core/namespace.js', 'src/core/audio.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
    const A = ctx.SL.Audio, tried = [];
    ctx.SL.warn = (msg, name) => tried.push(name);
    A.ctx = { state: 'running', currentTime: 0 }; // no audio nodes can be made: every sound function throws
    for (let i = 0; i < 100; i++) A.play('explosionBig');
    eq(A.voices, 0, 'a hundred failed sounds leave the counter at zero (it used to climb to the cap and stay)');
    A.voices = A.MAX_VOICES;
    tried.length = 0;
    A.play('punchLight');
    eq(tried.length, 0, 'at the cap a punch gives way');
    A.play('explosionBig');
    eq(tried.join(), 'explosionBig', 'a finisher still plays, from the reserve');
    A.voices = A.MAX_VOICES + A.VOICE_RESERVE;
    tried.length = 0;
    A.play('explosionBig');
    eq(tried.length, 0, 'the reserve has an end too');
    let resumed = 0;
    A.ctx = { state: 'suspended', currentTime: 0, resume: () => (resumed++, Promise.resolve()) };
    A.play('explosionBig');
    eq(resumed, 1, 'a suspended context is woken');
  });

  test('schema: every fighter still validates — no entry inherits a wheel move for a form it does not have (Future Gohan)', () => {
    const { SL } = H.create({ quiet: true, seed: 3 });
    const bad = [];
    for (const c of Object.values(SL.data.characters)) for (const p of SL.Schema.validateCharacter(c)) bad.push(p);
    eq(bad.join('; '), '');
  });

  test('schema: Goku and SSJ4 Goku are valid; a cinematic step on an unknown shot or event is reported', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    eq(SL.Schema.validateCharacter(SL.data.characters.goku).join('; '), '');
    eq(SL.Schema.validateCharacter(SL.data.characters.goku_ssj4).join('; '), '');
    for (const id of ['vegeta', 'teen_gohan', 'adult_gohan', 'future_trunks', 'gogeta_blue', 'gogeta_ssj4', 'vegito']) eq(SL.Schema.validateCharacter(SL.data.characters[id]).join('; '), '', id);
    const bad = Object.assign({}, SL.data.characters.goku, {
      extras: [Object.assign({}, SL.data.characters.goku.extras[1], { forms: ['ssj9'], cine: { steps: [{ on: 'later', shot: 'dolly' }] } })],
    });
    const p = SL.Schema.validateCharacter(bad).join('; ');
    ok(/unknown event "later"/.test(p) && /unknown shot "dolly"/.test(p) && /unknown form "ssj9"/.test(p), p);
    const nappa = SL.data.characters.goku.extras.find((x) => x.id === 'nappaRush');
    const perchLast = Object.assign({}, SL.data.characters.goku, { extras: [Object.assign({}, nappa, { hits: nappa.hits.slice(0, 3) })] });
    ok(/perch must be "head" and not the last step/.test(SL.Schema.validateCharacter(perchLast).join('; ')), 'a head-stand with no blow after it is reported');
    const fi = SL.data.characters.vegeta.extras.find((x) => x.id === 'finalImpact');
    const aimLast = Object.assign({}, SL.data.characters.vegeta, { extras: [Object.assign({}, fi, { hits: fi.hits.slice(0, 2) })] });
    ok(/step needs a blow after it/.test(SL.Schema.validateCharacter(aimLast).join('; ')), 'a raised hand with no shot after it is reported');
  });

  /* ---- Roadmap One (the records-and-ultimates PDF), 2026-10-17: the gaps found by the audit ---- */

  /** Fires the player's Ultimate in Training, held for `hold` frames (0 = let go at once); returns the beam. */
  function fireUlt(b, p, hold) {
    let n = 0;
    p.controller = { update: () => Object.assign(b.SL ? b.SL.emptyIntent() : {}, { ult: ++n === 1, ultHeld: n <= hold }) };
    let beam = null;
    for (let i = 0; i < 260 && !beam; i++) {
      b.update(1 / 60);
      if (p.state === 'beamFire') beam = p.sd.beam;
    }
    return beam;
  }

  test('Roadmap One — Final Flash: charge decides its strength; ready at 70 frames as before (5000), a fully charged tier at 108 (6000, wider) with its own shots', () => {
    for (const hold of [0, 200]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'vegeta', p2: 'goku', distance: 10 });
      b.SL = gg.SL;
      const v = b.player;
      v.ki = v.kiMax;
      const shots = spyShots(b);
      const beam = fireUlt(b, v, hold);
      ok(beam, 'the beam fires');
      if (!hold) {
        ok(Math.abs(beam.damage - 5000) < 30 && Math.abs(beam.radius - 1.9) < 0.03, 'let go at once: the old 5000 / 1.9 m (' + Math.round(beam.damage) + ', ' + beam.radius.toFixed(2) + ')');
        eq(v.sd.tier, 1, 'the first tier');
      } else {
        ok(beam.damage > 5900 && beam.radius > 2.3, 'held: the full tier (' + Math.round(beam.damage) + ', ' + beam.radius.toFixed(2) + ')');
        eq(v.sd.tier, 2, 'the last tier');
        ok(shots.filter((s) => s === 'frontShot').length >= 2, 'square on him again as it reaches full (' + shots.join(' ') + ')');
      }
      gg.step(b, 200);
      eq(b.camera.shot, null, 'camera back');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('Roadmap One — Super Kamehameha (Adult Gohan): its cine (stance, hands, side-on at the release and the push) and the second push into the flowing beam (wider and harder)', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'adult_gohan', p2: 'goku', distance: 40 });
    b.SL = gg.SL;
    const p = b.player;
    p.ki = p.kiMax;
    const shots = spyShots(b);
    const beam = fireUlt(b, p, 0);
    ok(beam, 'the beam fires');
    const r0 = beam.radius, d0 = beam.damage;
    for (let i = 0; i < 10 && p.state === 'beamFire'; i++) b.update(1 / 60);
    ok(beam.radius > r0 * 1.2 && beam.damage > d0 * 1.05, 'the second push (' + r0.toFixed(2) + ' -> ' + beam.radius.toFixed(2) + ')');
    gg.step(b, 240);
    for (const k of ['ultimateChargeShot', 'handShot', 'wideShot']) ok(shots.includes(k), k + ' in ' + shots.join(' '));
    ok(shots.filter((s) => s === 'wideShot').length >= 2, 'side-on at the release and again at the push');
    eq(b.camera.shot, null, 'camera back');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Roadmap One — villain finishers: Final Form Frieza\'s Death Ball and Perfect Cell\'s Solar Kamehameha play their own shots, then give the camera back', () => {
    for (const [p1, form, want] of [['frieza', 'final', ['handShot', 'reverseShot', 'pathShot']], ['cell', 'perfect', ['frontShot', 'pullShot', 'wideShot']]]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1, p2: 'goku', distance: 12 });
      const p = b.player;
      toForm(p, form);
      p.ki = p.kiMax;
      const shots = spyShots(b);
      ok(p.specFor('ultimate').cine, p1 + ': the Ultimate has a cine');
      ok(p._trySpecial('ultimate'), p1 + ': fired');
      gg.step(b, 300);
      for (const k of want) ok(shots.includes(k), p1 + ': ' + k + ' in ' + shots.join(' '));
      eq(b.camera.shot, null, p1 + ': camera back');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('Roadmap One — Perfect Counter (Perfect Cell): earned after the Cell Games, only from a Perfect Guard (Heavy), the adaptation rush lands; the story keeps his old heavy', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'cell', p2: 'goku', distance: 1.6 });
    const c = b.player, o = b.fighters.find((f) => f !== c);
    toForm(c, 'perfect');
    c.ki = c.kiMax;
    ok(!entry(SL, b, c, 'x:perfectCounter'), 'hidden before the Cell Games are over');
    SL.Save.completeMission('cell_fatherson', { score: 1, rank: 'C' });
    eq(entry(SL, b, c, 'x:perfectCounter').locked, 'Perfect Guard, then Heavy', 'on the wheel, locked outside a Perfect Guard');
    eq(c._trySpecial('x:perfectCounter'), false, 'never pressed cold');
    toForm(c, 'base');
    c.counterFrames = 45;
    ok(!(c.moveSet.counter && c.moveSet.counter.heavy), 'Imperfect Cell has no such counter');
    toForm(c, 'perfect');
    c.ki = c.kiMax;
    c.counterFrames = 45; // a Perfect Guard has just happened
    c.setState('free');
    const ki0 = c.ki;
    let dealt = 0;
    b.on('damage', (e) => e.target === o && (dealt += e.amount));
    ok(c._startCounter('heavy'), 'the counter starts');
    eq(c.state, 'rush', 'as the rush');
    eq(c.sd.spec.id, 'perfectCounter');
    eq(c.counterFrames, 0, 'the window spent');
    ok(ki0 - c.ki >= 45, 'it pays its ki');
    gg.step(b, 220);
    ok(dealt > 2000, 'the adaptation rush lands (' + Math.round(dealt) + ')');
    eq(b.camera.shot, null, 'camera back');
    // the story: the counter is not offered, the press falls back to his heavy
    const g2 = H.create({ quiet: true, seed: 3 });
    g2.SL.Save.completeMission('cell_fatherson', { score: 1, rank: 'C' });
    const b2 = g2.battle({ p1: 'cell', p2: 'goku', distance: 1.6 });
    const c2 = b2.player;
    toForm(c2, 'perfect');
    c2.ki = c2.kiMax;
    b2.mode = 'story';
    c2.counterFrames = 45;
    c2.setState('free');
    eq(c2._startCounter('heavy'), false, 'story: no Perfect Counter');
    eq(gg.errors.length + g2.errors.length, 0, 'engine errors');
  });

  test('Roadmap One — Adult and Ultimate Gohan\'s own counters (Perfect Guard, then Light / Heavy) and Ultimate Gohan\'s own heavies', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.battle({ p1: 'adult_gohan', p2: 'goku', distance: 1.6 });
    const p = b.player, o = b.fighters.find((f) => f !== p);
    const want = { base: ['agCatchElbow', 'agKneeCounter'], ultimate: ['ugSlipPalm', 'ugGutCounter'] };
    let dealt = 0;
    b.on('damage', (e) => e.target === o && (dealt += e.amount));
    for (const form of ['base', 'ultimate']) {
      toForm(p, form);
      ['light', 'heavy'].forEach((kind, i) => {
        // in reach again each time (the last counter knocked him away)
        o.setState('free');
        o.setPosition(p.pos.clone().addScaledVector(p.forward, 1.4));
        p.faceTarget(999);
        p.counterFrames = 45;
        p.setState('free');
        dealt = 0;
        ok(p._startCounter(kind), form + ' ' + kind + ': the counter starts');
        eq(p.sd.move && p.sd.move.id, want[form][i]);
        gg.step(b, 40);
        ok(dealt > 0, form + ' ' + kind + ': it lands');
      });
    }
    eq(p.moveSet.heavy[0].id, 'ugHammer', 'Ultimate Gohan: his own heavy');
    toForm(p, 'base');
    eq(p.moveSet.heavy[0].id, 'agAxe', 'base keeps the axe');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Roadmap One — Stardust Breaker (Super Saiyan Gogeta): earned by Fusion Reborn\'s "Gogeta", the orb over the palm, the crush, the dust thrown into him; nothing left behind', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'gogeta', p2: 'goku', distance: 9 });
    const p = b.player, o = b.fighters.find((f) => f !== p);
    toForm(p, 'ssj');
    p.ki = p.kiMax;
    ok(!entry(SL, b, p, 'x:stardustBreaker'), 'hidden before Fusion Reborn');
    SL.Save.completeMission('fr_gogeta', { score: 1, rank: 'C' });
    eq(entry(SL, b, p, 'x:stardustBreaker').locked, null, 'earned');
    toForm(p, 'base');
    ok(entry(SL, b, p, 'x:stardustBreaker').locked, 'Super Saiyan only');
    toForm(p, 'ssj');
    p.ki = p.kiMax;
    const shots = spyShots(b);
    let dealt = 0;
    b.on('damage', (e) => e.target === o && (dealt += e.amount));
    ok(p._trySpecial('x:stardustBreaker'), 'used');
    eq(p.state, 'breaker');
    gg.step(b, 20);
    ok(p.sd.prism && p.sd.prism.r > 0.1, 'the orb grows over his palm');
    const orb = p.sd.prism;
    gg.step(b, 200);
    ok(dealt > 3000, 'the dust lands (' + Math.round(dealt) + ')');
    eq(p.state, 'free');
    ok(!orb.alive, 'the orb gone');
    ok(shots.includes('faceShot') && shots.includes('ultimateChargeShot') && shots.includes('reverseShot'), 'its shots: ' + shots.join(' '));
    eq(b.camera.shot, null, 'camera back');
    // interrupted before the crush: the orb fades, nothing stays
    p.ki = p.kiMax;
    p._trySpecial('x:stardustBreaker');
    gg.step(b, 10);
    const orb2 = p.sd.prism;
    p.setState('free');
    gg.step(b, 30);
    ok(orb2 && !orb2.alive, 'interrupted: the orb fades');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('transformations: a story that owns the camera (sd.noShots) gets no engine shots on either path — the sequence (SSJ2) and the plain full change (God Ki); without it both still shoot', () => {
    for (const [formId, noShots] of [['ssj2', true], ['godki', true], ['ssj2', false], ['godki', false]]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
      const g = b.player, i = g.def.forms.findIndex((f) => f.id === formId);
      ok(i > 0, formId + ' exists');
      const seen = spyShots(b);
      g.setState('transform', { form: g.def.forms[i], index: i, noShots });
      gg.until(b, () => g.state !== 'transform', 60 * 12);
      eq(g.form.id, formId, formId + ' applied');
      const shot = seen.some((k) => k === 'transformShot' || k === 'faceShot' || k === 'pullShot');
      eq(shot, !noShots, formId + (noShots ? ': no engine shot under noShots' : ': the engine shoots it') + ' (' + seen.join(',') + ')');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('Roadmap Three — The Saiyan Prince B02 / S03 (research draft): after the first exchange they meet in the air, trade six blocked blows circling under an overhead orbit, the jab, the forearm and the palm, and flip back to medium range in the air; watched or skipped', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.mission('saiyan_vegeta', { startPhase: 1 });
      const m = b.mission, g = b.story.goku, v = b.story.vegeta;
      const w = watch ? 'watched' : 'skipped';
      let rings = 0, rolled = false, maxStep = 0, last = null;
      const ring = b.vfx.ring.bind(b.vfx);
      b.vfx.ring = (p, r, col, ...x) => (col === 0xfff4d8 && rings++, ring(p, r, col, ...x));
      gg.until(b, () => m.flags.airExchange && !b.inputLocked, 60 * 20, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        if (m.flags.firstExchange && !m.flags.airExchange) {
          if (b.camera.roll > 0.1) rolled = true;
          if (last && watch) maxStep = Math.max(maxStep, g.pos.distanceTo(last));
          last = g.pos.clone();
        }
      });
      ok(m.flags.firstExchange && m.flags.airExchange, w + ': B01, then B02 staged');
      ok(!b.inputLocked && g.state === 'free' && v.state !== 'scripted' && !b.camera.shot, w + ': the duel handed over, the camera given back');
      ok(g.anim.root.rx > -1 && v.anim.root.rx > -1, w + ': the flip\'s full turn wrapped, nothing left to unwind (' + g.anim.root.rx.toFixed(2) + ', ' + v.anim.root.rx.toFixed(2) + ')');
      ok(!g.grounded && !v.grounded, w + ': handed over in the air');
      const gy = g.pos.y - b.stage.heightAt(g.pos.x, g.pos.z);
      ok(gy > 5 && gy < 10, w + ': ~7 m over the rock (' + gy.toFixed(1) + ' m)');
      const d = g.distTo(v);
      ok(d > 7 && d < 11, w + ': flipped back to medium range (' + d.toFixed(1) + ' m)');
      if (watch) {
        ok(rings >= 8, 'every blow blocked with a ring of light, plus the forearm and the palm (' + rings + ')');
        ok(rolled, 'S03: the overhead orbit at a Dutch angle');
        ok(maxStep < 1, 'Goku never jumps more than a metre in a frame (' + maxStep.toFixed(2) + ' m)');
      }
      eq(m.def.phases[m.phaseIndex].id, 'duel', w + ': the duel is played from here');
      b.dispose();
      eq(gg.errors.length, 0, w + ': engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    }
  });

  test('Roadmap Three — The Saiyan Prince B03 / S04 (research draft): the player\'s first Kaioken in the duel is staged (face, wide, the prince\'s shock, Goku at his back), then the duel goes on; only once', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.mission('saiyan_vegeta', { startPhase: 1 });
    const m = b.mission, g = b.story.goku, v = b.story.vegeta;
    const phase = () => m.def.phases[m.phaseIndex].id;
    ok(gg.until(b, () => m.flags.firstExchange && !b.inputLocked, 60 * 20) >= 0, 'the duel is handed over after the first exchange (B01)');
    g.ki = g.kiMax;
    ok(g._tryTransform(), 'the player lights the Kaioken');
    ok(gg.until(b, () => b.inputLocked && b.camera.shot, 30) >= 0, 'the moment is staged at once');
    ok(gg.until(b, () => !b.inputLocked, 60 * 10) >= 0, 'control comes back');
    ok(m.flags.vegetaSawKaioken && m.flags.kaiokenIgnite, 'the prince\'s shock and the vanish played');
    eq(g.form.id, 'kaioken', 'still in Kaioken');
    ok(g.distTo(v) < 2.2, 'Goku is at the prince\'s back: ' + g.distTo(v).toFixed(2));
    ok(g.state === 'free' && v.state === 'free' && !b.camera.shot, 'both fighters and the camera are given back');
    eq(phase(), 'duel', 'the duel goes on (B04 waits for its HP threshold)');
    // dropped and lit again: not staged a second time
    g.applyForm(0);
    g.ki = g.kiMax;
    g.strain = 0;
    g.overloadCooldown = 0;
    ok(g._tryTransform(), 'lit again');
    ok(gg.until(b, () => b.inputLocked, 90) < 0, 'only the first Kaioken is staged');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Roadmap Three — The Saiyan Prince B-CLASH-01/02/04 (research draft): the prince rises and charges, Goku\'s stance; in a real struggle the prince presses, then Goku surges and wins', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.mission('saiyan_vegeta', { startPhase: 2 });
    const m = b.mission, g = b.story.goku, v = b.story.vegeta;
    ok(gg.until(b, () => !b.inputLocked, 60 * 20) >= 0, 'the struggle is handed over');
    ok(m.flags.clashBuildUp, 'the rise, the Galick charge and Goku\'s stance played');
    eq(g.form.id, 'kaioken', 'Goku in Kaioken for it');
    // a player who answers the Galick Gun's charge with a charged Kamehameha, then mashes at a human rate (12 presses/s)
    let fired = 0, starts = 0, end = null;
    b.on('clashStart', () => starts++);
    b.on('clashEnd', (e) => (end = e));
    g.controller = {
      update: () => {
        const it = gg.SL.emptyIntent();
        if (!fired && v.state === 'beamCharge') fired = b.frame;
        if (fired && b.frame - fired < 3) it.s1 = true;
        if (fired && b.frame - fired < 40) it.s1Held = true;
        return it;
      },
    };
    gg.SL.Input.pressed = (a) => a === 'light' && b.clash.active && b.frame % 5 === 0;
    // S-CLASH-03 / 04: the struggle's own camera — wide and side-on as the waves meet, then low under the ball of light
    let wideAtMeet = false, lowFrames = 0, below = 0, minFov = 99, maxFov = 0, lowSeen = 0;
    gg.until(b, () => end || m.objectives.some((o) => o.id === 'struggle' && o.done), 60 * 15, () => {
      const c = b.clash.active, cam = b.camera.camera;
      if (!c) return;
      const across = Math.abs(cam.position.clone().sub(c.point).setY(0).normalize().dot(v.pos.clone().sub(g.pos).setY(0).normalize()));
      if (c.t < 0.5 && b.camera.shot && across < 0.3 && cam.position.distanceTo(c.point) > 25) wideAtMeet = true;
      // only the frames the low lens drew (not the cut to Goku at his surge)
      if (c.t > 0.7 && (m.flags.clashLow || 0) > lowSeen) {
        lowSeen = m.flags.clashLow;
        lowFrames++;
        if (cam.position.y < c.point.y - 2 && cam.position.distanceTo(c.point) < 16) below++;
        minFov = Math.min(minFov, cam.fov);
        maxFov = Math.max(maxFov, cam.fov);
      }
    });
    const shotAfter = b.camera.shot;
    gg.SL.Input.pressed = () => false;
    eq(starts, 1, 'the beams meet');
    ok(m.flags.clashSurge, 'the swing: the prince presses, Goku forces the Kaioken further');
    ok(end && end.winner === g, 'Goku wins the struggle');
    ok(wideAtMeet, 'S-CLASH-03: wide and side-on to the line between them as the waves meet');
    ok(lowFrames > 60 && below / lowFrames > 0.9, 'S-CLASH-04: low under the collision point, looking up into it (' + below + '/' + lowFrames + ')');
    ok(maxFov - minFov > 4, 'the lens pushes in and eases out with the struggle (fov ' + minFov.toFixed(1) + '–' + maxFov.toFixed(1) + ')');
    ok(m.flags.clashGokuCut, 'a cut to Goku as he forces the Kaioken further');
    eq(shotAfter, null, 'the camera is given back when the clash resolves');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Roadmap Three — the ToP endgame CS-END-03 (research draft): in Goku\'s flight the spent body catches the change twice for a few frames before the flash; in the fall Jiren looks up at them and stops fighting; the mission still ends, watched or skipped', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const idx = gg.SL.data.missions.top_finale.phases.findIndex((p) => p.id === 'burst');
      let goldFrames = 0, burstFrames = 0;
      const r = gg.playMission('top_finale', { startPhase: idx, watch, maxSeconds: 400, onBattle: (b) => {
        b.onTick(() => {
          const m = b.mission;
          const ph = m && m.def.phases[m.phaseIndex];
          if (!ph || ph.id !== 'burst' || m.flags.ssjFlickers === undefined || b.story.goku.form.id === 'ssj') return true;
          burstFrames++;
          if (b.story.flickerOn) goldFrames++;
          return true;
        });
      } });
      const w = watch ? 'watched' : 'skipped', F = r.m.flags;
      eq(r.state, 'success', w + ': the mission ends');
      if (watch) {
        eq(F.ssjFlickers, 2, 'the change catches twice before the flash');
        ok(goldFrames >= 4 && goldFrames <= 9, 'each for a few frames only (' + goldFrames + ' gold of ' + burstFrames + ')');
        ok(F.jirenAccepts, 'Jiren stops fighting as they fall');
      }
      r.b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors');
    }
  });

  test('Roadmap Three — the ToP endgame S-END-04 / CS-END-02 (research drafts): in the final push the frame splits, Frieza\'s eyes on the left and Goku\'s on the right, each face turned to the seam, shaking, Jiren straining across the bottom; Goku\'s teal drops to black twice; Frieza\'s gold fails at the barrier and the promise is a split too; the full frame comes back and the mission ends, watched, skipped or with nobody pushing', () => {
    const edgeAt = (SL) => SL.data.missions.top_finale.phases.findIndex((p) => p.id === 'edge');
    const probe = (gg, b, rec) => b.onTick(() => {
      const m = b.mission, ph = m && m.def.phases[m.phaseIndex];
      if (!ph || ph.id !== 'edge') {
        if (rec.edgeSeen && rec.after === undefined) {
          rec.after = b.split;
          rec.capsAfter = [b.story.frieza.auraViewCap, b.story.goku.auraViewCap, b.story.jiren.auraViewCap];
        }
        return true;
      }
      rec.edgeSeen = true;
      if (!b.split) return true;
      rec.frames++;
      const S = b.story, faces = [gg.SL.Cinema.body(S.frieza).face, gg.SL.Cinema.body(S.goku).face];
      rec.panels = b.split.length;
      if (b.split[2]) rec.jirenDist = Math.max(rec.jirenDist || 0, b.split[2].position.distanceTo(gg.SL.Cinema.body(S.jiren).face));
      rec.friezaForm = S.frieza.form.id;
      b.split.slice(0, 2).forEach((c, i) => {
        rec.maxDist = Math.max(rec.maxDist, c.position.distanceTo(faces[i]));
        // the face (the head's own forward) against the lens' right: + is turned to screen right (Frieza, left half)
        const f = i ? S.goku : S.frieza, T = gg.THREE;
        const right = new T.Vector3(1, 0, 0).applyQuaternion(c.quaternion);
        const fw = new T.Vector3(0, 0, 1).applyQuaternion(f.model.joints.head.getWorldQuaternion(new T.Quaternion()));
        if ((i ? -1 : 1) * fw.dot(right) > 0.2) rec.toSeam[i]++;
      });
      if (rec.prev && b.split[0].position.distanceTo(rec.prev) > 0.002) rec.moved++;
      rec.prev = b.split[0].position.clone();
      if (S.goku.model.face.pupilMat.color.getHex() === 0x1a1a22) rec.black++;
      return true;
    });
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const rec = { frames: 0, maxDist: 0, toSeam: [0, 0], moved: 0, black: 0 };
      const r = gg.playMission('top_finale', { startPhase: edgeAt(gg.SL), watch, maxSeconds: 400, onBattle: (b) => probe(gg, b, rec) });
      const w = watch ? 'watched' : 'skipped';
      eq(r.state, 'success', w + ': the mission ends');
      ok(r.m.flags.splitEyes, w + ': the split frame plays');
      ok(rec.frames >= 60 && rec.frames <= 90, w + ': for about 1.3 s (' + rec.frames + ' frames)');
      ok(rec.maxDist < 0.6, w + ': each half an extreme close-up on its face (' + rec.maxDist.toFixed(2) + ' m at most)');
      ok(rec.toSeam[0] / rec.frames > 0.9 && rec.toSeam[1] / rec.frames > 0.9, w + ': Frieza turned to the seam on the left, Goku on the right (' + rec.toSeam.join(' / ') + ' of ' + rec.frames + ')');
      ok(rec.moved / rec.frames > 0.8, w + ': shaking (' + rec.moved + ' of ' + rec.frames + ' frames)');
      ok(rec.black >= 4 && rec.black <= 8, w + ': Goku\'s eyes drop to black twice for a few frames (' + rec.black + ')');
      eq(rec.panels, 3, w + ': the reference frame\'s third panel, Jiren under the two');
      ok(rec.jirenDist < 1.2, w + ': close on his straining face (' + (rec.jirenDist || 0).toFixed(2) + ' m)');
      eq(rec.friezaForm, 'final', w + ': Frieza in his white final form (his gold failed at the barrier)');
      eq(rec.after, null, w + ': the full frame is back after the push');
      ok(rec.capsAfter && rec.capsAfter.every((c) => c === undefined || c === null), w + ': and all three auras are given back (' + (rec.capsAfter || []).join(', ') + ')');
      r.b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors');
    }
    // the barrier: the gold fails, and the promise is a split frame (CS-END-02), Frieza left and Goku right; the frame is
    // whole again for the throw
    for (const watch of [true, false]) {
      const gp = H.create({ quiet: true, seed: 3 });
      const MB = gp.SL.data.missions.top_finale;
      let promise = 0, after = null, formAtPromise = null;
      const rp = gp.playMission('top_finale', { startPhase: MB.phases.findIndex((p) => p.id === 'barrier'), watch, maxSeconds: 400, onBattle: (b) => b.onTick(() => {
        const m = b.mission, ph = m && MB.phases[m.phaseIndex];
        if (!ph) return true;
        if (ph.id === 'barrier' && b.split && m.flags.promiseSplit) {
          promise++;
          formAtPromise = b.story.frieza.form.id;
        }
        if (ph.id === 'throw' && after === null) after = b.split || null;
        return true;
      }) });
      const w = watch ? 'watched' : 'skipped';
      eq(rp.state, 'success', w + ': from the barrier, the mission ends');
      ok(rp.m.flags.friezaGoldGone, w + ': Frieza\'s gold fails at the barrier');
      if (watch) {
        ok(promise > 300, 'the promise exchange as a split frame (' + promise + ' frames)');
        eq(formAtPromise, 'final', 'Frieza in his final form by then');
      }
      eq(after, null, w + ': the frame whole again for the throw');
      rp.b.dispose();
      eq(gp.errors.length, 0, w + ': no engine errors (barrier)');
    }
    // nobody pushing: the split still comes and goes, and the frame is whole when the push is over
    const gg = H.create({ quiet: true, seed: 3 });
    const b = gg.mission('top_finale', { startPhase: edgeAt(gg.SL) });
    let seen = false;
    gg.until(b, () => b.mission.state !== 'running' || b.mission.def.phases[b.mission.phaseIndex].id !== 'edge', 60 * 30, () => {
      if (b.split) seen = true;
    });
    ok(seen, 'idle: the split plays');
    eq(b.split, null, 'idle: the full frame when the push is over (' + b.mission.state + ')');
    b.dispose();
    eq(gg.errors.length, 0, 'idle: no engine errors');
  });

  test('Roadmap Three — S-END-04\'s split renderer: two or three viewports tile the canvas at any size and pixel ratio (odd widths, a resize between frames), only the seams cleared black; the canvas state is given back after; the battle draws the split only while it is set; disposing mid-split gives back the full frame, the auras and Goku\'s teal', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const SL = gg.SL, R = SL.Render, T = gg.THREE;
    const saved = { renderer: R.renderer, width: R.width, height: R.height };
    // a recording renderer; three.js floors each viewport / scissor component after scaling by the pixel ratio
    let D = 1, vp = null, sc = null, scissorOn = false, clear = [new T.Color(0x123456), 0.5], log = [];
    const dev = (r) => r.map((v) => Math.floor(v * D));
    R.renderer = {
      getClearColor: (c) => c.copy(clear[0]),
      getClearAlpha: () => clear[1],
      setClearColor: (c, a) => (clear = [new T.Color(c), a]),
      setViewport: (...r) => (vp = r),
      setScissor: (...r) => (sc = r),
      setScissorTest: (v) => (scissorOn = v),
      render: (scene, cam) => log.push({ draw: true, cam, vp: dev(vp), sc: dev(sc), aspect: cam.aspect, w: vp[2] / vp[3] }),
      clear: () => log.push({ draw: false, sc: dev(sc), color: clear[0].getHex() }),
    };
    const cam = () => new T.PerspectiveCamera(30, 1, 0.1, 10);
    for (const [W, H] of [[1280, 720], [701, 601], [875, 752], [700, 600], [333, 211]]) {
      for (const d of [1, 1.25, 1.5, 2]) {
        for (const n of [2, 3]) {
          D = d;
          log = [];
          R.width = W;
          R.height = H;
          const cams = Array.from({ length: n }, cam);
          R.renderSplit(null, cams);
          const at = W + 'x' + H + ' @' + d + ' ' + n + ' panels';
          const cw = Math.floor(W * d), ch = Math.floor(H * d), cover = new Uint8Array(cw * ch);
          const draws = log.filter((e) => e.draw);
          eq(draws.length, n, at + ': every camera drawn');
          for (const e of draws) {
            ok(Math.abs(e.aspect - e.w) < 1e-9, at + ': each camera\'s aspect is its viewport\'s');
            const [x, y, w, h] = e.sc;
            for (let yy = Math.max(0, y); yy < Math.min(ch, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(cw, x + w); xx++) cover[yy * cw + xx] = 1;
          }
          eq(cover.indexOf(0), -1, at + ': the panels cover the whole canvas');
          const clears = log.filter((e) => !e.draw);
          eq(clears.length, n - 1, at + ': one seam per split');
          ok(clears.every((e) => e.color === 0 && Math.min(e.sc[2], e.sc[3]) <= Math.ceil(6 * d)), at + ': the seams black and thin');
          ok(!scissorOn, at + ': scissor test off after');
          eq(vp.join(), [0, 0, W, H].join(), at + ': full viewport after');
          ok(clear[0].getHex() === 0x123456 && clear[1] === 0.5, at + ': clear colour given back');
        }
      }
    }
    // the battle draws the split only while it is set, and never touches the main camera
    const b = gg.mission('top_finale', { startPhase: SL.data.missions.top_finale.phases.findIndex((p) => p.id === 'edge') });
    D = 1;
    R.width = 1280;
    R.height = 720;
    const main = b.camera.camera, aspect0 = main.aspect, two = [cam(), cam()];
    log = [];
    b.split = two;
    b.render();
    ok(log.filter((e) => e.draw).length === 2 && log[0].cam === two[0], 'battle.split set: the two panels drawn');
    eq(main.aspect, aspect0, 'the main camera\'s aspect untouched');
    log = [];
    b.split = null;
    b.render();
    ok(log.length === 1 && log[0].cam === main, 'battle.split cleared: the main camera alone');
    Object.assign(R, saved);
    // dispose mid-split, on one of the frames Goku's eyes are black
    const S = b.story, pm = S.goku.model.face.pupilMat;
    let teal = null;
    gg.until(b, () => b.split && pm.color.getHex() === 0x1a1a22, 60 * 40, () => {
      if (!b.split) teal = pm.color.getHex();
    });
    ok(b.split && pm.color.getHex() === 0x1a1a22, 'split, Goku\'s eyes black for a frame');
    ok([S.frieza, S.goku, S.jiren].every((f) => f.auraViewCap === 0.1), 'the auras thinned for the split');
    b.dispose();
    eq(b.split, null, 'disposed mid-split: the full frame');
    ok([S.frieza, S.goku, S.jiren].every((f) => f.auraViewCap === undefined || f.auraViewCap === null), 'the auras given back');
    eq(pm.color.getHex(), teal, 'Goku\'s teal given back');
    eq(gg.errors.length, 0, 'no engine errors');
  });

  test('Roadmap Three — the MUI block MUI-S04 / MUI-S05 (research draft): at the form\'s limit the lens is close and shaking with silver lightning over him, then high and pulling back as he lies alone; the mission still ends, watched or skipped', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const SL = gg.SL;
      const idx = SL.data.missions.top_mui.phases.findIndex((p) => p.id === 'limit');
      const b = gg.mission('top_mui', { startPhase: idx });
      const g = b.story.goku, w = watch ? 'watched' : 'skipped';
      let rolled = false, high = 0;
      gg.until(b, () => b.mission.state !== 'running', 60 * 40, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
        if (b.mission.flags.muiOverload && !b.mission.flags.muiPullBack && Math.abs(b.camera.roll) > 0.005) rolled = true;
        if (b.mission.flags.muiPullBack) high = Math.max(high, b.camera.camera.position.y - g.pos.y);
      });
      eq(b.mission.state, 'success', w + ': the mission ends');
      eq(g.form.id, 'base', w + ': the silver is gone');
      if (watch) {
        ok(b.mission.flags.muiOverload && rolled, 'MUI-S04: the close, hand-held shot as the form breaks');
        ok(b.mission.flags.muiPullBack && high > 15, 'MUI-S05: high above him, pulling back (' + high.toFixed(1) + ' m)');
      }
      b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors');
    }
  });

  test('Roadmap Three — the MUI block B-MUI-05 / MUI-S02 / MUI-S03 (research draft): before the Mastered fight is handed over, Goku walks into Jiren\'s barrage slipping every blow and opens with a palm that skids him back, the fight then starts; B-MUI-07: the rush that puts Jiren on his back before OVER HIM; watched or skipped', () => {
    for (const watch of [true, false]) {
      const gg = H.create({ quiet: true, seed: 3 });
      const SL = gg.SL;
      const idx = SL.data.missions.top_mui.phases.findIndex((p) => p.id === 'counter');
      let whiffs = 0, hp0 = null, started = false;
      const b = gg.mission('top_mui', { startPhase: idx, onCreate: (bb) => {
        const sl = bb.vfx.slash.bind(bb.vfx);
        bb.vfx.slash = (p, q, col, ...x) => (col === 0xff5a3a && whiffs++, sl(p, q, col, ...x));
        bb.on('sceneStart', (e) => {
          if (e.id === 'top_mui_advance') (started = true), (hp0 = bb.story.goku.hp);
        });
      } });
      const g = b.story.goku, j = b.story.jiren;
      gg.until(b, () => !!b.mission.flags.muiAdvance && !b.inputLocked, 60 * 30, () => {
        if (!watch && b.inputLocked) b.skipRequested = true;
      });
      const w = watch ? 'watched' : 'skipped';
      ok(started && b.mission.flags.muiAdvance, w + ': the advance is staged');
      ok(!b.inputLocked && g.state !== 'scripted' && j.state !== 'scripted', w + ': and the fight is handed over');
      if (watch) {
        eq(whiffs, 5, 'five blows slipped');
        eq(g.hp, hp0, 'none of them touches him');
        ok(g.pos.distanceTo(j.pos) > 3 && g.pos.distanceTo(j.pos) < 8, 'the palm skids Jiren back off him (' + g.pos.distanceTo(j.pos).toFixed(1) + ' m)');
      }
      b.dispose();
      eq(gg.errors.length, 0, w + ': no engine errors');
      // B-MUI-07: OVER HIM opens with the rush that puts Jiren on his back (palm, spin kick, the afterimage, the fist from behind)
      const gg2 = H.create({ quiet: true, seed: 3 });
      const over = gg2.SL.data.missions.top_mui.phases.findIndex((p) => p.id === 'over');
      let atLine = null;
      const b2 = gg2.mission('top_mui', { startPhase: over, onCreate: (bb) => bb.on('say', (e) => {
        if (/Finish it/.test(e.line || '') && !atLine) atLine = { pose: bb.story.jiren.sd.pose, d: bb.story.goku.pos.distanceTo(bb.story.jiren.pos) };
      }) });
      gg2.until(b2, () => !!atLine, 60 * 20, () => {
        if (!watch && b2.inputLocked) b2.skipRequested = true;
      });
      ok(b2.mission.flags.muiTakedown, w + ': the takedown is staged');
      ok(atLine && atLine.pose === 'lieBack' && atLine.d < 3, w + ': Jiren on his back, Goku over him, when he says "Finish it"');
      b2.dispose();
      eq(gg2.errors.length, 0, w + ': no engine errors (OVER HIM)');
    }
  });
};
