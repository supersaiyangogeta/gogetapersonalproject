/*
 * PROLOGUE — "The Final Stand" (Bardock).
 * Canon beats preserved: Bardock attacks Frieza's forces alone above Planet
 * Vegeta, Frieza answers with a Supernova and Bardock's final attack is
 * overwhelmed. The ending cinematic (prologue_ending.js) follows his last
 * moments: the vision of his son, the planet's destruction, Kakarot's pod.
 * Gameplay beats: blockade waves (teaches controls in context; enemies arrive
 * in small, readable groups in front of the player and gunners announce
 * themselves), a checkpoint when the gunners arrive, attack pods (lockable;
 * objective + optional timer, capped reinforcements), elite squad
 * (Battle-Hardened rage), and a
 * playable final struggle whose outcome is fixed but whose score is not.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;

  function hoverPod(scale) {
    const g = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), SL.Toon.mat(0xd9d4cc, { side: THREE.DoubleSide }));
    SL.Toon.addOutline(cup, 1.5);
    cup.position.y = 0.62;
    g.add(cup);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 8, 32), SL.Toon.mat(0x5a5a66));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.72;
    g.add(rim);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.73, 20, 12, Math.PI * 0.7, Math.PI * 0.6, Math.PI * 0.18, Math.PI * 0.3), new THREE.MeshBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
    glass.position.y = 0.6;
    g.add(glass);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0x9fd0ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.setScalar(1.4);
    glow.position.y = -0.1;
    g.add(glow);
    g.scale.setScalar(scale);
    return g;
  }

  function camAt(out, pos, look, fov) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
  }

  const mission = {
    id: 'prologue_final_stand',
    canon: true,
    chapter: 'PROLOGUE',
    title: 'The Final Stand',
    subtitle: 'Planet Vegeta · Age 737',
    character: 'bardock',
    stage: 'orbit',
    parTime: 420,
    blurb: "Frieza's army blocks the sky above Planet Vegeta. One Saiyan soldier refuses to go quietly.",
    rewards: ['Bardock — playable in Free Battle & Training', 'Planet Vegeta Orbit stage'],
    props: { hoverPod },

    setup(battle, startPhase) {
      battle.spawn({ charId: 'bardock', player: true, team: 0, pos: new V3(0, 6, 70), yaw: Math.PI, grounded: false, startKi: 40 });
    },

    phases: [
      {
        id: 'intro',
        run: function* (m) {
          const b = m.battle, p = m.player;
          m.lock(true);
          m.music('orbit', 0);
          p.setState('scripted', { pose: 'flyIdle' });
          m.title('PROLOGUE', 'THE FINAL STAND', 'Planet Vegeta · Age 737', 3.8);
          m.shot((t, out) => camAt(out, new V3(U.lerp(-70, -25, t), U.lerp(34, 18, t), U.lerp(170, 120, t)), new V3(20, U.lerp(-10, 10, t), -150), 50), 4.2, { cut: true, blendIn: 0 });
          yield* m.cine(4);
          p.setState('scripted', { pose: 'b_intro', speed: 6, expression: 'angry' });
          m.shot((t, out) => {
            const c = p.chest();
            camAt(out, new V3(c.x - 1.3, c.y + 0.05, c.z - U.lerp(3.2, 2.6, t)), c.clone().add(new V3(0, 0.08, 0)), 40);
          }, 3.4, { cut: true, blendIn: 0 });
          m.say('bardock', "Frieza... you won't erase my people. Not while I'm still breathing.", 3.3);
          yield* m.cine(3.3);
          SL.Audio.play('scouter');
          m.shot((t, out) => camAt(out, new V3(U.lerp(0, 12, t), 55, -110), new V3(30, 38, -230), 44), 2.8, { cut: true, blendIn: 0 });
          m.say('soldier', 'Scouter reading... a lone Saiyan? Ha! Blast him out of the sky!', 2.8);
          yield* m.cine(2.8);
          m.endShot();
          p.setState('free');
        },
      },
      {
        id: 'blockade',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, p = m.player;
          m.lock(false);
          m.music('battle', 1);
          // a first mission: one melee attacker at a time, at most one volley, enemies off-screen wait longer
          b.rules.pressure = { melee: 1, ranged: 1, gap: 100, grace: 200 };
          m.objective('blockade', 'Break through the blockade', { icon: 'fist', target: 3 });
          const k0 = m.kills;
          // two soldiers ahead of Bardock, in view
          const ahead = (dx, dy, dz) => p.pos.clone().add(new V3(dx, dy, dz));
          m.spawn({ charId: 'frieza_soldier', pos: ahead(-6, 1, -22), grounded: false, tag: 'wave' });
          m.spawn({ charId: 'frieza_soldier', pos: ahead(7, 3, -26), grounded: false, tag: 'wave' });
          m.tickHooks.push(() => m.progress('blockade', m.kills - k0));
          m.prompt('move', 'moveF', 'Move', { until: () => Math.abs(SL.Input.move.x) + Math.abs(SL.Input.move.y) > 0.5 });
          m.prompt('attack', 'light', 'Attack', { when: () => p.target && p.distTo(p.target) < 9, until: () => p.stats.damage > 900 });
          m.prompt('fly', 'ascend', 'Fly Up', { when: () => m.time > 5 && p.target && p.target.pos.y - p.pos.y > 3, until: () => SL.Input.held('ascend') });
          m.prompt('flyDown', 'descend', 'Fly Down', { when: () => m.time > 5 && p.target && p.pos.y - p.target.pos.y > 3, until: () => SL.Input.held('descend') });
          m.prompt('dodge', 'dodge', 'Dodge', { when: () => p.target && p.target.state === 'attack' && p.distTo(p.target) < 4.5, until: () => SL.Input.pressed('dodge') });
          yield () => m.kills - k0 >= 1;
          m.spawn({ charId: 'frieza_soldier', pos: ahead(0, -2, -24), grounded: false, tag: 'wave' });
          yield () => m.kills - k0 >= 3;
          m.tickHooks.length = 0;
          m.progress('blockade', 3);
          m.say('bardock', "Is that the best Frieza's army has?!", 2.2);
          yield 1.2;
        },
      },
      {
        id: 'gunners',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, p = m.player;
          m.lock(false);
          m.music('battle', 1);
          b.rules.pressure = { melee: 1, ranged: 1, gap: 90, grace: 180 };
          p.hp = Math.max(p.hp, p.hpMax * 0.6);
          m.objective('blockade2', 'Break through the gunner line', { icon: 'fist', target: 4 });
          const k0 = m.kills;
          m.tickHooks.push(() => m.progress('blockade2', m.kills - k0));
          // the gunners announce themselves in front of Bardock before they open fire
          SL.Audio.play('scouter');
          m.say('soldier', 'Gunners, open fire! Keep him at range!', 2.2);
          // in front of the camera, so the player sees them arrive
          const fwd = b.camera.look.clone().sub(b.camera.pos).setY(0).normalize();
          const side = new V3(fwd.z, 0, -fwd.x);
          const at = (k, s2, dy) => p.pos.clone().addScaledVector(fwd, k).addScaledVector(side, s2).add(new V3(0, dy, 0));
          const g1 = m.spawn({ charId: 'frieza_gunner', pos: at(30, -12, 8), grounded: false, tag: 'wave' });
          m.spawn({ charId: 'frieza_soldier', pos: at(20, 6, 2), grounded: false, tag: 'wave' });
          b.emit('markers', { list: [{ obj: g1, icon: 'fist' }] });
          m.prompt('guard', 'guard', 'Guard', { when: () => b.projectiles.list.some((pr) => pr.team !== p.team && pr.pos.distanceTo(p.chest()) < 12), until: () => SL.Input.held('guard') });
          m.prompt('blast', 'blast', 'Ki Blast', { when: () => p.target && p.distTo(p.target) > 16, until: () => SL.Input.pressed('blast') });
          m.prompt('boost', 'boost', 'Dash', { when: () => p.target && p.distTo(p.target) > 26, until: () => SL.Input.held('boost') });
          m.prompt('breakFree', 'dodge', 'Break free', { when: () => p.state === 'hitstun' && p.stateFrame > 6 && b.enemiesOf(p).filter((e) => e.distTo(p) < 6).length >= 2, until: () => SL.Input.pressed('dodge') });
          yield () => m.kills - k0 >= 2;
          b.emit('markers', { list: [] });
          const g2 = m.spawn({ charId: 'frieza_gunner', pos: at(34, 14, 14), grounded: false, tag: 'wave' });
          m.spawn({ charId: 'frieza_soldier', pos: at(22, -8, 6), grounded: false, tag: 'wave' });
          b.emit('markers', { list: [{ obj: g2, icon: 'fist' }] });
          yield () => m.kills - k0 >= 4;
          b.emit('markers', { list: [] });
          m.tickHooks.length = 0;
          m.progress('blockade2', 4);
          m.say('bardock', "Keep them coming!", 2);
          yield 1.2;
        },
      },
      {
        id: 'pods',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, p = m.player;
          m.lock(false);
          m.music('battle', 2);
          p.hp = Math.min(p.hpMax, p.hp + p.hpMax * 0.3);
          b.rules.pressure = { melee: 2, ranged: 1, gap: 80, grace: 160 };
          const podPos = [new V3(-46, 14, -40), new V3(42, 26, -52), new V3(2, -16, -82)];
          const pods = podPos.map((pos, i) => b.stage.addProp({ kind: 'pod', pos, r: 1.9, hp: 1800, id: 'pod' + i }));
          b.emit('markers', { list: pods.map((pd) => ({ obj: pd, icon: 'pod' })) });
          m.objective('pods', 'Destroy the attack pods', { icon: 'pod', target: 3 });
          const fast = m.objective('podsFast', 'Destroy them within 2:00', { icon: 'clock', optional: true });
          const t0 = m.time;
          let destroyed = 0;
          b.on('propDestroyed', (e) => {
            if (pods.includes(e.prop)) {
              destroyed++;
              m.progress('pods', destroyed);
              b.emit('markers', { list: pods.filter((pd) => pd.alive).map((pd) => ({ obj: pd, icon: 'pod' })) });
            }
          });
          m.tickHooks.push(() => {
            if (!fast.done && !fast.failed && m.time - t0 > 120) m.failObjective('podsFast');
          });
          pods.forEach((pod, i) => {
            if (i !== 2) m.spawn({ charId: 'frieza_soldier', pos: pod.pos.clone().add(new V3(3, 2, 3)), grounded: false, tag: 'pod' });
            // each pod keeps sending soldiers while it stands, but never more than three enemies at once
            m.spawner({
              every: 14, delay: 8 + i * 3, maxAlive: 3, while: () => pod.alive,
              spawn: () => m.spawn({ charId: Math.random() < 0.35 ? 'frieza_gunner' : 'frieza_soldier', pos: pod.pos.clone().add(new V3(U.rand(-3, 3), 3, U.rand(-3, 3))), grounded: false, tag: 'pod' }),
            });
          });
          m.prompt('charge', 'charge', 'Charge Ki', { when: () => p.ki < 30 && !b.enemiesOf(p).some((e) => e.distTo(p) < 15), until: () => p.ki > 65 });
          m.prompt('javelin', 'special1', 'Riot Javelin', { when: () => p.ki >= 25 && p.state === 'free', until: () => SL.Input.pressed('special1') });
          m.prompt('heavy', 'heavy', 'Launcher', { when: () => p.state === 'attack' && p.sd.kind === 'light' && p.chain >= 2, until: () => SL.Input.pressed('heavy') });
          // pods can be locked onto: Next Target cycles soldiers and pods; Lock On / Unlock frees the aim
          m.prompt('lockPod', 'targetNext', 'Target a pod', { when: () => m.time - t0 > 6 && !p.lockProp && pods.some((pd) => pd.alive && pd.pos.distanceTo(p.pos) < 60), until: () => !!p.lockProp || SL.Input.pressed('target') });
          yield () => destroyed >= 3;
          if (m.time - t0 <= 120) m.complete('podsFast');
          m.tickHooks.length = 0;
          for (const s of m.spawners) s.stop();
          m.say('bardock', 'Hah! No more reinforcements!', 2.4);
          const tEnd = m.time;
          yield () => m.alive().length === 0 || m.time - tEnd > 12;
          for (const e of m.alive()) {
            b.vfx.afterimage(e.pos, e.height, 0xff6080);
            b.remove(e);
          }
          yield 1;
        },
      },
      {
        id: 'elite',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, p = m.player;
          p.hp = Math.min(p.hpMax, p.hp + p.hpMax * 0.25);
          m.lock(true);
          m.music('battle', 3);
          const e1 = m.spawn({ charId: 'frieza_elite', pos: new V3(-9, 12, -26), grounded: false, tag: 'elite' });
          const e2 = m.spawn({ charId: 'frieza_elite', pos: new V3(11, 16, -30), grounded: false, tag: 'elite', skin: 0x8aa06a });
          m.spawn({ charId: 'frieza_gunner', pos: new V3(-26, 24, -40), grounded: false, tag: 'escort' });
          for (const e of [e1, e2]) e.setState('scripted', { pose: 'taunt', expression: 'smirk', face: true });
          m.shot((t, out) => {
            const c = e1.chest().lerp(e2.chest(), 0.5);
            camAt(out, c.clone().add(new V3(U.lerp(-4, 2, t), 1.5, 9)), c, 46);
          }, 2.8, { cut: true, blendIn: 0 });
          m.say('frieza_elite', "The monkey's still kicking? Stand aside — he's ours.", 2.8);
          yield* m.cine(2.8);
          m.endShot();
          for (const e of [e1, e2]) e.setState('free');
          m.lock(false);
          m.objective('elite', 'Defeat the elite squad', { icon: 'skull', target: 2 });
          m.tickHooks.push(() => m.progress('elite', m.killsByTag.elite || 0));
          m.prompt('rush', 'special2', 'Saiyan Assault', { when: () => p.ki >= 30 && p.state === 'free' && p.target && p.distTo(p.target) < 25, until: () => SL.Input.pressed('special2') });
          m.prompt('ultimate', 'ultimate', 'Final Spirit Cannon', { when: () => p.ki >= 100 && p.state === 'free', until: () => SL.Input.pressed('ultimate') });
          m.prompt('throw', 'guard', 'Guard + Heavy: Throw', { when: () => p.target && p.target.state === 'guard' && p.distTo(p.target) < 4, until: () => p.state === 'throw' });
          yield () => (m.killsByTag.elite || 0) >= 2;
          m.tickHooks.length = 0;
          m.say('bardock', 'Frieza... come out and face me!', 2.6);
          yield 2.2;
        },
      },
      {
        id: 'frieza',
        checkpoint: true,
        run: function* (m) {
          const b = m.battle, p = m.player;
          m.lock(true);
          m.clearObjectives();
          b.emit('markers', { list: [] });
          for (const s of m.spawners) s.stop();
          m.fade('black', 0.5);
          yield 0.6;
          for (const e of m.alive()) b.remove(e);
          SL.Music.stop(0.4);
          p.setPosition(new V3(0, 12, 32));
          p.vel.set(0, 0, 0);
          p.yaw = Math.PI;
          p.setState('scripted', { pose: 'flyIdle' });
          const fz = b.spawn({ charId: 'frieza', team: 1, pos: new V3(8, 58, -118), grounded: false, dummy: 'idle', infiniteHp: true, cannotDie: true, tags: { priority: true, cinematic: true } });
          fz.invuln = 1e9;
          fz.object.add(hoverPod(1));
          fz.setState('scripted', { pose: 'fz_pod', expression: 'smirk' });
          p.target = fz;
          fz.target = p;
          const fzGoal = new V3(0, 44, -80);
          m.tickHooks.push(() => {
            fz.pos.lerp(fzGoal, 0.012);
            fz.vel.set(0, 0, 0);
            fz.faceTarget(4);
          });
          m.fade('clear', 0.8);
          m.music('finale', 0);
          m.shot((t, out) => {
            const c = fz.chest();
            camAt(out, c.clone().add(new V3(U.lerp(-2.6, -1.6, t), U.lerp(0.1, 0.35, t), U.lerp(4.2, 3.2, t))), c.clone().add(new V3(0, 0.1, 0)), 38);
          }, 3.6, { cut: true, blendIn: 0 });
          yield* m.cine(1.2);
          m.say('frieza', 'My, my... all this commotion over one filthy monkey.', 3);
          yield* m.cine(2.6);
          p.setState('scripted', { pose: 'b_rage', expression: 'shout' });
          p.aura.setStyle({ color: 0xff3a1e, core: 0xffd0a0, particles: 0xff6040 });
          m.shot((t, out) => {
            const c = p.chest();
            camAt(out, c.clone().add(new V3(U.lerp(2.4, 1.6, t), 0.2, U.lerp(-3.6, -2.8, t))), c, 42);
          }, 2.8, { cut: true, blendIn: 0 });
          m.say('bardock', "Frieza! Take this — everything I've got left!", 2.8);
          yield* m.cine(2.8);

          // the Supernova forms
          fz.setState('scripted', { pose: 'fz_finger', expression: 'smirk' });
          const nova = new SL.SpiritBomb(b, fz, { radius: 16, color: 0xff7a1a, speed: 0, homing: 0, damage: 0, explode: 30 });
          m.nova = nova;
          let novaR = 0.5;
          const novaPos = () => fz.pos.clone().add(new V3(0, 3 + novaR, 0));
          m.tickHooks.push(() => {
            if (m.novaMode === 'held') {
              novaR = Math.min(16, novaR + 0.12);
              nova.pos.copy(novaPos());
            }
            nova.radius = novaR;
            nova.time += 1 / 60;
            nova.mesh.material.uniforms.uTime.value = nova.time;
            nova._render();
          });
          m.novaMode = 'held';
          m.shot((t, out) => {
            const c = fz.chest();
            camAt(out, c.clone().add(new V3(U.lerp(-7, -5, t), U.lerp(-2.5, -1.5, t), U.lerp(9, 12, t))), c.clone().add(new V3(0, 2 + novaR * 0.45, 0)), 55);
          }, 3.4, { cut: true, blendIn: 0 });
          SL.Audio.play('transformBurst');
          m.say('frieza', 'Allow me to exterminate the pests... along with their precious planet.', 3.3);
          yield* m.cine(3.3);
          m.endShot();
          fz.setState('scripted', { pose: 'fz_laugh', expression: 'smirk' });

          // player control: only the final attack
          p.ki = p.kiMax;
          p.setState('free');
          m.limits({ light: false, heavy: false, blast: false, s1: false, s2: false, dodge: false, guard: false, charge: false, transform: false, boost: false, boostPressed: false, up: false, down: false, mx: false, my: false, target: false });
          b.inputLocked = false;
          b.aiLocked = true;
          m.music('finale', 2);
          m.prompt('finalCannon', 'ultimate', 'Final Spirit Cannon', { required: true, always: true, until: () => p.state === 'beamCharge' || p.state === 'beamFire' });
          const t0 = performance.now();
          yield () => p.state === 'beamCharge' || p.state === 'beamFire' || performance.now() - t0 > 9000;
          if (p.state !== 'beamCharge' && p.state !== 'beamFire') p._trySpecial('ultimate');
          yield () => p.state === 'beamFire';
          const beam = p.sd.beam;
          m.novaMode = 'thrown';
          const novaVel = p.chest().sub(nova.pos).normalize().multiplyScalar(26);
          m.tickHooks.push(() => {
            if (m.novaMode === 'thrown') nova.pos.addScaledVector(novaVel, 1 / 60);
          });
          yield () => {
            if (beam.done) return true;
            const segD = distToSegment(nova.pos, beam.origin, beam.head);
            return segD < novaR + beam.radius;
          };

          // the struggle: outcome is canon, endurance is scored
          b.beginCinematic([p]);
          beam.state = 'clash';
          p.setState('clash', { beam });
          m.novaMode = 'struggle';
          const startDist = nova.pos.distanceTo(p.chest());
          const presses = [];
          let st = 0;
          let resolveT = 0;
          const I = SL.Input;
          m.tickHooks.push(() => {
            if (m.novaMode !== 'struggle') return;
            st += 1 / 60;
            const mode = SL.Settings.data.gameplay.beamClashInput;
            let rate;
            if (mode === 'hold') rate = ['ultimate', 'special1', 'light', 'heavy', 'blast'].some((a) => I.held(a)) ? 9 : 0;
            else {
              if (['ultimate', 'special1', 'light', 'heavy', 'blast'].some((a) => I.pressed(a))) {
                presses.push(st);
                SL.Audio.play('mash');
              }
              while (presses.length && st - presses[0] > 1) presses.shift();
              rate = presses.length * (SL.Settings.data.gameplay.qteAssist ? 1.35 : 1);
            }
            const speed = startDist / (4 + Math.min(10, rate) * 0.42);
            const toP = p.chest().sub(nova.pos);
            const d = toP.length();
            nova.pos.addScaledVector(toP.normalize(), speed / 60);
            beam.headOverride = nova.pos.clone().addScaledVector(toP, -novaR * 0.9);
            resolveT = st;
            b.emit('struggle', { active: true, progress: 1 - (d - novaR) / Math.max(1, startDist), rate, label: 'HOLD ON' });
            b.camera.addTrauma(0.03);
            if (b.frame % 3 === 0) b.vfx.explosion(beam.headOverride, 2.5, 0xffb060, { smoke: false, life: 0.25 });
            if (d < novaR * 0.8 + p.radius) m.novaMode = 'hit';
          });
          m.shot((t, out, el) => {
            const c = p.chest();
            const mid = c.clone().lerp(nova.pos, 0.35);
            camAt(out, mid.clone().add(new V3(26 + Math.sin(el * 0.3) * 4, 8, 6)), mid, 58);
          }, 999, { hold: true, blendIn: 0.4 });
          yield 2.5;
          m.say('bardock', 'This is for all of us... for my son...!', 3);
          yield () => m.novaMode === 'hit';
          b.emit('struggle', { active: false });
          m.qteScore = U.clamp01((resolveT - 4) / 3.5);
          m.limits(null);
          m.tickHooks.length = 0;
          b.camera.endShot();

          // the Supernova wins: the ending cinematic takes over (next phase, prologue_ending.js)
          b.inputLocked = true;
          m.ending = { fz, nova, beam };
        },
      },
      {
        // cinematic only and not a checkpoint: a retry replays the struggle that leads into it
        id: 'ending',
        run: function* (m) {
          yield* SL.data.cinematics.bardockEnding(m);
        },
      },
    ],
  };

  function distToSegment(p, a, b) {
    const ab = new V3().subVectors(b, a);
    const t = U.clamp01(new V3().subVectors(p, a).dot(ab) / Math.max(1e-6, ab.lengthSq()));
    return a.clone().addScaledVector(ab, t).distanceTo(p);
  }

  SL.data.missions[mission.id] = mission;
})();
