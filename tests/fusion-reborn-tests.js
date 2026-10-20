// MOVIE 1 · Fusion Reborn — behaviour on the real engine, headless. Pikkon's stand and defeat; the finish of "Gogeta": the
// counter-combination's cues answered by the player's own buttons, and the Stardust Breaker driven by
// holding and letting go of Special 2 (pause on an early release; the release crushes it to dust that
// flies into Janemba; the purification).
const H = require('./headless');

module.exports = function fusionRebornTests({ test, eq, ok }) {
  console.log('\nMovie 1: Fusion Reborn — Pikkon\'s stand, the Gogeta finish (headless)');

  const finishAt = (SL) => SL.data.missions.fr_gogeta.phases.findIndex((p) => p.id === 'finish');
  // the buttons a human is holding, read by SL.Input (Battle.tick polls it every tick)
  const pressing = (SL, fn) => {
    SL.Input.held = (a) => !!fn(a);
    SL.Input.pressed = (a) => !!fn(a);
  };

  test('a cue is answered by the real button even when the scene has handed the player body to a script (found in the real-time review: the Gogeta combination never took a press)', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const b = gg.mission('fr_gogeta', { startPhase: finishAt(SL) });
    const cues = [];
    let scripted = null;
    b.on('cue', () => {
      if (scripted === null) scripted = !(b.player.controller instanceof SL.PlayerController);
    });
    b.on('cueDone', (r) => cues.push(r));
    pressing(SL, (a) => b.cue && (a === b.cue.action || a === b.cue.key));
    gg.until(b, () => cues.length >= 5 || b.mission.state !== 'running', 60 * 40);
    ok(scripted, 'the body is in the hands of the scene (a scripted controller) during the cues');
    eq(cues.map((c) => c.key).join(','), 'guard,light,heavy,light,heavy', 'the five-part counter-combination: catch, knee, reverse kick, flurry, double palm');
    ok(cues.every((c) => c.pressed && c.seconds < 1), 'every one taken by the button, not by the 3 s auto: ' + JSON.stringify(cues));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('Pikkon makes his stand and is beaten: played as Pikkon, his blows land on the armour and chip it without moving Janemba, who does not even fight back at first; then the staged defeat — down, alive, out of the fight for the dance', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const b = gg.mission('fr_gogeta', { startPhase: 0 });
    const S = b.story, pk = S.pikkon, sj = S.sj;
    pressing(SL, () => false);
    const skip = () => {
      if (b.inputLocked) b.skipRequested = true;
    };
    eq(b.mission.def.phases[0].id, 'pikkon', 'the mission opens on Pikkon\'s stand');
    ok(gg.until(b, () => b.player === pk && !b.inputLocked, 60 * 30, skip) >= 0, 'the stand is played as Pikkon');
    const cracks0 = sj.model.armorParts.cracks.length;
    ok(cracks0 >= 3, 'the insults already cracked the plate: ' + cracks0);
    // nobody touching anything for two seconds: Janemba does not come for him yet
    gg.step(b, 120);
    eq(Math.round(pk.hp), pk.hpMax, 'Janemba does not fight back while Pikkon is still confident');
    // Pikkon's heavy blows: armoured (no flinch), a chip each, a sliver of damage
    const V3 = gg.THREE.Vector3;
    pk.setPosition(sj.pos.clone().add(new V3(-1.2, 0, 0)));
    const res = [];
    for (let i = 0; i < 3; i++) {
      const dir = sj.pos.clone().sub(pk.pos).setY(0).normalize();
      res.push(sj.takeHit(pk, { type: 'melee', damage: 1500, knock: 'heavy', knockSpeed: 28, hitstun: 32, impact: 3, dir, point: sj.chest(), name: 'test' }));
      gg.step(b, 30);
    }
    eq(res.join(','), 'armored,armored,armored', 'the blows land and he does not even flinch');
    ok(sj.model.armorParts.cracks.length >= cracks0 + 3, 'every heavy blow chips the plate: ' + sj.model.armorParts.cracks.length);
    ok(sj.hp > sj.hpMax * 0.99, 'and does next to nothing: ' + Math.round(sj.hp) + '/' + sj.hpMax);
    // the rest: he holds on, Janemba stops playing, and the staged defeat
    ok(gg.until(b, () => b.mission.def.phases[b.mission.phaseIndex].id === 'dance', 60 * 120, skip) >= 0, 'on to the dance');
    ok(b.mission.flags.pikkonDown, 'Pikkon was beaten down');
    ok(pk.alive && pk.hp > 0, 'and he is alive: a defeat, not a death');
    ok(pk.hidden && pk.untargetable && !(pk.controller instanceof SL.PlayerController) && pk.state === 'scripted', 'and out of the fight: no one drives him back into it');
    eq(b.player, S.goku, 'Goku dances');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the two-finger catch is solved before it is shown: the blade stops between the fingers and Janemba is never moved to make it fit', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const b = gg.mission('fr_gogeta', { startPhase: finishAt(SL) });
    const S = b.story, sj = S.sj;
    ok(gg.until(b, () => !!b.cue, 60 * 10) >= 0, 'the catch cue comes up');
    const p0 = sj.pos.clone();
    pressing(SL, (a) => b.cue && (a === b.cue.action || a === b.cue.key));
    ok(gg.until(b, () => !!b.mission.flags.caughtAt, 60 * 5) >= 0, 'the blade reaches the fingers');
    gg.step(b, 2);
    const gap = SL.data.frGogeta.bladeGap(S.gogeta, sj);
    ok(gap < 0.05, 'the blade lies between the two fingers: ' + gap.toFixed(3) + ' m');
    ok(sj.pos.distanceTo(p0) < 0.02, 'Janemba was not moved to make it fit: ' + sj.pos.distanceTo(p0).toFixed(3) + ' m');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });

  test('the Stardust Breaker is held and let go: no charge before the arm is up, a pause on an early release, the throw on the release, the light into Janemba', () => {
    const gg = H.create({ quiet: true, seed: 11 });
    const { SL } = gg;
    const b = gg.mission('fr_gogeta', { startPhase: finishAt(SL) });
    const GG = SL.data.frGogeta.GG;
    let s2 = false;
    pressing(SL, (a) => (b.cue && (a === b.cue.action || a === b.cue.key)) || (a === 'special2' && s2));
    ok(gg.until(b, () => !!b.breaker, 60 * 40) >= 0, 'the Breaker begins after the combination');
    const BR = b.breaker;
    const gogeta = b.story.gogeta;
    ok(gogeta.halo && gogeta.halo.visible, 'Gogeta wears a halo');
    // held from the first frame of the reveal: nothing charges until the arm goes up (after the reveal)
    s2 = true;
    gg.step(b, 40);
    eq(BR.k, 0, 'no charge during the reveal');
    gg.until(b, () => BR.k > 0, 200);
    gg.step(b, 60);
    ok(BR.k > 0.1 && BR.k < 0.4, 'holding charges it: ' + BR.k.toFixed(2));
    // let go early: the charge waits (after the one frame the controller takes to read the button)
    s2 = false;
    gg.step(b, 2);
    const k1 = BR.k;
    gg.step(b, 60);
    eq(+BR.k.toFixed(4), +k1.toFixed(4), 'an early release pauses the charge');
    eq(BR.want, 'hold', 'and does not throw');
    ok(!b.mission.flags.breakerThrown, 'nothing thrown yet');
    // hold again to the full orb
    s2 = true;
    const frames = gg.until(b, () => BR.want === 'release', 60 * 10);
    ok(frames > 0 && Math.abs(frames - (1 - k1) * GG.charge * 60) < 8, 'full after the rest of ' + GG.charge + ' s: ' + frames + ' frames');
    gg.step(b, 30);
    ok(!b.mission.flags.breakerThrown, 'a full orb still held is not thrown');
    s2 = false;
    // the release: the crush, behind Janemba, the heel turn, the dust's flight (about three seconds)
    gg.until(b, () => b.mission.flags.breakerHit, 400);
    ok(b.mission.flags.breakerThrown && b.mission.flags.breakerHit, 'let go: it is thrown and reaches him');
    eq(b.breaker, null, 'the hold is over');
    gg.until(b, () => b.story.saike && !b.story.saike.hidden, 60 * 12, () => {
      if (b.inputLocked) b.skipRequested = true;
    });
    ok(b.story.sj.hidden && !b.story.saike.hidden, 'Janemba is gone and Saike is back');
    ok(b.mission.qteParts.includes(1), 'a played Breaker scores in full');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    b.dispose();
  });
};
