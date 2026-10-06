// The Room of Spirit and Time (2026-09-25, the owner's Buu Saga brief, priority 8, second half):
// Super Buu at the Lookout, the Human Extinction Attack as a world-state event, the Time Chamber
// stage, Super Saiyan 3 Gotenks against Super Buu, the door, and the scream that tears the
// dimension. Behaviour on the real engine, headless.
const H = require('./headless');

module.exports = function buuChamberTests({ test, eq, ok }) {
  console.log('\nThe Room of Spirit and Time: the extinction, the chamber, SSJ3 Gotenks, the scream (headless)');

  const phaseAt = (SL, id) => SL.data.missions.buu_timechamber.phases.findIndex((p) => p.id === id);
  const phaseId = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  const at = (gg, phase) => {
    const b = gg.mission('buu_timechamber', { startPhase: phaseAt(gg.SL, phase) });
    gg.until(b, () => !b.inputLocked && phaseId(b) === phase, 60 * 60, () => {
      if (b.inputLocked) b.skipRequested = true;
    });
    return b;
  };

  test('the Room of Spirit and Time is a place of its own: a white floor with no slope and no end, a white sky, one building with the door and the hourglass', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'gotenks', p2: 'super_buu', distance: 6, stage: 'timechamber' });
    const st = b.stage;
    ok(st.def.storyOnly, 'story only');
    const hs = [];
    for (const [x, z] of [[0, 0], [80, 40], [-150, 120], [200, -180], [5, -60]]) hs.push(st.heightAt(x, z));
    ok(hs.every((h) => Math.abs(h) < 1e-6), 'flat everywhere: ' + hs.map((h) => h.toFixed(2)).join(','));
    let light = 0, n = 0;
    for (let i = 0; i < st.baseColors.length; i += 3 * 97) {
      n++;
      if (st.baseColors[i] > 0.78 && st.baseColors[i + 1] > 0.78 && st.baseColors[i + 2] > 0.78) light++;
    }
    ok(light / n > 0.95, 'the floor is (near) white: ' + light + '/' + n);
    ok(st.chamber && st.chamber.door.visible && !st.chamber.rubble.visible && st.chamber.glass, 'the entrance building, its door and the hourglass');
    ok(st.obstacles.some((o) => Math.hypot(o.x - 0, o.z - (-26)) < 1 && o.r > 10), 'the terrace and the building are solid');
    ok(!st.obstacles.some((o) => o.alive && Math.hypot(o.x, o.z + 26) > 12), 'nothing else stands in it: ' + st.obstacles.length);
    st.destroyChamberDoor();
    ok(!st.chamber.door.visible && st.chamber.rubble.visible, 'the door can be destroyed');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the Human Extinction Attack is a world-state event, not a fight: beams over the horizon, a street of people, then an empty one — and the save remembers', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    let stages = [], beamsOut = 0, civSeen = 0, civGone = 0;
    const b = gg.mission('buu_timechamber', {});
    const S = b.story;
    b.on('sceneEnd', (e) => e.id === 'tc_extinction' && (S.__extDone = true));
    let prevStage = null;
    gg.until(b, () => S.__extDone || b.mission.state !== 'running', 60 * 120, () => {
      if (b.stage.def.id !== prevStage) stages.push((prevStage = b.stage.def.id));
      if (S.beams) beamsOut = Math.max(beamsOut, S.beams.length);
      civSeen = Math.max(civSeen, S.civilians.length);
      civGone = Math.max(civGone, S.civilians.filter((c) => c.hidden).length);
      if (!b.inputLocked) S.__played = true;
    });
    ok(S.__extDone, 'the scene played');
    eq(stages.join(','), 'lookout,satan_city,lookout', 'the Lookout, a street in Satan City, the Lookout');
    ok(beamsOut >= SL.data.timeChamber.TC.extinctionBeams * 0.9, 'hundreds of beams: ' + beamsOut);
    ok(civSeen >= 5 && civGone === civSeen, 'every one of them: ' + civGone + '/' + civSeen);
    ok(!S.__played, 'nothing of it is played (a cinematic, not a murder sequence)');
    ok(b.mission.flags.humanExtinction && SL.Save.data.flags.humanExtinction, 'the world state is kept');
    ok(!b.fighters.some((f) => f.def.id === 'civilian'), 'nobody left over on the Lookout');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"The Room of Spirit and Time" plays through: outclassed as a Super Saiyan, Super Saiyan 3 held through, Super Buu taken apart and losing his temper, the door, the scream', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const order = [];
    const moods = [];
    let taught = null, stagesSeen = new Set();
    const r = gg.playMission('buu_timechamber', {
      maxSeconds: 700,
      onBattle: (b) => {
        b.on('missionPhase', () => order.push(phaseId(b)));
        b.on('buuTemper', (e) => moods.push(e.mood));
        b.on('skillLearned', (e) => (taught = taught || e.key));
        b.onTick(() => {
          stagesSeen.add(b.stage.def.id);
          return true;
        });
      },
    });
    const f = r.m.flags, S = r.b.story, T = gg.SL.data.timeChamber.TC;
    eq(r.state, 'success', 'mission state');
    eq(order.join(','), 'enter,base,third,after', 'the beats');
    ok(stagesSeen.has('timechamber') && stagesSeen.has('lookout'), 'from the Lookout into the chamber: ' + [...stagesSeen].join(','));
    ok(f.superBuuArrived && f.humanExtinction && f.inChamber, 'Super Buu came, the world paid, and they went in');
    eq(taught, 'form:ssj3', 'Super Saiyan 3 handed over');
    ok(f.thirdAparts >= T.aparts, 'Super Buu taken apart ' + f.thirdAparts + ' times');
    ok(moods.includes('annoyed') && moods.includes('furious'), 'and losing his temper: ' + moods.join(','));
    ok(f.doorDestroyed && f.dimensionTorn, 'the door, and the hole in the world');
    ok(S.sup.hidden && S.gotenks.hidden && S.piccolo.hidden, 'all three through it');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Super Saiyan 3 Gotenks: not before the chamber, handed over by holding Charge, burning ki; Free Battle gets it only after the mission', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    const G = SL.data.characters.gotenks;
    const f3 = G.forms.find((f) => f.id === 'ssj3');
    eq(f3.freeUnlock, 'buu_timechamber', 'the form waits for this mission');
    eq(SL.data.formGivenBy['gotenks:ssj3'], 'buu_timechamber', 'the story gives it here');
    ok(f3.drain && f3.drain.kiPerSec > 0, 'it burns ki');
    const b = at(gg, 'base');
    const S = b.story;
    eq(b.player, S.gotenks, 'Gotenks is played');
    eq(S.gotenks.form.id, 'ssj', 'in as a Super Saiyan');
    ok(S.gotenks.lockedForms.ssj3, 'the third level is locked in the first fight');
    eq(b.stage.def.id, 'timechamber', 'the checkpoint starts inside the chamber');
    ok(S.sup.controller instanceof SL.AIController && !S.sup.untargetable, 'Super Buu fights');
    ok(!(S.piccolo.controller instanceof SL.AIController) && S.piccolo.untargetable, 'Piccolo watches');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the scream tears the dimension: a hole that grows out of nothing, the picture and the sound going wrong, then everything back to normal', () => {
    const gg = H.create({ quiet: true, seed: 4 });
    const { SL } = gg;
    const b = gg.mission('buu_timechamber', { startPhase: phaseAt(SL, 'third') });
    const S = b.story;
    let maxPortal = 0, dream = 0, vision = 0, sawPortal = false, bend = 0;
    const setDream = SL.Audio.setDream.bind(SL.Audio);
    SL.Audio.setDream = (a) => ((dream = Math.max(dream, a)), setDream(a));
    const setVision = SL.ScreenFX.vision.bind(SL.ScreenFX);
    SL.ScreenFX.vision = (a) => ((vision = Math.max(vision, a)), setVision(a));
    const brains = require('../tools/mission_brains');
    brains.attach(SL, b, 'buu_timechamber', {});
    gg.until(b, () => b.mission.state !== 'running' || phaseId(b) === 'after', 60 * 400, () => {
      if (b.stage.chamber) bend = Math.max(bend, Math.abs(b.stage.chamber.group.scale.y - 1));
      if (S.portal) {
        sawPortal = true;
        maxPortal = Math.max(maxPortal, S.portal.size);
      }
    });
    ok(sawPortal && maxPortal > 0.95, 'a hole opens to full size: ' + maxPortal.toFixed(2));
    ok(dream > 0.5 && vision > 0.3, 'the sound and the picture go wrong: ' + dream.toFixed(2) + ' / ' + vision.toFixed(2));
    ok(bend > 0.02, 'the room bends while he screams: ' + bend.toFixed(3));
    eq(b.stage.chamber.group.scale.y, 1, 'and stands straight again');
    eq(S.portal.size, 0, 'and it closes behind them');
    SL.Audio.setDream = setDream;
    SL.ScreenFX.vision = setVision;
    ok(!b.stage.chamber.door.visible && b.stage.chamber.rubble.visible, 'the door is rubble');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
};
