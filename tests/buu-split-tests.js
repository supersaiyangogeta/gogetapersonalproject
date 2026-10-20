// The Evil in Him (2026-09-25, the owner's Buu Saga brief, priority 8, first half): Mr. Satan and
// Good Buu, Bee, the hunters, Evil Buu coming out of Good Buu's steam, and Super Buu — Evil Buu and
// Super Buu as their own bodies, Bee as a creature, and the mission that ties them together.
// Behaviour on the real engine, headless.
const H = require('./headless');

module.exports = function buuSplitTests({ test, eq, ok }) {
  console.log('\nThe Evil in Him: Mr. Satan, Bee, Evil Buu, Super Buu (headless)');

  const phaseAt = (SL, id) => SL.data.missions.buu_split.phases.findIndex((p) => p.id === id);
  const phaseId = (b) => (b.mission.def.phases[b.mission.phaseIndex] || {}).id;
  /** A checkpoint started the way the app starts it, stepped (scenes skipped) until the player has control. */
  const at = (gg, phase) => {
    const b = gg.mission('buu_split', { startPhase: phaseAt(gg.SL, phase) });
    gg.until(b, () => !b.inputLocked && phaseId(b) === phase, 60 * 60, () => {
      if (b.inputLocked) b.skipRequested = true;
    });
    return b;
  };
  const box = (gg, f) => {
    f.model.root.updateMatrixWorld(true);
    return new gg.THREE.Box3().setFromObject(f.model.root);
  };

  test('Evil Buu and Super Buu are bodies of their own, not recolours: grey and starved-thin, pink and heavy-muscled, the antenna down the back of the grey one and standing up on the pink one, black eyes with red in them', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'majin_buu', distance: 6 });
    const good = b.fighters[1];
    const evil = b.spawn({ charId: 'evil_buu', team: 1, pos: new V3(4, 0, 0) });
    const sup = b.spawn({ charId: 'super_buu', team: 1, pos: new V3(-4, 0, 0) });
    for (const f of [good, evil, sup]) f.setState('scripted', { pose: 'idle', expression: 'calm' });
    gg.step(b, 20);
    const size = (f) => {
      const bx = box(gg, f);
      return { h: bx.max.y - bx.min.y, w: Math.max(bx.max.x - bx.min.x, bx.max.z - bx.min.z) };
    };
    const G = size(good), E = size(evil), U = size(sup);
    ok(E.w < G.w * 0.8, 'Evil Buu is thin beside the fat one: ' + JSON.stringify({ evil: E, good: G }));
    ok(U.h > G.h * 1.02 && U.w < G.w, 'Super Buu is taller and without the belly: ' + JSON.stringify({ sup: U, good: G }));
    const D = SL.data.characters;
    eq(D.evil_buu.appearance.skin, 0x8e8e9c, 'grey');
    eq(D.super_buu.appearance.skin, 0xf29ac0, 'pink');
    ok(!D.super_buu.appearance.outfit.belly && !D.evil_buu.appearance.outfit.belly, 'neither has the fat one\'s belly');
    for (const id of ['evil_buu', 'super_buu']) {
      const a = D[id].appearance;
      ok(a.face.sclera < 0x303030 && ((a.face.pupil >> 16) & 255) > 0xa0, id + ': dark eyes with red pupils');
      if (id === 'evil_buu') {
        const tip = a.headExtras.filter((x) => x.d[1] < -0.5 && x.a[2] < -0.5);
        ok(tip.length >= 2, id + ': the antenna runs down the back of the head');
      } else {
        // (the board p.43, 2026-10-15: Super Buu's antenna stands up off the crown, thick at the root, and hooks back
        // at the tip — it no longer lies down the back of the head like Evil Buu's)
        const up = a.headExtras.filter((x) => x.a[1] > 0.9 && x.d[1] > 0.8 && x.bend > 0 && x.curl && x.toward && x.toward[2] < 0);
        ok(up.length === 1, id + ': the antenna stands up off the crown and hooks back at the tip');
      }
      // their own poses, not the fat one's
      ok(Object.keys(D[id].poses).filter((k) => k.startsWith(id === 'evil_buu' ? 'eb_' : 'sb_')).length >= 5, id + ': a pose set of its own');
    }
    ok(D.super_buu.mechanic.type === 'majinBody' && D.super_buu.majin.gut > D.majin_buu.majin.gut, 'Super Buu regenerates like a Majin, without the belly that swallows blows');
    ok(D.super_buu.specials.special1 && D.super_buu.specials.special2 && D.super_buu.moves.heavy[0], 'new attacks: the cannon, the grasp, the hammer');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Super Buu regenerates: a wound closes by itself while you watch', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = gg.battle({ p1: 'goku', p2: 'super_buu', distance: 2 });
    const g = b.player, sup = b.fighters[1];
    sup.controller = { update: () => SL.emptyIntent() };
    g.controller = { update: () => SL.emptyIntent() };
    sup.hp = sup.hpMax * 0.9;
    sup.takeHit(g, { damage: 2400, type: 'ki', knock: 'flinch', impact: 2, hitstun: 10, dir: g.dirTo(sup) });
    gg.step(b, 2);
    const after = sup.hp;
    ok(after < sup.hpMax * 0.9, 'the blow landed: ' + Math.round(sup.hpMax * 0.9 - after));
    gg.step(b, 60 * 3);
    ok(sup.hp > after + 200, 'and grew back: +' + Math.round(sup.hp - after));
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('Bee is a dog, not a fighter: he trots after Buu, lies on his side when hurt, and is carried against a chest', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const b = gg.battle({ p1: 'majin_buu', p2: 'goku', distance: 6 });
    const buu = b.player;
    const bee = new SL.Creature(b, SL.data.creatures.bee, { pos: new V3(-6, 0, 4) });
    ok(!b.fighters.includes(bee) && b.creatures.includes(bee), 'a creature');
    bee.setState('follow', { follow: buu });
    const d0 = bee.pos.distanceTo(buu.pos);
    gg.step(b, 120);
    ok(bee.pos.distanceTo(buu.pos) < Math.min(2, d0), 'he follows Buu: ' + bee.pos.distanceTo(buu.pos).toFixed(2));
    bee.setState('hurt', {});
    gg.step(b, 60);
    ok(Math.abs(bee.tilt) > 1.3, 'hurt: on his side (' + bee.tilt.toFixed(2) + ')');
    bee.setState('held', { by: buu });
    gg.step(b, 5);
    const c = buu.chest();
    ok(bee.pos.distanceTo(c) < 1.2 && buu.forward.dot(bee.pos.clone().sub(buu.pos).setY(0).normalize()) > 0.5, 'held: in front of Buu\'s chest');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('"The Evil in Him" plays through: the present, the massage, a promise, Bee, the hunters, the steam, Evil Buu, the chocolate and Super Buu — in that order', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const order = [];
    let shotWith = null;
    const r = gg.playMission('buu_split', {
      maxSeconds: 600,
      onBattle: (b) => {
        b.on('missionPhase', () => order.push(phaseId(b)));
        let downs = 0;
        b.on('hunterDown', () => downs++);
        b.onTick(() => {
          if (b.mission.flags.satanShot && shotWith === null) shotWith = downs;
          return shotWith === null;
        });
      },
    });
    const f = r.m.flags, S = r.b.story;
    eq(r.state, 'success', 'mission state');
    eq(order.join(','), 'gifts,friends,hunters,split,absorb,after', 'the beats');
    ok(f.giftExploded && f.massageHits >= 6 && f.friends, 'the present goes off and the champion\'s fists are a massage');
    ok(f.buuPromised && f.beeHealed, 'the promise, and Bee');
    ok(f.beeShot && f.huntersDown === 2 && f.satanShot, 'the rifles, the fight, the shot in the back');
    eq(shotWith, 2, 'the champion is shot only after both hunters are down');
    ok(f.evilBorn && f.reflected && f.chocolate && f.goodBuuEaten && f.superBuuBorn, 'the steam, the reflected beam, the chocolate, Super Buu');
    ok(S.buu.hidden && S.evil.hidden && S.sup.hidden, 'nobody Buu is left standing in the wastes (Super Buu has flown)');
    eq(S.bee.state, 'held', 'Bee in the champion\'s arms');
    eq(S.bee.sd.by, S.satan, '...Mr. Satan\'s');
    ok(S.g1.hidden && S.g2.hidden, 'the hunters are gone');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the evil comes out of him, not out of a menu: steam from the holes in his head, a body forming beside him, and Good Buu squeezed while it leaves', () => {
    const gg = H.create({ quiet: true, seed: 2 });
    const { SL } = gg;
    const b = gg.mission('buu_split', { startPhase: phaseAt(SL, 'hunters') });
    const S = b.story;
    let squeezed = 1, evilShownAt = null, steamBefore = 0, sceneOn = false;
    b.on('sceneEnd', (e) => e.id === 'split_shot' && (sceneOn = true));
    const origEmit = b.vfx.smoke.emit.bind(b.vfx.smoke);
    b.vfx.smoke.emit = (...a) => {
      if (sceneOn && evilShownAt === null) steamBefore++;
      return origEmit(...a);
    };
    const brains = require('../tools/mission_brains');
    brains.attach(SL, b, 'buu_split', {});
    gg.until(b, () => phaseId(b) === 'split' || b.mission.state !== 'running', 60 * 240, () => {
      if (sceneOn) {
        const sx = S.buu.model.root.scale.x / (S.buu.model.baseScale * (S.buu.model._lookScale || 1));
        squeezed = Math.min(squeezed, sx);
        if (evilShownAt === null && !S.evil.hidden) evilShownAt = S.evil.pos.distanceTo(S.buu.pos);
      }
    });
    eq(phaseId(b), 'split', 'reached the fight');
    ok(steamBefore > 150, 'steam before anything stands there: ' + steamBefore + ' puffs');
    ok(squeezed < 0.96, 'Good Buu narrows while it leaves him: ' + squeezed.toFixed(3));
    ok(evilShownAt > 2 && evilShownAt < 5, 'Evil Buu forms beside him: ' + (evilShownAt && evilShownAt.toFixed(2)));
    const sx = S.buu.model.root.scale.x / (S.buu.model.baseScale * (S.buu.model._lookScale || 1));
    ok(Math.abs(sx - 1) < 1e-6, 'and he is his own size again after');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('the split: Good Buu is played, Evil Buu is stronger and is not beaten, the Candy Beam waits for its cue — and comes back as chocolate', () => {
    const gg = H.create({ quiet: true, seed: 3 });
    const { SL } = gg;
    let cue = null, lowestEvil = 1, stoneAt = null;
    const r = gg.playMission('buu_split', {
      startPhase: phaseAt(SL, 'split'),
      maxSeconds: 300,
      watch: true, // (a skipped scene ends before its cue: the cue belongs to the watched scene)
      onBattle: (b) => {
        const S = b.story;
        b.on('cue', (e) => (cue = cue || e));
        b.onTick(() => {
          if (phaseId(b) === 'split' && !b.inputLocked) lowestEvil = Math.min(lowestEvil, S.evil.hpFrac);
          if (stoneAt === null && S.buu.model._stoneMats && b.mission.flags.reflected !== true) stoneAt = S.buu.hidden ? 'hidden' : 'visible';
          return true;
        });
      },
    });
    const S = r.b.story, K = SL.data.buuSplit.SPLIT;
    eq(r.state, 'success', 'mission state');
    ok(r.m.flags.splitSeconds > 0, 'the fight was played');
    // (the floor is put back every tick: one blow can dip under it between two)
    ok(lowestEvil >= K.evilFloor - 0.05, 'Evil Buu never beaten (floor ' + K.evilFloor + '): ' + lowestEvil.toFixed(3));
    ok(cue && cue.key === 's1', 'the Candy Beam is a cue: ' + JSON.stringify(cue && cue.key));
    eq(stoneAt, 'visible', 'the beam turns him to chocolate while you can see it');
    ok(S.buu.hidden, 'then he is a bar on the ground, and eaten');
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('checkpoints: the hunters and the split restart with only their fighters active; the Candy Beam is locked until the story asks for it', () => {
    const gg = H.create({ quiet: true, seed: 5 });
    const { SL } = gg;
    const cases = [
      ['hunters', 'satan', ['satan', 'g1', 'g2']],
      ['split', 'buu', ['buu', 'evil']],
    ];
    for (const [phase, hero, active] of cases) {
      const b = at(gg, phase);
      const S = b.story;
      eq(b.player, S[hero], phase + ': the player is ' + hero);
      const act = active.map((k) => S[k]);
      for (const f of b.fighters) {
        if (act.includes(f)) continue;
        ok(!(f.controller instanceof SL.AIController), phase + ': ' + f.def.id + ' is not given a brain');
        ok(f.untargetable || f.hidden, phase + ': ' + f.def.id + ' cannot be fought');
      }
      for (const k of active.slice(1)) ok(S[k].controller instanceof SL.AIController && !S[k].untargetable && !S[k].hidden, phase + ': ' + k + ' fights');
      if (phase === 'split') {
        ok(S.buu.lockedSlots.special1, 'the Candy Beam waits for the cue');
        ok(S.buu.noRegen, 'what the evil one tears open does not close');
        ok(!S.buu.model._stoneMats && !S.buu.hidden, 'a whole Good Buu, not a chocolate one');
      } else {
        eq(S.bee.state, 'held', 'Bee held by Buu, out of the line of fire');
        ok(S.buu.untargetable && S.buu.team === 0, 'Buu watches, on the champion\'s side');
      }
      b.dispose();
    }
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });

  test('wiring: Chapter 11 plays Fusion, then The Evil in Him; the new speakers have names; props and the chocolate stone exist', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = gg;
    const ch = SL.data.story.chapters.find((c) => c.id === 'buu5');
    ok(ch.missions.indexOf('buu_split') === ch.missions.indexOf('buu_fusion') + 1 && ch.missions[0] === 'buu_ssj3', 'Chapter 11: ... Fusion, then The Evil in Him: ' + ch.missions.join(','));
    for (const id of ['evil_buu', 'super_buu', 'gunman', 'gunman_b']) ok(SL.data.dialogue.speakers[id], id + ' has a speaker name');
    const b = gg.battle({ p1: 'gunman', p2: 'mr_satan', distance: 4 });
    ok(b.player.model.props.rifle, 'the hunter carries a rifle');
    const s = b.fighters[1];
    s.model.addProp(SL.data.buuSplit.GIFT);
    ok(s.model.props.gift, 'a present with a ribbon');
    s.model.setStone(true, 'chocolate');
    let brown = 0;
    s.model.root.traverse((o) => o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x6a3a22 && brown++);
    ok(brown > 10, 'a chocolate body: ' + brown + ' surfaces');
    s.model.setStone(false);
    eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
  });
};
