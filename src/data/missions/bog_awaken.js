/*
 * CHAPTER 16 — BATTLE OF GODS, mission 1: "The God of Destruction" (canon; Age 778).
 *
 *   TEMPLE    (scene, GROUND: Beerus' world)  the floating island in the nebula, the inverted pyramid; Whis
 *                                             wakes Beerus after thirty-nine years; the dream of a Super Saiyan
 *                                             God; Whis' staff shows Namek, the golden Saiyan, King Kai's planet;
 *                                             they leave in a pillar of light
 *   JOURNEY   (scene)                         the streak across space; the little planet ahead
 *   TRAINING* (play, GROUND: King Kai's planet, ten times gravity)  Goku breaks his training rocks while King
 *                                             Kai heckles — until King Kai's antennae stand straight up
 *   ARRIVAL   (scene, GROUND)                 King Kai shoves Goku into the house; the god lands; the bowing, the
 *                                             lies; Goku walks out anyway and asks for a friendly spar
 *   AFTER                                     the chapter card ("Next: A Friendly Spar")
 *
 * Space: everything here is GROUND except the departure and the arrival (flight / landing, said by the scenes).
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;
  const K = () => SL.data.bogKit;
  const S = (SL.data.scenes = SL.data.scenes || {});
  const PZ = SL.data.poses;

  // King Kai's planet: where things are (the planet curves away from the middle: ground() follows it)
  const KKP = { house: new V3(0, 0, -16), goku: new V3(0, 0, 6), land: new V3(13, 0, 3), kk: new V3(-5, 0, -9), rocks: 5 };
  // Beerus' world: the bed is in front of the temple. Everything said here is said on the OPEN side of the bed (+z,
  // the court): Whis stands there, Beerus sits up on the bed's front edge facing him, and every lens stays on that
  // side — the posts, the canopy and the back curtain are never between a lens and a face (the owner, 2026-10-06).
  const BW = { bed: new V3(0, 0, -4), whis: new V3(6, 0, 9), byBed: new V3(1.5, 0, -0.9), sitAt: new V3(0.2, 0, -3.15), beerusUp: new V3(-0.6, 0, -1.3) };
  /** A lens hung over a face that is lying down, looking along the body from the chest so the face reads upright. */
  function overFace(ctx, f, name, dist = 1.1, side = 0.35) {
    const B = SL.Cinema.body(f);
    const along = B.up.clone().setY(0);
    if (along.lengthSq() < 1e-6) along.set(-1, 0, 0);
    along.normalize();
    const right = new V3(-along.z, 0, along.x);
    K().pt(ctx, name + 'Face', B.face.clone());
    // nearly straight down onto the face (his broad collar would stand between a lens further down the body and it)
    K().pt(ctx, name + 'Cam', B.face.clone().addScaledVector(along, -0.3 * dist).addScaledVector(right, side * 0.5 * dist).add(new V3(0, 1.0 * dist, 0)));
  }

  function setup(battle) {
    const b = battle;
    // Goku of the Super era: his own transformation lines, not Namek's
    K().superVoice(b);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: new V3(0, 0, 30), startKi: 80 });
    const beerus = b.spawn({ charId: 'beerus', team: 0, pos: new V3(0, 0, 2) });
    const whis = b.spawn({ charId: 'whis', team: 0, pos: BW.whis.clone() });
    const kingkai = b.spawn({ charId: 'king_kai', team: 0, pos: new V3(-30, 0, 30) });
    const bubbles = b.spawn({ charId: 'bubbles', team: 0, pos: new V3(-32, 0, 30) });
    for (const f of [beerus, whis, kingkai, bubbles]) {
      f.controller = K().scripted();
      f.untargetable = f.intangible = true;
      f.cannotDie = true;
    }
    goku.cannotDie = true;
    // King Kai's planet, Age 778: base form only while he trains (the spar opens the rest)
    goku.lockedForms = { kaioken: true, ssj: true, ssj2: true, ssj3: true, god: true, godki: true };
    goku.setHidden(true);
    kingkai.setHidden(true);
    bubbles.setHidden(true);
    b.story = { goku, beerus, whis, kingkai, bubbles };
  }

  /* ---------------------------------------------------------------- the training rocks */
  function trainingRocks(m) {
    const b = m.battle, T = SL.Toon;
    const list = [];
    for (let i = 0; i < KKP.rocks; i++) {
      const a = (i / KKP.rocks) * Math.PI * 2 + 0.4;
      const p = new V3(KKP.goku.x + Math.cos(a) * 9, 0, KKP.goku.z + Math.sin(a) * 7.5);
      p.y = b.stage.heightAt(p.x, p.z) + 1.1;
      const pr = b.stage.addProp({ kind: 'trainingRock', pos: p, r: 1.25, hp: 1500, id: 'kkRock' + i });
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), T.mat(0x9a8a6a));
      rock.scale.set(1, 0.9, 1);
      T.addOutline(rock, 1.4);
      pr.group.add(rock);
      pr.static = true;
      pr.rocky = true;
      pr.lockable = true;
      pr.debrisColor = 0x9a8a6a;
      list.push(pr);
      m.onDispose(() => rock.geometry.dispose());
    }
    return list;
  }

  /* ---------------------------------------------------------------- phases */
  const P = {};
  P.temple = K().scene('temple', 'bga_temple');
  P.journey = {
    id: 'journey',
    run: function* (m) {
      const b = m.battle, st = b.story;
      m.lock(true);
      yield* SL.Cinema.play(m, 'bga_journey');
      // King Kai's planet: GROUND. The god and his attendant are not here yet.
      m.fade('black', 0.4);
      yield* m.cine(0.45);
      b.changeStage('kingkai');
      m.endShot();
      st.house = K().kkHouse(b, KKP.house);
      m.onDispose(() => st.house && st.house.dispose());
      K().hide([st.beerus, st.whis]);
      K().ground(m, st.goku, KKP.goku.x, KKP.goku.z, KKP.house);
      K().ground(m, st.kingkai, KKP.kk.x, KKP.kk.z, KKP.goku, 'idle', 'smirk');
      K().ground(m, st.bubbles, KKP.kk.x - 4, KKP.kk.z + 2, KKP.goku, 'idle', 'grin');
      m.fade('clear', 0.6);
    },
  };

  /** TRAINING: ten times gravity, five rocks, King Kai heckling. GROUND. */
  P.training = {
    id: 'training',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, st = b.story, g = st.goku;
      m.lock(true);
      m.clearObjectives();
      if (b.stage.def.id !== 'kingkai') {
        b.changeStage('kingkai');
        m.endShot();
      }
      if (!st.house) {
        st.house = K().kkHouse(b, KKP.house);
        m.onDispose(() => st.house && st.house.dispose());
      }
      K().hide([st.beerus, st.whis]);
      K().ground(m, g, KKP.goku.x, KKP.goku.z, KKP.house);
      K().ground(m, st.kingkai, KKP.kk.x, KKP.kk.z, KKP.goku, 'armsCrossed', 'smirk');
      K().ground(m, st.bubbles, KKP.kk.x - 4, KKP.kk.z + 2, KKP.goku, 'idle', 'grin');
      st.kingkai.setState('scripted', { pose: 'idle', expression: 'smirk' });
      const rocks = (st.rocks = trainingRocks(m));
      m.cast({ active: [g], support: [{ f: st.kingkai, pose: 'idle', face: 'smirk' }, { f: st.bubbles, pose: 'idle', face: 'grin' }] }, { centre: KKP.goku.clone(), supportClear: 6 });
      m.space(g, 'ground', { pos: KKP.goku.clone(), face: rocks[0].pos });
      g.setState('free');
      g.target = null;
      m.lock(false);
      m.music('light_battle', 2);
      m.objective('rocks', 'Train under ten times gravity: break the rocks', { icon: 'target', target: rocks.length });
      m.prompt('kkLight', 'light', 'Strike', { until: () => rocks.some((r) => !r.alive) });
      m.prompt('kkBlast', 'blast', 'Ki blast', { until: () => rocks.filter((r) => !r.alive).length >= 2 });
      m.say('king_kai', 'Ten times gravity, Goku — and you still eat like a horse! Show me something!', 3.4);
      let t = 0, said = 0;
      const lines = [
        [1, 'king_kai', 'Hmph. Not bad. Not GOOD, but not bad!'],
        [3, 'goku', 'Heh! The gravity\'s nothing now, King Kai!'],
        [4, 'king_kai', 'Show-off. One more!'],
      ];
      const hook = () => {
        if (b.inputLocked) return;
        t += 1 / 60;
        const broken = rocks.filter((r) => !r.alive).length;
        m.progress('rocks', broken);
        while (said < lines.length && broken >= lines[said][0]) {
          m.say(lines[said][1], lines[said][2], 2.6);
          said++;
        }
      };
      m.tickHooks.push(hook);
      // all five, or a minute of it: the story is about to arrive either way
      yield () => rocks.every((r) => !r.alive) || t > 75;
      K().unhook(m, hook);
      m.complete('rocks');
      m.lock(true);
      g.setState('free');
      yield* m.cine(0.6);
    },
  };

  /**
   * THE ARRIVAL owns its world (it can be reached from the dev menu, or after a training minute that left rocks
   * standing): King Kai's planet, the house, Goku and King Kai on the grass, the gods not here yet.
   */
  P.arrival = {
    id: 'arrival',
    run: function* (m) {
      const b = m.battle, st = b.story;
      m.lock(true);
      m.clearObjectives();
      if (b.stage.def.id !== 'kingkai') {
        m.fade('black', 0.3);
        yield* m.cine(0.35);
        b.changeStage('kingkai');
        m.endShot();
        st.rocks = null;
      }
      if (!st.house) {
        st.house = K().kkHouse(b, KKP.house);
        m.onDispose(() => st.house && st.house.dispose());
      }
      for (const f of [st.goku, st.kingkai]) {
        f.setHidden(false);
        f.controller = K().scripted();
        f.untargetable = f.intangible = true;
      }
      K().hide([st.beerus, st.whis, st.bubbles]);
      yield* SL.Cinema.play(m, 'bga_arrival');
    },
  };
  /** Whatever training rocks are still standing go to pieces: the gods' ki rolling over the little planet. */
  function crumbleRocks(b, rocks) {
    let i = 0;
    for (const pr of rocks || []) {
      if (!pr.alive) continue;
      pr.alive = false;
      pr.group.visible = false;
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2 + i;
        b.vfx.rock(pr.pos, new V3(Math.cos(a) * 3, 1.5 + (k % 3), Math.sin(a) * 3), 0.18 + (k % 4) * 0.08, pr.debrisColor || 0x9a8a6a);
      }
      b.vfx.dust(pr.pos.clone().setY(pr.pos.y - pr.r * 0.5), pr.r * 1.6, 16, b.stage.def.terrain && b.stage.def.terrain.sand);
      i++;
    }
    if (i) b.sfx('rockBreak', null, { vol: 0.9, pitch: 0.7 });
  }
  P.after = K().after('THE GOD OF DESTRUCTION');

  /* ============================================================================ SCENES */
  const cast = (m) => K().cast(m);
  const st = (ctx) => ctx.b.story;
  const pt = (ctx, n, v) => K().pt(ctx, n, v);

  /* ---------------------------------------------------------------- the temple */
  S.bga_temple = {
    id: 'bga_temple',
    cast,
    music: { song: 'mystery', level: 1 },
    clearMood: false,
    events: [
      // UNIVERSE 7: the island hanging in the nebula, the temple on its pillar
      {
        call: (ctx) => {
          const b = ctx.b, s = st(ctx);
          s.goku.setHidden(true);
          // GROUND: the god asleep on his stone bed (the bed's top is 0.9 m up: set by hand, not by the terrain)
          const bed = b.stage.landmarks.bed || new V3(0, 0.9, BW.bed.z);
          s.beerus.setHidden(false);
          s.beerus.setPosition(new V3(0.2, bed.y + 0.02, bed.z));
          s.beerus.prevPos.copy(s.beerus.pos);
          s.beerus.grounded = false;
          s.beerus.yaw = s.beerus.prevYaw = Math.PI / 2;
          s.beerus.setState('scripted', { pose: 'bg_sleep', expression: 'closed' });
          ctx.m.space(s.whis, 'ground', { pos: BW.whis.clone(), face: bed, pose: 'w_idle', expr: 'calm' });
          pt(ctx, 'isle', new V3(0, 0, -6));
          pt(ctx, 'templeTop', (b.stage.landmarks.shrine || new V3(0, 30, -22)).clone());
          pt(ctx, 'bedP', bed.clone());
        },
        cam: { from: { at: 'isle', off: [74, 30, 92] }, to: { at: 'isle', off: [52, 18, 62] }, look: { at: 'isle', off: [0, 10, -16] }, fov: 50, ease: 'inOut' },
        title: { chapter: 'CHAPTER 16 · AGE 778', title: 'BATTLE OF GODS', subtitle: 'Universe 7 · the Realm of the God of Destruction', duration: 4.6 },
        hold: 5,
      },
      {
        cam: { from: { at: 'bedP', off: [5, 0.6, 9] }, to: { at: 'bedP', off: [3.5, 0.9, 7] }, look: { at: 'templeTop' }, fov: 46 },
        say: { who: 'narrator', line: 'Far beyond the North Kai\'s galaxy, a god has slept for thirty-nine years.', duration: 3.8, style: 'quiet' },
        hold: 3.8,
      },
      // Whis walks to the bed: the staff ticking on the stones
      {
        // he comes round to the open side of the bed: in front of it, never behind its posts and curtains
        move: { who: 'whis', at: [BW.byBed.x, 0, BW.byBed.z], seconds: 3, face: 'bedP' },
        pose: [{ who: 'whis', pose: 'w_walk', face: 'calm', speed: 6 }],
        cam: { subject: 'whis', focus: 'full', angle: 'front' },
      },
      {
        pose: [{ who: 'whis', pose: 'w_staffTap', face: 'calm', speed: 8 }],
        sfx: { name: 'block', pitch: 1.6, vol: 0.5 },
        call: (ctx) => SL.Cinema.turnTo(ctx, st(ctx).whis, st(ctx).beerus.pos),
        cam: { subject: 'whis', focus: 'upper', angle: 'front', side: 1 },
        say: { who: 'whis', line: 'Lord Beerus. Lord Beerus — it is time to wake up.', duration: 3 },
        hold: 3.1,
      },
      // asleep: a close look at the god of destruction, snoring — the lens over his chest, the face upright in it
      {
        pose: [{ who: 'whis', pose: 'w_idle', face: 'calm' }],
        call: (ctx) => overFace(ctx, st(ctx).beerus, 'sleep', 1.25, 0.4),
        cam: { from: { at: 'sleepCam' }, to: { at: 'sleepCam', off: [0, -0.18, 0] }, look: { at: 'sleepFace' }, fov: 36, raw: true },
        sfx: { name: 'growl', pitch: 0.5, vol: 0.35 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'beerus', pose: 'bg_sleep', face: 'calm', speed: 6 }],
        call: (ctx) => overFace(ctx, st(ctx).beerus, 'wake', 0.85, -0.25),
        cam: { from: { at: 'wakeCam' }, look: { at: 'wakeFace' }, fov: 30, raw: true },
        say: { who: 'beerus', line: '...Whis. How long was I asleep?', duration: 2.8, style: 'quiet' },
        music: { song: 'beerus_theme', level: 1 },
        hold: 3,
      },
      // he sits up and stretches — on the FRONT edge of the bed, facing Whis on the open side
      {
        call: (ctx) => {
          const s = st(ctx);
          s.beerus.setPosition(new V3(BW.sitAt.x, (ctx.b.stage.landmarks.bed || new V3(0, 0.9, 0)).y + 0.02, BW.sitAt.z));
          s.beerus.prevPos.copy(s.beerus.pos);
          s.beerus.yaw = s.beerus.prevYaw = Math.atan2(s.whis.pos.x - s.beerus.pos.x, s.whis.pos.z - s.beerus.pos.z);
        },
        pose: [{ who: 'beerus', pose: 'bg_sitStretch', face: 'closed', speed: 4 }, { who: 'whis', pose: 'w_idle', face: 'smirk' }],
        // over Beerus' shoulder onto Whis: the god in the corner of the frame, his attendant whole and in the open
        cam: { subject: 'whis', angle: 'ots', over: 'beerus', focus: 'upper' },
        say: { who: 'whis', to: 'beerus', line: 'Thirty-nine years, my lord. A little longer than usual.', duration: 3.2 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'beerus', pose: 'bg_sitYawn', face: 'closed', speed: 5 }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', to: 'whis', line: 'I had a dream. A Super Saiyan God... someone who could give me a real fight.', duration: 4 },
        hold: 4.1,
      },
      {
        pose: [{ who: 'whis', pose: 'w_finger', face: 'calm', speed: 6 }, { who: 'beerus', pose: 'bg_sitYawn', face: 'serious', speed: 5 }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', to: 'beerus', line: 'A Super Saiyan God? I\'ve never heard of such a thing.', duration: 2.8 },
        hold: 2.9,
      },
      {
        pose: [{ who: 'beerus', pose: 'bg_sitYawn', face: 'serious', speed: 5 }, { who: 'whis', pose: 'w_idle', face: 'calm' }],
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        say: { who: 'beerus', to: 'whis', line: 'The Oracle Fish said it too, years ago. A Saiyan. Frieza was supposed to be keeping an eye on them for me.', duration: 4.4 },
        hold: 4.5,
      },
      // up off the bed, onto the stones: GROUND (the lens in the court, in front of the bed)
      {
        space: { who: 'beerus', mode: 'landing', at: [BW.beerusUp.x, 0, BW.beerusUp.z], seconds: 0.5, face: 'whis', endPose: 'bs_idle', expr: 'calm' },
        cam: { subject: 'beerus', focus: 'full', focus2: 'upper', angle: 'three' },
        hold: 1.6,
      },
      // WHAT THE STAFF KNOWS: Namek
      {
        call: (ctx) => {
          const s = st(ctx);
          const orb = s.whis.model.props.staff ? s.whis.model.props.staff.userData.orb.getWorldPosition(new V3()) : s.whis.chest();
          s.vision = K().vision(ctx.b, orb.clone().add(new V3(0, 0.75, 0)), 'namek');
          pt(ctx, 'orb', orb.clone().add(new V3(0, 0.75, 0)));
          ctx.b.sfx('magic', s.whis, { pitch: 1.4, vol: 0.7 });
        },
        pose: [{ who: 'whis', pose: 'w_staffShow', face: 'calm', speed: 6 }],
        tick: (ctx, t) => {
          const s = st(ctx);
          if (!s.vision) return;
          const staff = s.whis.model.props.staff;
          if (staff) {
            const p = staff.userData.orb.getWorldPosition(new V3()).add(new V3(0, 0.75, 0));
            s.vision.at(p);
            ctx.cast.orb.pos.copy(p);
          }
          s.vision.fade(Math.min(1, t / 0.8));
        },
        cam: { from: { at: 'whis', local: [1.6, 0.6, 2.4] }, look: { at: 'orb' }, fov: 42, subject: 'whis' },
        say: { who: 'whis', to: 'beerus', line: 'Frieza was defeated, my lord. On the planet Namek.', duration: 3.2 },
        hold: 3.4,
      },
      {
        // the golden Saiyan, seen from where Beerus stands
        call: (ctx) => st(ctx).vision && st(ctx).vision.kind('ssj'),
        cam: { from: { at: 'beerus', local: [0.45, 0.5, -0.6] }, look: { at: 'orb' }, fov: 32 },
        say: { who: 'whis', line: 'By a Saiyan called Son Goku. A Saiyan who could turn into something called... a Super Saiyan.', duration: 4.2 },
        hold: 4.3,
      },
      {
        cam: { subject: 'beerus', focus: 'closeup', angle: 'three' },
        pose: [{ who: 'beerus', pose: 'bg_tilt', face: 'smirk' }],
        say: { who: 'beerus', to: 'whis', line: 'A Super Saiyan. Not a god — but close enough to ask about one. Where is he?', duration: 3.8 },
        hold: 3.9,
      },
      {
        call: (ctx) => st(ctx).vision && st(ctx).vision.kind('kingkai'),
        cam: { from: { at: 'whis', local: [1.6, 0.6, 2.4] }, look: { at: 'orb' }, fov: 40, subject: 'whis' },
        say: { who: 'whis', line: 'Right now? Training with the North Kai, on his little planet at the end of Snake Way.', duration: 4 },
        hold: 4.1,
      },
      {
        call: (ctx) => {
          const s = st(ctx);
          if (s.vision) {
            s.vision.dispose();
            s.vision = null;
          }
        },
        pose: [{ who: 'whis', pose: 'w_bow', face: 'calm', speed: 6 }],
        // over the bowing attendant's shoulder: the god giving the order
        cam: { subject: 'beerus', angle: 'ots', over: 'whis', focus: 'upper' },
        say: { who: 'beerus', to: 'whis', line: 'Then we\'ll pay the North Kai a visit.', duration: 2.6 },
        hold: 2.4,
      },
      {
        pose: [{ who: 'whis', pose: 'w_idle', face: 'smirk' }, { who: 'beerus', pose: 'bs_idle', face: 'calm' }],
        cam: { subject: 'whis', focus: 'upper', angle: 'three', side: -1 },
        say: { who: 'whis', to: 'beerus', line: 'As you wish. Hold on to me, my lord.', duration: 2.4 },
        hold: 2.4,
      },
      // the departure: Beerus' hand on Whis' back, the staff tapped once, a pillar of light — and up
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          ctx.m.space(s.beerus, 'ground', { pos: s.whis.pos.clone().addScaledVector(s.whis.forward, -0.9).add(new V3(0.5, 0, 0)), face: s.whis.pos, pose: 'bs_idle', expr: 'calm' });
          s.travel = K().travel(b, s.whis.pos.clone());
          b.sfx('teleport', s.whis, { pitch: 0.6, vol: 1 });
          pt(ctx, 'below', s.whis.pos.clone().add(new V3(3, 0.3, 6)));
        },
        pose: [{ who: 'whis', pose: 'w_staffTap', face: 'calm', speed: 8 }],
        tick: (ctx, t) => st(ctx).travel && st(ctx).travel.set(Math.min(1, t / 0.6)),
        cam: { from: { at: 'below' }, look: { at: 'whis', off: [0, 2, 0] }, fov: 52 },
        hold: 1.2,
      },
      {
        space: [
          { who: 'whis', mode: 'flight', to: { at: 'whis', off: [0, 60, -30] }, seconds: 1.6, pose: 'w_fly', endPose: 'w_fly' },
          { who: 'beerus', mode: 'flight', to: { at: 'beerus', off: [0, 60, -30] }, seconds: 1.6, pose: 'bs_flyIdle', endPose: 'bs_flyIdle' },
        ],
        tick: (ctx, t) => {
          const s = st(ctx);
          if (s.travel) s.travel.set(1 - t / 1.6);
          if (ctx.b.frame % 2 === 0) ctx.b.vfx.trail(s.whis.chest(), 0xdff6ff, 1.2, 0.6);
        },
        cam: { from: { at: 'below' }, look: { at: 'whis' }, fov: 56 },
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.vision) {
        s.vision.dispose();
        s.vision = null;
      }
      if (s.travel) {
        s.travel.dispose();
        s.travel = null;
      }
      K().hide([s.beerus, s.whis]);
      ctx.m.flags.beerusAwake = true;
    },
  };

  /* ---------------------------------------------------------------- the journey (a streak across the nebula) */
  S.bga_journey = {
    id: 'bga_journey',
    cast,
    clearMood: false,
    events: [
      {
        call: (ctx) => {
          const b = ctx.b;
          st(ctx).streak = SL.data.endzKit ? SL.data.endzKit.streak(b, 0xdff6ff) : null;
          pt(ctx, 'sky', new V3(0, 60, -60));
        },
        tick: (ctx, t) => {
          const s = st(ctx);
          const p = new V3(-120 + t * 110, 70 + t * 6, -260 + t * 40);
          if (s.streak) s.streak.at(p);
          ctx.cast.sky.pos.copy(p);
        },
        cam: { from: [40, 30, 60], look: { at: 'sky' }, fov: 40, raw: true },
        sfx: { name: 'wind', pitch: 0.8, vol: 0.6 },
        hold: 2.6,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.streak) {
        s.streak.dispose();
        s.streak = null;
      }
    },
  };

  /* ---------------------------------------------------------------- King Kai's planet: the arrival */
  // (rebuilt 2026-10-06, the owner: Beerus did not appear, the camera found the house instead of the gods.)
  // GROUND. The landing point is out on the open grass, well clear of the house, the car and the tree; King Kai
  // stands between it and his house; Goku is pushed inside and peeks out of the door.
  const ARR = { land: new V3(5, 0, 1), kk: new V3(0.5, 0, -4.5) };
  S.bga_arrival = {
    id: 'bga_arrival',
    cast,
    music: { song: 'ominous', level: 1 },
    events: [
      // 1. the little planet: the house, the car, the tree, the yellow sky — and something wrong
      {
        call: (ctx) => {
          const s = st(ctx), m = ctx.m;
          m.space(s.goku, 'ground', { pos: KKP.goku.clone(), face: ARR.kk, pose: 'idle', expr: 'calm' });
          m.space(s.kingkai, 'ground', { pos: ARR.kk.clone(), face: KKP.goku, pose: 'kk_antennae', expr: 'shock' });
          K().hide([s.beerus, s.whis]);
          pt(ctx, 'land', SL.Staging.clearSpot(ctx.b, ARR.land, 3));
          pt(ctx, 'door', s.house ? s.house.door() : KKP.house.clone().add(new V3(0, 0, 5.4)));
          pt(ctx, 'houseP', KKP.house.clone().add(new V3(0, 2.4, 0)));
          pt(ctx, 'planet', new V3(0, 0, -6));
        },
        cam: { from: { at: 'planet', off: [34, 16, 34] }, to: { at: 'planet', off: [26, 10, 26] }, look: { at: 'planet', off: [0, 1.5, 0] }, fov: 44, raw: true },
        hold: 2.4,
      },
      // 2. the house, the car, the tree — quiet; Goku catching his breath on the grass
      {
        call: (ctx) => pt(ctx, 'yard', KKP.house.clone().add(new V3(0, 1.6, 7))),
        cam: { from: { at: 'yard', off: [-10, 1.2, 9] }, to: { at: 'yard', off: [-7, 1.6, 7] }, look: { at: 'yard', off: [0, 0.6, -3] }, fov: 46, raw: true },
        sfx: { name: 'tinnitus', vol: 0.45 },
        hold: 1.8,
      },
      // 3. something is coming: the god's ki rolls over the little planet — what is left of the training rocks goes to
      //    pieces, the tree shivers, King Kai's antennae stand straight up
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b;
          crumbleRocks(b, s.rocks);
          // the landing spot, now that nothing stands on the grass but the house
          pt(ctx, 'land', SL.Staging.clearSpot(b, ARR.land, 3));
          b.cameraTraumaAt(s.kingkai.pos, 0.35);
          if (s.house) s.house.shake(0.6, ctx.cast.land.pos);
        },
        tick: (ctx, t) => st(ctx).house && st(ctx).house.shake(Math.max(0, 0.6 - t * 0.4), ctx.cast.land.pos),
        sfx: { name: 'rumble', vol: 0.7, pitch: 0.5 },
        cam: { subject: 'kingkai', focus: 'closeup', angle: 'front' },
        say: { who: 'king_kai', to: 'goku', line: '...!? That ki... No. No, no, no — it can\'t be HIM!', duration: 3.2, style: 'shout' },
        hold: 3.2,
      },
      // King Kai's panic: Goku, into the house!
      {
        space: { who: 'kingkai', mode: 'ground', at: 'goku', off: [-1.3, 0, -0.6], face: 'goku' },
        pose: [{ who: 'kingkai', pose: 'bg_kkPanic', face: 'nervous', speed: 10 }, { who: 'goku', pose: 'idle', face: 'shock' }],
        cam: { subject: 'kingkai', with: 'goku', focus: 'full' },
        say: { who: 'king_kai', to: 'goku', line: 'Goku! Inside! Into the house, NOW — and don\'t come out, whatever you hear!', duration: 3.4, style: 'shout' },
        hold: 3.4,
      },
      {
        pose: [{ who: 'kingkai', pose: 'bg_kkShove', face: 'nervous', speed: 10 }, { who: 'goku', pose: 'idle', face: 'neutral' }],
        cam: { subject: 'goku', focus: 'upper', angle: 'three' },
        say: { who: 'goku', to: 'kingkai', line: 'Huh? What\'s wrong, King Kai? Hey — quit pushing!', duration: 2.4 },
        hold: 2.4,
      },
      {
        move: { who: 'goku', at: 'door', seconds: 1.4, face: 'door' },
        pose: [{ who: 'goku', pose: 'run', face: 'neutral', speed: 8 }, { who: 'kingkai', pose: 'bg_kkPanic', face: 'nervous', speed: 12 }],
        cam: { from: { at: 'door', off: [7, 2.6, 9] }, look: { at: 'door', off: [0, 1.2, -1] }, fov: 46 },
      },
      // King Kai back out on the grass, facing where the ki is coming from
      {
        call: (ctx) => {
          const s = st(ctx);
          s.goku.setHidden(true);
          ctx.m.space(s.kingkai, 'ground', { pos: ARR.kk.clone(), face: ctx.cast.land.pos, pose: 'bg_kkPanic', expr: 'nervous' });
          const back = ARR.kk.clone().sub(ctx.cast.land.pos).setY(0).normalize();
          pt(ctx, 'behindKK', ARR.kk.clone().addScaledVector(back, 2.6).addScaledVector(new V3(back.z, 0, -back.x), 0.9).add(new V3(0, 1.45, 0)));
        },
        cam: { from: { at: 'behindKK' }, look: { at: 'land', off: [0, 3, 0] }, fov: 40 },
        sfx: { name: 'rumble', vol: 0.8, pitch: 0.6 },
        hold: 1.2,
      },
      // 3. THE ARRIVAL: a pillar of light comes down out of the sky onto the grass
      {
        call: (ctx) => {
          const s = st(ctx), b = ctx.b, m = ctx.m, L = ctx.cast.land.pos;
          s.travel = K().travel(b, L.clone());
          b.sfx('teleport', null, { pitch: 0.5, vol: 1.3, at: L });
          b.cameraTraumaAt(L, 0.45);
          b.vfx.ring(L.clone().add(new V3(0, 0.1, 0)), 7, 0xdff6ff, 0.8, new V3(0, 1, 0));
          b.vfx.dust(L, 3.5, 24);
          // Beerus in front, Whis half a step behind him and to his left; both facing King Kai — VISIBLE
          const toKK = ARR.kk.clone().sub(L).setY(0).normalize();
          const left = new V3(toKK.z, 0, -toKK.x);
          s.beerus.setHidden(false);
          s.whis.setHidden(false);
          m.space(s.beerus, 'ground', { pos: L.clone(), face: ARR.kk, pose: 'bs_idle', expr: 'calm' });
          m.space(s.whis, 'ground', { pos: L.clone().addScaledVector(toKK, -0.9).addScaledVector(left, 2.1), face: ARR.kk, pose: 'w_idle', expr: 'calm' });
          s.beerus.untargetable = s.beerus.intangible = true;
          s.whis.untargetable = s.whis.intangible = true;
        },
        tick: (ctx, t) => st(ctx).travel && st(ctx).travel.set(t < 0.4 ? t / 0.4 : Math.max(0, 1 - (t - 0.4) / 1.4)),
        cam: { from: { at: 'behindKK' }, to: { at: 'behindKK', off: [0, -0.1, 0] }, look: { at: 'land', off: [0, 1.3, 0] }, fov: 32 },
        hold: 2,
      },
      // 4. the god, dominant: a controlled push from his chest into his face, the lens a little under his eyes (a
      //    deity looked up at — never a waist-height frame on his belt: the owner, 2026-10-06)
      {
        cam: { subject: 'beerus', focus: 'upper', focus2: 'closeup', angle: 'front', height: -0.08, ease: 'inOut' },
        music: { song: 'beerus_theme', level: 1 },
        hold: 3,
      },
      // 5. Whis beside and behind him, smiling
      {
        pose: [{ who: 'whis', pose: 'w_idle', face: 'smirk' }],
        cam: { subject: 'whis', with: 'beerus', focus: 'full' },
        hold: 1.8,
      },
      // 6. King Kai scurries up to the god — and throws himself down in front of him
      {
        move: { who: 'kingkai', at: 'beerus', local: [0.5, 0, 3], seconds: 0.9, face: 'beerus' },
        pose: [{ who: 'kingkai', pose: 'bg_kkPanic', face: 'nervous', speed: 14 }],
        cam: { subject: 'beerus', with: 'kingkai', focus: 'full' },
        sfx: { name: 'uiMove', vol: 0.4, pitch: 1.6 },
      },
      {
        pose: [{ who: 'kingkai', pose: 'bg_kkBow', face: 'nervous', speed: 8 }],
        call: (ctx) => SL.Cinema.turnTo(ctx, st(ctx).kingkai, st(ctx).beerus.pos, 6),
        // from behind the god's shoulder: King Kai on his face in the grass in front of him
        cam: { subject: 'kingkai', angle: 'ots', over: 'beerus', focus: 'full' },
        say: { who: 'king_kai', to: 'beerus', line: 'L-L-Lord Beerus! What an honor! Welcome — welcome to my humble little planet!', duration: 3.6 },
        hold: 3.6,
      },
      // 7. Goku, peeking out of the door
      {
        call: (ctx) => {
          const s = st(ctx);
          s.goku.setHidden(false);
          if (s.house) s.house.open(true);
          const d = s.house ? s.house.doorway() : ctx.cast.door.pos.clone();
          ctx.m.space(s.goku, 'ground', { pos: d, face: ctx.cast.land.pos, pose: 'bg_peek', expr: 'grin' });
        },
        cam: { subject: 'goku', focus: 'upper', angle: 'front' },
        sfx: { name: 'uiMove', vol: 0.3 },
        hold: 1.8,
      },
      // 8. back to the gods: the question
      {
        pose: [{ who: 'beerus', pose: 'bs_idle', face: 'calm' }],
        cam: { subject: 'beerus', focus: 'upper', angle: 'three' },
        say: { who: 'beerus', to: 'kingkai', line: 'North Kai. I\'m looking for a Saiyan called Goku. I hear he\'s here.', duration: 3.4 },
        hold: 3.4,
      },
      {
        pose: [{ who: 'kingkai', pose: 'bg_kkPanic', face: 'nervous', speed: 12 }],
        cam: { subject: 'kingkai', focus: 'closeup', angle: 'front' },
        say: { who: 'king_kai', to: 'beerus', line: 'G-Goku? Goku... Never heard of him! No Saiyans here! Just me and my monkey!', duration: 3.6, style: 'shout' },
        hold: 3.6,
      },
      {
        pose: [{ who: 'whis', pose: 'w_point', face: 'smirk', speed: 6 }],
        call: (ctx) => SL.Cinema.turnTo(ctx, st(ctx).whis, ctx.cast.door.pos),
        cam: { subject: 'whis', focus: 'upper', angle: 'three' },
        say: { who: 'whis', line: 'Then who, may I ask, is that peeking out of your door?', duration: 3.2 },
        hold: 3.2,
      },
      // Goku walks out anyway — he cannot help himself
      {
        move: { who: 'goku', at: 'beerus', local: [-1.7, 0, 2.5], seconds: 2, face: 'beerus' },
        pose: [{ who: 'goku', pose: 'ez_walk', face: 'grin', speed: 7 }],
        cam: { subject: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'goku', to: 'beerus', line: 'Heh. So YOU\'RE the one King Kai\'s so scared of.', duration: 2.6 },
      },
      {
        pose: [{ who: 'goku', pose: 'idle', face: 'grin' }, { who: 'kingkai', pose: 'bg_kkPanic', face: 'shout', speed: 14 }],
        call: (ctx) => SL.Cinema.turnTo(ctx, st(ctx).kingkai, st(ctx).goku.pos),
        cam: { subject: 'kingkai', focus: 'upper', angle: 'front' },
        say: { who: 'king_kai', to: 'goku', line: 'GOKU! I TOLD you to stay inside!', duration: 2.4, style: 'shout' },
        hold: 2.4,
      },
      {
        pose: [{ who: 'goku', pose: 'bg_bowScratch', face: 'grin', speed: 8 }, { who: 'beerus', pose: 'bs_idle', face: 'calm' }],
        // over Beerus' shoulder: Goku asking the god for a fight, the god's head in the corner of the frame
        cam: { subject: 'goku', angle: 'ots', over: 'beerus', focus: 'upper' },
        say: { who: 'goku', to: 'beerus', line: 'I\'m Goku. You\'re the God of Destruction, right? I\'ve never felt a ki like yours... Would you spar with me? Just a friendly match.', duration: 4.8 },
        hold: 4.8,
      },
      {
        pose: [{ who: 'kingkai', pose: 'knockdown', face: 'ko', speed: 6 }],
        cam: { subject: 'kingkai', focus: 'full', angle: 'high' },
        say: { who: 'king_kai', line: '...He\'s going to get us all destroyed...', duration: 2.6, style: 'quiet' },
        hold: 2.6,
      },
      {
        pose: [{ who: 'beerus', pose: 'bg_tilt', face: 'smirk' }, { who: 'goku', pose: 'idle', face: 'grin' }],
        cam: { subject: 'beerus', with: 'goku', focus: 'full', angle: 'three' },
        say: { who: 'beerus', to: 'goku', line: 'Hm. Fine. Show me this... Super Saiyan.', duration: 3 },
        music: { song: 'beerus_theme', level: 2 },
        hold: 3.2,
      },
    ],
    end(ctx) {
      const s = st(ctx);
      if (s.travel) {
        s.travel.dispose();
        s.travel = null;
      }
      s.beerus.setHidden(false);
      s.whis.setHidden(false);
      s.goku.setHidden(false);
      ctx.m.flags.sparAsked = true;
    },
  };

  const def = {
    id: 'bog_awaken',
    canon: true,
    chapter: 'CHAPTER 16 · BATTLE OF GODS',
    title: 'The God of Destruction',
    subtitle: 'Beerus awakens · Age 778',
    character: 'goku',
    stage: 'beerus_world',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Thirty-nine years asleep, and a dream about a god. On King Kai\'s little planet, Goku is training — and King Kai\'s antennae have just stood straight up.',
    rewards: ['Story: Beerus and Whis', 'Stage: Beerus\' World'],
    setup,
    phases: [P.temple, P.journey, P.training, P.arrival, P.after],
  };
  SL.data.missions[def.id] = def;
  SL.data.bogAwaken = { KKP, BW };
})();
