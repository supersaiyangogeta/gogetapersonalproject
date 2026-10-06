/*
 * WHAT IF · PROLOGUE — "What if the warning got out?"   (NOT CANON)
 * Astra What-If Bible, Scenario 03 — P03: "The Scouter That Would Not Die" (PROPOSED STORY DESIGN · MEDIUM).
 *
 * Branches from "The Final Stand". In canon Bardock dies shouting at a sky that nobody is
 * listening to. Here he spends his last minutes on a wrecked supply pod's transmitter: he
 * holds a broadcast open while Frieza's communications squad tries to shoot it down, and
 * then dies the same way — but the fragment is already gone.
 *
 * Divergence → the transmitter survives long enough to send. Consequence → different
 * gameplay (an object to defend instead of a blockade to break), and the warning outlives
 * him. Ending → a scouter somewhere else in the fleet hears two words and hides them.
 *
 * Phases: RIG (checkpoint: clear the escort and open the channel) → SEND (checkpoint: hold
 * the broadcast) → STAND (the Supernova, and the last shot he has) → AFTER (the receiver).
 *
 * Saved on the separate What-If track (`whatIf`, `branchOf`); canon progress is untouched.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  const POD_AT = new V3(0, 10, 26);
  const SEND_SECONDS = 30;
  const NEAR_POD = 16; // an enemy this close to the transmitter jams it

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }
  function place(f, pos, yaw) {
    f.setPosition(pos);
    if (yaw !== undefined) f.yaw = yaw;
    f.prevYaw = f.yaw;
    f.vel.set(0, 0, 0);
    f.fallVel = 0;
    f.grounded = false;
  }
  function faceTo(f, pos) {
    f.yaw = f.prevYaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }
  const scripted = () => ({ update: () => SL.emptyIntent() });
  function clearCombat(b) {
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
  }

  /** Frieza's sphere, grown in the sky: the same trick the canon ending uses, at mission scale. */
  function supernova(b, at) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffb040 }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xff8a30, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.setScalar(4.5);
    g.add(core, glow);
    g.position.copy(at);
    g.scale.setScalar(1);
    b.scene.add(g);
    return {
      group: g,
      dispose() {
        b.scene.remove(g);
        core.geometry.dispose();
        core.material.dispose();
        glow.material.dispose();
      },
    };
  }

  function setup(battle) {
    const b = battle;
    const bardock = b.spawn({ charId: 'bardock', player: true, team: 0, pos: new V3(0, 8, 44), yaw: Math.PI, grounded: false, startKi: 60 });
    bardock.hp = Math.round(bardock.hpMax * 0.55); // he has already fought his way up here
    b.story = { bardock, pod: null, nova: null };
  }

  const P = {};

  /* RIG. The squad that was guarding the wreck, and then a channel nobody was meant to open. */
  P.rig = {
    id: 'rig',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.bardock;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      place(p, new V3(0, 8, 44), Math.PI);
      p.setState('scripted', { pose: 'b_beaten', expression: 'hurt' });
      // the wreck he is holding on to
      const pod = b.stage.addProp({ kind: 'pod', pos: POD_AT.clone(), r: 1.7, hp: 2600, id: 'transmitter' });
      pod.static = true;
      S.pod = pod;
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.6);
      m.music('orbit', 0);
      m.shot((t, out) => camAt(out, POD_AT.clone().add(new V3(6, 3, 10)), POD_AT, U.lerp(50, 44, t)), 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('bardock', "A supply pod. Half a hull left... and a transmitter that still talks to the fleet.", 3.4);
      yield* m.cine(3.6);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(-1.4, 0.1, -2.8)), c, 40);
      }, 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('bardock', "I can't beat him. But every ship out there is listening on this band.", 3.2, { style: 'quiet' });
      yield* m.cine(3.4);
      m.endShot();
      SL.Audio.play('scouter');
      m.say('soldier', 'Communications squad — that Saiyan is at the relay pod! Put it in pieces!', 3);
      yield 1.2;
      // the escort that was already out here
      p.setState('free');
      m.lock(false);
      b.aiLocked = false;
      b.rules.pressure = { melee: 1, ranged: 1, gap: 110, grace: 180 };
      m.music('battle', 2);
      m.objective('escort', 'Clear the squad off the relay', { icon: 'fist', target: 3 });
      const k0 = m.kills;
      m.spawn({ charId: 'frieza_soldier', pos: POD_AT.clone().add(new V3(-9, 3, -12)), grounded: false, tag: 'escort' });
      m.spawn({ charId: 'frieza_soldier', pos: POD_AT.clone().add(new V3(8, -2, -14)), grounded: false, tag: 'escort' });
      m.spawn({ charId: 'frieza_gunner', pos: POD_AT.clone().add(new V3(0, 6, -20)), grounded: false, tag: 'escort' });
      const hook = () => m.progress('escort', Math.min(3, m.kills - k0));
      m.tickHooks.push(hook);
      yield () => m.kills - k0 >= 3;
      m.tickHooks.splice(m.tickHooks.indexOf(hook), 1);
      m.complete('escort');
      m.flags.escortCleared = true;
      m.lock(true);
      m.say('bardock', 'Channel open. Now stay open.', 2, { style: 'shout' });
      yield 1.4;
    },
  };

  /*
   * SEND. The whole mission is here: the broadcast needs thirty seconds of clear air, and
   * the squad keeps arriving. Anything of theirs near the pod jams it and chews on it.
   */
  P.send = {
    id: 'send',
    checkpoint: true,
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.bardock;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      let pod = S.pod;
      if (!pod || !pod.alive) {
        pod = b.stage.addProp({ kind: 'pod', pos: POD_AT.clone(), r: 1.7, hp: 2600, id: 'transmitter' });
        pod.static = true;
        S.pod = pod;
      }
      place(p, POD_AT.clone().add(new V3(0, 2, 8)), Math.PI);
      p.setState('free');
      p.hp = Math.max(p.hp, Math.round(p.hpMax * 0.35));
      m.lock(false);
      b.aiLocked = false;
      b.rules.pressure = { melee: 2, ranged: 2, gap: 90, grace: 140 };
      m.music('battle', 4);
      m.objective('signal', 'Hold the broadcast open', { icon: 'clock', target: SEND_SECONDS });
      m.objective('intact', 'Keep the relay above half', { icon: 'guard', optional: true });
      m.prompt('defendPod', 'boost', 'Anything near the pod jams the signal — go and get it', { required: true, always: true, when: () => m.flags.jammed });
      let sent = 0, waveAt = 0, wave = 0, jamWarned = false;
      const hook = () => {
        if (b.inputLocked) return;
        if (!pod.alive) return;
        const near = b.fighters.filter((f) => f.alive && f.team !== p.team && f.pos.distanceTo(pod.pos) < NEAR_POD);
        m.flags.jammed = near.length > 0;
        if (near.length) {
          // they are on top of it: the signal stalls and the hull takes their fire
          if (b.frame % 20 === 0) b.stage.damageProp(pod, 26 * near.length, near[0]);
          if (b.frame % 10 === 0) b.vfx.sparks(pod.pos, 0xff6040, 5, 6);
          if (!jamWarned) {
            jamWarned = true;
            m.say('bardock', 'Get away from it!', 1.8, { style: 'shout' });
          }
        } else {
          sent += 1 / 60;
          m.progress('signal', Math.min(SEND_SECONDS, Math.floor(sent)));
          if (b.frame % 12 === 0) b.vfx.ring(pod.pos.clone(), 3.4, 0x9fd0ff, 0.3, new V3(0, 1, 0));
        }
        // waves keep coming for as long as the channel is open
        if (b.frame - waveAt > 60 * 9 && m.alive('comm').length < 3) {
          waveAt = b.frame;
          wave++;
          const side = wave % 2 ? 1 : -1;
          m.spawn({ charId: 'frieza_gunner', pos: pod.pos.clone().add(new V3(15 * side, 7, -18)), grounded: false, tag: 'comm' });
          m.spawn({ charId: 'frieza_soldier', pos: pod.pos.clone().add(new V3(11 * side, -4, -16)), grounded: false, tag: 'comm' });
          if (wave >= 3) m.spawn({ charId: 'frieza_soldier', pos: pod.pos.clone().add(new V3(-6 * side, 2, -22)), grounded: false, tag: 'comm' });
        }
      };
      m.tickHooks.push(hook);
      yield () => sent >= SEND_SECONDS || !pod.alive;
      m.tickHooks.splice(m.tickHooks.indexOf(hook), 1);
      m.prompts.delete('defendPod');
      if (!pod.alive) {
        // canon reasserts itself: no transmitter, no warning, and this timeline never happens
        m.lock(true);
        m.say('bardock', 'No — the relay! ...Then nobody hears it. Nobody ever hears it.', 3.4, { style: 'shout' });
        yield 2.6;
        m.fail('relayDown');
        yield () => false;
      }
      m.complete('signal');
      if (pod.hp > pod.maxHp * 0.5) m.complete('intact');
      else m.failObjective('intact');
      m.flags.sent = Math.round(sent);
      m.flags.relayHp = Math.round((pod.hp / pod.maxHp) * 100);
      m.lock(true);
      // what actually went out
      m.shot((t, out) => camAt(out, pod.pos.clone().add(new V3(4, 2.4, 7)), pod.pos, U.lerp(48, 42, t)), 5, { cut: true, blendIn: 0, hold: true });
      SL.Audio.play('scouter');
      m.say('bardock', 'Anyone on this band — Frieza is burning our world. He is not paying us. He is clearing us out. Get off the planet. GET OFF THE PLANET!', 6, { style: 'shout' });
      yield* m.cine(6.2);
      m.endShot();
      m.flags.broadcast = true;
    },
  };

  /* STAND. Same sky, same sphere, same ending for him — only the timing is different. */
  P.stand = {
    id: 'stand',
    run: function* (m) {
      const b = m.battle, S = b.story, p = S.bardock;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      for (const f of b.fighters) if (f !== p && f.alive) f.setHidden(true);
      place(p, new V3(0, 10, 30), Math.PI);
      p.controller = scripted();
      p.cannotDie = true;
      p.setState('scripted', { pose: 'b_defiant', expression: 'angry' });
      m.music('finale', 5);
      const nova = supernova(b, new V3(0, 46, -70));
      S.nova = nova;
      let k = 0;
      const grow = () => {
        k++;
        nova.group.scale.setScalar(1 + Math.min(1, k / 260) * 16);
      };
      m.tickHooks.push(grow);
      b.stage.setMood(0.5, 0x2a0a04, 2);
      m.shot((t, out) => camAt(out, new V3(14, 16, 34), nova.group.position, U.lerp(46, 58, t)), 4, { cut: true, blendIn: 0, hold: true });
      m.say('frieza', 'Was that a broadcast, monkey? How sweet. Let us see who is still alive to answer it.', 4.2);
      yield* m.cine(4.4);
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(-1.6, 0.2, -3)), c, 40);
      }, 3.4, { cut: true, blendIn: 0, hold: true });
      m.say('bardock', 'Too late. It is already out there — and you cannot shoot a radio wave.', 3.4);
      yield* m.cine(3.6);
      // the last thing he does
      p.setState('scripted', { pose: 'b_cannonCharge', expression: 'shout' });
      m.shot((t, out) => camAt(out, p.chest().clone().add(new V3(3.4, 1.2, 5)), nova.group.position, 52), 999, { hold: true, cut: true, blendIn: 0 });
      const res = yield* m.struggle({
        start: 0.35,
        drain: -0.02,
        duration: 4,
        label: 'EVERYTHING HE HAS LEFT',
        canFail: false,
        keepInput: false,
        onTick: () => {
          if (b.frame % 4 === 0) b.vfx.streamInward(p.handPos('R'), 2.2, 0x5fd0ff, 3, 0.12, 0.35);
          b.camera.addTrauma(0.012);
        },
      });
      m.qteParts.push(U.clamp01(res.avg * 1.2));
      m.flags.cannonAvg = Math.round(res.avg * 100) / 100;
      p.setState('scripted', { pose: 'b_cannonFire', expression: 'shout' });
      const from = p.handPos('R'), to = nova.group.position.clone();
      for (let i = 0; i <= 26; i++) b.vfx.trail(from.clone().lerp(to, i / 26), 0x5fd0ff, 0.4, 0.5);
      b.sfx('beamFire', p, { vol: 1.4, pitch: 0.9 });
      b.vfx.flash(to, 10, 0xbfe8ff, 0.5, SL.Toon.tex.glow);
      b.cameraTraumaAt(p.chest(), 0.7);
      m.say('bardock', 'FRIEZA!', 1.6, { style: 'shout' });
      yield 1.8;
      // and the sphere comes anyway
      b.sfx('explosionBig', null, { at: to });
      SL.ScreenFX.flash(0.6, '#ffd8a0');
      p.setState('scripted', { pose: 'b_smile', expression: 'soft' });
      m.shot((t, out) => {
        const c = p.chest();
        camAt(out, c.clone().add(new V3(-1.1, 0.15, -2.2)), c, 38);
      }, 3, { cut: true, blendIn: 0, hold: true });
      m.say('bardock', 'Kakarot... somebody out there heard me.', 3, { style: 'quiet' });
      yield* m.cine(3.2);
      m.tickHooks.splice(m.tickHooks.indexOf(grow), 1);
      m.fade('white', 1.6);
      yield 1.8;
      nova.dispose();
      S.nova = null;
      p.setHidden(true);
      m.flags.bardockFell = true;
      m.endShot();
    },
  };

  /* AFTER. Somewhere else in the fleet, a scouter crackles and somebody decides to keep it. */
  P.after = {
    id: 'after',
    run: function* (m) {
      const b = m.battle, S = b.story;
      m.lock(true);
      m.clearObjectives();
      clearCombat(b);
      b.stage.setMood(0.2, 0x0a1428, 2);
      const hearer = b.spawn({ charId: 'frieza_soldier', team: 1, pos: new V3(30, 6, 30), grounded: false, tags: { cinematic: true } });
      hearer.controller = scripted();
      hearer.untargetable = true;
      hearer.cannotDie = true;
      place(hearer, new V3(30, 6, 30), Math.PI * 0.8);
      hearer.setState('scripted', { pose: 'idle', expression: 'calm' });
      m.music('finale', 2);
      m.shot((t, out) => {
        const c = hearer.chest();
        camAt(out, c.clone().add(new V3(-1.8, 0.3, -2.6)), c, U.lerp(42, 38, t));
      }, 4, { cut: true, blendIn: 0, hold: true });
      SL.Audio.play('scouter');
      m.say('scouter', '...zzk... Frieza... zzk... our world...', 3.4, { style: 'quiet' });
      yield* m.cine(3.6);
      hearer.setState('scripted', { pose: 'idle', expression: 'shock' });
      m.say('soldier', 'That band is Saiyan. ...That was a Saiyan.', 2.8, { style: 'quiet' });
      yield* m.cine(3);
      m.shot((t, out) => camAt(out, hearer.chest().clone().add(new V3(-2.6, 0.8, -3.4)), hearer.chest(), U.lerp(42, 46, t)), 4, { cut: true, blendIn: 0, hold: true });
      m.say('soldier', 'If the Lord finds this recording on my scouter, I am next. ...And if he does not, somebody else hears it.', 4.6, { style: 'quiet' });
      yield* m.cine(4.8);
      hearer.setState('scripted', { pose: 'flyIdle', expression: 'grit' });
      b.vfx.flash(hearer.chest(), 3, 0x9fd0ff, 0.3, SL.Toon.tex.glow);
      m.shot((t, out) => {
        // he leaves with it: stay near him, let the planet fall away behind
        const c = hearer.chest();
        camAt(out, c.clone().add(new V3(-3.4, U.lerp(1.2, 3.4, t), -4.4)), c.clone().add(new V3(0, U.lerp(0, 1.6, t), 0)), U.lerp(44, 52, t));
      }, 3.4, { cut: true, blendIn: 0, hold: true });
      yield* m.cine(3.4);
      m.fade('black', 1.2);
      yield 1.4;
      m.endShot();
      m.title('WHAT IF...?', 'THE SCOUTER THAT WOULD NOT DIE', 'He still died. The warning did not · Not canon', 4.4);
      yield* m.cine(4.6);
    },
  };

  const def = {
    id: 'whatif_signal',
    whatIf: true,
    branchOf: 'prologue_final_stand',
    branchPoint: 'ending',
    chapter: 'WHAT IF · PROLOGUE',
    title: 'What if the warning got out?',
    subtitle: 'Planet Vegeta orbit · Age 737 · Alternate timeline',
    character: 'bardock',
    stage: 'orbit',
    parTime: 300,
    qteLabel: 'The last shot',
    rules: { allowTransform: false, allowUltimates: true },
    blurb: 'His last minutes spent on a wrecked relay instead of a blockade: hold a broadcast open against the communications squad, and die with the warning already gone.',
    rewards: ['An alternate ending: the warning outlives him', 'Defend-the-relay encounter in orbit'],
    setup,
    phases: [P.rig, P.send, P.stand, P.after],
  };

  SL.data.missions[def.id] = def;
})();
