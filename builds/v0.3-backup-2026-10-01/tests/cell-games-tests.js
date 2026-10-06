// The Cell Games rebuild (2026-09-17): arena, Goku vs Cell in four stages, the bed
// scene, Gohan's path to Super Saiyan 2, the Cell Juniors' squad AI, the rage state,
// Cell's adaptive AI, the playable Father-Son Kamehameha, the aftermath and every
// checkpoint. Runs the real engine headless (see tests/headless.js).
const H = require('./headless');

module.exports = function cellGamesTests({ test, eq, ok }) {
  console.log('\nThe Cell Games rebuild: interactive anime, played (headless)');

  const skipAll = (b) => () => {
    if (b.inputLocked) b.skipRequested = true;
  };
  const phaseIndex = (SL, id) => SL.data.missions.cell_games.phases.findIndex((p) => p.id === id);

  /** Plays from a phase with the bot until the phase after `untilId` begins (or the mission ends). */
  function runTo(opts) {
    const gg = H.create({ quiet: true, seed: opts.seed || 5 });
    const SL = gg.SL;
    const start = phaseIndex(SL, opts.from);
    const stopAt = opts.until ? phaseIndex(SL, opts.until) + 1 : null;
    let snap = null, b0 = null;
    const r = gg.playMission('cell_games', {
      startPhase: start,
      style: opts.style || 'reader',
      maxSeconds: opts.maxSeconds || 300,
      onBattle: (b) => {
        b0 = b;
        if (opts.onBattle) opts.onBattle(b, gg);
        b.on('missionPhase', (e) => {
          if (stopAt !== null && e.index === stopAt && !snap) {
            snap = opts.snapshot ? opts.snapshot(b) : true;
            b.mission.state = 'stopped';
          }
        });
      },
    });
    return { gg, SL, r, b: b0, snap };
  }

  test('the arena is its own place: a raised paved ring that cracks instead of denting, and a readable edge', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, THREE } = gg;
    const V3 = THREE.Vector3;
    const st = SL.data.stages.cellarena;
    eq(st.builder, 'arena', 'its own builder, not a renamed battlefield');
    const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'goku') });
    const S = b.stage;
    ok(S.arena && S.arena.half === 17, 'a ring 34 across');
    eq(S.heightAt(0, 0), S.arena.y, 'the paving is lifted analytically');
    eq(S.heightAt(16.9, -16.9), S.arena.y, 'right to the corner');
    ok(S.heightAt(17.6, 0) < S.arena.y - 3, 'and just past the edge you are off it: ' + S.heightAt(17.6, 0).toFixed(2));
    let cracks = 0, craters = 0;
    b.on('ringDamaged', () => cracks++);
    b.on('crater', () => craters++);
    const before = S.ringDamage;
    S.crater(new V3(2, S.arena.y, 3), 4, 0.6, null);
    eq(cracks, 1, 'an impact on the paving cracks it');
    ok(S.ringDamage > before, 'and the damage accumulates: ' + S.ringDamage.toFixed(3));
    eq(S.heightAt(2, 3), S.arena.y, 'without denting the platform');
    S.crater(new V3(40, S.heightAt(40, 0), 0), 4, 0.6, null);
    eq(craters, 1, 'off the platform the ground still craters');
    ok(S.crowdGroup && S.crowdGroup.children.length > 20 && S.landmarks.announcer, 'the broadcast crew and onlookers are there');
    gg.step(b, 120, skipAll(b));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('story order: the fever at home comes after "Ten in the Morning", and the Cell Games close Chapter 6 as 28 phases with 11 checkpoints', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const order = SL.data.storyOrder();
    eq(order.indexOf('android_fever'), order.indexOf('android_nineteen') + 1, 'the fever right after the virus: ' + order.filter((x) => x.startsWith('android')).join(' → '));
    eq(order.indexOf('cell_games'), order.indexOf('cell_perfect') + 1, 'the Cell Games after the perfect form');
    const def = SL.data.missions.cell_games;
    eq(def.stage, 'cellarena', 'on the arena');
    eq(def.phases.map((p) => p.id).join(','), 'ring,goku,measures,serious,blitz,speed,pressure,limit,regrow,forfeit,gohan,powers,refuses,hold,strike16,born,juniors,sixteen,ascend,purge,rage,spit,desperate,sacrifice,returns,beam,ends,after', 'phase order');
    eq(def.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'goku,serious,speed,limit,gohan,hold,juniors,purge,rage,desperate,beam', 'every playable stretch is a checkpoint');
    // every Cell Games scene is played by the mission: nothing written and left unused
    const src = def.phases.map((p) => p.run.toString()).join('\n');
    const sceneIds = ['games_open', 'cell_measures', 'cell_blitz', 'cell_pressure', 'cell_regrows', 'goku_forfeits', 'gohan_refuses', 'sixteen_strikes', 'juniors_born', 'sixteen_speaks', 'ssj2_reveal', 'cell_spits', 'goku_sacrifice', 'cell_returns', 'father_son', 'cell_ends', 'gohan_after'];
    for (const id of sceneIds) {
      ok(SL.data.scenes[id], 'scene ' + id + ' exists');
      ok(src.includes("'" + id + "'"), 'scene ' + id + ' is played by the mission');
    }
    // cinematic beats come from the fight's state, never from a clock
    ok(/gohanBreaking/.test(def.phases[phaseIndex(SL, 'ascend')].run.toString()), 'the ascension reads the story flag');
    for (const id of ['goku', 'serious', 'speed', 'gohan', 'hold', 'juniors', 'rage', 'desperate']) {
      const body = def.phases[phaseIndex(SL, id)].run.toString();
      ok(!/HOLD_SECONDS|t2 >=|seconds >=/.test(body), id + ' does not end on a timer');
    }
  });

  test('Goku vs Cell, stage 1: Goku in the ring as a Super Saiyan, Cell restrained (no beams, no flight), and the stage ends on what the fight proves', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'goku') });
    gg.step(b, 30, skipAll(b));
    const S = b.story, g = S.goku, c = S.cell;
    eq(b.player, g, 'the player has Goku');
    ok(g.controller instanceof SL.PlayerController, 'with a player controller');
    eq(g.form.id, 'ssj', 'as a Super Saiyan');
    eq(c.form.id, 'perfect', 'against the perfect form');
    ok(S.gohan.untargetable && S.piccolo.untargetable, 'everybody else is watching from the edge');
    ok(c.controller instanceof SL.AIController && c.controller.profileOverride.beam === 0 && c.noFlight, 'Cell is holding back: no beams, no flight');
    eq(b.playerLimits && b.playerLimits.up, false, 'and the first exchange is on the ground');
    // Goku proves something: the stage turns into the next beat
    for (let i = 0; i < 12 && b.mission.def.phases[b.mission.phaseIndex].id === 'goku'; i++) {
      c.takeHit(g, { type: 'melee', damage: 1600, knock: 'flinch', hitstun: 10, impact: 1, dir: c.forward.clone().negate() });
      gg.step(b, 20);
    }
    gg.step(b, 40, skipAll(b));
    ok(b.mission.phaseIndex > phaseIndex(SL, 'goku'), 'dealt damage ends the stage: now ' + b.mission.def.phases[b.mission.phaseIndex].id);
    ok(b.mission.flags.stage1 && b.mission.flags.stage1.dealt >= c.hpMax * 0.12, 'on the damage Goku dealt');
    eq(b.playerLimits, null, 'and the ground-only limit is lifted');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('Goku vs Cell, stages 2–4: serious (flight, beams, the ring breaks), the aerial exchange, and Cell\'s Kamehameha at the planet that has to be answered', () => {
    const s2 = runTo({ from: 'serious', until: 'serious', style: 'reader', seed: 5, snapshot: (b) => ({ cellHp: b.story.cell.hpFrac, gokuHp: b.story.goku.hpFrac, ring: b.stage.ringDamage }) });
    ok(s2.snap, 'stage 2 ends');
    ok(s2.snap.cellHp <= 0.66 || s2.snap.gokuHp <= 0.31, 'on Cell pushed back or Goku worn down: ' + JSON.stringify(s2.snap));
    ok(s2.snap.ring > 0, 'and the ring took damage during it: ' + s2.snap.ring.toFixed(3));
    const s3 = runTo({ from: 'speed', until: 'speed', style: 'reader', seed: 7, snapshot: (b) => ({ hits: b.mission.flags.aerialHits, gokuHp: b.story.goku.hpFrac }) });
    ok(s3.snap && (s3.snap.hits >= 8 || s3.snap.gokuHp <= 0.26), 'stage 3 ends on aerial hits (or Goku worn down): ' + JSON.stringify(s3.snap));
    // stage 4 with a player who answers
    const events = [];
    const s4 = runTo({
      from: 'limit', until: 'limit', style: 'reader', seed: 5,
      onBattle: (b) => {
        const c = b.story.cell;
        let rose = false;
        b.on('missionPhase', () => {});
        const t = setInterval;
        b.on('damage', (e) => {
          if (e.target === c && e.attacker === b.story.goku && e.type === 'beam') events.push('answer:' + c.state);
        });
        b.story._probe = () => (rose = rose || c.pos.y - b.stage.heightAt(c.pos.x, c.pos.z) > 14);
      },
      snapshot: (b) => ({ via: b.mission.flags.answeredVia, stage: b.mission.flags.stage }),
    });
    ok(s4.snap && ['interrupt', 'beam', 'clash'].includes(s4.snap.via), 'the Kamehameha is answered: ' + JSON.stringify(s4.snap) + ' ' + events.join(','));
    // stage 4 with a player who does nothing: Cell's beam lands, and the stretch cannot be lost
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'limit') });
    gg.step(b, 20, skipAll(b));
    const g = b.story.goku, c = b.story.cell;
    g.controller = { update: () => SL.emptyIntent() };
    let maxAlt = 0, charged = false, landed = 0;
    b.on('damage', (e) => {
      if (e.target === g && e.attacker === c && e.type === 'beam') landed++;
    });
    gg.step(b, 60 * 14, () => {
      maxAlt = Math.max(maxAlt, c.pos.y - b.stage.heightAt(c.pos.x, c.pos.z));
      if (c.state === 'beamCharge') charged = true;
    });
    ok(maxAlt >= 14, 'Cell climbs over the ring: ' + maxAlt.toFixed(1) + ' m');
    ok(charged, 'and charges where everybody can see it');
    ok(landed >= 1, 'unanswered, his beam lands: ' + landed);
    eq(b.mission.def.phases[b.mission.phaseIndex].id, 'limit', 'the stretch is still waiting for an answer');
    ok(g.alive && b.mission.state === 'running', 'and Goku is still standing: it cannot be lost, only answered');
    eq(s2.gg.errors.length + s3.gg.errors.length + s4.gg.errors.length + gg.errors.length, 0, 'engine errors');
    b.dispose();
  });

  test('Goku\'s condition: after the answer Cell regrows, Goku is exhausted and gives up, and throws Cell a Senzu Bean', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'regrow') });
    b.story.cell.hp = Math.round(b.story.cell.hpMax * 0.3);
    gg.until(b, () => b.mission.phaseIndex > phaseIndex(SL, 'forfeit'), 60 * 120, skipAll(b));
    const S = b.story, f = b.mission.flags;
    ok(f.cellRegrew && f.forfeited && f.senzuForCell, 'regrow, forfeit and the bean: ' + JSON.stringify(f));
    eq(S.cell.hp, S.cell.hpMax, 'Cell comes out of it whole');
    ok(S.goku.untargetable, 'Goku is out of the ring');
    eq(b.player, S.gohan, 'and the next stretch belongs to Gohan');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the bed scene: "The Fever" puts Goku in a bed with the heart virus and Chi-Chi beside him, in a room built for it — watched or skipped, the same', () => {
    const run = (skip) => {
      const gg = H.create({ quiet: true, seed: 2 });
      const { SL } = gg;
      const def = SL.data.missions.android_fever;
      eq(def.stage, 'son_house', 'on the interior stage');
      ok(SL.data.stages.son_house.storyOnly, 'which never appears in Free Battle');
      const b = gg.mission('android_fever');
      let atEnd = null, frames = 0;
      b.on('sceneEnd', (e) => {
        if (e.id !== 'goku_bed') return;
        const g = b.story.goku, c = b.story.chichi, L = b.stage.landmarks;
        atEnd = {
          gokuPose: g.state === 'scripted' ? g.anim.name : g.state,
          gokuOnBed: Math.abs(g.pos.y - L.bed.y) < 0.05 && Math.abs(g.pos.z - L.bed.z) < 1.2,
          chichiPose: c.anim.name,
          chichiAtStool: Math.hypot(c.pos.x - L.stool.x, c.pos.z - L.stool.z) < 0.05,
          flag: !!b.mission.flags.feverScene,
          skipped: e.skipped,
        };
      });
      gg.until(b, () => b.mission.state !== 'running', 60 * 90, () => {
        frames++;
        if (skip && b.inputLocked) b.skipRequested = true;
      });
      const out = Object.assign({ state: b.mission.state, frames, errors: gg.errors.length, chichi: SL.data.characters.chichi }, atEnd || {});
      b.dispose();
      return out;
    };
    const watched = run(false);
    const skipped = run(true);
    eq(watched.state, 'success', 'the mission completes');
    eq(watched.gokuPose, 'lieFever', 'Goku lies in bed with the fever');
    ok(watched.gokuOnBed, 'on the bed');
    eq(watched.chichiPose, 'cc_bedside', 'Chi-Chi sits at his bedside');
    ok(watched.chichiAtStool, 'on the stool');
    for (const k of ['gokuPose', 'gokuOnBed', 'chichiPose', 'chichiAtStool', 'flag', 'state']) eq(skipped[k], watched[k], 'skipped matches watched: ' + k);
    ok(watched.frames > 60 * 25, 'and it is allowed to breathe: ' + (watched.frames / 60).toFixed(1) + ' s watched');
    ok(skipped.frames < watched.frames, 'skipping is faster');
    eq(watched.chichi.assetLevel, 1, 'Chi-Chi is a level 1 prototype');
    eq(watched.errors + skipped.errors, 0, 'no engine errors');
  });

  test('Gohan enters: base form first, holding his own; pushed, he becomes a Super Saiyan through the staged transformation; then he refuses to fight the way Cell wants', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'gohan') });
    gg.step(b, 30, skipAll(b));
    const S = b.story, gh = S.gohan, c = S.cell;
    eq(b.player, gh, 'the player has Gohan');
    eq(gh.form.id, 'base', 'in base form');
    ok(gh.lockedForms && gh.lockedForms.ssj2, 'with the second form locked by the story');
    ok(gh.damageDealtMul < 0.6, 'hitting like a boy who does not want to: ×' + gh.damageDealtMul);
    eq(c.infiniteHp, true, 'Cell is only testing');
    ok(S.goku.untargetable && !S.goku.hidden, 'Goku watches from the edge');
    let transformed = 0;
    b.on('transformCinematic', () => transformed++);
    gg.until(b, () => b.mission.phaseIndex > phaseIndex(SL, 'refuses'), 60 * 120, () => {
      if (b.inputLocked) b.skipRequested = true;
      else if (b.mission.def.phases[b.mission.phaseIndex].id === 'gohan' && b.frame % 20 === 0) gh.takeHit(c, { type: 'melee', damage: 1400, knock: 'flinch', hitstun: 10, impact: 1, dir: gh.forward.clone().negate() });
    });
    eq(gh.form.id, 'ssj', 'he comes out of it a Super Saiyan');
    ok(b.mission.flags.gohanSsj && b.mission.flags.gohanRefused, 'and refuses: ' + JSON.stringify(b.mission.flags));
    eq(b.mission.def.phases[b.mission.phaseIndex].id, 'hold', 'into the stretch where he holds back');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('Cell Juniors: seven spawn and fight the Z Fighters; at most two work Gohan at once and they rotate; nobody dogpiles or stun-locks him; his friends really are beaten', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const { SL } = gg;
    const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'juniors') });
    gg.step(b, 20, skipAll(b));
    const S = b.story, gh = S.gohan;
    const juniors = S.juniors;
    eq(juniors.length, 7, 'seven Juniors');
    ok(juniors.every((j) => j.alive && !j.hidden && j.controller instanceof SL.AIController), 'all alive, visible and fighting');
    ok(juniors.every((j) => (j.def.ai.hooks === 'cell_junior')), 'on the squad hook');
    const allies = ['piccolo', 'vegeta', 'trunks', 'krillin', 'tien', 'goku'].map((k) => S[k]);
    ok(allies.every((a) => !a.untargetable && a.controller instanceof SL.AIController), 'the Z Fighters fight for real');
    // a player who only guards: the worst case for dogpiling
    gh.controller = { update: () => Object.assign(SL.emptyIntent(), { guard: b.frame % 90 < 60 }) };
    let maxMeleeOnPlayer = 0, maxOnAlly = 0, alliesHurt = 0, chain = 0, longest = 0, lastHit = -999;
    const pressureSeen = new Set(), roles = new Set();
    const recent = [];
    let maxDistinct = 0;
    b.on('squadRole', (e) => {
      roles.add(e.role);
      if (e.role === 'pressure') pressureSeen.add(e.fighter);
    });
    b.on('damage', (e) => {
      if (e.blocked) return;
      if (allies.includes(e.target) && juniors.includes(e.attacker)) alliesHurt++;
      if (e.target === gh && juniors.includes(e.attacker)) {
        recent.push([b.frame, e.attacker]);
        chain = b.frame - lastHit < 45 ? chain + 1 : 1;
        lastHit = b.frame;
        longest = Math.max(longest, chain);
      }
    });
    const phaseJ = phaseIndex(SL, 'juniors');
    gg.step(b, 60 * 20, () => {
      if (b.mission.phaseIndex !== phaseJ) return;
      const onPlayer = juniors.filter((j) => j.alive && j.target === gh && j.state === 'attack').length;
      maxMeleeOnPlayer = Math.max(maxMeleeOnPlayer, onPlayer);
      for (const a of allies) if (!a.untargetable) maxOnAlly = Math.max(maxOnAlly, juniors.filter((j) => j.alive && j.target === a && j.state === 'attack').length);
      while (recent.length && b.frame - recent[0][0] > 120) recent.shift();
      maxDistinct = Math.max(maxDistinct, new Set(recent.map((r) => r[1])).size);
    });
    ok(maxMeleeOnPlayer <= 2, 'never more than two Juniors in melee on Gohan at once: ' + maxMeleeOnPlayer);
    ok(maxOnAlly <= 2, 'never more than two swinging at any one friend: ' + maxOnAlly);
    ok(maxDistinct <= 4, 'at most four different Juniors land hits on him in any two seconds (a pair and the pair that relieves it): ' + maxDistinct);
    ok(longest <= 30, 'no endless hit chain: longest ' + longest);
    ok(roles.has('pressure') && roles.has('ally'), 'the squad splits into roles: ' + [...roles].join(','));
    ok(pressureSeen.size > 2, 'and the pressure rotates between them: ' + pressureSeen.size + ' different Juniors took a turn');
    ok(alliesHurt > 10, 'the Juniors are beating his friends: ' + alliesHurt + ' hits');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the rage state: tears first, then the shadow, then the red line; removable; composes with forms and the torn gi', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ p1: 'teen_gohan', p2: 'cell' });
    const gh = b.player;
    const events = [];
    b.on('rageState', (e) => events.push(e.amount));
    gh.setRage(true, 0.3);
    let r = gh.model._rage;
    ok(r.group.visible && r.tears.every((t) => t.visible), 'at 0.3 the tears are there');
    ok(!r.shadow.visible && r.lineParts.every((p) => !p.visible), 'but not the shadow or the line yet');
    gh.setRage(true, 0.55);
    ok(r.shadow.visible && r.lineParts.every((p) => !p.visible), 'at 0.55 the shadow gathers, the line still waits');
    gh.setRage(true, 1);
    ok(r.lineParts.every((p) => p.visible) && r.line.material.opacity > 0.9, 'at 1 the red line cuts across');
    gh.setTorn(true);
    gh.applyForm(2);
    r = gh.model._rage;
    ok(gh.raged && r.group.visible && r.lineParts.every((p) => p.visible), 'it survives the Super Saiyan 2 change');
    ok(gh.torn, 'and so does the torn gi');
    gh.setRage(false);
    ok(!gh.model._rage.group.visible && !gh.raged, 'and it comes off');
    eq(events.join(','), '0.3,0.55,1,0', 'each step is announced');
    eq(gg.errors.length, 0, 'engine errors');
    b.dispose();
  });

  test('Android 16\'s death: watched or skipped, 16 is gone, Gohan wears the rage at full, and the ascension flag is set — and the scene is staged as silence, tears, the red line and the scream', () => {
    const { SL } = H.create({ quiet: true, seed: 1 });
    const sc = SL.data.scenes.sixteen_speaks;
    eq(sc.music && sc.music.song, null, 'the music stops');
    const rages = sc.events.filter((e) => e.rage).map((e) => e.rage.amount);
    eq(rages.join(','), '0.3,0.55,1', 'the face goes tears → shadow → red line, in that order');
    const iLine = sc.events.findIndex((e) => e.rage && e.rage.amount === 1);
    const iScream = sc.events.findIndex((e) => e.pose && e.pose.some((p) => p.face === 'shout'));
    ok(iScream > iLine, 'the scream comes after the red line');
    ok(sc.events.some((e) => e.crack) && sc.events.some((e) => e.vfx && e.vfx.kind === 'rocks') && sc.events.some((e) => e.vfx && e.vfx.kind === 'bolt'), 'the ring cracks, rocks lift, lightning starts');
    ok(sc.events.some((e) => e.cam && e.cam.orbit), 'and the camera circles him');
    ok(sc.events.some((e) => !e.say && (e.hold || 0) >= 4 && e.cam && (e.cam.fov2 || e.cam.fov) <= 30), 'there is a long silent close-up');
    const run = (skip) => {
      const gg = H.create({ quiet: true, seed: 4 });
      const b = gg.mission('cell_games', { startPhase: phaseIndex(gg.SL, 'sixteen') });
      let snap = null, frames = 0;
      b.on('missionPhase', (e) => {
        if (!snap && e.index === phaseIndex(gg.SL, 'ascend')) {
          const S = b.story;
          snap = JSON.stringify({ a16: [S.a16.alive, !!S.a16.hidden], raged: !!S.gohan.raged, amount: S.gohan.rageAmount, visible: S.gohan.model._rage.group.visible, line: S.gohan.model._rage.lineParts.every((p) => p.visible), flags: ['sixteenGone', 'gohanRaged', 'gohanBreaking'].map((k) => !!b.mission.flags[k]), state: S.gohan.state });
        }
      });
      gg.until(b, () => !!snap, 60 * 90, () => {
        frames++;
        if (skip && b.inputLocked) b.skipRequested = true;
      });
      b.dispose();
      return { snap, frames, errors: gg.errors.length };
    };
    const w = run(false), s = run(true);
    ok(w.snap && JSON.parse(w.snap).raged && JSON.parse(w.snap).line, 'watched: ' + w.snap);
    eq(s.snap, w.snap, 'skipped leaves exactly the same state');
    ok(s.frames < w.frames, 'skip is faster: ' + s.frames + ' vs ' + w.frames);
    eq(w.errors + s.errors, 0, 'no engine errors');
  });

  test('Super Saiyan 2: the transformation and the reveal leave the same state watched or skipped, and land in a different fighter', () => {
    const run = (skip) => {
      const gg = H.create({ quiet: true, seed: 4 });
      const { SL } = gg;
      const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'sixteen') });
      let snap = null, frames = 0;
      b.on('missionPhase', (e) => {
        if (!snap && e.index === phaseIndex(SL, 'purge')) {
          const S = b.story, gh = S.gohan;
          snap = JSON.stringify({
            form: gh.form.id, locked: Object.keys(gh.lockedForms || {}), raged: gh.rageAmount, torn: !!gh.torn, state: gh.state,
            idleIsStance: gh.anim.poses.idle === gh.form.poses.idle, light: gh.moveSet.light.map((x) => x.id), s1: gh.specFor('special1').name,
            cellForm: S.cell.form.id, flags: ['ascended', 'ssj2Revealed'].map((k) => !!b.mission.flags[k]), locks: b.inputLocked,
          });
        }
      });
      gg.until(b, () => !!snap, 60 * 150, () => {
        frames++;
        if (skip && b.inputLocked) b.skipRequested = true;
      });
      b.dispose();
      return { snap, frames, errors: gg.errors.length };
    };
    const w = run(false), s = run(true);
    ok(w.snap, 'watched reaches the next stretch');
    const o = JSON.parse(w.snap);
    eq(o.form, 'ssj2', 'Super Saiyan 2');
    eq(o.locked.length, 0, 'the story unlocked it');
    ok(o.idleIsStance, 'a different stance');
    ok(o.light.every((id) => id.startsWith('tg2')), 'different strikes: ' + o.light.join(','));
    eq(o.s1, 'Super Kamehameha', 'a stronger Kamehameha');
    eq(o.raged, 1, 'still wearing the rage');
    eq(s.snap, w.snap, 'skipped: exactly the same');
    ok(s.frames < w.frames, 'skip is faster');
    eq(w.errors + s.errors, 0, 'no engine errors');
  });

  test('Super Saiyan 2 as a gameplay identity: stance, strikes, counters, specials, AI personality, lightning, hair — and back again when he leaves the form', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const t = SL.data.characters.teen_gohan;
    const f2 = t.forms.find((x) => x.id === 'ssj2');
    eq(JSON.stringify(SL.Schema.validateCharacter(t)), '[]', 'Gohan still validates');
    ok(f2.poses && f2.poses.idle, 'own stance');
    ok(f2.moves && f2.moves.counter && f2.moves.counter.light && f2.moves.counter.heavy, 'own Perfect-Guard counters');
    ok(f2.moves.dash.teleport, 'a dash that ends behind the target');
    eq(f2.specials.special2.type, 'rush', 'a signature rush');
    ok(f2.aura.lightning, 'lightning in the aura during play, not just in the cinematic');
    ok(f2.ai && f2.ai.personality === 'aggressive', 'a different AI personality');
    ok(f2.intro && f2.victory, 'its own intro and victory');
    ok(SL.data.hair.gohan_ssj2.spikes.some((s) => s.a[2] > 0.5 && s.d[1] < -0.5), 'the strand over his forehead');
    const b = gg.battle({ p1: 'cell', p2: 'teen_gohan', distance: 4 });
    const gh = b.fighters[1];
    gh.controller = new SL.AIController(b, { difficulty: 'normal' });
    gg.step(b, 30);
    const baseAggr = gh.controller.p.aggression;
    gh.applyForm(2);
    gg.step(b, 30);
    ok(gh.controller.p.aggression > baseAggr && gh.controller.p.personality === 'aggressive', 'the CPU fights differently in the form: ' + baseAggr + ' → ' + gh.controller.p.aggression);
    eq(gh.anim.poses.idle, f2.poses.idle, 'and stands differently');
    gh.applyForm(0);
    gg.step(b, 10);
    eq(gh.controller.p.personality, t.ai.personality, 'leaving the form puts his own profile back');
    eq(gh.anim.poses.idle, gh.poses.idle, 'and his own stance');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('Cell adapts: against Super Saiyan 2 Gohan he notices the jump in power, reacts to being countered, and backs off to regenerate when hurt', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL, THREE } = gg;
    const b = gg.mission('cell_games', { startPhase: phaseIndex(SL, 'rage') });
    const seen = [];
    b.on('cellAdapts', (e) => seen.push(e.reason));
    gg.step(b, 30, skipAll(b));
    const S = b.story, gh = S.gohan, c = S.cell;
    eq(c.controller.profileOverride.hooks, 'cell', 'Cell runs on the adaptive hook in this stretch');
    gh.controller = { update: () => SL.emptyIntent() };
    gg.step(b, 60);
    ok(seen.includes('form'), 'he reacts to the new form: ' + seen.join(','));
    // hurt, with room to breathe: he backs off to regenerate
    c.hp = Math.round(c.hpMax * 0.55);
    gh.setPosition(c.pos.clone().add(new THREE.Vector3(0, 0, 12)));
    gh.grounded = true;
    const d0 = gh.distTo(c);
    gg.step(b, 90);
    ok(seen.includes('regen'), 'and backs off to regenerate: ' + seen.join(','));
    ok(gh.distTo(c) > d0 - 0.5, 'by keeping his distance: ' + d0.toFixed(1) + ' → ' + gh.distTo(c).toFixed(1));
    // countered twice: he stops walking into it
    const ai = c.controller;
    ai.cellCountered = 1;
    gh.state = 'attack';
    gh.sd = { counter: true };
    ai.hooks().pre(ai, c, gh, 3, null, SL.emptyIntent());
    ok(seen.includes('countered') && ai.cellCountered === 2, 'counters register: ' + seen.join(','));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the Father-Son Kamehameha is played: Cell charges, the beams meet, Goku\'s voice when Gohan is pushed back, Vegeta\'s blast past the middle, and Cell dies to the beam that connects', () => {
    const beats = [], kos = [];
    let cellDamage = 0, startHp = 0, lastType = null, clashWinner = null;
    const { gg, SL, r, b } = runTo({
      from: 'beam', until: 'beam', style: 'reader', seed: 5, maxSeconds: 200,
      onBattle: (bb) => {
        bb.on('fskBeat', (e) => beats.push(e.beat));
        bb.on('clashEnd', (e) => {
          if (e.winner) clashWinner = e.winner.def.id;
        });
        bb.on('ko', (e) => kos.push({ who: e.fighter.def.id, by: e.attacker && e.attacker.def.id }));
        bb.on('missionPhase', (e) => {
          if (e.phase.id === 'beam') setTimeoutLike(bb);
        });
        const setTimeoutLike = () => {};
        bb.on('damage', (e) => {
          if (e.target === bb.story.cell) {
            if (!startHp) startHp = bb.story.cell.hpMax;
            cellDamage += e.amount;
            lastType = e.type;
          }
        });
      },
      snapshot: (bb) => ({ flags: bb.mission.flags, cellAlive: bb.story.cell.alive }),
    });
    ok(r && b, 'the stretch ran');
    const f = b.mission.flags;
    ok(f.fskClashes >= 1, 'the beams met in a clash: ' + f.fskClashes);
    eq(beats.join(','), 'voice,vegeta,through', 'the story beats come from the struggle, in order');
    eq(clashWinner, 'teen_gohan', 'Gohan wins the clash');
    ok(kos.some((k) => k.who === 'cell' && k.by === 'teen_gohan'), 'and Cell is killed by Gohan: ' + JSON.stringify(kos));
    eq(lastType, 'beam', 'with the beam');
    ok(f.finishedWithBeam && f.cellBeaten, 'the mission records it');
    ok(cellDamage >= startHp, 'every point of his health went to real damage, not a script: ' + Math.round(cellDamage) + ' of ' + startHp);
    eq(b.clash.maxSeconds, 7, 'the long story clash is put back to normal afterwards');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the Father-Son Kamehameha cannot be skipped or spent early: it is not in the slot before the last stand, it is locked while Cell only charges, the prelude is staged from the checkpoint, and a lost struggle puts him back on the ring', () => {
    const gg = H.create({ quiet: true, seed: 6 });
    const { SL } = gg;
    const def = SL.data.missions.cell_games;
    const at = (id) => def.phases.findIndex((p) => p.id === id);
    // before Goku is gone the Father-Son Kamehameha does not exist: the slot holds an ordinary big beam instead,
    // so the boy keeps a tool but the story never fires the beam it has not earned yet
    for (const id of ['hold', 'purge', 'rage', 'desperate']) {
      const b = gg.mission('cell_games', { startPhase: at(id) });
      gg.until(b, () => b.player === b.story.gohan && !b.inputLocked, 60 * 60, skipAll(b));
      gg.step(b, 5);
      const gh = b.story.gohan;
      const ult = gh.specFor('ultimate');
      ok(ult && ult.id !== 'fatherSon', id + ': the ultimate slot is not the Father-Son Kamehameha (' + (ult && ult.id) + ')');
      ok(!/Father/i.test(ult.name), id + ': and it is not named after it either (' + ult.name + ')');
      b.dispose();
    }
    // from the checkpoint, the prelude is shot where the struggle happens
    {
      // the phase opens the scene on its first step, inside start(): look at the world as the scene is called
      let staged = null, b = null;
      const play = SL.Cinema.play;
      SL.Cinema.play = function* (m, id, o) {
        if (id === 'father_son') record(m.battle);
        return yield* play.call(this, m, id, o);
      };
      const record = (bb) => {
        const S = bb.story, ring = bb.stage.heightAt(0, 9);
        staged = { form: S.gohan.form.id, torn: S.gohan.torn, raged: S.gohan.raged, gz: +S.gohan.pos.z.toFixed(1), onRing: Math.abs(S.gohan.pos.y - ring) < 0.3, cellForm: S.cell.form.id, cellAbove: S.cell.pos.y > ring + 3, cellHidden: !!S.cell.hidden };
      };
      b = gg.mission('cell_games', { startPhase: at('beam') });
      SL.Cinema.play = play;
      gg.until(b, () => b.player === b.story.gohan && !b.inputLocked, 60 * 60, skipAll(b));
      ok(staged, 'the prelude played');
      eq(staged.form, 'ssj2', 'Gohan is a Super Saiyan 2 in the prelude, not the checkpoint default');
      ok(staged.torn && staged.raged, 'torn gi and rage in the prelude');
      eq(staged.gz, 9, 'at his spot on the ring');
      ok(staged.onRing, 'standing on the ring top');
      eq(staged.cellForm, 'perfect', 'Cell perfect');
      ok(staged.cellAbove && !staged.cellHidden, 'Cell above the ring');
      // while Cell only charges, the answer is locked; it opens when his beam is out
      const gh = b.story.gohan, c = b.story.cell;
      let chargeFrames = 0, earlyUnlock = 0, opened = false;
      gg.until(b, () => {
        if (c.state === 'beamCharge' && !b.clash.active && !['beamCharge', 'beamFire', 'clash'].includes(gh.state)) {
          chargeFrames++;
          if (!gh.lockedSlots.ultimate) earlyUnlock++;
          gh.ki = gh.kiMax;
          if (gh._trySpecial('ultimate')) earlyUnlock++;
        }
        if (c.state === 'beamFire' && !gh.lockedSlots.ultimate) opened = true;
        return opened;
      }, 60 * 30);
      ok(chargeFrames > 20, 'Cell charged for a while: ' + chargeFrames + ' frames');
      eq(earlyUnlock, 0, 'Gohan could not answer before the beam was out');
      ok(opened, 'and could once it was');
      b.dispose();
    }
    // a lost struggle blows him off the ring; he cannot fly, so once he is up he is back at his spot
    {
      const b = gg.mission('cell_games', { startPhase: at('beam') });
      gg.until(b, () => b.player === b.story.gohan && !b.inputLocked, 60 * 60, skipAll(b));
      gg.step(b, 5);
      const gh = b.story.gohan, c = b.story.cell;
      const off = gh.pos.clone();
      off.set(0, b.stage.heightAt(0, 30), 30);
      gh.setPosition(off);
      gh.setState('free');
      ok(c.state !== 'beamFire', 'Cell is not firing yet');
      gg.step(b, 3);
      ok(Math.abs(gh.pos.z - 9) < 0.5 && Math.abs(gh.pos.y - b.stage.heightAt(0, 9)) < 0.5, 'back on the ring: ' + gh.pos.toArray().map((v) => v.toFixed(1)).join(','));
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('from any checkpoint after the Juniors Gohan fights alone: the Z Fighters watch or lie where they fell, and nobody else is given a brain (found in the browser: Goku teleporting into the rage fight)', () => {
    const gg = H.create({ quiet: true, seed: 9 });
    const { SL } = gg;
    const def = SL.data.missions.cell_games;
    for (const id of ['purge', 'rage', 'desperate', 'beam']) {
      const b = gg.mission('cell_games', { startPhase: def.phases.findIndex((p) => p.id === id) });
      gg.until(b, () => b.player === b.story.gohan && !b.inputLocked, 60 * 60, skipAll(b));
      gg.step(b, 90);
      const S = b.story;
      const fighting = b.fighters.filter((f) => f.team === 0 && f !== S.gohan && f.alive && !f.hidden && (!f.untargetable || f.controller instanceof SL.AIController));
      eq(fighting.map((f) => f.def.id + ':' + f.state).join(','), '', id + ': nobody on Gohan\'s side but Gohan is in the fight');
      if (S.goku.alive && id !== 'beam') ok(S.goku.untargetable && S.goku.state === 'scripted', id + ': Goku is watching from the edge');
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('every checkpoint restores the story it belongs to: the right hero and form, a fresh brain on Cell, no stale limits or overrides, and who has fallen', () => {
    const gg = H.create({ quiet: true, seed: 8 });
    const { SL } = gg;
    const def = SL.data.missions.cell_games;
    const expect = {
      goku: { hero: 'goku', form: 'ssj', cellForm: 'perfect', a16: true, goku: true },
      serious: { hero: 'goku', form: 'ssj', cellForm: 'perfect', a16: true, goku: true },
      speed: { hero: 'goku', form: 'ssj', cellForm: 'perfect', a16: true, goku: true },
      limit: { hero: 'goku', form: 'ssj', cellForm: 'perfect', a16: true, goku: true },
      gohan: { hero: 'teen_gohan', form: 'base', cellForm: 'perfect', a16: true, goku: true },
      hold: { hero: 'teen_gohan', form: 'ssj', cellForm: 'perfect', a16: true, goku: true },
      juniors: { hero: 'teen_gohan', form: 'ssj', cellForm: 'perfect', a16: true, goku: true },
      purge: { hero: 'teen_gohan', form: 'ssj2', cellForm: 'perfect', a16: false, goku: true, rage: true },
      rage: { hero: 'teen_gohan', form: 'ssj2', cellForm: 'perfect', a16: false, goku: true, rage: true },
      desperate: { hero: 'teen_gohan', form: 'ssj2', cellForm: 'semi_perfect', a16: false, goku: true, rage: true },
      beam: { hero: 'teen_gohan', form: 'ssj2', cellForm: 'perfect', a16: false, goku: false, rage: true, torn: true },
    };
    const brains = new Set();
    for (const [id, want] of Object.entries(expect)) {
      const b = gg.mission('cell_games', { startPhase: def.phases.findIndex((p) => p.id === id) });
      gg.until(b, () => !b.inputLocked, 60 * 60, skipAll(b));
      gg.step(b, 10);
      const S = b.story, p = b.player;
      eq(def.phases[b.mission.phaseIndex].id, id, id + ': resumes in its own stretch');
      eq(p.def.id, want.hero, id + ': hero');
      ok(p.controller instanceof SL.PlayerController, id + ': the player drives the hero');
      eq(p.form.id, want.form, id + ': hero form');
      eq(S.cell.form.id, want.cellForm, id + ': Cell form');
      eq(S.a16.alive, want.a16, id + ': Android 16 ' + (want.a16 ? 'alive' : 'gone'));
      // from the beam on he is dead: what stands at Gohan's back is a spirit, intangible and never a target
      eq(S.goku.alive && !S.goku.intangible, want.goku, id + ': Goku ' + (want.goku ? 'alive' : 'gone'));
      if (id === 'beam') ok(S.spiritOn && S.goku.intangible && S.goku.untargetable, id + ': his father is at his back as a spirit, not a fighter');
      if (want.rage) ok(p.raged && p.rageAmount === 1, id + ': wearing the rage');
      if (want.torn) ok(p.torn, id + ': in the torn gi');
      if (id !== 'goku') eq(b.playerLimits, null, id + ': no leftover input limits');
      ok(!brains.has(S.cell.controller), id + ': Cell has a fresh brain');
      brains.add(S.cell.controller);
      if (!['limit', 'beam'].includes(id)) eq(S.cell.specOverrides, null, id + ': no leftover technique overrides on Cell');
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('a bot plays the whole Cell Games: every phase in order, no stall, no engine errors, and the chapter ends with the aftermath', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const r = gg.playMission('cell_games', { style: 'reader', maxSeconds: 1500 });
    const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
    const want = SL.data.missions.cell_games.phases.map((p) => p.id);
    eq(r.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s)');
    eq([...new Set(phases)].join(','), want.join(','), 'every phase, in order');
    const f = r.m.flags;
    for (const k of ['gamesOpened', 'cellSerious', 'inTheAir', 'gokuPressed', 'cellRegrew', 'forfeited', 'gohanSsj', 'gohanRefused', 'gohanHeld', 'sixteenStruck', 'juniorsBorn', 'sixteenGone', 'gohanBreaking', 'ascended', 'ssj2Revealed', 'juniorsDestroyed', 'eighteenFreed', 'desperateDone', 'sacrificed', 'cellReturned', 'gohanArm', 'fatherSon', 'cellBeaten', 'finishedWithBeam', 'cellGone', 'aftermath', 'gamesDone']) ok(f[k], 'flag ' + k);
    const S = r.b.story;
    eq(S.cell.alive, false, 'Cell is gone');
    eq(S.goku.alive, false, 'and so is Goku');
    eq(S.gohan.raged, false, 'the rage goes when the fight does');
    eq(S.gohan.form.id, 'base', 'and Gohan comes out of it in base form');
    ok(r.b.stage.ringDamage > 0.2, 'the ring is a ruin: ' + r.b.stage.ringDamage.toFixed(2));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('engine: Battle.on returns an unsubscribe, and a story clash can run longer than seven seconds without changing free battles', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const b = gg.battle({ p1: 'goku', p2: 'vegeta' });
    let n = 0;
    const off = b.on('ping', () => n++);
    b.emit('ping', {});
    off();
    b.emit('ping', {});
    eq(n, 1, 'unsubscribed listeners stop hearing events');
    eq(b.clash.maxSeconds, 7, 'free battle clashes resolve at seven seconds by default');
    b.dispose();
  });
};
