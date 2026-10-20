// Behaviour tests that run the real engine headless (see tests/headless.js):
// fighters, forms, strain, story restrictions, creatures and whole missions
// played by bots that only send player inputs.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const H = require('./headless');

module.exports = function simTests({ test, eq, ok }) {
  const root = path.resolve(__dirname, '..');

  console.log('\nCombat Lab scenarios (headless)');
  {
    const g = H.create({ quiet: true, seed: 11 });
    vm.runInContext(fs.readFileSync(path.join(root, 'tools/lab.js'), 'utf8'), g.ctx, { filename: 'tools/lab.js' });
    const { SL } = g;
    for (const sc of g.ctx.SLLab.SCENARIOS) {
      test(sc.name, () => {
        const b = g.battle({ p1: sc.p1, p2: sc.p2, dummy: sc.dummy || 'idle', distance: sc.distance || 3, p1InfiniteHp: true });
        const p = b.player, d = b.fighters[1];
        p.ki = 100;
        d.ki = 100;
        if (sc.setupP1) sc.setupP1(p);
        if (sc.setupP2) sc.setupP2(d);
        const r = { custom: {}, moves: [], knocks: [], events: {}, p1States: [], p2States: [], damageTypes: [], damageCount: 0, maxHits: 0, formsSeen: [], blastsSpawned: 0 };
        const listen = ['chase', 'throw', 'vanish', 'perfectGuard', 'guardBreak', 'burst', 'teleported', 'bombLaunch', 'transformStart', 'transformBurst', 'callout', 'formLevel', 'clashStart', 'overload', 'latch', 'latchBlocked', 'latchEscape', 'selfDestruct', 'burrowErupt', 'scatterBurst', 'blinded', 'lifeCost', 'demonHand', 'mineArmed', 'mineTriggered', 'counterStrike'];
        for (const n of listen) b.on(n, () => (r.events[n] = (r.events[n] || 0) + 1));
        b.on('damage', (e) => {
          if (e.attacker === p) {
            r.damageTypes.push(e.type);
            r.damageCount++;
          }
        });
        const start = b.frame;
        const mk = (script) => ({
          update: () => {
            const it = SL.emptyIntent();
            const n = b.frame - start;
            for (const s of script || []) if (s.f === n) Object.assign(it, s.i);
            return it;
          },
        });
        p.controller = mk(sc.script);
        if (sc.p2Script) d.controller = mk(sc.p2Script);
        let done = false;
        const origTick = b.tick;
        b.tick = function () {
          origTick.call(b);
          const n = b.frame - start;
          if (p.sd.move && !r.moves.includes(p.sd.move.id)) r.moves.push(p.sd.move.id);
          if (d.sd.knock && !r.knocks.includes(d.sd.knock)) r.knocks.push(d.sd.knock);
          if (!r.p1States.includes(p.state)) r.p1States.push(p.state);
          if (!r.p2States.includes(d.state)) r.p2States.push(d.state);
          if (!r.formsSeen.includes(p.form.id)) r.formsSeen.push(p.form.id);
          r.maxHits = Math.max(r.maxHits, p.combo.hits);
          if (sc.probe) sc.probe(p, d, r, b);
          for (const x of b.projectiles.list) if (x.owner === p && !x._counted) {
            x._counted = true;
            r.blastsSpawned++;
          }
          if (n === sc.ticks) done = true;
        };
        g.until(b, () => done, sc.ticks * 8);
        ok(done, 'scenario did not reach its tick count');
        r.finalDistance = p.distTo(d);
        r.finalForm = p.form.id;
        r.finalKi = p.ki;
        const pass = !!sc.check(r);
        b.dispose();
        ok(pass, JSON.stringify({ custom: r.custom, moves: r.moves, events: r.events, p1: r.p1States, p2: r.p2States, dmg: r.damageTypes.slice(0, 6), forms: r.formsSeen }));
      });
    }
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\nFighter systems (headless)');
  {
    const g = H.create({ quiet: true, seed: 11 });
    const { SL } = g;

    test('strainScale multiplies how fast Kaioken strain builds (story gravity)', () => {
      const rates = [1, 2].map((scale) => {
        const b = g.battle({ p1: 'goku', distance: 30 });
        const p = b.player;
        p.infiniteKi = true;
        p.strainScale = scale;
        p.controller = g.script(b, { 2: { transform: true } });
        g.until(b, () => p.form.id === 'kaioken' && p.state === 'free', 200);
        const s0 = p.strain;
        g.step(b, 120);
        const gained = p.strain - s0;
        b.dispose();
        return gained;
      });
      ok(rates[0] > 5, 'strain builds: ' + rates[0]);
      ok(Math.abs(rates[1] / rates[0] - 2) < 0.15, 'double scale doubles the rate: ' + rates.join(' vs '));
    });

    test('an overload drops Kaioken, hurts, and locks the form out while strain is high', () => {
      const b = g.battle({ p1: 'goku', distance: 30 });
      const p = b.player;
      p.infiniteKi = true;
      p.controller = g.script(b, { 2: { transform: true } });
      g.until(b, () => p.form.id === 'kaioken' && p.state === 'free', 200);
      const hp0 = p.hp;
      let overloads = 0;
      b.on('overload', () => overloads++);
      p.strain = 99.5;
      g.step(b, 10);
      eq(overloads, 1, 'overload event');
      eq(p.form.id, 'base');
      ok(p.hp < hp0, 'overload costs health');
      p.controller = g.script(b, { 5: { transform: true } });
      g.step(b, 30);
      eq(p.form.id, 'base', 're-entry blocked while sore');
      b.dispose();
    });

    test('on foot, sprinting drains stamina and a winded fighter must jog until it recovers', () => {
      const b = g.battle({ p1: 'kid_gohan', distance: 60 });
      const p = b.player;
      p.noFlight = true;
      p.target = null;
      let winded = 0;
      b.on('winded', () => winded++);
      p.controller = g.script(b, () => ({ my: 1, boost: true, camYaw: 0 }));
      const s0 = p.stamina;
      g.step(b, 60);
      ok(p.stamina < s0 - 10, 'stamina drains while sprinting');
      g.until(b, () => winded > 0, 60 * 15);
      ok(p.winded, 'winded once empty');
      g.step(b, 30);
      const jog = Math.hypot(p.vel.x, p.vel.z);
      ok(jog < 12, 'winded speed is a jog: ' + jog.toFixed(1));
      g.until(b, () => !p.winded, 60 * 10);
      ok(!p.winded, 'recovers');
      b.dispose();
    });

    test('flying fighters are not charged stamina for boosting', () => {
      const b = g.battle({ p1: 'goku', distance: 60 });
      const p = b.player;
      p.target = null;
      p.controller = g.script(b, () => ({ my: 1, boost: true, camYaw: 0 }));
      g.step(b, 120);
      ok(!p.winded && p.stamina > p.staminaMax * 0.9, 'stamina ' + p.stamina);
      b.dispose();
    });

    test('Gregory reads each strike once: a dodge chance of 0 means every swing can land', () => {
      const b = g.battle({ p1: 'goku', stage: 'kingkai', distance: 30 });
      const p = b.player;
      const greg = new SL.Creature(b, SL.data.creatures.gregory, { pos: p.pos.clone().add(new g.V3(0, 1.1, 1.2)), target: p });
      greg.sd.dodgeChance = 0;
      // hold him still in front of Goku
      greg.sd.home = greg.pos.clone();
      greg.sd.goal = greg.pos.clone();
      greg.sd.next = 1e9;
      let swings = 0;
      b.on('meleeSwing', (e) => {
        if (e.center.distanceTo(greg.pos) < e.r + 0.9) swings++;
      });
      p.target = null;
      p.yaw = 0;
      p.controller = g.script(b, { 2: { light: true } });
      g.step(b, 30);
      ok(swings > 0, 'a strike reached Gregory');
      eq(greg.sd.dodges || 0, 0);
      b.dispose();
    });

    test('mission teach() removes the story lock and shows the skill', () => {
      const b = g.mission('saiyan_kingkai', { startPhase: 3 });
      let learned = null;
      b.on('skillLearned', (e) => (learned = e.key));
      g.until(b, () => learned, 60 * 20, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      const p = b.player;
      eq(learned, 'transform');
      ok(!p.lockedSlots.transform, 'transform unlocked');
      eq(p.formCaps.kaioken, 0, 'story caps Kaioken at x2');
      ok(p.lockedForms.ssj, 'Super Saiyan stays locked');
      b.dispose();
    });
  }

  console.log('\nHuman playtest fixes: flight controls, lock-on / free aim, group pressure (headless)');
  {
    const g = H.create({ quiet: true, seed: 41 });
    const { SL, V3 } = g;
    const hold = (b, intent, frames, each) => {
      const p = b.player;
      p.controller = { update: () => Object.assign(SL.emptyIntent(), { camYaw: b.cameraYaw() }, typeof intent === 'function' ? intent() : intent) };
      g.step(b, frames, each);
    };

    test('flight: ascend, descend, forward, back, strafe, boost, brake, dodge and a vertical dash all move the flier as asked (orbit stage, no ground)', () => {
      const b = g.mission('prologue_final_stand', { startPhase: 1 });
      g.until(b, () => !b.inputLocked, 60 * 30, () => {
        b.skipRequested = true;
      });
      const p = b.player;
      p.infiniteHp = true;
      p.infiniteStamina = true;
      b.aiLocked = true;
      for (const e of b.enemiesOf(p)) e.setHidden(true), (e.untargetable = true);
      SL.Targeting.unlock(b, p, true);
      const y = () => p.pos.y;
      let y0 = y();
      hold(b, { up: true }, 40);
      ok(y() - y0 > 3, 'ascend: ' + (y() - y0).toFixed(2));
      y0 = y();
      hold(b, { down: true }, 40);
      ok(y0 - y() > 3, 'descend: ' + (y0 - y()).toFixed(2));
      y0 = y();
      hold(b, { down: true, boost: true }, 30);
      ok(y0 - y() > 4, 'boosted descend is faster: ' + (y0 - y()).toFixed(2));
      // a dash with Fly Down held and no direction goes straight down
      hold(b, {}, 20);
      y0 = y();
      hold(b, (() => {
        let n = 0;
        return () => (n++ === 0 ? { down: true, boost: true, boostPressed: true } : { down: true });
      })(), 14, () => {});
      ok(y0 - y() > 3, 'vertical dash down: ' + (y0 - y()).toFixed(2));
      const yaw = b.cameraYaw();
      const fwd = new V3(Math.sin(yaw), 0, Math.cos(yaw));
      const right = new V3(-fwd.z, 0, fwd.x);
      const moved = (intent) => {
        hold(b, {}, 20);
        const p0 = p.pos.clone();
        hold(b, intent, 30);
        return p.pos.clone().sub(p0);
      };
      ok(moved({ my: 1 }).dot(fwd) > 3, 'forward');
      ok(moved({ my: -1 }).dot(fwd) < -3, 'back');
      ok(Math.abs(moved({ mx: 1 }).dot(right)) > 3, 'strafe');
      const slow = moved({ my: 1 }).length(), fast = moved({ my: 1, boost: true }).length();
      ok(fast > slow * 1.6, 'boost is faster: ' + fast.toFixed(1) + ' vs ' + slow.toFixed(1));
      // brake: release everything and flight drifts to a stop; guard stops it hard
      hold(b, { my: 1, boost: true }, 30);
      hold(b, { guard: true }, 20);
      ok(p.vel.length() < 4, 'guard brakes: ' + p.vel.length().toFixed(2));
      hold(b, {}, 20);
      y0 = y();
      let dodged = false;
      hold(b, (() => {
        let n = 0;
        return () => (n++ === 0 ? { dodge: true, down: true } : {});
      })(), 12, () => {
        if (p.state === 'dodge') dodged = true;
      });
      ok(dodged && y0 - y() > 1, 'dodge downward: ' + (y0 - y()).toFixed(2));
      b.dispose();
    });

    test('knocked back in the air, holding Fly Down recovers early and keeps descending, exactly like Fly Up (human playtest: descend felt unreliable)', () => {
      const out = {};
      for (const key of ['up', 'down', 'none']) {
        const b = g.mission('prologue_final_stand', { startPhase: 1 });
        g.until(b, () => !b.inputLocked, 60 * 30, () => {
          b.skipRequested = true;
        });
        const p = b.player;
        p.infiniteHp = true;
        b.aiLocked = true;
        const foe = b.enemiesOf(p)[0];
        p.takeHit(foe, { type: 'melee', damage: 100, knock: 'heavy', knockSpeed: 22, hitstun: 30, impact: 2, dir: new V3(0, 0.3, 1).normalize() });
        const y0 = p.pos.y;
        let freeAt = -1;
        const intent = key === 'none' ? {} : { [key]: true };
        hold(b, intent, 70, (i) => {
          if (freeAt < 0 && p.state === 'free') freeAt = i;
        });
        out[key] = { freeAt, dy: p.pos.y - y0 };
        b.dispose();
      }
      ok(out.down.freeAt >= 0 && out.down.freeAt < out.none.freeAt, 'Fly Down recovers early: ' + JSON.stringify(out));
      ok(Math.abs(out.down.freeAt - out.up.freeAt) <= 2, 'as early as Fly Up');
      ok(out.down.dy < out.none.dy - 2, 'and ends lower than doing nothing');
    });

    test('descend is bound on keyboard (C) and on the gamepad on both the left stick click and the D-pad (so steering and descending work together)', () => {
      const d = SL.Settings.DEFAULTS || null;
      const kb = SL.Settings.data.controls.keyboard, pad = SL.Settings.data.controls.gamepad;
      ok(kb.descend.includes('KeyC'), 'keyboard ' + kb.descend);
      ok(pad.descend.includes('13') && pad.descend.includes('10'), 'gamepad ' + pad.descend);
      ok(kb.target.includes('Tab') && kb.targetNext.includes('KeyX') && kb.targetNext.includes('WheelDown') && kb.targetPrev.includes('WheelUp'), 'targeting keys');
    });

    test('lock on a soldier, unlock, free-aim ki blasts destroy a pod, lock on again', () => {
      const b = g.mission('prologue_final_stand', { startPhase: 3 });
      g.until(b, () => !b.inputLocked && b.stage.props.some((pr) => pr.kind === 'pod'), 60 * 30, () => {
        b.skipRequested = true;
      });
      const p = b.player;
      p.infiniteHp = true;
      p.infiniteKi = true;
      b.aiLocked = true;
      const T = SL.Targeting;
      g.step(b, 2);
      ok(p.target && p.lockMode !== 'free', 'starts locked on an enemy: ' + (p.target && p.target.def.id));
      // unlock
      hold(b, (() => {
        let n = 0;
        return () => (n++ === 0 ? { target: true } : {});
      })(), 10);
      eq(p.lockMode, 'free');
      eq(p.target, null, 'no fighter target while free');
      g.step(b, 30);
      eq(p.target, null, 'the game does not quietly lock on again');
      // aim the camera at the nearest pod and fire free-aimed blasts
      const pod = b.stage.props.filter((pr) => pr.kind === 'pod' && pr.alive).sort((x, y) => x.pos.distanceTo(p.pos) - y.pos.distanceTo(p.pos))[0];
      p.setPosition(pod.pos.clone().add(new V3(0, -1.2, 14)));
      p.vel.set(0, 0, 0);
      // the free camera looks along its own direction: put it behind the player, facing the pod
      const look = pod.pos.clone();
      b.camera.pos.copy(p.chest().add(new V3(0.7, 0.6, 6)));
      b.camera.look.copy(p.chest());
      const toPod = look.clone().sub(b.camera.pos).normalize();
      b.camera.look.copy(b.camera.pos.clone().addScaledVector(toPod, 6));
      const aim = T.freeAimPoint(b, p, p.chest());
      ok(aim.distanceTo(pod.pos) < 1, 'crosshair assist lands on the pod');
      let podHits = 0;
      b.on('propDamaged', (e) => e.prop === pod && podHits++);
      hold(b, () => {
        b.camera.look.copy(b.camera.pos.clone().addScaledVector(pod.pos.clone().sub(b.camera.pos).normalize(), 6));
        return b.frame % 10 === 0 ? { blast: true } : {};
      }, 60 * 8, () => {});
      ok(podHits > 0, 'blasts hit the pod: ' + podHits);
      // lock onto the pod directly with Next Target, then onto a soldier again
      if (pod.alive) {
        T.next(b, p, 1);
        ok(p.lockProp || p.target, 'Next Target locks something');
      }
      for (let i = 0; i < 6 && !p.lockProp; i++) T.next(b, p, 1);
      const pods = b.stage.props.filter((pr) => pr.kind === 'pod' && pr.alive);
      if (pods.length) ok(!!p.lockProp, 'a pod can be a lock target');
      let soldier = false;
      for (let i = 0; i < 8 && !soldier; i++) {
        T.next(b, p, 1);
        soldier = !!p.target;
      }
      ok(soldier, 'switching back to a soldier');
      eq(p.lockMode, 'locked');
      b.dispose();
    });

    test('unlocking keeps the view: a far pod that was locked stays under the crosshair and free-aimed blasts still hit it', () => {
      const b = g.mission('prologue_final_stand', { startPhase: 3 });
      g.until(b, () => !b.inputLocked && b.stage.props.some((pr) => pr.kind === 'pod'), 60 * 30, () => {
        b.skipRequested = true;
      });
      const p = b.player;
      p.infiniteHp = true;
      p.infiniteKi = true;
      b.aiLocked = true;
      for (const e of b.enemiesOf(p)) e.setHidden(true), (e.untargetable = true);
      const T = SL.Targeting;
      const pod = b.stage.props.filter((pr) => pr.kind === 'pod' && pr.alive).sort((x, y) => x.pos.distanceTo(p.pos) - y.pos.distanceTo(p.pos))[0];
      ok(pod.pos.distanceTo(p.pos) > 60, 'the pod is far away: ' + pod.pos.distanceTo(p.pos).toFixed(0) + ' m');
      T.lock(b, p, { kind: 'pod', prop: pod, pos: pod.pos.clone() }, true);
      g.step(b, 90);
      const deg = () => (T.view(b, pod.pos).angle * 180) / Math.PI;
      const lockedDeg = deg();
      hold(b, (() => {
        let n = 0;
        return () => (n++ === 0 ? { target: true } : {});
      })(), 60);
      eq(p.lockMode, 'free');
      ok(deg() < 2.5, 'after unlocking, the pod is still at the centre of the view: ' + lockedDeg.toFixed(1) + ' deg locked, ' + deg().toFixed(1) + ' deg a second after unlocking');
      let podHits = 0;
      b.on('propDamaged', (e) => e.prop === pod && podHits++);
      // no camera input at all: the shots go where the (unchanged) view points
      hold(b, () => (b.frame % 20 === 0 ? { blast: true } : {}), 60 * 5, () => {});
      ok(podHits >= 4, 'free-aimed blasts keep hitting the pod: ' + podHits + ' hits, view ' + deg().toFixed(1) + ' deg off');
      b.dispose();
    });

    test('a locked pod is tracked by melee, blasts and the camera; destroying it moves the lock on (or frees the aim)', () => {
      const b = g.mission('prologue_final_stand', { startPhase: 3 });
      g.until(b, () => !b.inputLocked && b.stage.props.some((pr) => pr.kind === 'pod'), 60 * 30, () => {
        b.skipRequested = true;
      });
      const p = b.player;
      p.infiniteHp = true;
      p.infiniteKi = true;
      b.aiLocked = true;
      const pod = b.stage.props.find((pr) => pr.kind === 'pod' && pr.alive);
      SL.Targeting.lock(b, p, { kind: 'pod', prop: pod, pos: pod.pos.clone() }, true);
      p.setPosition(pod.pos.clone().add(new V3(3, -1, 3)));
      hold(b, (n => () => ({ light: b.frame % 12 === 0 }))(), 60 * 10, () => {});
      ok(!pod.alive, 'pod destroyed by melee aimed through the lock');
      g.step(b, 2);
      ok(!p.lockProp, 'dead pod released');
      ok(p.target || p.lockProp || p.lockMode === 'free', 'moved on or freed the aim');
      b.dispose();
    });

    test('a locked enemy falls: Auto Switch Target on locks the next one, off leaves the aim free until the player locks on', () => {
      const gp = SL.Settings.data.gameplay;
      const was = gp.autoTargetSwitch;
      const out = {};
      try {
        for (const auto of [true, false]) {
          gp.autoTargetSwitch = auto;
          const b = g.mission('prologue_final_stand', { startPhase: 1 });
          g.until(b, () => !b.inputLocked, 60 * 30, () => {
            b.skipRequested = true;
          });
          const p = b.player;
          p.infiniteHp = true;
          b.aiLocked = true;
          g.step(b, 5);
          ok(b.enemiesOf(p).filter((e) => e.alive).length >= 2, 'two soldiers to choose from');
          const first = p.target;
          ok(first && p.lockMode === 'locked', 'starts locked');
          first._ko(p, null);
          g.step(b, 60);
          out[auto] = { mode: p.lockMode, target: !!p.target, other: p.target && p.target !== first };
          b.dispose();
        }
      } finally {
        gp.autoTargetSwitch = was;
      }
      ok(out.true.mode === 'locked' && out.true.other, 'auto switch on: locked onto the other soldier ' + JSON.stringify(out));
      ok(out.false.mode === 'free' && !out.false.target, 'auto switch off: free aim, no quiet re-lock ' + JSON.stringify(out));
    });

    test('group pressure: few enemies in melee at once in the prologue opening, one volley at a time, and off-screen enemies hold back', () => {
      const b = g.mission('prologue_final_stand', { startPhase: 2 });
      g.until(b, () => !b.inputLocked, 60 * 30, () => {
        b.skipRequested = true;
      });
      const p = b.player;
      p.infiniteHp = true;
      let maxMelee = 0, maxVolleys = 0, offscreenOpeners = 0;
      const opened = new Set();
      g.step(b, 60 * 30, () => {
        const foes = b.enemiesOf(p).filter((e) => e.alive && e.target === p);
        const meleeNow = foes.filter((e) => e.state === 'attack').length;
        maxMelee = Math.max(maxMelee, meleeNow);
        const volleys = foes.filter((e) => e.controller && e.controller.plan && e.controller.plan.type === 'blast' && e.controller.plan.cleared && !e.controller.plan.done).length;
        maxVolleys = Math.max(maxVolleys, volleys);
        for (const e of foes) {
          if (e.state === 'attack' && e.stateFrame === 1 && !opened.has(e.sd)) {
            opened.add(e.sd);
            if (!b.inPlayerView(e) && p.target !== e && (e._offscreenWait || 0) <= b.pressureRules().grace) offscreenOpeners++;
          }
        }
        // the player keeps attacking their target so the enemies have something to answer
        p.controller = { update: () => Object.assign(SL.emptyIntent(), { camYaw: b.cameraYaw(), light: b.frame % 20 === 0, my: p.target && p.distTo(p.target) > 2.4 ? 1 : 0 }) };
      });
      ok(maxMelee <= 2, 'melee attackers at once: ' + maxMelee);
      ok(maxVolleys <= 1, 'volleys at once: ' + maxVolleys);
      eq(offscreenOpeners, 0, 'no enemy opened melee from outside the view before its grace time');
      b.dispose();
    });

    test('breakaway: a player piled on by several enemies bursts free instead of being stun-locked', () => {
      const b = g.battle({ p1: 'bardock', p2: 'frieza_soldier', distance: 2 });
      const p = b.player;
      const a1 = b.fighters[1];
      const a2 = b.spawn({ charId: 'frieza_soldier', team: 1, pos: p.pos.clone().add(new V3(0, 0, 2)) });
      const a3 = b.spawn({ charId: 'frieza_soldier', team: 1, pos: p.pos.clone().add(new V3(0, 0, -2)) });
      p.infiniteHp = true;
      let breakaways = 0;
      b.on('breakaway', () => breakaways++);
      const jab = { type: 'melee', damage: 100, knock: 'flinch', impact: 1, hitstun: 20 };
      const order = [a1, a2, a3];
      for (let i = 0; i < 12 && !breakaways; i++) {
        p.invuln = 0;
        p.takeHit(order[i % 3], jab);
        g.step(b, 6);
      }
      eq(breakaways, 1, 'broke away');
      ok(p.invuln > 0 || p.state === 'recover' || p.state === 'free', 'protected moment after it');
      // a single attacker never triggers it (a 1v1 combo is the player's own problem)
      const b2 = g.battle({ p1: 'bardock', p2: 'frieza_soldier', distance: 2 });
      let solo = 0;
      b2.on('breakaway', () => solo++);
      for (let i = 0; i < 12; i++) {
        b2.player.invuln = 0;
        b2.player.takeHit(b2.fighters[1], jab);
        g.step(b2, 6);
      }
      eq(solo, 0, 'no breakaway in a one-on-one');
      b.dispose();
      b2.dispose();
    });

    test('prologue opening is readable for a novice (probe): few simultaneous attackers, short hit chains, almost no off-screen hits', () => {
      const { execFileSync } = require('child_process');
      const out = execFileSync(process.execPath, [path.join(__dirname, '..', 'tools', 'encounter_probe.js'), 'prologue_final_stand', '1', '60', '3', 'novice'], { encoding: 'utf8' });
      const attackers = /within 2 s: ([\d, ]+)/.exec(out)[1].split(',').map(Number);
      const chains = /gap: ([\d, ]+)/.exec(out)[1].split(',').map(Number);
      const off = +/camera view: (\d+)%/.exec(out)[1];
      ok(Math.max(...attackers) <= 3, 'attackers within 2 s: ' + attackers);
      ok(Math.max(...chains) <= 25, 'hit chains: ' + chains);
      ok(off <= 10, 'off-screen hits ' + off + '%');
      ok(!/KO/.test(out), 'the novice survives the first minute: ' + out.split('outcomes: ')[1]);
      ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
    });
  }

  console.log('\nRaditz: Tail Grapple (headless)');
  {
    const g = H.create({ quiet: true, seed: 31 });
    const { SL, V3 } = g;
    const throwAt = (n) => (i) => (i === n ? { guard: true, heavy: true } : {});
    // Raditz (player, scripted) against a target at a distance
    const setup = (dist, dummy = 'idle', o = {}) => {
      const b = g.battle({ p1: 'raditz', p2: o.p2 || 'goku', distance: dist, dummy });
      const r = b.player, v = b.fighters[1];
      r.infiniteKi = true;
      v.infiniteHp = false;
      v.cannotDie = true;
      const ev = {};
      for (const k of ['tailLash', 'tailGrab', 'tailLoose', 'tailEscape', 'tailCounter', 'tailFollowUp']) b.on(k, (e) => (ev[k] = (ev[k] || []).concat([e])));
      return { b, r, v, ev };
    };
    const grab = (ctx) => {
      ctx.r.controller = g.script(ctx.b, throwAt(2));
      g.until(ctx.b, () => ctx.r.state === 'tailGrapple' && ctx.r.sd.phase !== 'lash', 40);
    };

    test('reaches 3 m — beyond a hand grab — through a guard, lifts the victim and swaps the belt tail for a lashing one', () => {
      const normalReach = 1.9 * 1.04 + 0.42;
      const c = setup(3.0, 'guard');
      const belt = c.r.model.beltTail;
      ok(belt && belt.visible, 'tail wrapped around the waist at rest');
      ok(3.0 > normalReach + 0.5, 'test distance is outside a normal throw');
      grab(c);
      eq(c.r.sd.phase, 'hold', 'caught');
      eq(c.v.state, 'held');
      ok(!belt.visible, 'belt tail hidden while the tail is out');
      const rope = c.r.sd.rope;
      ok(rope && c.b.scene.children.includes(rope.group), 'tail rope in the scene');
      const y0 = c.v.pos.y;
      g.step(c.b, 12);
      ok(c.v.pos.y > y0 + 0.4, 'victim lifted: ' + (c.v.pos.y - y0).toFixed(2));
      ok(rope.coil.visible, 'coil wrapped around the victim');
      eq((c.ev.tailGrab || []).length, 1);
      // Raditz is hit by someone else: the grip breaks
      c.r.takeHit(c.v, { type: 'melee', damage: 200, knock: 'flinch', impact: 2, hitstun: 20 });
      g.step(c.b, 2);
      ok(c.v.state !== 'held', 'victim dropped when Raditz is struck: ' + c.v.state);
      ok(belt.visible, 'tail back around the waist');
      ok(!c.b.scene.children.includes(rope.group), 'rope removed');
      c.b.dispose();
    });

    test('a whiff at 6 m leaves Raditz open: the lash retracts and he recovers slowly', () => {
      const c = setup(6);
      c.r.controller = g.script(c.b, throwAt(2));
      let recovering = 0;
      g.step(c.b, 60, () => {
        if (c.r.state === 'tailGrapple' && c.r.sd.phase === 'retract') recovering++;
      });
      ok(!c.ev.tailGrab, 'no grab');
      ok(recovering >= 25, 'punishable recovery frames: ' + recovering);
      eq(c.r.state, 'free');
      c.b.dispose();
    });

    test('follow-ups: Light slams into the ground, Heavy hurls far, Special 1 blasts point blank', () => {
      // slam
      let c = setup(2.6);
      grab(c);
      let hp = c.v.hp;
      c.r.controller = g.script(c.b, { 20: { light: true } });
      g.step(c.b, 80);
      eq(c.ev.tailFollowUp && c.ev.tailFollowUp[0].kind, 'slam');
      ok(hp - c.v.hp > 900, 'slam damage ' + (hp - c.v.hp));
      c.b.dispose();
      // hurl
      c = setup(2.6);
      grab(c);
      const start = c.r.pos.clone();
      c.r.controller = g.script(c.b, { 20: { heavy: true } });
      g.step(c.b, 70);
      eq(c.ev.tailFollowUp && c.ev.tailFollowUp[0].kind, 'hurl');
      ok(c.v.pos.distanceTo(start) > 7, 'hurled away: ' + c.v.pos.distanceTo(start).toFixed(1));
      c.b.dispose();
      // point-blank Double Sunday
      c = setup(2.6);
      grab(c);
      let beamHit = false;
      c.b.on('damage', (e) => e.attacker === c.r && e.target === c.v && e.type === 'beam' && (beamHit = true));
      c.r.controller = g.script(c.b, (i) => (i === 20 ? { s1: true, s1Held: true } : {}));
      g.step(c.b, 80);
      eq(c.ev.tailFollowUp && c.ev.tailFollowUp[0].kind, 'blast');
      ok(beamHit, 'Double Sunday hit the dangling victim');
      c.b.dispose();
    });

    test('the victim mashes free; a victim who does nothing gets slammed when Raditz waits too long', () => {
      // the player is the victim here: Goku (player) vs scripted Raditz
      const run = (mash) => {
        const b = g.battle({ p1: 'goku', p2: 'raditz', distance: 2.6 });
        const p = b.player, r = b.fighters[1];
        p.infiniteHp = false;
        p.cannotDie = true;
        const ev = {};
        for (const k of ['tailGrab', 'tailEscape', 'tailFollowUp']) b.on(k, () => (ev[k] = (ev[k] || 0) + 1));
        r.controller = g.script(b, throwAt(2));
        p.controller = g.script(b, (i) => (mash && i > 20 && i % 3 === 0 ? { light: true } : {}));
        g.step(b, 200);
        b.dispose();
        return ev;
      };
      const mashed = run(true), idle = run(false);
      ok(mashed.tailGrab && mashed.tailEscape, 'mashing escapes: ' + JSON.stringify(mashed));
      ok(idle.tailGrab && !idle.tailEscape && idle.tailFollowUp, 'idle victim slammed: ' + JSON.stringify(idle));
    });

    test('grabbing the tail back in a loose moment leaves Raditz writhing and drained; outside the window it does nothing', () => {
      const run = (timed) => {
        const b = g.battle({ p1: 'goku', p2: 'raditz', distance: 2.6 });
        const p = b.player, r = b.fighters[1];
        p.cannotDie = true;
        r.infiniteHp = false;
        r.ki = 100;
        const ev = {};
        for (const k of ['tailGrab', 'tailLoose', 'tailCounter']) b.on(k, () => (ev[k] = (ev[k] || 0) + 1));
        let kiDrop = 0, kiPrev = 0;
        b.on('tailLoose', () => (kiPrev = r.ki));
        b.on('tailCounter', () => (kiDrop = kiPrev - r.ki));
        r.controller = g.script(b, throwAt(2));
        let pressed = 0;
        p.controller = {
          update: () => {
            const it = SL.emptyIntent();
            const hold = r.state === 'tailGrapple' && r.sd.phase === 'hold';
            if (!hold || pressed) return it;
            const loose = r.sd.loose > 0;
            if (timed ? loose : !loose && r.stateFrame - r.sd.holdStart === 8) {
              it.heavy = true;
              pressed++;
            }
            return it;
          },
        };
        let painFrames = 0;
        g.step(b, 150, () => {
          if (r.state === 'tailPain') painFrames++;
        });
        const out = { ev, painFrames, kiDrop };
        b.dispose();
        return out;
      };
      const timed = run(true), early = run(false);
      eq(timed.ev.tailCounter, 1, 'countered: ' + JSON.stringify(timed.ev));
      ok(timed.painFrames > 60, 'Raditz writhes: ' + timed.painFrames);
      ok(timed.kiDrop >= 20, 'ki drained by the counter: ' + timed.kiDrop.toFixed(1));
      ok(!early.ev.tailCounter, 'a press while the grip is tight does not counter');
    });

    test('CPU Raditz lashes at a guarding opponent and follows up on his own', () => {
      const b = g.battle({ p1: 'raditz', p2: 'goku', distance: 6, dummy: 'guard' });
      const r = b.player, v = b.fighters[1];
      v.infiniteHp = true;
      r.controller = new SL.AIController(b, { difficulty: 'hard' });
      r.ki = 100;
      let grabs = 0, follow = 0;
      b.on('tailGrab', () => grabs++);
      b.on('tailFollowUp', () => follow++);
      g.step(b, 60 * 20);
      ok(grabs >= 1, 'grabbed ' + grabs + ' times in 20 s');
      ok(follow >= 1, 'followed up ' + follow + ' times');
      b.dispose();
      ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
    });
  }

  console.log('\nChiaotzu: Telekinesis, Psychic Link, Self-Destruct (headless)');
  {
    const g = H.create({ quiet: true, seed: 32 });
    const { SL, V3 } = g;
    const holdS2 = (from, until) => (i) => (i === from ? { s2: true, s2Held: true } : i > from && i < until ? { s2Held: true } : {});

    test('Telekinesis pins a target 15 m away while he concentrates, drains ki, and the release leaves it reeling', () => {
      const b = g.battle({ p1: 'chiaotzu', p2: 'goku', distance: 15 });
      const c = b.player, v = b.fighters[1];
      c.ki = 100;
      let held = 0, stagger = false;
      c.controller = g.script(b, holdS2(2, 100));
      const pos0 = v.pos.clone();
      g.step(b, 140, () => {
        if (v.state === 'held') held++;
        if (held > 0 && v.state === 'stagger') stagger = true;
      });
      ok(held > 60, 'held for ' + held + ' frames');
      ok(c.ki < 85, 'ki drained: ' + c.ki.toFixed(1));
      ok(stagger, 'released into a stagger (an opening)');
      ok(v.pos.distanceTo(pos0) < 0.6, 'the target stayed where it was pinned');
      b.dispose();
      // out of range: refused, nothing spent
      const b2 = g.battle({ p1: 'chiaotzu', p2: 'goku', distance: 40 });
      const c2 = b2.player;
      c2.ki = 100;
      c2.controller = g.script(b2, holdS2(2, 40));
      g.step(b2, 40);
      eq(c2.state === 'telekinesis', false, 'no hold out of range');
      ok(c2.ki >= 99, 'no ki spent: ' + c2.ki.toFixed(1));
      b2.dispose();
    });

    test('striking Chiaotzu breaks his focus; a boss breaks free much sooner; a player can mash out', () => {
      let b = g.battle({ p1: 'chiaotzu', p2: 'goku', distance: 10 });
      let c = b.player, v = b.fighters[1];
      c.ki = 100;
      c.controller = g.script(b, holdS2(2, 200));
      g.until(b, () => v.state === 'held', 40);
      eq(v.state, 'held');
      c.takeHit(v, { type: 'ki', damage: 150, knock: 'flinch', impact: 1, hitstun: 16 });
      g.step(b, 2);
      ok(v.state !== 'held', 'hold broken by the hit: ' + v.state);
      b.dispose();
      // Nappa: poise means a much shorter hold
      b = g.battle({ p1: 'chiaotzu', p2: 'nappa', distance: 12 });
      c = b.player;
      v = b.fighters[1];
      c.ki = 100;
      let held = 0;
      c.controller = g.script(b, holdS2(2, 300));
      g.step(b, 260, () => {
        if (v.state === 'held') held++;
      });
      ok(held > 10 && held <= c.def.specials.special2.bossFrames + 2, 'boss held only ' + held + ' frames');
      b.dispose();
      // the player is the one pinned: mashing breaks it
      b = g.battle({ p1: 'goku', p2: 'chiaotzu', distance: 10 });
      const p = b.player;
      c = b.fighters[1];
      c.ki = 100;
      c.infiniteKi = true;
      c.controller = g.script(b, holdS2(2, 400));
      let escaped = false;
      b.on('telekinesisEnd', (e) => e.how === 'escape' && (escaped = true));
      p.controller = g.script(b, (i) => (i > 20 && i % 3 === 0 ? { light: true } : {}));
      g.step(b, 200);
      ok(escaped, 'mashed free');
      b.dispose();
    });

    test('Psychic Link: allies near Chiaotzu recover ki faster; it stops when he falls', () => {
      const gain = (withChiaotzu, kill) => {
        const b = g.battle({ p1: 'krillin', p2: 'goku', distance: 30 });
        const k = b.player;
        if (withChiaotzu) {
          const c = b.spawn({ charId: 'chiaotzu', team: 0, pos: k.pos.clone().add(new V3(0, 0, 4)) });
          c.controller = { update: () => SL.emptyIntent() };
          if (kill) {
            c.cannotDie = false;
            c.hp = 0;
            c._ko(null, { dir: new V3(0, 1, 0) });
          }
        }
        k.ki = 10;
        g.step(b, 300);
        const out = k.ki - 10;
        b.dispose();
        return out;
      };
      const alone = gain(false), linked = gain(true), fallen = gain(true, true);
      ok(linked > alone + 5, 'linked ' + linked.toFixed(1) + ' vs alone ' + alone.toFixed(1));
      ok(Math.abs(fallen - alone) < 1, 'no link from a fallen Chiaotzu: ' + fallen.toFixed(1));
    });

    test('Self-Destruct in a normal battle: he clings, the blast lands, and he survives at 1 health with no ki', () => {
      const b = g.battle({ p1: 'chiaotzu', p2: 'goku', distance: 8 });
      const c = b.player, v = b.fighters[1];
      v.infiniteHp = false;
      v.cannotDie = true;
      c.cannotDie = false;
      c.ki = 100;
      let blast = null;
      b.on('selfDestruct', (e) => (blast = e));
      const hp0 = v.hp;
      c.controller = g.script(b, { 2: { ult: true } });
      g.step(b, 260);
      ok(blast && blast.survived, 'detonated and survived');
      ok(hp0 - v.hp > 4000, 'blast damage ' + (hp0 - v.hp));
      ok(c.alive && c.hp <= 1, 'Chiaotzu alive at ' + c.hp);
      ok(c.ki < 5, 'ki spent');
      ok(!c.hidden, 'still there');
      b.dispose();
      ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
    });
  }

  console.log('\nYajirobe: katana, Senzu Beans, sneak attacks (headless)');
  {
    const g = H.create({ quiet: true, seed: 33 });
    const { SL, V3 } = g;

    test('the katana is a real prop in his right hand, and its reach lands slashes a fist would not', () => {
      const b = g.battle({ p1: 'yajirobe', p2: 'goku', distance: 3.3 });
      const y = b.player, d = b.fighters[1];
      const kat = y.model.props && y.model.props.katana;
      ok(kat, 'katana built');
      ok(kat.parent === y.model.joints.handR, 'parented to the right hand');
      let hits = 0;
      b.on('damage', (e) => e.attacker === y && hits++);
      y.controller = g.script(b, { 2: { light: true } });
      g.step(b, 40);
      ok(hits >= 1, 'slash landed at 3.3 m');
      b.dispose();
      const b2 = g.battle({ p1: 'goku', p2: 'yajirobe', distance: 3.3 });
      let fist = 0;
      b2.on('damage', (e) => e.attacker === b2.player && fist++);
      b2.player.controller = g.script(b2, { 2: { light: true } });
      g.step(b2, 40);
      eq(fist, 0, 'a jab from the same distance misses');
      b2.dispose();
    });

    test('Senzu Bean: heals 45% and ki, two per battle, a hit before he swallows keeps the bean, the wheel shows none left', () => {
      const b = g.battle({ p1: 'yajirobe', p2: 'goku', distance: 12 });
      const y = b.player, d = b.fighters[1];
      y.infiniteHp = false;
      y.cannotDie = true;
      y.hp = y.hpMax * 0.3;
      y.ki = 0;
      eq(y.mech.beans, 2);
      const sp = y.def.specials.special1;
      y.controller = g.script(b, { 2: { s1: true } });
      g.step(b, sp.eatAt + 30);
      ok(Math.abs(y.hpFrac - 0.75) < 0.02, 'healed to ' + y.hpFrac.toFixed(2));
      ok(y.ki >= 49, 'ki restored ' + y.ki.toFixed(0));
      eq(y.mech.beans, 1);
      // interrupted before swallowing: the bean stays in the pouch
      y.cooldowns.special1 = 0;
      y.controller = g.script(b, { 2: { s1: true } });
      g.step(b, 8);
      eq(y.state, 'senzu');
      y.takeHit(d, { type: 'melee', damage: 100, knock: 'flinch', impact: 1, hitstun: 18 });
      g.step(b, 40);
      eq(y.mech.beans, 1, 'bean kept');
      // eat the last one, then nothing
      y.cooldowns.special1 = 0;
      y.controller = g.script(b, { 2: { s1: true } });
      g.step(b, sp.eatAt + 30);
      eq(y.mech.beans, 0);
      y.cooldowns.special1 = 0;
      let empty = 0;
      b.on('senzuEmpty', () => empty++);
      y.controller = g.script(b, { 2: { s1: true } });
      g.step(b, 10);
      eq(empty, 1, 'refused with no beans');
      const entry = SL.RadialMenu.buildEntries(y, b).find((e) => e.id === 'special1');
      eq(entry.locked, 'No beans left');
      b.dispose();
    });

    test('an ally in worse shape close by gets the bean instead', () => {
      const b = g.battle({ p1: 'yajirobe', p2: 'goku', distance: 20 });
      const y = b.player;
      const k = b.spawn({ charId: 'krillin', team: 0, pos: y.pos.clone().add(new V3(0, 0, 4)) });
      k.controller = { update: () => SL.emptyIntent() };
      k.hp = k.hpMax * 0.2;
      y.hp = y.hpMax * 0.9;
      let to = null;
      b.on('senzu', (e) => (to = e.to));
      y.controller = g.script(b, { 2: { s1: true } });
      g.step(b, 60);
      eq(to, k, 'tossed to Krillin');
      ok(k.hpFrac > 0.6, 'Krillin healed to ' + k.hpFrac.toFixed(2));
      b.dispose();
    });

    test('strikes that land on an opponent’s back deal 40% more', () => {
      const dmg = (behind) => {
        const b = g.battle({ p1: 'yajirobe', p2: 'goku', distance: 2 });
        const y = b.player, d = b.fighters[1];
        let amount = 0;
        b.on('damage', (e) => e.attacker === y && !amount && (amount = e.amount));
        y.controller = g.script(b, { 2: { light: true } });
        g.step(b, 30, () => {
          // the victim keeps its back turned (or keeps facing him)
          d.yaw = behind ? y.yaw : y.yaw + Math.PI;
        });
        b.dispose();
        return amount;
      };
      const front = dmg(false), back = dmg(true);
      ok(front > 0 && back > 0, 'both landed ' + front + ' / ' + back);
      ok(Math.abs(back / front - 1.4) < 0.08, 'ratio ' + (back / front).toFixed(2));
    });

    test('CPU Yajirobe eats a bean when hurt and out of reach', () => {
      const b = g.battle({ p1: 'yajirobe', p2: 'goku', distance: 14, dummy: 'idle' });
      const y = b.player;
      y.infiniteHp = false;
      y.cannotDie = true;
      y.hp = y.hpMax * 0.25;
      y.controller = new SL.AIController(b, { difficulty: 'normal' });
      let ate = 0;
      b.on('senzu', () => ate++);
      g.step(b, 60 * 8);
      ok(ate >= 1, 'ate ' + ate);
      b.dispose();
      ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
    });
  }

  console.log('\nBoss systems: Nappa (headless)');
  {
    const g = H.create({ quiet: true, seed: 7 });
    const { SL, V3 } = g;
    const N = SL.data.characters.nappa;
    const duel = (distance, p1 = 'goku') => {
      const b = g.battle({ p1, p2: 'nappa', distance, dummy: 'idle', p1InfiniteHp: true, p2InfiniteHp: true });
      return { b, p: b.player, n: b.fighters[1] };
    };
    test('poise: light hits do not make Nappa flinch until his poise breaks', () => {
      const { b, p, n } = duel(2.6);
      const states = new Set();
      let broke = -1;
      b.on('poiseBreak', () => (broke = b.frame));
      p.controller = g.script(b, (k) => (k % 14 === 1 ? { light: true } : {}));
      g.until(b, () => broke >= 0, 60 * 20, () => states.add(n.state));
      ok(broke >= 0, 'poise eventually breaks under pressure');
      ok(!states.has('hitstun'), 'no flinch before the break: ' + [...states].join(','));
      eq(n.state, 'stagger');
      ok(n.poise.broken > 0, 'broken timer running');
      b.dispose();
    });
    test('poise: a broken Nappa takes extra damage, then his poise comes back full', () => {
      const { b, p, n } = duel(3);
      const hit = { type: 'melee', damage: 1000, knock: 'flinch', impact: 1 };
      n.infiniteHp = false;
      n.hp = n.hpMax;
      const a = n.hp;
      n.takeHit(p, hit);
      const normal = a - n.hp;
      n.poise.value = 1;
      n.takeHit(p, Object.assign({}, hit, { impact: 3 }));
      ok(n.poise.broken > 0, 'broken');
      const c = n.hp;
      n.takeHit(p, hit);
      const vulnerable = c - n.hp;
      ok(vulnerable > normal * 1.2, 'damage while broken ' + vulnerable + ' vs ' + normal);
      g.until(b, () => n.poise.broken <= 0, 400);
      eq(n.poise.value, n.poise.max, 'restored');
      b.dispose();
    });
    test('Ground Slam: a telegraph marks the landing; the shockwave hits the grounded but misses the airborne', () => {
      const results = [0, 5].map((lift) => {
        const { b, p, n } = duel(12);
        n.target = p;
        let marked = false, slammed = false, hurt = false;
        b.on('telegraph', () => (marked = true));
        b.on('bossSlam', () => (slammed = true));
        b.on('damage', (e) => {
          if (e.target === p && e.attacker === n) hurt = true;
        });
        if (lift) {
          p.pos.y += lift;
          p.prevPos.copy(p.pos);
          p.grounded = false;
        }
        SL.Techniques.groundSlam.start(n, N.boss.techniques.slam);
        g.step(b, 150);
        b.dispose();
        return { marked, slammed, hurt };
      });
      ok(results[0].marked && results[0].slammed && results[0].hurt, 'grounded: ' + JSON.stringify(results[0]));
      ok(results[1].slammed && !results[1].hurt, 'airborne: ' + JSON.stringify(results[1]));
    });
    test('Break Cannon eruptions only hurt after their warning disc has filled', () => {
      const { b, p, n } = duel(20);
      n.target = p;
      let firstMark = -1, firstHit = -1;
      b.on('telegraph', () => firstMark < 0 && (firstMark = b.frame));
      b.on('damage', (e) => e.attacker === n && firstHit < 0 && (firstHit = b.frame));
      SL.Techniques.eruption.start(n, N.boss.techniques.eruption);
      g.step(b, 220);
      ok(firstMark >= 0 && firstHit >= 0, 'marked and hit');
      ok(firstHit - firstMark >= N.boss.techniques.eruption.delay - 1, 'hit came ' + (firstHit - firstMark) + ' frames after the warning');
      b.dispose();
    });
    test('Bomber DX blows away everyone inside its dome and no one outside it', () => {
      const hurt = [7, 22].map((dist) => {
        const { b, p, n } = duel(dist);
        let h = false;
        b.on('damage', (e) => e.attacker === n && e.target === p && (h = true));
        SL.Techniques.bomberWave.start(n, N.boss.techniques.bomber);
        g.step(b, 140);
        b.dispose();
        return h;
      });
      ok(hurt[0], 'inside is hit');
      ok(!hurt[1], 'outside is safe');
    });
    test('boss phases advance with health, never go back, and the entry move waits for a free moment', () => {
      const { b, p, n } = duel(14);
      n.infiniteHp = false;
      const phases = [];
      b.on('bossPhase', (e) => phases.push(e.phase.id));
      let roared = false;
      b.on('bossRoar', () => (roared = true));
      n.hp = n.hpMax * 0.5;
      n.setState('stagger', { frames: 60 });
      g.step(b, 10);
      eq(phases.join(','), 'angry');
      ok(!roared, 'no roar while staggered');
      g.step(b, 120);
      ok(roared, 'roars once free');
      n.hp = n.hpMax * 0.9;
      g.step(b, 30);
      eq(n.mech.phase, 1, 'healing does not return to Toying');
      n.hp = n.hpMax * 0.2;
      g.step(b, 5);
      eq(phases.join(','), 'angry,rampage');
      b.dispose();
    });
    test('mission hold: bossPhaseCap keeps Nappa out of his Rampage phase', () => {
      const { b, n } = duel(14);
      n.infiniteHp = false;
      n.bossPhaseCap = 1;
      n.hp = n.hpMax * 0.1;
      g.step(b, 5);
      eq(n.mech.phase, 1);
      b.dispose();
    });
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\nGiant boss systems: Great Ape (headless)');
  {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL, V3 } = g;
    const A = SL.data.characters.great_ape_vegeta;
    const arena = (distance) => {
      const b = g.battle({ p1: 'goku', p2: 'great_ape_vegeta', distance, dummy: 'idle', p1InfiniteHp: true, p2InfiniteHp: true });
      const p = b.player, ga = b.fighters[1];
      ga.target = p;
      return { b, p, ga };
    };
    test('Great Ape is a real giant: scaled body, own model parts (tail joints) and giant camera scale', () => {
      const { b, ga } = arena(20);
      ok(ga.height > 10, 'about 11 m tall: ' + ga.height.toFixed(1));
      ok(ga.model.joints.tail0 && ga.model.joints.tail7, 'jointed tail');
      ok(ga.cameraScale > 2, 'giant camera framing');
      ok(ga.noFlight, 'cannot fly');
      b.dispose();
    });
    test('hit zones: attacking from behind lands on the tail, which takes extra damage and can be broken', () => {
      const { b, p, ga } = arena(30);
      ga.controller = g.script(b, {});
      ga.target = null;
      g.step(b, 5);
      const behind = ga.pos.clone().addScaledVector(ga.forward, -4.2);
      behind.y = b.stage.heightAt(behind.x, behind.z) + 1.2;
      p.setPosition(behind);
      p.grounded = false;
      p.target = ga;
      const hits = {};
      let broken = null;
      b.on('zoneHit', (e) => (hits[e.zone.id] = (hits[e.zone.id] || 0) + 1));
      b.on('zoneBroken', (e) => (broken = e.zone.id));
      p.controller = g.script(b, (n) => (n % 14 === 1 ? { light: true } : n % 56 === 43 ? { heavy: true } : {}));
      g.until(b, () => broken, 60 * 30, () => (ga.yaw = ga.prevYaw));
      ok((hits.tail || 0) > (hits.chest || 0), 'mostly tail hits: ' + JSON.stringify(hits));
      eq(broken, 'tail');
      const tailZone = A.hitZones.find((z) => z.id === 'tail'), armZone = A.hitZones.find((z) => z.id === 'armL');
      ok(tailZone.damageMul > 1 && armZone.damageMul < 1, 'tail is the weak point, arms are armoured');
      b.dispose();
    });
    test('giant sweep hits a grounded hero but passes under one who jumped or flew over it', () => {
      const res = [0, 6].map((lift) => {
        const { b, p, ga } = arena(10);
        if (lift) {
          p.pos.y += lift;
          p.prevPos.copy(p.pos);
          p.grounded = false;
        }
        let hurt = false;
        b.on('damage', (e) => e.target === p && e.attacker === ga && (hurt = true));
        SL.Techniques.giantSweep.start(ga, A.boss.techniques.sweep);
        g.step(b, 90);
        b.dispose();
        return hurt;
      });
      ok(res[0], 'grounded hit');
      ok(!res[1], 'airborne clear');
    });
    test('giant grab: an idle hero is crushed and thrown; mashing breaks free and staggers the ape', () => {
      const outcomes = [false, true].map((mash) => {
        const { b, p, ga } = arena(9);
        const ev = [];
        for (const n of ['giantGrab', 'grabEscape', 'giantThrow']) b.on(n, () => ev.push(n));
        const started = SL.Techniques.giantGrab.start(ga, A.boss.techniques.grab);
        ev.push('start:' + started + ':' + p.state + ':' + ga.distTo(p).toFixed(1));
        if (mash) p.controller = g.script(b, (n) => (p.state === 'held' && n % 3 === 0 ? { light: true } : {}));
        let apeStagger = false;
        let lastSt = '';
        g.step(b, 320, () => {
          if (ga.state === 'stagger') apeStagger = true;
          const st = ga.state + ':' + (ga.sd.phase || '') + ':' + p.state + ':' + p.pos.x.toFixed(1);
          if (st !== lastSt) ev.push(st);
          lastSt = st;
        });
        b.dispose();
        return { ev, apeStagger };
      });
      ok(outcomes[0].ev.includes('giantGrab') && outcomes[0].ev.includes('giantThrow'), 'idle: ' + outcomes[0].ev.join(','));
      ok(outcomes[1].ev.includes('grabEscape') && !outcomes[1].ev.includes('giantThrow') && outcomes[1].apeStagger, 'mash: ' + JSON.stringify(outcomes[1]));
    });
    test('giant roar freezes heroes standing near it but not one flying high', () => {
      const res = [0, 8].map((lift) => {
        const { b, p, ga } = arena(12);
        if (lift) {
          p.pos.y += lift;
          p.prevPos.copy(p.pos);
          p.grounded = false;
        }
        let stunned = false;
        b.on('roarStun', (e) => e.fighter === p && (stunned = true));
        SL.Techniques.bossRoar.start(ga, A.boss.techniques.roar);
        g.step(b, 60);
        b.dispose();
        return stunned;
      });
      ok(res[0] && !res[1], JSON.stringify(res));
    });
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\nPlayable Great Ape (headless)');
  {
    const g = H.create({ quiet: true, seed: 17 });
    const { SL } = g;
    const P = SL.data.characters.great_ape_gohan_player;
    const arena = (dist) => {
      const b = g.battle({ p1: 'great_ape_gohan_player', p2: 'vegeta', distance: dist, dummy: 'idle' });
      b.player.infiniteHp = true;
      return { b, ape: b.player, v: b.fighters[1] };
    };
    test('played Great Ape: valid data, story-only, and its buttons map to the giant techniques', () => {
      const problems = SL.Schema.validateCharacter(P);
      eq(problems.length, 0, problems.join(' | '));
      ok(!P.playable && !P.boss && P.giant && P.hitZones.some((z) => z.id === 'tail'), 'a story-only giant with a tail weak point');
      eq(P.specials.special1.type, 'giantStomp');
      eq(P.specials.ultimate.type, 'bossRoar');
      eq(P.moves.throw.technique, 'giantGrab');
      eq(P.extras[0].type, 'giantSweep');
    });
    test('played Great Ape: Stomp, Roar, Arm Sweep and the grab start from the buttons; the specials cost ki and go on cooldown', () => {
      const cases = [
        ['stomp', { s1: true, s1Held: true }, 'giantStomp', 'special1'],
        ['roar', { ult: true, ultHeld: true }, 'bossRoar', 'ultimate'],
        ['sweep', { extra: 'sweep', extraHeld: true }, 'giantSweep', 'x:sweep'],
        ['grab', { guard: true, heavy: true }, 'giantGrab', null],
      ];
      for (const [name, input, state, slot] of cases) {
        const { b, ape } = arena(9);
        ape.ki = 100;
        g.step(b, 10);
        ape.controller = g.script(b, { 1: input });
        let saw = false;
        g.step(b, 14, () => {
          if (ape.state === state) saw = true;
        });
        ok(saw, name + ' started (state now ' + ape.state + ')');
        if (slot) ok(ape.cooldowns[slot] > 0, name + ' is on cooldown: ' + ape.cooldowns[slot]);
        if (name === 'roar') ok(ape.ki < 55, 'the roar cost ki: ' + ape.ki.toFixed(1));
        b.dispose();
      }
    });
    test('boss AI still starts the same giant techniques for free (its pattern cooldowns pace them)', () => {
      const { b, ape } = arena(9);
      ape.ki = 40;
      ok(SL.Techniques.giantStomp.start(ape, P.specials.special1, 'boss', 0), 'started');
      eq(ape.ki, 40, 'no ki spent');
      ok(!(ape.cooldowns.special1 > 0) && !(ape.cooldowns.boss > 0), 'no cooldown set');
      b.dispose();
    });
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\nYamcha: Spirit Ball Control (headless)');
  {
    const g = H.create({ quiet: true, seed: 19 });
    const { SL } = g;
    const Y = SL.data.characters.yamcha;
    test('Yamcha is a playable prototype, unlocked by clearing "The Saibamen", with a steerable Spirit Ball', () => {
      ok(Y.playable, 'playable');
      const problems = SL.Schema.validateCharacter(Y);
      eq(problems.length, 0, problems.join(' | '));
      const rule = SL.data.unlocks.find((u) => u.target === 'yamcha');
      ok(rule && rule.condition.missionComplete === 'saiyan_saibamen', 'unlock rule');
      ok(Y.specials.ultimate.projectile.steer && Y.specials.ultimate.projectile.steer.frames > 0, 'steer data');
    });
    // Yamcha throws the Spirit Ball at a target far away; hold = frames Ultimate stays held, stick = input while steering
    const throwBall = (hold, stick) => {
      const b = g.battle({ p1: 'yamcha', p2: 'vegeta', distance: 70, dummy: 'idle' });
      const y = b.player;
      y.ki = 100;
      let control = null;
      b.on('spiritBallControl', (e) => (control = e));
      y.controller = g.script(b, (n) => (n < hold ? Object.assign({ ult: n === 1, ultHeld: true }, n > 33 ? stick : {}) : {}));
      g.step(b, 33);
      const ball = b.projectiles.list.find((p) => p.owner === y);
      const dir0 = ball ? ball.vel.clone().setY(0).normalize() : null;
      g.step(b, 36);
      const dir1 = ball && ball.alive ? ball.vel.clone().setY(0).normalize() : dir0;
      const turn = dir0 && dir1 ? Math.acos(Math.max(-1, Math.min(1, dir0.dot(dir1)))) : 0;
      return { b, y, ball, control, turn };
    };
    test('holding Ultimate after the throw steers the Spirit Ball; a tap just throws it; letting go ends control', () => {
      const steered = throwBall(90, { mx: 1 });
      ok(steered.ball, 'ball thrown');
      ok(steered.control, 'Spirit Ball Control started');
      eq(steered.y.state, 'spiritSteer', 'Yamcha concentrates on it');
      ok(steered.turn > 0.6, 'the ball curved: ' + steered.turn.toFixed(2) + ' rad');
      g.step(steered.b, 30);
      ok(steered.y.state !== 'spiritSteer' && !steered.ball.steering, 'releasing the button ends control');
      steered.b.dispose();
      const tapped = throwBall(4, { mx: 1 });
      ok(!tapped.control, 'a tap does not start control');
      ok(tapped.turn < 0.25, 'a thrown ball only homes a little: ' + tapped.turn.toFixed(2) + ' rad');
      tapped.b.dispose();
    });
    test('a hit on Yamcha while he steers ends Spirit Ball Control', () => {
      const r = throwBall(400, {});
      eq(r.y.state, 'spiritSteer');
      r.y.invuln = 0;
      r.y.takeHit(r.b.fighters[1], { type: 'melee', damage: 300, knock: 'flinch', impact: 2, hitstun: 20 });
      ok(r.y.state !== 'spiritSteer', 'control broken: ' + r.y.state);
      ok(!r.ball.steering, 'the ball flies on unsteered');
      r.b.dispose();
    });
    test('a steered Spirit Ball bursts through its target and comes round for a second, weaker hit', () => {
      const b = g.battle({ p1: 'yamcha', p2: 'vegeta', distance: 16, dummy: 'idle' });
      const y = b.player, v = b.fighters[1];
      const spec = Y.specials.ultimate.projectile;
      const origin = y.chest();
      const p = b.projectiles.spawnBlast(y, origin, v.chest().sub(origin).normalize(), Object.assign({}, spec, { special: true }));
      p.autoSteer = spec.steer.cpuFrames;
      const hits = [];
      let rebound = false;
      b.on('damage', (e) => e.target === v && e.attacker === y && !e.blocked && hits.push(e.amount));
      b.on('spiritBallRebound', () => (rebound = true));
      g.step(b, 200);
      ok(rebound, 'burst through once');
      eq(hits.length, 2, 'two hits: ' + JSON.stringify(hits));
      ok(hits[1] < hits[0], 'the second pass is weaker');
      b.dispose();
    });
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\nBalance telemetry and character mechanics (headless)');
  {
    const g = H.create({ quiet: true, seed: 12 });
    const { SL, V3 } = g;
    const light = { type: 'melee', damage: 300, knock: 'flinch', impact: 1, hitstun: 20 };

    test('telemetry records landed hits by move, whiffs, and the victim\'s time stunned', () => {
      const b = g.battle({ p1: 'goku', p2: 'vegeta', distance: 2.2 });
      const p = b.player, d = b.fighters[1];
      p.controller = g.script(b, { 2: { light: true }, 14: { light: true }, 26: { light: true } });
      g.step(b, 90);
      const me = b.telemetry.summary().find((r) => r.player);
      const foe = b.telemetry.summary().find((r) => !r.player);
      ok(me.hitsLanded >= 2, 'hits landed ' + me.hitsLanded);
      ok(me.byMove.jab > 0, 'damage credited to the jab: ' + JSON.stringify(me.byMove));
      eq(Math.round(me.damageDealt), Math.round(foe.damageTaken), 'dealt matches taken');
      ok(foe.stunShare > 0.2, 'victim spent time in hitstun: ' + foe.stunShare);
      // now swing at nothing
      d.setPosition(new V3(40, 0, 0));
      const whiffs = me.whiffs;
      p.controller = g.script(b, { 2: { light: true } });
      g.step(b, 60);
      ok(b.telemetry.summary().find((r) => r.player).whiffs > whiffs, 'a swing at empty air counts as a whiff');
      b.dispose();
    });

    test('telemetry credits a special with whether it landed and what it did, and explains the fight', () => {
      const b = g.battle({ p1: 'goku', p2: 'vegeta', distance: 12 });
      const p = b.player, d = b.fighters[1];
      p.controller = g.script(b, (n) => (n >= 2 && n < 30 ? { s1: n === 2, s1Held: true } : {}));
      g.step(b, 150);
      const k = b.telemetry.summary().find((r) => r.player).specials.Kamehameha;
      ok(k && k.used === 1 && k.landed === 1 && k.damage > 1000, 'Kamehameha used, landed, damage ' + JSON.stringify(k));
      // a fight where the player was mostly stunned produces that insight first
      const r = b.telemetry.R(p);
      r.frames = 600;
      r.stateFrames = { hitstun: 300, free: 300 };
      ok(/stunned/.test(b.telemetry.insights()[0] || ''), 'insight: ' + b.telemetry.insights()[0]);
      b.dispose();
    });

    test('a beam cancelled from a landed hit is a true combo (Kamehameha: the target never recovers in between)', () => {
      const b = g.battle({ p1: 'goku', p2: 'vegeta', distance: 2.2 });
      const p = b.player, d = b.fighters[1];
      let hitAt = -1, beamHit = -1;
      const between = new Set();
      b.on('damage', (e) => {
        if (e.attacker !== p) return;
        if (e.type === 'melee' && hitAt < 0) hitAt = b.frame;
        if (e.type === 'beam' && beamHit < 0) beamHit = b.frame;
      });
      p.controller = g.script(b, (n) => (n === 2 ? { light: true } : n >= 8 && n < 12 ? { s1: true, s1Held: false } : {}));
      g.step(b, 90, () => {
        if (hitAt >= 0 && beamHit < 0) between.add(d.state);
      });
      ok(hitAt > 0 && beamHit > 0, 'jab and beam both hit (' + hitAt + ', ' + beamHit + ')');
      ok(!between.has('free'), 'no free frame for the target between jab and beam: ' + [...between].join(','));
      b.dispose();
      // from neutral the full minimum charge still applies
      const b2 = g.battle({ p1: 'goku', p2: 'vegeta', distance: 12 });
      const p2 = b2.player;
      let fireFrame = -1;
      p2.controller = g.script(b2, (n) => (n === 2 ? { s1: true } : {}));
      g.step(b2, 60, () => {
        if (p2.state === 'beamCharge') fireFrame = p2.stateFrame;
      });
      ok(fireFrame >= SL.data.characters.goku.specials.special1.chargeMin - 1, 'neutral Kamehameha still charges ' + fireFrame + ' frames');
      b2.dispose();
    });

    test('Saiyan Instinct: taking hits fills Adaptation, and a full meter empowers Goku', () => {
      const b = g.battle({ p1: 'goku', p2: 'vegeta', distance: 3 });
      const p = b.player, d = b.fighters[1];
      p.infiniteHp = true;
      const kinds = [];
      b.on('mechanic', (e) => e.fighter === p && kinds.push(e.kind));
      eq(SL.mech(p, 'damageOut', {}), 1, 'no bonus at the start');
      for (let i = 0; i < 20 && !kinds.includes('adapted'); i++) {
        p.setState('free');
        p.takeHit(d, light);
      }
      ok(kinds.includes('adapted'), 'adapted after repeated hits: ' + kinds.join(','));
      ok(SL.mech(p, 'damageOut', {}) > 1.1, 'empowered strikes');
      eq(SL.mech(p, 'hud').label, 'INSTINCT');
      b.dispose();
    });

    test('Pride: standing near an idle opponent builds nothing; pressing them does; at max he shrugs one light hit and pays for it', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'goku', distance: 3 });
      const v = b.player, d = b.fighters[1];
      g.step(b, 300);
      ok(v.mech.pride < 1, 'no Pride for loitering: ' + v.mech.pride.toFixed(1));
      v.controller = g.script(b, (n) => (n % 14 === 2 ? { light: true } : {}));
      g.step(b, 240);
      ok(v.mech.pride > 5, 'pressing builds Pride: ' + v.mech.pride.toFixed(1));
      v.controller = g.script(b, {});
      g.step(b, 60);
      v.mech.pride = 100;
      g.step(b, 2);
      ok(v.mech.max, 'max Pride');
      let shrugs = 0;
      b.on('mechanic', (e) => e.kind === 'prideShrug' && shrugs++);
      v.setState('free');
      eq(v.takeHit(d, light), 'armored', 'light hit shrugged off');
      eq(shrugs, 1);
      ok(v.mech.pride <= 75, 'the shrug costs Pride: ' + v.mech.pride);
      v.setState('free');
      eq(v.takeHit(d, light), 'hit', 'the next light hit lands');
      b.dispose();
    });

    test('Battle-Hardened rage: light hits stop staggering Bardock, but he no longer also takes less damage', () => {
      const b = g.battle({ p1: 'bardock', p2: 'goku', distance: 3 });
      const k = b.player, d = b.fighters[1];
      k.infiniteHp = false;
      k.cannotDie = true;
      k.hp = k.hpMax * 0.25;
      g.step(b, 2);
      ok(k.mech.rage, 'raging');
      eq(SL.mech(k, 'damageIn', {}), undefined, 'no damage reduction');
      k.setState('free');
      eq(k.takeHit(d, light), 'armored', 'light hit does not stagger');
      b.dispose();
    });

    test('CPU Goku never teleports onto a downed opponent or behind one mid-swing', () => {
      const b = g.battle({ p1: 'goku', p2: 'vegeta', distance: 20 });
      const p = b.player, d = b.fighters[1];
      const ai = new SL.AIController(b, { difficulty: 'normal' });
      ai._init(p);
      p.ki = 100;
      const scoreIt = () => {
        const sc = { melee: 1 };
        SL.AIHooks.goku.scores(ai, p, d, 20, { state: d.state }, sc, false);
        return sc.it;
      };
      d.setState('free');
      ok(scoreIt() > 0, 'IT considered against a free opponent at range');
      d.setState('knockdown', { frames: 40 });
      eq(scoreIt(), undefined, 'not onto a downed opponent');
      d.setState('attack', { move: d.def.moves.light[0], kind: 'light', hit: false, hitSet: new Set(), startup: 4 });
      eq(scoreIt(), undefined, 'not behind a swing');
      b.dispose();
    });

    test('CPU duels: character mechanics stay within a comparable average bonus (telemetry)', () => {
      const tally = {};
      for (let r = 0; r < 4; r++) {
        const ids = r % 2 ? ['vegeta', 'goku'] : ['goku', 'bardock'];
        const b = new SL.Battle({ mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 40 },
          fighters: [{ charId: ids[0], player: true, team: 0, pos: new V3(-5, 0, 0) }, { charId: ids[1], team: 1, pos: new V3(5, 0, 0) }], onEnd: () => {} });
        b.start();
        b.fighters[0].controller = new SL.AIController(b, { difficulty: 'normal' });
        let started = false;
        g.until(b, () => (started = started || b.phase === 'fight') && b.phase !== 'fight', 60 * 150);
        for (const s of b.telemetry.summary()) (tally[s.id] = tally[s.id] || []).push(s.mechDamageAvg);
        b.dispose();
      }
      for (const [id, list] of Object.entries(tally)) {
        const avg = list.reduce((x, y) => x + y, 0) / list.length;
        ok(avg >= 1 && avg < 1.12, id + ' mechanic average damage x' + avg.toFixed(3));
      }
    });
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\n.glb pipeline: imported test mannequin (headless)');
  {
    const g = H.create({ quiet: true, seed: 14 });
    const { SL, THREE, V3 } = g;
    const glbPath = path.join(__dirname, '..', 'assets', 'models', 'test_dummy.glb');
    const fileBytes = () => {
      const b = fs.readFileSync(glbPath);
      return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    };

    test('the .glb file parses: skin, joints, meshes, materials and clips; the file:// copy is byte-identical', () => {
      const r = SL.GLB.parse(fileBytes());
      eq(r.report.joints, 26);
      eq(r.report.skinnedMeshes, 3);
      eq(r.report.materials, 3);
      ok(r.report.vertices > 500 && r.report.triangles > 500, r.report.vertices + ' verts');
      eq(r.clips.map((c) => c.name).join(','), 'Idle,Wave');
      eq(r.report.unsupported.length, 0, 'nothing unsupported in the test file');
      const reg = new Uint8Array(SL.GLB.decodeBase64(SL.assets.glb.test_dummy));
      const disk = new Uint8Array(fileBytes());
      ok(reg.length === disk.length && reg.every((x, i) => x === disk[i]), 'assets/models/test_dummy.glb.js matches the .glb');
    });

    test('broken or unsupported files are rejected with a clear message', () => {
      const bytes = new Uint8Array(fileBytes());
      const bad = bytes.slice();
      bad[0] = 0;
      let msg = '';
      try { SL.GLB.parse(bad.buffer); } catch (e) { msg = e.message; }
      ok(/magic/.test(msg), 'bad magic: ' + msg);
      msg = '';
      try { SL.GLB.parse(bytes.slice(0, 200).buffer); } catch (e) { msg = e.message; }
      ok(/truncated/.test(msg), 'truncated: ' + msg);
      // a file that requires an extension this reader does not implement
      const json = { asset: { version: '2.0' }, extensionsRequired: ['KHR_draco_mesh_compression'] };
      let jb = Buffer.from(JSON.stringify(json));
      jb = Buffer.concat([jb, Buffer.alloc((4 - (jb.length % 4)) % 4, 0x20)]);
      const glb = Buffer.alloc(12 + 8 + jb.length);
      glb.writeUInt32LE(0x46546c67, 0); glb.writeUInt32LE(2, 4); glb.writeUInt32LE(glb.length, 8);
      glb.writeUInt32LE(jb.length, 12); glb.writeUInt32LE(0x4e4f534a, 16); jb.copy(glb, 20);
      msg = '';
      try { SL.GLB.parse(glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.length)); } catch (e) { msg = e.message; }
      ok(/draco/.test(msg), 'required extension: ' + msg);
    });

    test('embedded base color texture: PNG bytes, sampler, UVs, decoded onto the material when ready', async () => {
      const r = SL.GLB.parse(fileBytes());
      eq(r.report.textures, 1);
      const tex = r.textures[0];
      eq(tex.userData.mimeType, 'image/png');
      const png = tex.userData.bytes;
      ok(png[0] === 0x89 && png[1] === 0x50 && png[2] === 0x4e && png[3] === 0x47, 'PNG signature');
      eq(tex.flipY, false, 'glTF UV origin');
      eq(tex.wrapS, THREE.RepeatWrapping);
      ok(r.materials.find((m) => m.name === 'Body').map === tex, 'Body material uses it');
      ok(r.meshes.every((m) => m.geometry.attributes.uv), 'every primitive has UVs');
      ok(/not decoded/.test(r.report.warnings.join(' ')), 'without a decoder it says so instead of failing');
      // with a decoder (the browser uses createImageBitmap)
      let seen = null;
      const r2 = SL.GLB.parse(fileBytes(), { decodeImage: (bytes, mime) => ((seen = mime), { width: 64, height: 64 }) });
      await r2.ready;
      eq(seen, 'image/png');
      ok(r2.textures[0].userData.decoded && r2.textures[0].image.width === 64, 'image assigned');
      eq(r2.report.warnings.length, 0);
      // a decoder failure is reported, the model still loads
      const r3 = SL.GLB.parse(fileBytes(), { decodeImage: () => Promise.reject(new Error('corrupt image')) });
      await r3.ready;
      ok(/corrupt image/.test(r3.report.warnings.join(' ')), 'decode failure reported: ' + r3.report.warnings.join(' | '));
    });

    test('skinning is exact in the bind pose (every vertex where the modeler put it)', () => {
      const r = SL.GLB.parse(fileBytes());
      const v = new THREE.Vector3();
      let err = 0;
      for (const m of r.meshes) {
        m.skeleton.update();
        const p = m.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          v.fromBufferAttribute(p, i);
          const base = v.clone();
          m.boneTransform(i, v);
          err = Math.max(err, v.distanceTo(base));
        }
      }
      ok(err < 1e-4, 'max bind error ' + err);
    });

    test('joint mapping: the name-based guess finds the same 17 bones as the explicit map', () => {
      const r = SL.GLB.parse(fileBytes());
      const names = r.skins[0].skeleton.bones.map((b) => b.userData.gltfName);
      const guess = SL.GLBModel.guessJointMap(names);
      eq(guess.missing.length, 0, 'missing: ' + guess.missing.join(','));
      const explicit = SL.data.characters.test_dummy.model.jointMap;
      for (const j of Object.keys(explicit)) eq(guess.map[j], explicit[j], j);
      // other common conventions
      const mix = SL.GLBModel.guessJointMap(['mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine2', 'mixamorig:Neck', 'mixamorig:Head', 'mixamorig:LeftArm', 'mixamorig:LeftForeArm', 'mixamorig:LeftHand', 'mixamorig:RightArm', 'mixamorig:RightForeArm', 'mixamorig:RightHand', 'mixamorig:LeftUpLeg', 'mixamorig:LeftLeg', 'mixamorig:LeftFoot', 'mixamorig:RightUpLeg', 'mixamorig:RightLeg', 'mixamorig:RightFoot']);
      eq(mix.missing.length, 0, 'Mixamo-style names: missing ' + mix.missing.join(','));
      eq(mix.map.elbowL, 'mixamorig:LeftForeArm');
      eq(mix.map.kneeR, 'mixamorig:RightLeg');
      const blender = SL.GLBModel.guessJointMap(['hips', 'spine', 'chest', 'neck', 'head', 'upper_arm.L', 'forearm.L', 'hand.L', 'upper_arm.R', 'forearm.R', 'hand.R', 'thigh.L', 'shin.L', 'foot.L', 'thigh.R', 'shin.R', 'foot.R']);
      eq(blender.missing.length, 0, 'Blender-style names: missing ' + blender.missing.join(','));
    });

    test('retargeting: every game pose puts the imported limbs in the same directions as the procedural rig', () => {
      const ref = new SL.Model(SL.data.characters.goku);
      const glb = SL.ModelBuilder.build(SL.data.characters.test_dummy);
      const poses = Object.assign({}, SL.data.poses, SL.data.characters.goku.poses);
      const aRef = new SL.Animator(ref, poses), aGlb = new SL.Animator(glb, poses);
      aRef.breathe = aGlb.breathe = 0;
      const SEG = [['shoulderL', 'elbowL'], ['elbowL', 'handL'], ['shoulderR', 'elbowR'], ['elbowR', 'handR'], ['thighL', 'kneeL'], ['kneeL', 'footL'], ['thighR', 'kneeR'], ['kneeR', 'footR'], ['neck', 'head']];
      const at = (m, j) => m.joints[j].getWorldPosition(new THREE.Vector3());
      let worst = 0, count = 0;
      for (const [name, p] of Object.entries(poses)) {
        if (typeof p === 'function') continue;
        for (const an of [aRef, aGlb]) {
          an.play(name, 10, { snap: true });
          an.update(0);
        }
        ref.root.updateMatrixWorld(true);
        glb.root.updateMatrixWorld(true);
        for (const [x, y] of SEG) {
          const d1 = at(ref, y).sub(at(ref, x)).normalize(), d2 = at(glb, y).sub(at(glb, x)).normalize();
          worst = Math.max(worst, (d1.angleTo(d2) * 180) / Math.PI);
        }
        count++;
      }
      ok(count > 50, count + ' poses');
      ok(worst < 1, 'worst limb direction error ' + worst.toFixed(3) + ' deg');
      ref.dispose();
      glb.dispose();
    });

    test('sockets follow the real bones: hands and head give effect origins, props attach to the hand', () => {
      const b = g.battle({ p1: 'test_dummy', p2: 'vegeta', distance: 4 });
      const p = b.player, m = p.model;
      p.anim.play('g_jab', 10, { snap: true });
      p.anim.update(0);
      m.root.updateMatrixWorld(true);
      const bone = m.jointMap.handR.getWorldPosition(new V3());
      ok(m.joints.handR.getWorldPosition(new V3()).distanceTo(bone) < 1e-4, 'socket sits on the bone');
      const prop = new THREE.Group();
      prop.position.set(0, -0.1, 0);
      m.joints.handR.add(prop);
      m.root.updateMatrixWorld(true);
      const d = prop.getWorldPosition(new V3()).distanceTo(bone);
      ok(Math.abs(d - 0.1 * p.scale) < 0.01, 'prop offset keeps game units under the scaled import: ' + d.toFixed(3));
      ok(m.nodes.Socket_HandR, 'extra socket node from the file is reachable');
      ok(m.headCenter.getWorldPosition(new V3()).y > m.jointMap.neck.getWorldPosition(new V3()).y, 'head center above the neck');
      b.dispose();
    });

    test('embedded clips play on the imported skeleton, then the game rig takes over again', () => {
      const m = SL.ModelBuilder.build(SL.data.characters.test_dummy);
      const fore = m.nodes.Forearm_R;
      m.afterPose();
      const q0 = fore.quaternion.clone();
      ok(m.playClip('Wave'), 'clip found');
      m.tick(0.6);
      ok(fore.quaternion.angleTo(q0) > 0.3, 'Wave moves the forearm: ' + fore.quaternion.angleTo(q0).toFixed(2));
      m.afterPose();
      ok(fore.quaternion.angleTo(q0) > 0.3, 'retargeting does not fight a playing clip');
      m.tick(1.2);
      eq(m.clipAction, null, 'clip finished');
      m.afterPose();
      ok(fore.quaternion.angleTo(q0) < 1e-3, 'rig pose restored');
      eq(m.playClip('Nope'), false);
      m.dispose();
    });

    test('in combat: the mannequin lands strikes, fires a beam from its hand, leaves a frozen afterimage', () => {
      const b = g.battle({ p1: 'test_dummy', p2: 'vegeta', distance: 2.2 });
      const p = b.player;
      let melee = 0;
      b.on('damage', (e) => e.attacker === p && e.type === 'melee' && melee++);
      p.controller = g.script(b, { 2: { light: true }, 14: { light: true } });
      g.step(b, 40);
      ok(melee >= 1, 'strikes connect: ' + melee);
      b.dispose();

      const b2 = g.battle({ p1: 'test_dummy', p2: 'vegeta', distance: 14 });
      const p2 = b2.player;
      let beam = null, beamHit = 0;
      b2.on('damage', (e) => e.attacker === p2 && e.type === 'beam' && beamHit++);
      p2.controller = g.script(b2, (n) => (n >= 2 && n < 30 ? { s1: n === 2, s1Held: true } : {}));
      g.step(b2, 120, () => {
        if (!beam && p2.state === 'beamFire') beam = p2.sd.beam;
      });
      ok(beam, 'beam fired');
      ok(beamHit > 0, 'beam hits');
      const hands = p2.handPos('R').add(p2.handPos('L')).multiplyScalar(0.5);
      ok(beam.origin ? beam.origin.distanceTo(hands) < 1.2 : true, 'beam starts at the imported hands');
      // afterimage: baked pose, not a live skinned clone
      p2.anim.play('g_jab', 10, { snap: true });
      p2.anim.update(0);
      const ghost = p2.model.ghostClone();
      const geo = ghost.children[0].geometry;
      eq(geo.attributes.position.count, p2.model.gltf.meshes[0].geometry.attributes.position.count);
      ok(ghost.children.every((c) => !c.isSkinnedMesh), 'ghost meshes are static');
      const before = geo.attributes.position.array.slice();
      p2.anim.play('idle', 10, { snap: true });
      p2.anim.update(0);
      p2.model.root.updateMatrixWorld(true);
      ok(geo.attributes.position.array.every((x, i) => x === before[i]), 'ghost stays frozen when the model moves on');
      p2.ghost();
      ok(b2.vfx.ghosts.length > 0, 'afterimage spawned through the normal VFX path');
      b2.dispose();
    });

    test('tools/glb_check.js passes the mannequin and flags a broken joint map (swapped sides, knee and foot switched)', () => {
      const { spawnSync } = require('child_process');
      const tool = path.join(__dirname, '..', 'tools', 'glb_check.js');
      const good = spawnSync(process.execPath, [tool, glbPath, '--json'], { encoding: 'utf8' });
      eq(good.status, 0, 'exit code: ' + good.stderr);
      const gr = JSON.parse(good.stdout);
      eq(gr.errors.length, 0, 'errors: ' + gr.errors.join(' | '));
      eq(gr.warnings.length, 0, 'warnings: ' + gr.warnings.join(' | '));
      ok(gr.info.retarget.worst.deg < 1, 'retarget math worst ' + gr.info.retarget.worst.deg);
      ok(Math.abs(gr.info.lowestPoint) < 0.05, 'feet on the ground: ' + gr.info.lowestPoint);
      const map = Object.assign({}, SL.data.characters.test_dummy.model.jointMap, { shoulderL: 'UpperArm_R', elbowL: 'Forearm_R', handL: 'Hand_R', shoulderR: 'UpperArm_L', elbowR: 'Forearm_L', handR: 'Hand_L', kneeL: 'Foot_L', footL: 'Shin_L' });
      const mapFile = path.join(require('os').tmpdir(), 'sl_badmap_' + process.pid + '.json');
      fs.writeFileSync(mapFile, JSON.stringify(map));
      const bad = spawnSync(process.execPath, [tool, glbPath, '--json', '--map', mapFile], { encoding: 'utf8' });
      fs.unlinkSync(mapFile);
      const br = JSON.parse(bad.stdout);
      const w = br.warnings.join('\n');
      ok(/left and right swapped/.test(w), 'side swap flagged');
      ok(/footL \("Shin_L"\) is not below kneeL/.test(w), 'knee/foot order flagged');
      // not a GLB at all
      const junk = path.join(require('os').tmpdir(), 'sl_junk_' + process.pid + '.glb');
      fs.writeFileSync(junk, 'not a model');
      const jr = spawnSync(process.execPath, [tool, junk, '--json'], { encoding: 'utf8' });
      fs.unlinkSync(junk);
      eq(jr.status, 1, 'unusable file exits 1');
      ok(/magic/.test(JSON.parse(jr.stdout).errors.join(' ')), 'says why');
    });

    test('CPU mannequin fights a full CPU duel with telemetry and no engine errors; retargeting is cheap', () => {
      const b = new SL.Battle({ mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 40 },
        fighters: [{ charId: 'test_dummy', player: true, team: 0, pos: new V3(-5, 0, 0) }, { charId: 'raditz', team: 1, pos: new V3(5, 0, 0) }], onEnd: () => {} });
      b.start();
      b.fighters[0].controller = new SL.AIController(b, { difficulty: 'normal' });
      g.step(b, 60 * 20);
      const me = b.telemetry.summary().find((r) => r.id === 'test_dummy');
      ok(me && me.attacks > 5 && me.damageDealt > 0, 'it fought: ' + (me && me.attacks) + ' attacks, ' + (me && Math.round(me.damageDealt)) + ' damage');
      const m = b.fighters[0].model;
      const t0 = Date.now();
      for (let i = 0; i < 2000; i++) m.afterPose();
      const per = (Date.now() - t0) / 2000;
      ok(per < 0.5, 'retarget cost ' + per.toFixed(4) + ' ms per frame');
      b.dispose();
      ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
    });
  }

  console.log('\nBattle tick handlers (headless)');
  {
    const g = H.create({ quiet: true, seed: 23 });
    // the 2026-10-19 engine fix: battle.js rebuilt the handler list after running it, so a b.onTick / b.after
    // registered from inside a handler was silently lost (Gogeta's sphere impacts, Beerus' barrage, a barrier fade)
    test('tick handlers: one registered inside a handler (onTick or after) is kept and first runs next tick, after the others, once per tick; removed or cancelled, it stops at once; a throwing handler keeps the list intact', () => {
      const b = g.battle({ p1: 'test_dummy', p2: 'test_dummy', distance: 20 });
      const base = b.tickHandlers.length;
      const log = [];
      let t = 0, spawned = false;
      b.onTick(() => {
        t++;
        log.push('A' + t);
        if (!spawned) {
          spawned = true;
          b.onTick(() => log.push('C' + t));
          b.after(2, () => log.push('D' + t));
        }
      });
      b.onTick(() => log.push('B' + t));
      for (let i = 0; i < 4; i++) b.tick();
      eq(log.join(','), 'A1,B1,A2,B2,C2,A3,B3,C3,D3,A4,B4,C4', 'kept, in registration order, from the next tick; after() fires once');
      eq(b.tickHandlers.length, base + 3, 'the fired after() is gone, nothing duplicated');
      // removal from inside a handler: a later handler removed by an earlier one does not run that tick, or again
      const seen = [];
      let offLater = null;
      const offEarly = b.onTick(() => {
        seen.push('E');
        if (offLater) offLater();
      });
      offLater = b.onTick(() => seen.push('L'));
      const cancel = b.after(1, () => seen.push('X'));
      cancel();
      b.tick();
      b.tick();
      eq(seen.join(','), 'E,E', 'the removed handler never ran; the cancelled after() never fired');
      offEarly();
      b.tick();
      eq(seen.join(','), 'E,E', 'a handler removed between ticks does not run');
      eq(b.tickHandlers.length, base + 3, 'removed handlers leave the list');
      // a handler that throws: the ones already done are settled, the rest keep their place, nothing is lost
      const order = [];
      let boom = true;
      b.tickHandlers.length = 0;
      b.onTick(() => (order.push('once'), false));
      b.onTick(() => {
        order.push('T');
        if (boom) throw new Error('boom');
      });
      b.onTick(() => order.push('Y'));
      let threw = false;
      try {
        b.tick();
      } catch (e) {
        threw = e.message === 'boom';
      }
      boom = false;
      b.tick();
      ok(threw, 'the error still reaches the caller');
      eq(order.join(','), 'once,T,T,Y', 'after a throw: the finished one-shot gone, the thrower and the rest kept, each once a tick');
      eq(b.tickHandlers.length, 2, 'two handlers left');
      b.dispose();
    });

    test('mission tick hooks: one that removes itself (or another) no longer makes the next one skip a tick; each runs once a tick; one added meanwhile runs at once, as before', () => {
      const b = g.battle({ p1: 'test_dummy', p2: 'test_dummy', distance: 20 });
      const m = new g.SL.Mission(b, { id: 'probe', phases: [] });
      const log = [];
      const drop = (h) => {
        const i = m.tickHooks.indexOf(h);
        if (i >= 0) m.tickHooks.splice(i, 1);
      };
      const A = () => (log.push('A'), drop(A)); // gone after its first run
      const B = () => log.push('B');
      const C = () => (log.push('C'), drop(B)); // removes one that already ran
      const D = () => {
        log.push('D');
        if (!m.tickHooks.includes(E)) m.tickHooks.push(E);
      };
      const E = () => log.push('E');
      m.tickHooks.push(A, B, C, D);
      m.tick();
      eq(log.join(','), 'A,B,C,D,E', 'first tick: none skipped, none twice, the new one at once');
      log.length = 0;
      m.tick();
      eq(log.join(','), 'C,D,E', 'second tick: the removed ones gone');
      b.dispose();
    });
  }

  console.log('\nBattle rules: form level limit (headless)');
  {
    const g = H.create({ quiet: true, seed: 22 });
    const { SL } = g;
    // original mannequin fixture with a generic three-level form ("Overdrive")
    const levelUp = (rules, caps) => {
      const b = g.battle({ p1: 'test_dummy', p2: 'test_dummy', distance: 40, rules });
      const p = b.player;
      p.infiniteKi = true;
      p.infiniteHp = true;
      if (caps) p.formCaps = caps;
      p.controller = g.script(b, (n) => (n === 2 ? { transform: true } : n > 90 ? { charge: true } : {}));
      g.until(b, () => p.form.id === 'overdrive' && p.state !== 'transform', 200);
      g.step(b, 60 * 8, () => {
        p.strain = 0; // keep strain out of the way: this test is about the cap
      });
      const entry = SL.RadialMenu.buildEntries(p, b).find((e) => e.id === 'formLevel');
      const out = { level: p.formLevel, cap: p.formLevelCap(), entry };
      b.dispose();
      return out;
    };

    test('no limit: holding charge climbs to the top level', () => {
      const r = levelUp({});
      eq(r.level, 2, 'reached the third level');
      eq(r.entry, undefined, 'nothing left to show on the wheel');
    });

    test('rules.maxFormLevel stops the climb and the wheel says why', () => {
      const r0 = levelUp({ maxFormLevel: 0 });
      eq(r0.level, 0, 'first level only');
      eq(r0.entry && r0.entry.locked, 'Limited by battle rules');
      const r1 = levelUp({ maxFormLevel: 1 });
      eq(r1.level, 1, 'up to the second level');
    });

    test('a story cap below the battle rule still wins, and the wheel names the story reason', () => {
      const r = levelUp({ maxFormLevel: 2 }, { overdrive: 0 });
      eq(r.level, 0);
      eq(r.entry && r.entry.locked, 'Not mastered yet');
    });

    test('CPU stays within the limit', () => {
      const b = g.battle({ p1: 'test_dummy', p2: 'test_dummy', distance: 30, rules: { maxFormLevel: 0 } });
      const p = b.player;
      const ai = new SL.AIController(b, { difficulty: 'normal' });
      ai._init(p);
      p.applyForm(1);
      p.infiniteKi = true;
      p.controller = ai;
      g.step(b, 60 * 12, () => {
        p.strain = 0;
      });
      eq(p.formLevel, 0, 'CPU stayed at the first level');
      b.dispose();
      ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
    });
  }

  console.log('\nRadial skill menu (headless)');
  {
    const g = H.create({ quiet: true, seed: 9 });
    const { SL } = g;
    const R = SL.RadialMenu;
    const byId = (list, id) => list.find((e) => e.id === id);
    test('story restrictions show on the wheel as locked entries with the reason', () => {
      const b = g.battle({ p1: 'goku', p2: 'vegeta', distance: 20, rules: { allowUltimates: false } });
      const p = b.player;
      p.lockedSlots = { special2: true };
      p.lockedForms = { ssj: true };
      p.formCaps = { kaioken: 0 };
      let list = R.buildEntries(p, b);
      eq(byId(list, 'special2').locked, 'Not learned yet', 'Instant Transmission not learned');
      eq(byId(list, 'ultimate').locked, 'Not allowed here', 'ultimates off by the rules');
      ok(!byId(list, 'special1').locked, 'Kamehameha usable');
      p.applyForm(1);
      list = R.buildEntries(p, b);
      eq(byId(list, 'transform').locked, 'Not unlocked in the story', 'Super Saiyan locked');
      eq(byId(list, 'formLevel').locked, 'Not mastered yet', 'Kaioken capped at x2');
      ok(byId(list, 'revert') && !byId(list, 'revert').locked, 'Power Down offered');
      b.dispose();
    });
    test('the wheel shows ki cost and cooldowns, and refuses what cannot be used', () => {
      const b = g.battle({ p1: 'piccolo', p2: 'goku', distance: 12 });
      const p = b.player;
      p.ki = 10;
      let list = R.buildEntries(p, b);
      const grenade = byId(list, 'special2');
      eq(grenade.cost, 25);
      ok(!grenade.affordable, 'not enough ki shown');
      let refused = 0;
      b.on('radialRefused', () => refused++);
      eq(R.use(grenade, p, b), null);
      eq(refused, 1);
      p.ki = 100;
      p.cooldowns.special1 = 50;
      list = R.buildEntries(p, b);
      ok(byId(list, 'special1').cooldown > 0 && !R.usable(byId(list, 'special1')), 'Demon Hand recharging');
      b.dispose();
    });
    test('pointing picks the wedge in that direction (clockwise from the top)', () => {
      const entries = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
      eq(R.pick(entries, 0, 1), 0, 'up');
      eq(R.pick(entries, 1, 0), 1, 'right');
      eq(R.pick(entries, 0, -1), 2, 'down');
      eq(R.pick(entries, -1, 0), 3, 'left');
      eq(R.pick(entries, 0.1, 0.1), -1, 'dead zone');
    });
    test('holding the menu, pointing and releasing fires the technique through the real controller', () => {
      const b = g.battle({ p1: 'goku', p2: 'vegeta', distance: 24 });
      const p = b.player;
      p.controller = new SL.PlayerController(b);
      p.ki = 100;
      const list = R.buildEntries(p, b);
      const idx = list.findIndex((e) => e.id === 'special1');
      const ang = (idx / list.length) * Math.PI * 2;
      let open = true;
      SL.Input.held = (act) => act === 'skillMenu' && open;
      SL.Input.move = { x: Math.sin(ang), y: Math.cos(ang) };
      g.step(b, 6);
      ok(b.radial && b.radial.open, 'wheel open');
      eq(b.radial.entries[b.radial.selected].id, 'special1');
      ok(b.slow && b.slow.scale < 1, 'time slows while choosing');
      open = false;
      SL.Input.move = { x: 0, y: 0 };
      let charged = false;
      g.step(b, 40, () => {
        if (p.state === 'beamCharge' || p.state === 'beamFire') charged = true;
      });
      SL.Input.held = () => false;
      ok(!b.radial.open, 'wheel closed on release');
      ok(charged, 'Kamehameha came out');
      b.dispose();
    });
    test('pointing devices: stick first, then right stick, then accumulated mouse motion (flick to select, dead zone for jitter)', () => {
      const st = {};
      const none = { x: 0, y: 0 };
      let d = R.pointDirection(st, { move: none, rightStick: none, pointer: { x: 5, y: -3 } });
      eq(d.source, null, 'small mouse jitter selects nothing');
      d = R.pointDirection(st, { move: none, rightStick: none, pointer: { x: 40, y: 0 } });
      eq(d.source, 'mouse');
      ok(d.x > 0.9, 'mouse to the right points right');
      // a big move the other way overrides (vector is clamped, so it does not take forever)
      for (let i = 0; i < 3; i++) d = R.pointDirection(st, { move: none, rightStick: none, pointer: { x: -80, y: 0 } });
      ok(d.x < -0.9, 'flick back left re-selects: ' + d.x.toFixed(2));
      d = R.pointDirection(st, { move: none, rightStick: none, pointer: { x: 0, y: -200 } });
      ok(d.y > 0.9, 'mouse up (negative screen y) points up: ' + d.y.toFixed(2));
      d = R.pointDirection(st, { move: none, rightStick: { x: 0, y: -1 }, pointer: none });
      eq(d.source, 'rightStick');
      d = R.pointDirection(st, { move: { x: 1, y: 0 }, rightStick: { x: 0, y: -1 }, pointer: none });
      eq(d.source, 'stick', 'left stick wins');
    });
    test('the mouse points at the wheel through the real controller, and the camera does not turn meanwhile', () => {
      // like input.js: mouse motion piles up between polls, and poll() only runs on simulation ticks (fewer in slow motion)
      const run = (withMouse) => {
        const b = g.battle({ p1: 'test_dummy', p2: 'test_dummy', distance: 24 });
        const p = b.player;
        p.controller = new SL.PlayerController(b);
        p.ki = 100;
        const list = R.buildEntries(p, b);
        const idx = list.findIndex((e) => e.id === 'special1');
        const ang = (idx / list.length) * Math.PI * 2;
        let open = true;
        SL.Input.held = (act) => act === 'skillMenu' && open;
        SL.Input.move = { x: 0, y: 0 };
        const pending = { x: 0, y: 0 };
        const poll0 = SL.Input.poll;
        SL.Input.poll = () => {
          SL.Input.pointer = { x: pending.x, y: pending.y };
          SL.Input.look = { x: pending.x * 0.0022, y: pending.y * 0.0022 }; // what the same motion does to the camera
          pending.x = pending.y = 0;
        };
        const yaw0 = b.cameraYaw();
        g.step(b, 30, (i) => {
          if (withMouse && i < 6) {
            pending.x += Math.sin(ang) * 8;
            pending.y += -Math.cos(ang) * 8;
          }
        });
        const out = { yaw: b.cameraYaw() - yaw0, open: b.radial.open, pointer: b.radial.pointer, picked: b.radial.entries[b.radial.selected] && b.radial.entries[b.radial.selected].id };
        open = false;
        let charged = false;
        g.step(b, 40, () => {
          if (p.state === 'beamCharge' || p.state === 'beamFire') charged = true;
        });
        out.charged = charged;
        SL.Input.poll = poll0;
        SL.Input.held = () => false;
        SL.Input.pointer = { x: 0, y: 0 };
        SL.Input.look = { x: 0, y: 0 };
        b.dispose();
        return out;
      };
      const still = run(false), moved = run(true);
      ok(moved.open, 'wheel open');
      eq(moved.pointer, 'mouse');
      eq(moved.picked, 'special1', 'mouse picked the beam');
      ok(moved.charged, 'releasing used the beam');
      ok(Math.abs(moved.yaw - still.yaw) < 0.02, 'mouse motion did not turn the camera: ' + moved.yaw.toFixed(3) + ' vs ' + still.yaw.toFixed(3) + ' without it');
    });
    test('extra techniques beyond the three buttons live on the wheel: Explosive Demon Wave fires through the real controller', () => {
      const b = g.battle({ p1: 'piccolo', p2: 'goku', distance: 16 });
      const p = b.player, d = b.fighters[1];
      p.controller = new SL.PlayerController(b);
      p.ki = 100;
      const list = R.buildEntries(p, b);
      const idx = list.findIndex((e) => e.id === 'x:explosiveDemonWave');
      ok(idx >= 0, 'listed on the wheel: ' + list.map((e) => e.id).join(','));
      eq(list[idx].cost, 45);
      const ang = (idx / list.length) * Math.PI * 2;
      let open = true;
      SL.Input.held = (act) => act === 'skillMenu' && open;
      SL.Input.move = { x: Math.sin(ang), y: Math.cos(ang) };
      g.step(b, 6);
      eq(b.radial.entries[b.radial.selected].id, 'x:explosiveDemonWave');
      open = false;
      SL.Input.move = { x: 0, y: 0 };
      let beamHit = 0, special = null;
      b.on('special', (e) => e.fighter === p && (special = e));
      b.on('damage', (e) => e.attacker === p && e.type === 'beam' && beamHit++);
      g.step(b, 120);
      SL.Input.held = () => false;
      ok(special && special.slot === 'x:explosiveDemonWave', 'started from the wheel');
      ok(beamHit > 0, 'the wave hit');
      ok(p.ki <= 60, 'ki spent: ' + p.ki.toFixed(0));
      b.dispose();
    });
    test('a story lock on an extra technique shows on the wheel and blocks it; the validator checks extras', () => {
      const b = g.battle({ p1: 'piccolo', p2: 'goku', distance: 16 });
      const p = b.player;
      p.ki = 100;
      p.lockedSlots = { 'x:explosiveDemonWave': true };
      const e = R.buildEntries(p, b).find((x) => x.id === 'x:explosiveDemonWave');
      eq(e.locked, 'Not learned yet');
      eq(p._trySpecial('x:explosiveDemonWave'), false, 'refused');
      b.dispose();
      const base = SL.data.characters.piccolo;
      const dup = Object.assign({}, base, { extras: [base.extras[0], base.extras[0]] });
      ok(SL.Schema.validateCharacter(dup).some((m) => m.includes('duplicate id')), 'duplicate extras flagged');
      const bad = Object.assign({}, base, { extras: [Object.assign({}, base.extras[0], { id: 'x2', chargeMin: 99, chargeMax: 10 })] });
      ok(SL.Schema.validateCharacter(bad).some((m) => m.includes('chargeMin')), 'extra beam numbers checked');
    });
    test('CPU Piccolo answers a charging opponent at range with the Explosive Demon Wave', () => {
      const b = g.battle({ p1: 'piccolo', p2: 'goku', distance: 22, dummy: 'idle' });
      const p = b.player, d = b.fighters[1];
      p.controller = new SL.AIController(b, { difficulty: 'hard' });
      p.infiniteKi = true;
      d.infiniteHp = true;
      let waves = 0;
      b.on('special', (e) => e.fighter === p && e.slot === 'x:explosiveDemonWave' && waves++);
      g.step(b, 60 * 20, () => {
        if (d.state === 'free') d.setState('charge');
      });
      ok(waves >= 1, 'waves fired: ' + waves);
      b.dispose();
    });
    test('missions can add contextual abilities to the wheel (party switch and a team attack)', () => {
      const b = g.battle({ p1: 'piccolo', p2: 'nappa', distance: 14 });
      const p = b.player;
      let ran = false;
      b.contextActions = [{ id: 'teamAttack', label: 'Team Attack', when: () => true, run: () => (ran = true) }];
      const list = R.buildEntries(p, b);
      const team = byId(list, 'teamAttack');
      ok(team && team.context, 'context entry listed');
      R.use(team, p, b);
      ok(ran, 'context action ran');
      b.dispose();
    });
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\nParty battles (headless)');
  {
    const g = H.create({ quiet: true, seed: 11 });
    const { SL, V3 } = g;
    const makeParty = () => {
      const b = new SL.Battle({ mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { allowTransform: true, allowUltimates: true, startKi: 50 }, fighters: [
        { charId: 'krillin', player: true, team: 0, pos: new V3(0, 0, 0) }, { charId: 'piccolo', team: 0, pos: new V3(3, 0, 0) },
        { charId: 'saibaman', team: 1, pos: new V3(0, 0, 14) }, { charId: 'saibaman', team: 1, pos: new V3(5, 0, 14) }], onEnd: () => {} });
      b.start();
      g.until(b, () => b.phase === 'fight', 400);
      const [k, pc] = b.fighters;
      b.setParty([k, pc]);
      return { b, k, pc };
    };
    test('switching heroes hands the player controller over and the old hero keeps fighting as a CPU ally', () => {
      const { b, k, pc } = makeParty();
      eq(b.player, k);
      ok(pc.controller instanceof SL.AIController, 'benched hero is CPU controlled');
      ok(b.switchPlayer(b.nextPartyMember(1)), 'switch accepted');
      eq(b.player, pc);
      ok(pc.isPlayer && !k.isPlayer, 'isPlayer flags move');
      ok(pc.controller instanceof SL.PlayerController, 'new hero reads player input');
      ok(k.controller instanceof SL.AIController, 'old hero handed to the AI');
      ok(!b.switchPlayer(k), 'a short cooldown prevents instant switching back');
      g.step(b, 60);
      if (k.state !== 'free') k.setState('free');
      if (pc.state !== 'free') pc.setState('free');
      ok(b.switchPlayer(k), 'switch back after the cooldown');
      b.dispose();
    });
    test('a hero cannot be switched to while held by a Saibaman latch', () => {
      const { b, pc } = makeParty();
      pc.setState('held', { by: b.fighters[2], frames: 999 });
      ok(!b.canSwitchTo(pc));
      b.dispose();
    });
    test('when the controlled hero falls, control passes to the next living hero instead of failing', () => {
      const { b, k, pc } = makeParty();
      let down = null;
      b.on('heroDown', (e) => (down = e.fighter));
      k.cannotDie = false;
      k.invuln = 0;
      if (k.state !== 'free') k.setState('free');
      k.takeHit(b.fighters[2], { type: 'beam', damage: 1e7, knock: 'heavy', impact: 3 });
      ok(!k.alive, 'Krillin is down');
      eq(down, k);
      eq(b.player, pc, 'Piccolo takes over');
      ok(pc.isPlayer);
      b.dispose();
    });

    // boss attention: a boss fighting a party does not hunt only the hero the player controls
    const makeBossParty = () => {
      const b = new SL.Battle({ mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { allowTransform: false, allowUltimates: true, startKi: 50 }, fighters: [
        { charId: 'krillin', player: true, team: 0, pos: new V3(0, 0, 0) }, { charId: 'piccolo', team: 0, pos: new V3(6, 0, 0) },
        { charId: 'nappa', team: 1, pos: new V3(0, 0, 12), tags: { boss: true, priority: true } }], onEnd: () => {} });
      b.start();
      g.until(b, () => b.phase === 'fight', 400);
      const [k, pc, n] = b.fighters;
      b.setParty([k, pc]);
      // a passive player: the test is about where the boss looks, not about winning
      k.controller = { update: () => SL.emptyIntent() };
      n.controller = new SL.AIController(b, { difficulty: 'normal' });
      for (const f of [k, pc, n]) f.infiniteHp = true;
      n.target = k;
      return { b, k, pc, n };
    };
    test('boss attention: a boss fighting a party turns between heroes, only between attacks', () => {
      const { b, k, pc, n } = makeBossParty();
      const turns = [];
      // recorded before the turn cancels the old plan: a boss pattern (hook plan) or a started swing counts as mid-attack
      let lastPlan = null;
      b.onTick(() => {
        const pl = n.controller.plan;
        lastPlan = pl && !pl.done ? { hook: !!pl.hook, swing: pl.type === 'melee' && pl.presses > 0 } : null;
      });
      b.on('bossAttention', (e) => turns.push({ state: e.fighter.state, plan: !!(lastPlan && (lastPlan.hook || lastPlan.swing)), to: e.to }));
      let onPlayer = 0, onAlly = 0;
      g.step(b, 60 * 60, () => {
        if (n.target === k) onPlayer++;
        else if (n.target === pc) onAlly++;
      });
      ok(turns.length >= 2, 'turned ' + turns.length + ' times');
      ok(turns.some((t) => t.to === pc) && turns.some((t) => t.to === k), 'turned to the ally and back to the player');
      ok(turns.every((t) => t.state === 'free' && !t.plan), 'never turned in the middle of a move or pattern');
      const share = onPlayer / Math.max(1, onPlayer + onAlly);
      ok(share > 0.3 && share < 0.85, 'share of time on the controlled hero: ' + share.toFixed(2));
      b.dispose();
    });
    test('boss attention: a hero who hurts the boss badly draws it at once; with one hero left it never turns', () => {
      const { b, k, pc, n } = makeBossParty();
      let provoked = null;
      b.on('bossAttention', (e) => e.provoked && (provoked = e.to));
      // Piccolo keeps landing heavy blows while Nappa is on Krillin
      g.until(b, () => n.target === pc, 60 * 8, () => {
        if (b.frame % 30 === 0) b.emit('damage', { target: n, attacker: pc, amount: 1500, type: 'ki' });
      });
      eq(n.target, pc, 'Nappa turns to Piccolo');
      eq(provoked, pc, 'the turn was provoked, not the focus timer');
      b.dispose();
      const s = makeBossParty();
      s.pc.untargetable = true;
      let turned = 0;
      s.b.on('bossAttention', () => turned++);
      g.step(s.b, 60 * 20);
      eq(turned, 0, 'no second hero to turn to');
      eq(s.n.target, s.k, 'stays on the only targetable hero');
      s.b.dispose();
    });
  }

  console.log('\nGinyu Force: Recoome and the pose (headless)');
  {
    const g = H.create({ quiet: true, seed: 17 });
    const { SL } = g;

    test('Recoome is a showman, not another wall: the biggest health pool, wrestling moves, and a pose that pays him', () => {
      const rc = SL.data.characters.recoome;
      eq(SL.Schema.validateCharacter(rc).join(' | '), '', 'schema');
      ok(rc.stats.hp > SL.data.characters.dodoria.stats.hp, 'more health than Dodoria: ' + rc.stats.hp);
      eq(rc.specials.special1.type, 'rush', 'the Recoome Kick is a rush');
      eq(rc.specials.special2.type, 'beam', 'the Eraser Gun is a beam');
      ok(rc.specials.special2.fromHead, 'fired from his mouth, not his hands');
      eq(rc.boss.phases.map((p) => p.id).join(','), 'showboat,serious', 'two phases');
      ok(rc.boss.phases[0].patterns.pose > 0 && !rc.boss.phases[1].patterns.pose, 'he stops posing once he stops enjoying himself');
      const pose = rc.boss.techniques.pose;
      ok(pose.damageBuff > 1 && pose.breakDamage > 0, 'the pose carries a reward and a price: ' + JSON.stringify({ buff: pose.damageBuff, breaks: pose.breakDamage }));
    });

    test('an unpunished pose makes him hit harder for a while, then wears off', () => {
      const b = g.battle({ p1: 'krillin', p2: 'recoome', distance: 7, p1CannotDie: true, p2InfiniteHp: true });
      const r = b.fighters[1];
      r.controller = { update: () => SL.emptyIntent() };
      const spec = SL.data.characters.recoome.boss.techniques.pose;
      const events = [];
      b.on('bossPose', () => events.push('pose'));
      b.on('bossPoseDone', (e) => events.push('done:' + e.mul));
      ok(SL.Techniques.bossPose.start(r, spec), 'started');
      eq(r.state, 'bossPose', 'he is posing, not fighting');
      g.until(b, () => r.state !== 'bossPose', 60 * 4);
      g.step(b, 4);
      eq(r.damageDealtMul, spec.damageBuff, 'an unpunished pose pays him');
      g.step(b, spec.buffFrames + 40);
      eq(r.damageDealtMul, 1, 'and it wears off');
      eq(events.join(','), 'pose,done:' + spec.damageBuff, 'pose then payoff');
      b.dispose();
    });

    test('a committed punish during the pose denies the payoff', () => {
      const b = g.battle({ p1: 'krillin', p2: 'recoome', distance: 3, p1CannotDie: true, p2InfiniteHp: true });
      const r = b.fighters[1];
      r.controller = { update: () => SL.emptyIntent() };
      const spec = SL.data.characters.recoome.boss.techniques.pose;
      let paid = false;
      b.on('bossPoseDone', () => (paid = true));
      SL.Techniques.bossPose.start(r, spec);
      g.step(b, 10);
      r.takeHit(b.player, { type: 'melee', damage: spec.breakDamage + 200, knock: 'flinch', hitstun: 30, impact: 3, dir: b.player.forward.clone() });
      g.step(b, spec.frames + 60);
      ok(!paid, 'he never finished the pose');
      eq(r.damageDealtMul === undefined ? 1 : r.damageDealtMul, 1, 'and gained nothing from it');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('chipping through his armour during a pose still denies it, even when the story gives him infinite health', () => {
      const b = g.battle({ p1: 'krillin', p2: 'recoome', distance: 3, p1CannotDie: true, p2InfiniteHp: true });
      const r = b.fighters[1];
      r.controller = { update: () => SL.emptyIntent() };
      const spec = SL.data.characters.recoome.boss.techniques.pose;
      const events = [];
      b.on('bossPoseDone', (e) => events.push('done:' + e.mul));
      b.on('bossPoseBroken', (e) => events.push('broken:' + Math.round(e.taken)));
      SL.Techniques.bossPose.start(r, spec);
      g.step(b, 8);
      const hp0 = r.hp;
      const taken0 = r.stats.damageTaken || 0;
      // hits his poise shrugs off (impact 1). Armour suppresses the stagger, not the damage,
      // and mitigation eats roughly a quarter of each hit, so count what actually lands.
      let hits = 0;
      while ((r.stats.damageTaken || 0) - taken0 < spec.breakDamage && hits < 8) {
        r.takeHit(b.player, { type: 'melee', damage: 800, knock: 'flinch', hitstun: 6, impact: 1, dir: b.player.forward.clone() });
        g.step(b, 4);
        hits++;
      }
      const absorbed = (r.stats.damageTaken || 0) - taken0;
      ok(absorbed >= spec.breakDamage, 'chip damage added up past the threshold: ' + Math.round(absorbed) + ' in ' + hits + ' hits');
      g.step(b, spec.frames + 40);
      eq(r.hp, hp0, 'infiniteHp kept his health where it was, so a health check would never have fired');
      ok(events.some((e) => e.startsWith('broken:')), 'the pose was denied by damage absorbed: ' + events.join(','));
      ok(!events.some((e) => e.startsWith('done:')), 'and he never collected the payoff');
      eq(r.damageDealtMul === undefined ? 1 : r.damageDealtMul, 1, 'no buff');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('"Recoome\'s Show": a bot survives Vegeta\'s beating and holds out until Goku lands', () => {
      const gg = H.create({ quiet: true, seed: 9 });
      const r = gg.playMission('namek_recoome', { maxSeconds: 480 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'challenge,pride,show,hold,arrival', 'every phase played in order');
      ok(S.recoome.alive, 'Recoome is still standing when Goku lands (canon)');
      ok(S.krillin.alive && S.gohan.alive, 'Krillin and Gohan survive the hold');
      const doneIds = new Set(r.log.filter((x) => x.ev === 'objectives' && x.done).map((x) => x.id));
      ok(doneIds.has('pride') && doneIds.has('hold'), 'both halves resolved (done: ' + [...doneIds].join(',') + ')');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('the hold checkpoint starts with Vegeta down and the party on their feet', () => {
      const b = g.mission('namek_recoome', { startPhase: 3 });
      g.step(b, 60 * 2, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      const S = b.story;
      eq(b.mission.checkpoint, 3, 'checkpoint registered');
      eq(b.player.def.id, 'krillin', 'the player takes Krillin');
      eq((b.party || []).map((f) => f.def.id).join(','), 'krillin,kid_gohan', 'with Gohan as the second hero');
      ok(S.recoome.mech.phase === 1, 'Recoome is already past playing around');
      ok(b.fighters.every((f) => Number.isFinite(f.pos.x) && Number.isFinite(f.hp)), 'no NaN positions or health');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }

  console.log('\nGinyu Force: Guldo and stolen seconds (headless)');
  {
    const g = H.create({ quiet: true, seed: 14 });
    const { SL } = g;

    test('Guldo is a psychic mini-boss, not a bruiser: weak fists, huge ki, time freeze and telekinesis', () => {
      const gd = SL.data.characters.guldo;
      eq(SL.Schema.validateCharacter(gd).join(' | '), '', 'schema');
      eq(gd.specials.special1.type, 'timeFreeze', 'special1 is the freeze');
      eq(gd.specials.special2.type, 'telekinesis', 'special2 is the psychic grip');
      ok(gd.stats.ki > SL.data.characters.dodoria.stats.ki, 'more ki than the bruiser: ' + gd.stats.ki);
      ok(gd.stats.hp < SL.data.characters.dodoria.stats.hp * 0.6, 'and far less health: ' + gd.stats.hp);
      ok(gd.moves.light[0].damage < 260, 'his fists barely matter: ' + gd.moves.light[0].damage);
      eq(gd.boss.phases.map((p) => p.id).join(','), 'smug,panicking', 'two phases');
      ok(gd.boss.phases[1].patterns.freeze > gd.boss.phases[0].patterns.freeze, 'he freezes more once he panics');
    });

    test('time freeze stops everyone in range, then leaves him gasping and open', () => {
      const b = g.battle({ p1: 'krillin', p2: 'guldo', distance: 8, p1CannotDie: true, p2InfiniteHp: true });
      const k = b.player, z = b.fighters[1];
      z.controller = { update: () => SL.emptyIntent() };
      const spec = SL.data.characters.guldo.specials.special1;
      const events = [];
      b.on('timeFreeze', (e) => events.push('freeze:' + e.victims));
      b.on('timeUnfreeze', () => events.push('unfreeze'));
      const startFrame = b.frame;
      ok(SL.Techniques.timeFreeze.start(z, spec, 'special1', spec.kiCost), 'started');
      g.step(b, 20);
      eq(k.state, 'held', 'the victim cannot act while time is stopped');
      eq(z.state, 'timeFreeze', 'and Guldo is holding his breath');
      const kiAtFreeze = z.ki;
      g.step(b, 60);
      ok(z.ki < kiAtFreeze, 'holding it costs him ki: ' + kiAtFreeze.toFixed(0) + ' → ' + z.ki.toFixed(0));
      // measure the whole window from the start, not what is left after stepping into it
      g.until(b, () => z.state !== 'timeFreeze', 60 * 6);
      const window = b.frame - startFrame;
      ok(window > 60 && window < 200, 'the window is short but real: ' + window + ' frames');
      eq(z.state, 'stagger', 'he is wide open the moment time restarts');
      eq(k.state, 'free', 'and everyone else can move again');
      eq(events.join(','), 'freeze:1,unfreeze', 'one freeze, one release');
      b.dispose();
    });

    test('a frozen fighter genuinely cannot act, and the freeze ends on its own with no leftovers', () => {
      const b = g.battle({ p1: 'krillin', p2: 'guldo', distance: 6, p1CannotDie: true, p2InfiniteHp: true });
      const k = b.player, z = b.fighters[1];
      z.controller = { update: () => SL.emptyIntent() };
      const spec = SL.data.characters.guldo.specials.special1;
      SL.Techniques.timeFreeze.start(z, spec, 'special1', spec.kiCost);
      g.step(b, 20);
      const before = k.pos.clone();
      // the player mashes everything while frozen
      k.controller = { update: () => Object.assign(SL.emptyIntent(), { light: true, heavy: true, my: 1, boost: true }) };
      g.step(b, 50);
      eq(k.state, 'held', 'still frozen despite mashing');
      ok(k.pos.distanceTo(before) < 0.5, 'and did not move: ' + k.pos.distanceTo(before).toFixed(2) + ' m');
      g.until(b, () => z.state !== 'timeFreeze', 60 * 6);
      g.step(b, 30);
      ok(['free', 'attack', 'dash', 'knockback', 'hitstun'].includes(k.state), 'released cleanly, now acting: ' + k.state);
      ok(b.fighters.every((f) => f.state !== 'held'), 'nobody is left stuck in the hold');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('"Five Seconds": a bot clears the Ginyu Force landing and Guldo falls to Vegeta', () => {
      const gg = H.create({ quiet: true, seed: 7 });
      const r = gg.playMission('namek_guldo', { maxSeconds: 420 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'arrival,guldo,breath,after', 'every phase played in order');
      ok(!S.guldo.alive, 'Guldo does not survive the last gasp');
      ok(S.krillin.alive && S.gohan.alive, 'both Earthlings live');
      const doneIds = new Set(r.log.filter((x) => x.ev === 'objectives' && x.done).map((x) => x.id));
      ok(doneIds.has('guldo'), 'the fight objective completed (done: ' + [...doneIds].join(',') + ')');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });
  }

  console.log('\nNamek: the Grand Elder (headless)');
  {
    const g = H.create({ quiet: true, seed: 8 });
    const { SL } = g;

    test('Guru is a story-only elder, and Krillin carries a story-locked potential form', () => {
      const guru = SL.data.characters.guru;
      ok(guru && !guru.playable && guru.cinematicOnly, 'Guru is a story character');
      eq(SL.Schema.validateCharacter(guru).join(' | '), '', 'Guru schema');
      ok(guru.appearance.height > 1.6, 'he is enormous next to everyone else: ' + guru.appearance.height);
      const k = SL.data.characters.krillin;
      eq(k.forms.map((f) => f.id).join(','), 'base,potential', 'Krillin forms');
      const pot = k.forms[1];
      ok(pot.kiCost > 0 && pot.mult.damage > 1.2 && pot.mult.speed > 1, 'a real upgrade, not a recolour: ' + JSON.stringify(pot.mult));
      const order = SL.data.storyOrder();
      eq(order.indexOf('namek_guru'), order.indexOf('namek_rematch') + 1, 'story order: ' + order.slice(-4).join(' → '));
    });

    test('the potential stays shut until Guru opens it', () => {
      const hb = g.mission('namek_hunted', {});
      ok(hb.story.krillin.lockedForms && hb.story.krillin.lockedForms.potential, 'locked in "The Hunted"');
      hb.dispose();
      const b = g.mission('namek_guru', {});
      const k = b.story.krillin;
      ok(k.lockedForms && k.lockedForms.potential, 'and locked when the Guru mission starts');
      // teach() is the story's own unlock path (form:<id>)
      b.mission.teach(k, 'form:potential');
      ok(!(k.lockedForms && k.lockedForms.potential), 'teach("form:potential") opens it');
      ok(!(k.lockedSlots && k.lockedSlots.transform), 'and stops the transform button being story-locked');
      b.dispose();
    });

    test('"The Eldest Namekian": a bot holds the plateau, Guru unlocks the potential, and it is used on the elite', () => {
      const gg = H.create({ quiet: true, seed: 6 });
      const r = gg.playMission('namek_guru', { maxSeconds: 420 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'climb,patrol,awakening,warning', 'every phase played in order');
      ok(r.log.some((x) => x.ev === 'skillLearned' && x.key === 'form:potential'), 'the unlock went through the story teach path');
      ok(!(S.krillin.lockedForms && S.krillin.lockedForms.potential), 'the form is open afterwards');
      ok(S.guru.alive && S.dende.alive, 'Guru and Dende survive');
      const doneIds = new Set(r.log.filter((x) => x.ev === 'objectives' && x.done).map((x) => x.id));
      ok(doneIds.has('patrol') && doneIds.has('elite'), 'both fights resolved (done: ' + [...doneIds].join(',') + ')');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('the plateau checkpoint starts cleanly with Guru in place', () => {
      const b = g.mission('namek_guru', { startPhase: 1 });
      g.step(b, 60 * 2, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      const S = b.story;
      eq(b.mission.checkpoint, 1, 'checkpoint registered');
      ok(S.guru && !S.guru.hidden, 'Guru is on the plateau');
      ok(S.wave.length === 3, 'the search party spawned: ' + S.wave.length);
      ok(b.fighters.every((f) => Number.isFinite(f.pos.x) && Number.isFinite(f.hp)), 'no NaN positions or health');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }

  console.log('\nZarbon: two forms, one fight (headless)');
  {
    const g = H.create({ quiet: true, seed: 12 });
    const { SL } = g;
    const BASE = ['elegantBlast', 'mirageStep', 'sweepingWave'];
    const BEAST = ['beastPounce', 'beastQuake', 'monsterWave'];

    test('Zarbon is a two-form boss whose forms differ in moves, specials, body and numbers', () => {
      const z = SL.data.characters.zarbon;
      eq(SL.Schema.validateCharacter(z).join(' | '), '', 'schema');
      eq(z.forms.map((f) => f.id).join(','), 'base,monster', 'forms');
      const mon = z.forms[1];
      ok(mon.moves && mon.specials && mon.sequence, 'the monstrous form brings its own moves, specials and transformation sequence');
      ok(mon.look.bulk > 1.2 && mon.look.hair.style !== z.appearance.hair.style, 'different silhouette: ' + mon.look.bulk + ', hair ' + mon.look.hair.style);
      ok(mon.mult.damage > 1.3 && mon.mult.speed < 1 && mon.mult.defense > 1.2, 'heavier, slower, tougher: ' + JSON.stringify(mon.mult));
      // the two kits share slots but not techniques
      eq(Object.keys(z.specials).map((k) => z.specials[k].id).join(','), BASE.join(','), 'normal kit');
      eq(Object.keys(mon.specials).map((k) => mon.specials[k].id).join(','), BEAST.join(','), 'monstrous kit');
      ok(z.boss.phases.length === 2 && z.boss.phases[1].enter === 'morph', 'a phase entry that transforms him');
      ok(z.poise.max < SL.data.characters.dodoria.poise.max, 'less armored than Dodoria (he evades instead): ' + z.poise.max);
    });

    test('a form can replace the whole moveset: the fighter and the AI both read the active form', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'zarbon', dummy: 'idle', distance: 6 });
      const z = b.fighters[1];
      eq(z.moveSet.light[0].id, 'zbJab', 'normal light chain');
      eq(z.specFor('special1').id, 'elegantBlast', 'normal special1');
      eq(z.specials().special2.type, 'teleport', 'normal special2 is the evasive one');
      z.applyForm(1);
      eq(z.moveSet.light[0].id, 'zbBeastHook', 'monstrous light chain');
      eq(z.moveSet.throw.id, 'zbBeastCrusher', 'monstrous throw');
      eq(z.specFor('special1').id, 'beastPounce', 'monstrous special1');
      eq(z.specials().special2.type, 'groundSlam', 'monstrous special2 is a quake, not a blink');
      eq(z.model.formScale, 1.34, 'body scaled up');
      b.dispose();
    });

    test('the transformation is a real event: the sequence plays, control returns, and it cannot fire twice', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'zarbon', dummy: 'idle', distance: 8 });
      const z = b.fighters[1];
      const events = [];
      b.on('transformStart', (e) => events.push(e.fighter.def.id + (e.boss ? ':boss' : '')));
      const spec = { type: 'bossTransform', frames: 150, form: 1 };
      ok(SL.Techniques.bossTransform.start(z, spec), 'started');
      eq(z.state, 'transform', 'enters the engine transform state');
      const again = SL.Techniques.bossTransform.start(z, spec);
      eq(again, false, 'cannot be started twice');
      const frames = g.until(b, () => z.state !== 'transform', 60 * 8);
      ok(frames > 60, 'it takes real time, not a snap: ' + frames + ' frames');
      eq(z.formIndex, 1, 'ends in the monstrous form');
      eq(z.state, 'free', 'control returns (no softlock)');
      eq(events.join(','), 'zarbon:boss', 'one transform event');
      b.dispose();
    });

    test('the boss never uses the other form\'s abilities', () => {
      const check = (formIndex, allowed, forbidden) => {
        // H.battle always spawns an idle dummy (dummy: o.dummy || 'idle'), and an idle
        // dummy never attacks — give the boss a real AI so it actually picks techniques
        const b = g.battle({ p1: 'vegeta', p2: 'zarbon', distance: 7, p1CannotDie: true, p2InfiniteHp: true });
        const z = b.fighters[1];
        z.controller = new SL.AIController(b, { difficulty: 'normal' });
        z.applyForm(formIndex);
        z.mech.phase = formIndex;
        z.bossPhaseCap = formIndex;
        const used = new Set();
        b.on('special', (e) => {
          if (e.fighter === z) used.add(e.spec.id);
        });
        // teleports return before the 'special' event, so sample what he is actually running too
        g.step(b, 60 * 40, () => {
          if (z.sd && z.sd.spec && z.sd.spec.id) used.add(z.sd.spec.id);
        });
        b.dispose();
        const bad = [...used].filter((id) => forbidden.includes(id));
        ok(bad.length === 0, 'form ' + formIndex + ' used ' + [...used].join(',') + ' — forbidden: ' + bad.join(','));
        return used;
      };
      const normal = check(0, BASE, BEAST);
      const monster = check(1, BEAST, BASE);
      ok(normal.size + monster.size > 0, 'the boss actually used techniques (' + [...normal].join(',') + ' | ' + [...monster].join(',') + ')');
    });

    test('"The Beautiful Monster": a bot plays it through the duel, the transformation and the survival half', () => {
      const results = (id) => SL.Save.missionResult(id);
      ok(SL.data.storyLocked('namek_zarbon', results), 'locked before "A Prince on Namek" is cleared');
      // its own context: a bot playthrough must not depend on which tests ran before it. The duel is a close
      // damage race and the bot wins it on about two seeds in three (measured 2026-09-18), so a shared random
      // stream shifted by unrelated code can flip it
      const g = H.create({ quiet: true, seed: 5 });
      const r = g.playMission('namek_zarbon', { maxSeconds: 480 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'arrival,duel,change,monster,aftermath', 'every phase played in order');
      eq(S.zarbon.formIndex, 1, 'he ends the mission transformed');
      eq(S.zarbon.mech.phase, 1, 'and in his monstrous boss phase');
      ok(S.vegeta.alive, 'Vegeta lives (beaten, not killed — canon)');
      const doneIds = new Set(r.log.filter((x) => x.ev === 'objectives' && x.done).map((x) => x.id));
      ok(doneIds.has('duel'), 'the duel objective completed (done: ' + [...doneIds].join(',') + ')');
      ok(doneIds.has('survive'), 'the survival objective completed');
      ok(g.SL.Save.missionResult('namek_zarbon') && g.SL.Save.missionResult('namek_zarbon').completed, 'recorded as cleared');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('"The Prince Repaid" reverses the fight: Zarbon opens as the monster, the Zenkai answers, and he dies begging in his elegant form', () => {
      // its own context: a bot playthrough must not depend on which tests ran before it
      const gr = H.create({ quiet: true, seed: 5 });
      const SLr = gr.SL;
      const order = SLr.data.storyOrder();
      // assert the relationship, not the tail: Namek keeps growing behind these missions
      eq(order.indexOf('namek_rematch'), order.indexOf('namek_zarbon') + 1, 'the rematch follows the loss: ' + order.slice(-4).join(' → '));
      const g = gr;
      const r = g.playMission('namek_rematch', { maxSeconds: 420 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'wake,rematch,beg,end', 'every phase played in order');
      ok(S.vegeta.damageDealtMul > 1.2, 'the Zenkai is a real multiplier: ' + S.vegeta.damageDealtMul);
      eq(S.zarbon.formIndex, 0, 'he is beaten back out of the monstrous form before the end');
      ok(!S.zarbon.alive, 'and does not survive this one');
      const doneIds = new Set(r.log.filter((x) => x.ev === 'objectives' && x.done).map((x) => x.id));
      ok(doneIds.has('rematch'), 'the rematch objective completed (done: ' + [...doneIds].join(',') + ')');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('replaying from the monster checkpoint starts already transformed and finishes again', () => {
      const b = g.mission('namek_zarbon', { startPhase: 3 });
      const m = b.mission;
      const S = b.story;
      g.step(b, 60, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.zarbon.formIndex, 1, 'the monster is already standing there');
      eq(m.checkpoint, 3, 'checkpoint registered');
      ok(!S.zarbon.hidden && !S.zarbon.untargetable, 'and is a real opponent');
      const frames = g.until(b, () => m.state !== 'running', 60 * 200, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      ok(frames >= 0 && m.state === 'success', 'completes from the checkpoint (' + m.state + ')');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }

  console.log('\nNamek: "The Hunted" (headless)');
  {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;

    test('The Hunted is wired into Chapter 4 before "A Prince on Namek", with valid story-only Namekians', () => {
      const order = SL.data.storyOrder();
      const iH = order.indexOf('namek_hunted'), iV = order.indexOf('namek_vegeta');
      ok(iH > 0 && iV === iH + 1, 'order: ' + order.slice(-3).join(' → '));
      for (const id of ['dende', 'namekian_elder']) {
        const def = SL.data.characters[id];
        ok(def && !def.playable && def.cinematicOnly, id + ' is a story-only character');
        eq(SL.Schema.validateCharacter(def).join(' | '), '', id + ' schema');
      }
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_hunted', results([])), 'locked before the Saiyan Saga is cleared');
      ok(!SL.data.storyLocked('namek_hunted', results(['saiyan_vegeta'])), 'opens after "The Saiyan Prince"');
      ok(SL.data.storyLocked('namek_vegeta', results(['saiyan_vegeta'])), 'Vegeta on Namek now waits for The Hunted');
      ok(!SL.data.storyLocked('namek_vegeta', results(['saiyan_vegeta', 'namek_hunted'])), 'and opens after it');
    });

    test('a bot plays The Hunted start to finish: the soldiers fall, three shelters are reached, Dodoria is held off and Dende is never hit', () => {
      const r = g.playMission('namek_hunted', { maxSeconds: 420 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'village,flight,cornered,getaway', 'every phase played');
      // later phases clear the objective list, so read what the run log recorded
      const doneIds = new Set(r.log.filter((x) => x.ev === 'objectives' && x.done).map((x) => x.id));
      ok(doneIds.has('cover'), 'three shelters reached (done: ' + [...doneIds].join(',') + ')');
      ok(doneIds.has('hold'), "Dodoria's guard broken and Gohan's Masenko landed twice (done: " + [...doneIds].join(',') + ')');
      ok(S.dende.alive, 'Dende survives');
      ok(!S.elder.alive, 'the elder falls in the opening (story)');
      ok(S.dodoria.alive, 'Dodoria escapes to meet Vegeta in the next mission');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }

  console.log('\nPrologue ending cinematic (headless)');
  {
    const ORDER = ['defeat', 'attack', 'realize', 'visionStart', 'visionEnd', 'smile', 'armorBreak', 'blownAway', 'consumed', 'planetImpact', 'planetDestroyed', 'transition', 'end'];
    const watch = (b) => {
      const log = [], beats = [];
      b.on('missionPhase', (e) => log.push('phase:' + e.phase.id));
      b.on('cinematicBeat', (e) => {
        log.push(e.id);
        beats.push(e);
      });
      b.on('missionFailed', () => log.push('FAILED'));
      b.on('finishKO', () => log.push('KO'));
      return { log, beats };
    };

    test('the ending follows a lost struggle: defeat, Frieza\'s attack, realization, vision and return, smile, consumed, planet destroyed, the pod to Earth; then the story moves on', () => {
      const g = H.create({ quiet: true, seed: 5 });
      const { SL } = g;
      const results = (id) => SL.Save.missionResult(id);
      ok(SL.data.storyLocked('saiyan_brothers', results), 'Chapter 1 is locked before the prologue is cleared');
      const b = g.mission('prologue_final_stand', { startPhase: 5 });
      const m = b.mission;
      const { log, beats } = watch(b);
      const at = (id) => beats.find((x) => x.id === id);
      let novaModeAtEnding = null;
      b.on('missionPhase', (e) => {
        if (e.phase.id === 'ending') novaModeAtEnding = m.novaMode;
      });
      const seen = {};
      const frames = g.until(b, () => m.state !== 'running', 60 * 240, () => {
        // only the Frieza phase's own dialogue is skipped; the ending plays in full
        if (m.def.phases[m.phaseIndex] && m.def.phases[m.phaseIndex].id === 'frieza' && b.inputLocked) b.skipRequested = true;
        const ctx = m.endingCtx;
        if (!ctx || !beats.length) return;
        const last = beats[beats.length - 1].id, since = ctx.time - beats[beats.length - 1].time;
        const p = b.player, st = b.stage;
        const vision = b.fighters.filter((f) => f.tags && f.tags.vision);
        if (last === 'defeat' && since > 3 && !seen.defeat) seen.defeat = { pose: p.sd.pose, face: p.sd.expression, alive: p.alive, hidden: p.hidden };
        if (last === 'attack' && since > 8.5 && !seen.attack) seen.attack = { r: ctx.novaR, light: ctx.nova.light.intensity, mood: st.mood.target, music: m.musicLevel };
        if (last === 'visionStart' && since > 2 && !seen.vision) seen.vision = { actors: vision.map((f) => f.def.id + ':' + f.formIndex), planet: st.planet.visible, hidden: p.hidden, inVision: ctx.inVision };
        if (last === 'visionEnd' && !seen.back) seen.back = { actors: vision.length, planet: st.planet.visible, stars: st.stars.visible, hidden: p.hidden, inVision: ctx.inVision, light: !!ctx.visionLight, mood: st.mood.target };
        if (last === 'smile' && p.sd.expression === 'soft' && !seen.smile) seen.smile = p.sd.pose;
        if (last === 'consumed' && !seen.consumed) seen.consumed = { dist: ctx.nova.pos.distanceTo(p.chest()), r: ctx.novaR };
        if (last === 'consumed' && since > 1 && seen.gone === undefined) seen.gone = p.hidden;
        if (last === 'planetDestroyed' && !seen.destroyed) seen.destroyed = { planet: st.planet.visible, atmo: st.atmo.visible, nova: ctx.nova.done };
      });
      ok(frames >= 0, 'finished within the frame budget (no softlock)');
      eq(m.state, 'success', 'mission state');
      eq(beats.map((x) => x.id).join(','), ORDER.join(','), 'every beat, in order');
      eq(novaModeAtEnding, 'hit', 'the ending starts only once the Supernova has won the struggle');
      ok(log.indexOf('phase:ending') >= 0 && log.indexOf('phase:ending') < log.indexOf('defeat'), 'the first beat belongs to the ending phase: ' + log.join(' '));
      ok(!log.includes('FAILED') && !log.includes('KO'), 'no generic defeat or KO flow');
      ok(seen.defeat && seen.defeat.pose === 'b_beaten' && seen.defeat.face === 'hurt' && seen.defeat.alive && !seen.defeat.hidden, 'defeat: hurt and barely floating: ' + JSON.stringify(seen.defeat));
      // music must climb through the mission's own level (the battle re-applies mission.musicLevel every frame)
      ok(seen.attack && seen.attack.r > 55 && seen.attack.light > 1.2 && seen.attack.mood > 0.4 && seen.attack.music === 3, 'attack: the Supernova grows huge, lights a darkened scene and the music climbs: ' + JSON.stringify(seen.attack));
      const T = (id) => at(id).time;
      ok(T('realize') - T('attack') >= 8, 'the attack builds up: ' + (T('realize') - T('attack')).toFixed(1) + ' s');
      ok(T('visionStart') - T('realize') >= 6, 'the realization is not rushed: ' + (T('visionStart') - T('realize')).toFixed(1) + ' s');
      const vd = T('visionEnd') - T('visionStart');
      ok(vd >= 6 && vd <= 14, 'the vision is a short run of flashes: ' + vd.toFixed(1) + ' s');
      ok(T('consumed') - T('smile') >= 6, 'the smile gets its moment: ' + (T('consumed') - T('smile')).toFixed(1) + ' s');
      ok(T('end') >= 60, 'whole ending ' + T('end').toFixed(1) + ' s');
      ok(seen.vision && seen.vision.actors.includes('goku:2') && seen.vision.actors.some((a) => a.startsWith('frieza')), 'vision: Super Saiyan Goku and Frieza: ' + JSON.stringify(seen.vision));
      ok(seen.vision.inVision && !seen.vision.planet && seen.vision.hidden, 'vision: the real scene is hidden');
      ok(seen.back && seen.back.actors === 0 && seen.back.planet && seen.back.stars && !seen.back.hidden && !seen.back.inVision && !seen.back.light && seen.back.mood > 0.4 && seen.back.mood < 0.7, 'return to the real scene: ' + JSON.stringify(seen.back));
      eq(seen.smile, 'b_smile', 'the quiet smile: pose and soft face');
      ok(seen.consumed && seen.consumed.dist < seen.consumed.r, 'the sphere reaches Bardock: ' + JSON.stringify(seen.consumed));
      eq(seen.gone, true, 'Bardock is gone after the sphere');
      ok(seen.destroyed && !seen.destroyed.planet && !seen.destroyed.atmo && seen.destroyed.nova, 'Planet Vegeta destroyed: ' + JSON.stringify(seen.destroyed));
      const ctx = m.endingCtx;
      ok(ctx.finished && ctx.extras.length === 0 && ctx.loops.length === 0 && m.tickHooks.indexOf(ctx.hook) < 0, 'cinematic cleaned up');
      eq(m.flags.endingSkipped, undefined, 'not skipped');
      ok(b.__ended && b.__ended.success, 'result delivered');
      ok(results('prologue_final_stand') && results('prologue_final_stand').completed, 'prologue recorded as cleared');
      ok(!SL.data.storyLocked('saiyan_brothers', results), 'story progression: Chapter 1 opens');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('skipping at any beat of the ending jumps to a clean end state: mission completes, vision and effects removed, scenery restored', () => {
      const g = H.create({ quiet: true, seed: 6 });
      for (const when of ['defeat', 'attack', 'realize', 'visionStart', 'smile', 'consumed', 'planetImpact', 'transition']) {
        // starting at the ending phase plays its first beat inside mission start, so follow the mission's own beat log
        const b = g.mission('prologue_final_stand', { startPhase: 6 });
        const m = b.mission;
        let skippedAt = -1, seenLen = 0, beatTime = 0;
        const frames = g.until(b, () => m.state !== 'running', 60 * 150, () => {
          const ctx = m.endingCtx, list = m.flags.endingBeats || [];
          if (!ctx) return;
          if (list.length !== seenLen) (seenLen = list.length), (beatTime = ctx.time);
          if (skippedAt < 0 && list[list.length - 1] === when && ctx.time - beatTime > (when === 'defeat' ? 1.7 : 1)) {
            skippedAt = list.length;
            b.skipRequested = true;
          }
        });
        const ctx = m.endingCtx;
        ok(frames >= 0 && m.state === 'success', when + ': completes (' + m.state + ')');
        eq(m.flags.endingSkipped, when, when + ': skip recorded at that beat');
        eq(m.flags.endingBeats.length, skippedAt, when + ': no beat plays after the skip');
        ok(!b.fighters.some((f) => f.tags && f.tags.vision), when + ': no vision actors left');
        ok(ctx.finished && !ctx.inVision && !ctx.visionLight && ctx.extras.length === 0 && ctx.loops.length === 0, when + ': effects cleaned');
        ok(b.player.hidden && !b.stage.planet.visible && ctx.nova.done, when + ': end state (Bardock and the planet are gone)');
        ok(b.stage.stars.visible && b.stage.ship.visible, when + ': scenery hidden by the vision is back');
        b.dispose();
      }
      // a press left over from mashing the struggle does not skip the opening of the ending
      const b = g.mission('prologue_final_stand', { startPhase: 6 });
      g.step(b, 30, () => {
        b.skipRequested = true;
      });
      g.step(b, 90);
      eq(b.mission.flags.endingSkipped, undefined, 'early skip press ignored');
      ok(b.mission.state === 'running' && b.mission.endingCtx.time > 1.9, 'the ending keeps playing');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('replay: the Frieza checkpoint twice with every cutscene skipped (bot behaviour) completes both times; unlocks once, other story records untouched', () => {
      const g = H.create({ quiet: true, seed: 7 });
      const { SL } = g;
      SL.Save.completeMission('saiyan_brothers', { score: 5100, rank: 'B' });
      const other = JSON.stringify(SL.Save.data.story.missions.saiyan_brothers);
      const run = (retries) => {
        const b = g.mission('prologue_final_stand', { startPhase: 5 });
        b.mission.retries = retries;
        const phases = [];
        b.on('missionPhase', (e) => phases.push(e.phase.id));
        const frames = g.until(b, () => b.mission.state !== 'running', 60 * 120, () => {
          if (b.inputLocked) b.skipRequested = true;
        });
        return { b, frames, phases };
      };
      const r1 = run(0);
      ok(r1.frames >= 0 && r1.b.mission.state === 'success', 'first clear: ' + r1.b.mission.state);
      // the Frieza phase starts inside mission start (before listeners attach); the checkpoint proves where it resumed
      eq(r1.b.mission.checkpoint, 5, 'resumed at the Frieza checkpoint');
      eq(r1.phases.join(','), 'ending', 'then the ending phase');
      ok(r1.b.__ended.unlocked && r1.b.__ended.unlocked.length > 0, 'first clear unlocks the rewards');
      ok(r1.b.mission.flags.endingSkipped, 'the ending was skipped');
      r1.b.dispose();
      const r2 = run(1);
      ok(r2.frames >= 0 && r2.b.mission.state === 'success', 'replay clear: ' + r2.b.mission.state);
      eq(r2.b.__ended.unlocked.length, 0, 'nothing unlocks twice');
      eq(SL.Save.data.story.missions.prologue_final_stand.clears, 2, 'clears counted');
      eq(JSON.stringify(SL.Save.data.story.missions.saiyan_brothers), other, 'other story records untouched');
      r2.b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }

  console.log('\nRegression sweep: every mission, every checkpoint (headless)');
  {
    const g = H.create({ quiet: true, seed: 21 });
    const { SL } = g;
    for (const [id, def] of Object.entries(SL.data.missions)) {
      const starts = [0, ...def.phases.map((p, i) => (p.checkpoint ? i : -1)).filter((i) => i > 0)];
      test(id + ': starts cleanly from the beginning and from every checkpoint (' + starts.join(', ') + ')', () => {
        for (const sp of starts) {
          const e0 = g.errors.length;
          const b = g.mission(id, { startPhase: sp });
          ok(b.player && b.player.alive, id + '@' + sp + ': a controllable player exists');
          g.step(b, 60 * 4, () => {
            if (b.inputLocked) b.skipRequested = true;
          });
          eq(g.errors.length, e0, id + '@' + sp + ' engine errors: ' + g.errors.slice(e0, e0 + 2).join(' | '));
          ok(b.mission.phaseIndex >= sp, id + '@' + sp + ': resumed at or after the checkpoint (now ' + b.mission.phaseIndex + ')');
          ok(['running', 'success', 'failed'].includes(b.mission.state), id + '@' + sp + ' state ' + b.mission.state);
          ok(b.fighters.every((x) => Number.isFinite(x.pos.x) && Number.isFinite(x.pos.y) && Number.isFinite(x.hp)), id + '@' + sp + ': no NaN positions or health');
          b.dispose();
        }
      });
    }

    test('failing reports the last checkpoint reached; retrying from it resumes there and counts the retry', () => {
      const id = 'saiyan_nappa';
      const def = SL.data.missions[id];
      const cp = def.phases.findIndex((p, i) => i > 1 && p.checkpoint);
      const b = g.mission(id, { startPhase: cp });
      g.step(b, 60);
      eq(b.mission.checkpoint, cp, 'checkpoint registered on start');
      b.mission.fail('regression test');
      eq(b.mission.state, 'failed');
      ok(b.inputLocked, 'input locked after failure');
      g.step(b, 60 * 3);
      ok(b.__ended && b.__ended.failed, 'end report delivered');
      eq(b.__ended.checkpoint, cp, 'report names the checkpoint');
      b.dispose();
      // the retry button builds the mission exactly like this (SL.App.startMission with startPhase + retries)
      const b2 = new SL.Battle({ mode: 'story', missionId: id, stageId: def.stage, rules: Object.assign({ allowTransform: true, allowUltimates: true, startKi: 40 }, SL.Mission.rulesFor('normal'), def.rules || {}), fighters: [], onEnd: () => {} });
      def.setup(b2, cp);
      new SL.Mission(b2, def, { startPhase: cp, retries: 1 });
      b2.start();
      g.step(b2, 30);
      eq(b2.mission.phaseIndex >= cp, true, 'retry resumes at the checkpoint');
      eq(b2.mission.retries, 1, 'retry counted');
      ok(b2.mission.computeScore() <= g.mission(id, { startPhase: cp }).mission.computeScore(), 'a retry never scores higher than a first attempt');
      b2.dispose();
    });

    test('a mission started from the first phase reaches its first checkpoint and a failure after it reports that checkpoint', () => {
      const id = 'saiyan_kingkai';
      const def = SL.data.missions[id];
      const first = def.phases.findIndex((p) => p.checkpoint);
      const b = g.mission(id, {});
      g.until(b, () => b.mission.phaseIndex >= first, 60 * 60, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      ok(b.mission.phaseIndex >= first, 'reached phase ' + b.mission.phaseIndex);
      b.mission.fail('regression test');
      g.step(b, 60 * 3);
      eq(b.__ended && b.__ended.checkpoint, first);
      b.dispose();
    });
    ok(g.errors.length === 0, 'engine errors: ' + g.errors.slice(0, 3).join(' | '));
  }

  console.log('\nStory missions played by bots (headless)');
  {
    test('Chapter 2 "Alone in the Wild" can be completed with player inputs; rewards unlock', () => {
      const g = H.create({ quiet: true, seed: 11 });
      const r = g.playMission('saiyan_survival', { maxSeconds: 400 });
      eq(r.state, 'success', 'mission state');
      const learned = r.log.filter((x) => x.ev === 'skillLearned').map((x) => x.key);
      ['guard', 'dodge', 'heavy', 'flight', 'special1'].forEach((k) => ok(learned.includes(k), 'learned ' + k));
      const ids = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      ok(ids.includes('moon'), 'the full-moon night plays: ' + ids.join(','));
      ok(r.log.some((x) => x.ev === 'switch' && x.to === 'piccolo'), 'Piccolo takes over while Gohan is a Great Ape');
      ok(r.log.some((x) => x.ev === 'moonDestroyed'), 'Piccolo blasts the moon');
      ok(r.log.some((x) => x.ev === 'switch' && x.to === 'kid_gohan'), 'control returns to Gohan');
      ok(g.SL.Save.isUnlocked('characters', 'kid_gohan'), 'Kid Gohan unlocked');
      ok(g.SL.Save.isUnlocked('stages', 'wilderness'), 'Wilderness unlocked');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Chase: sprinting blindly gets Gohan caught; pacing the sprint escapes clean', () => {
      const outcomes = [false, true].map((naive) => {
        const g = H.create({ quiet: true, seed: 11 });
        const brains = require('../tools/mission_brains');
        const b = g.mission('saiyan_survival', { startPhase: 3 });
        const run = brains.attach(g.SL, b, 'saiyan_survival', {});
        run.st.naiveSprint = naive;
        g.SL.Input.pressed = (a) => !!(b.mission.struggling && a === 'light' && b.frame % 3 === 0);
        g.until(b, () => b.mission.phaseIndex > 3 || b.mission.state !== 'running', 60 * 120, () => {
          if (b.inputLocked) b.skipRequested = true;
        });
        const clean = run.log.some((x) => x.ev === 'objectives' && x.id === 'unbitten' && x.done);
        return { escaped: b.mission.phaseIndex > 3, bitten: run.log.some((x) => x.ev === 'creatureBite'), clean };
      });
      ok(outcomes[0].escaped && outcomes[0].clean && !outcomes[0].bitten, 'paced run: ' + JSON.stringify(outcomes[0]));
      ok(outcomes[1].escaped && outcomes[1].bitten, 'blind sprint: ' + JSON.stringify(outcomes[1]));
    });

    test('Chapter 2 "Snake Way": a paced runner jumps the gaps and reaches the tail without falling; the road posts count up', () => {
      const g = H.create({ quiet: true, seed: 11 });
      const r = g.playMission('saiyan_snakeway', { maxSeconds: 300 });
      eq(r.state, 'success', 'mission state');
      const ids = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      ['checkin', 'run', 'arrive'].forEach((id) => ok(ids.includes(id), 'reached ' + id));
      eq(r.log.filter((x) => x.ev === 'roadMarker').length, g.SL.data.stages.snakeway.route.markers - 1, 'every road post lit');
      eq(r.log.filter((x) => x.ev === 'fellOff').length, 0, 'never fell off');
      ok(r.log.some((x) => x.ev === 'objectives' && x.id === 'noFall' && x.done), 'no-fall goal done');
      const run = r.log.find((x) => x.ev === 'snakeWayRun');
      ok(run, 'run finished');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Snake Way: stepping off the road drops Goku into the clouds; he climbs back at the last post, loses time and the no-fall goal', () => {
      const g = H.create({ quiet: true, seed: 11 });
      const { SL, V3 } = g;
      const b = g.mission('saiyan_snakeway', { startPhase: 1 });
      g.until(b, () => !b.inputLocked, 600, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      const p = b.player, road = b.stage.road;
      p.controller = { update: () => SL.emptyIntent() };
      const t0 = b.mission.time;
      let fell = null;
      b.on('fellOff', (e) => (fell = e));
      // put him beside the road, 40 m in (before the first post)
      const i = Math.round(40 / road.step);
      p.setPosition(new V3(road.x[i] - road.tz[i] * 8, road.y[i] + 0.5, road.z[i] + road.tx[i] * 8));
      p.grounded = false;
      ok(!b.stage.roadInfo(p.pos.x, p.pos.z).onRoad, 'starts off the road');
      g.until(b, () => fell && !b.inputLocked, 60 * 8, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      ok(fell, 'fell into the clouds');
      g.step(b, 20);
      const q = b.stage.roadInfo(p.pos.x, p.pos.z);
      ok(q.onRoad && p.grounded && Math.abs(p.pos.y - q.y) < 0.2, 'standing on the road again');
      ok(q.s < 15, 'back at the start (no post passed yet): s = ' + q.s.toFixed(1));
      ok(b.mission.time - t0 >= 5, 'time penalty: ' + (b.mission.time - t0).toFixed(1));
      ok(b.mission.objectives.find((o) => o.id === 'noFall').failed, 'no-fall goal failed');
      eq(b.mission.state, 'running');
      b.dispose();
    });

    test('Snake Way road: holes over the clouds at the gaps with road on both sides; walkable only up to the road edge', () => {
      const g = H.create({ quiet: true, seed: 11 });
      const b = g.mission('saiyan_snakeway', {});
      const st = b.stage, road = st.road;
      const at = (s, side = 0) => {
        const k = Math.round(s / road.step);
        return st.roadInfo(road.x[k] - road.tz[k] * side, road.z[k] + road.tx[k] * side);
      };
      ok(road.gaps.length >= 2, 'gaps: ' + road.gaps.length);
      for (const gp of road.gaps) {
        ok(!at((gp.from + gp.to) / 2).onRoad, 'hole in the middle of the gap at ' + gp.from.toFixed(0) + ' m');
        ok(at(gp.from - 1).onRoad && at(gp.to + 1).onRoad, 'road on both sides');
        ok(gp.to - gp.from <= 7, 'a sprint jump carries about 10 m: gap ' + (gp.to - gp.from).toFixed(1) + ' m');
        ok(!road.markers.some((mk) => mk.s > gp.from - 3 && mk.s < gp.to + 3), 'no post next to a gap');
      }
      const k = Math.round(30 / road.step), hw = road.hw[k];
      ok(at(30, hw - 0.3).onRoad && at(30, -(hw - 0.3)).onRoad, 'inside both edges');
      ok(!at(30, hw + 0.5).onRoad && !at(30, -(hw + 0.5)).onRoad, 'past both edges');
      ok(st.supportHeight(road.x[k], road.z[k], road.y[k] - 3) < -50, 'no floor under the road for someone already below it');
      ok(road.length > 600 && road.length < 1000, 'road length ' + road.length.toFixed(0) + ' m');
      b.dispose();
    });

    test('Chapter 3 "The Saibamen": Tien wins his bout, Yamcha falls to the latch, the party finishes the pack', () => {
      const g = H.create({ quiet: true, seed: 11 });
      const r = g.playMission('saiyan_saibamen', { maxSeconds: 500 });
      eq(r.state, 'success', 'mission state');
      ok(r.log.some((x) => x.ev === 'selfDestruct' && x.victim === 'yamcha'), 'Yamcha is taken out by a real self-destruct latch');
      ok(r.log.some((x) => x.ev === 'switch' && x.to === 'krillin'), 'control passes to Krillin for the pack fight');
      // six in canon; since playtest round 2 Nappa empties the rest of his pouch into the pack fight
      eq(r.log.filter((x) => x.ev === 'ko' && x.who === 'saibaman').length, r.b.story.saibamen.length, 'every Saibaman falls (' + r.b.story.saibamen.length + ')');
      ok(g.SL.Save.isUnlocked('characters', 'krillin') && g.SL.Save.isUnlocked('characters', 'tien'), 'Krillin and Tien unlocked');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Chapter 3 "Nappa Attacks": a player who reads the telegraphs survives the hold and beats Nappa as Goku (seeded run)', () => {
      // seed chosen from a sweep of seeds 1-12. Re-measured on 2026-09-16 after the Frieza
      // work changed how many random draws happen before this mission runs: the careful bot
      // (which now spends the Kaioken instead of saving it) wins 8 of 12 — losses on seeds
      // 5, 7, 8 and 12, all of them in the Goku duel. See STATUS.md balance notes.
      const g = H.create({ quiet: true, seed: 4 });
      const r = g.playMission('saiyan_nappa', { maxSeconds: 700 });
      eq(r.state, 'success', 'mission state');
      const ids = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      ['holdLine', 'sacrifice', 'goku', 'duel', 'finale'].forEach((id) => ok(ids.includes(id), 'reached ' + id));
      ok(r.log.some((x) => x.ev === 'latch' && x.who === 'chiaotzu'), 'Chiaotzu latches onto Nappa: ' + JSON.stringify(r.log.filter((x) => /latch|selfDestruct/.test(x.ev))));
      ok(r.log.some((x) => x.ev === 'selfDestruct' && x.who === 'chiaotzu'), 'and self-destructs');
      ok(r.log.some((x) => x.ev === 'ko' && x.who === 'chiaotzu'), 'Chiaotzu does not survive it in the story');
      ok(r.log.some((x) => x.ev === 'ko' && x.who === 'tien'), 'Tien spends himself on the Tri-Beam');
      ok(r.log.some((x) => x.ev === 'ko' && x.who === 'piccolo'), 'Piccolo falls protecting Gohan');
      ok(r.log.some((x) => x.ev === 'switch' && x.to === 'goku'), 'control passes to Goku');
      ok(r.log.filter((x) => x.ev === 'bossPhase').length >= 2, 'Nappa goes through his phases');
      ok(r.log.some((x) => x.ev === 'ko' && x.who === 'nappa'), 'Vegeta finishes Nappa');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Chapter 3 "The Saiyan Prince": duel, Galick Gun struggle, Great Ape tail, desperate Vegeta (seeded run)', () => {
      const g = H.create({ quiet: true, seed: 2 });
      const r = g.playMission('saiyan_vegeta', { maxSeconds: 900 });
      eq(r.state, 'success', 'mission state');
      const ids = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      ['duel', 'galick', 'transform', 'greatApe', 'shrink', 'desperate', 'moonlight', 'gohanApe', 'retreat'].forEach((id) => ok(ids.includes(id), 'reached ' + id));
      ok(r.log.some((x) => x.ev === 'switch' && x.to === 'great_ape_gohan_player'), 'the player takes Great Ape Gohan');
      ok(r.log.some((x) => x.ev === 'objectives' && x.id === 'struggle' && x.done), 'Kamehameha wins the beam struggle');
      // Roadmap Three (the owner's Gemini research): the Kaioken assault through the spires (B04) and the beam carrying
      // Vegeta into the sky (B-CLASH-05) are staged between the played stretches
      ok(r.m.flags.firstExchange && r.m.flags.airExchange && r.m.flags.kaiokenAssault && r.m.flags.skyward, 'the first exchange (B01), the air exchange (B02), the Kaioken assault and the ride into the sky play');
      ok(r.log.some((x) => x.ev === 'zoneBroken' && x.zone === 'tail'), "the Great Ape's tail is cut");
      ok(r.log.some((x) => x.ev === 'switch' && x.to === 'kid_gohan'), 'Gohan takes over for the last stand');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Great Ape tail: Yajirobe joins the party, circles behind the giant and hacks at its tail, then leaves the fight', () => {
      const g = H.create({ quiet: true, seed: 2 });
      const b = g.mission('saiyan_vegeta', { startPhase: 4 });
      const S = b.story;
      let tailHits = 0, joined = false;
      b.on('zoneHit', (e) => e.attacker === S.yajirobe && e.zone.id === 'tail' && tailHits++);
      g.until(b, () => b.mission.phaseIndex > 4 || b.mission.state !== 'running', 60 * 120, () => {
        if (b.inputLocked) b.skipRequested = true;
        if (b.party && b.party.includes(S.yajirobe)) joined = true;
      });
      ok(joined, 'Yajirobe was a switchable party member');
      ok(tailHits >= 5, 'Yajirobe struck the tail ' + tailHits + ' times');
      ok(b.mission.phaseIndex > 4, 'tail cut, phase ' + b.mission.phaseIndex);
      g.step(b, 60, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      ok(S.yajirobe.hidden, 'he slips away afterwards');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('The Saiyan Prince, Great Ape Gohan: left standing still, the giant loses its tail to Vegeta and falls on him', () => {
      const g = H.create({ quiet: true, seed: 2 });
      const { SL } = g;
      const idx = SL.data.missions.saiyan_vegeta.phases.findIndex((ph) => ph.id === 'gohanApe');
      const b = g.mission('saiyan_vegeta', { startPhase: idx });
      const S = b.story;
      g.until(b, () => !b.inputLocked, 600, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      const ape = b.player;
      eq(ape.def.id, 'great_ape_gohan_player', 'the player is the Great Ape');
      ape.controller = { update: () => SL.emptyIntent() };
      let cutBy = null, tailFailed = false, lowest = 1;
      b.on('zoneBroken', (e) => e.fighter === ape && e.zone.id === 'tail' && (cutBy = e.attacker));
      b.on('objectives', (e) => e.changed && e.changed.id === 'tail' && e.changed.failed && (tailFailed = true));
      g.until(b, () => b.mission.phaseIndex > idx || b.mission.state !== 'running', 60 * 150, () => {
        if (b.inputLocked) b.skipRequested = true;
        lowest = Math.min(lowest, S.vegeta.hpFrac);
      });
      eq(cutBy, S.vegeta, 'Vegeta cut the tail himself');
      ok(tailFailed, 'the optional tail goal failed');
      ok(b.mission.phaseIndex > idx, 'the story moved on to the retreat');
      ok(lowest < 0.06, 'the falling giant crushed him: ' + lowest.toFixed(3));
      eq(b.player, S.gohan, 'control is back on Gohan');
      ok(!b.fighters.some((f) => f.def.id === 'great_ape_gohan_player'), 'the giant is gone');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('The Saiyan Prince, Great Ape Gohan: a rampaging player crushes Vegeta before he reaches the tail (seeded run)', () => {
      // seeds 1-4 with the rampage bot: crush goal reached in 14-44 s on all four, tail kept on all four, grabs on two
      const g = H.create({ quiet: true, seed: 4 });
      const idx = g.SL.data.missions.saiyan_vegeta.phases.findIndex((ph) => ph.id === 'gohanApe');
      const r = g.playMission('saiyan_vegeta', { startPhase: idx, maxSeconds: 240 });
      eq(r.state, 'success', 'mission state');
      const done = (id) => r.log.some((x) => x.ev === 'objectives' && x.id === id && x.done);
      ok(done('crush'), 'Vegeta crushed');
      ok(done('tail'), 'the tail kept until Vegeta cuts it in the finale');
      ok(r.log.some((x) => x.ev === 'phase' && x.id === 'retreat'), 'the story continues');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Chapter 4 "A Prince on Namek": Vegeta beats Cui, then Dodoria, and hears the truth about Planet Vegeta (seeded run)', () => {
      // seeds 1-7: the careful bot cleared the mission 5 of 7 times while bosses could beam in any phase (both losses to
      // Dodoria's Mouth Energy Wave); 7 of 7 once bosses beam only through their phase patterns (see STATUS.md)
      const g = H.create({ quiet: true, seed: 3 });
      const r = g.playMission('namek_vegeta', { maxSeconds: 600 });
      eq(r.state, 'success', 'mission state');
      const ids = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      ['arrival', 'cui', 'dodoria', 'truth'].forEach((id) => ok(ids.includes(id), 'reached ' + id));
      ok(r.log.some((x) => x.ev === 'ko' && x.who === 'cui'), 'Cui falls');
      ok(r.log.some((x) => x.ev === 'ko' && x.who === 'dodoria'), 'Dodoria falls');
      ok(g.SL.Save.isUnlocked('stages', 'namek'), 'Namek stage unlocked');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Dodoria is a real boss: poise shrugs off light hits, the body slam draws its landing spot, and he turns desperate below half health', () => {
      const g = H.create({ quiet: true, seed: 5 });
      const { SL } = g;
      const b = g.battle({ p1: 'vegeta', p2: 'dodoria', distance: 12, dummy: 'idle' });
      const v = b.player, d = b.fighters[1];
      g.step(b, 5);
      const res = d.takeHit(v, { type: 'melee', damage: 300, knock: 'flinch', impact: 1, hitstun: 20 });
      eq(res, 'armored', 'a light hit does not make him flinch');
      let marked = false;
      b.on('telegraph', () => (marked = true));
      ok(SL.Techniques.groundSlam.start(d, SL.data.characters.dodoria.boss.techniques.slam, 'boss', 0), 'slam started');
      g.step(b, 30);
      ok(marked, 'the landing spot is drawn on the ground');
      g.step(b, 120);
      d.hp = d.hpMax * 0.45;
      g.step(b, 90);
      eq(d.mech.phase, 1, 'Cornered phase below half health');
      b.dispose();
    });

    test('What If "Piccolo survived Nappa": hold the blast back, team attack, separate What-If save track', () => {
      // the team attack is optional (Nappa's poise broken while Piccolo is the one playing); the bot
      // wins on every seed but reaches the team attack on about half (seeds 2, 5, 6 of 1–6, measured
      // 2026-09-24), so this playthrough uses one where it does
      const g = H.create({ quiet: true, seed: 2 });
      const canonBefore = JSON.stringify(g.SL.Save.data.story);
      const r = g.playMission('whatif_piccolo', { maxSeconds: 600 });
      eq(r.state, 'success', 'mission state');
      ok(r.log.some((x) => x.ev === 'deflectedBlast'), 'the Mouth Blast is thrown aside');
      ok(r.log.some((x) => x.ev === 'teamAttack'), 'the team attack fires');
      ok(!r.log.some((x) => x.ev === 'ko' && x.who === 'piccolo'), 'Piccolo lives');
      ok(g.SL.Save.data.whatIf.missions.whatif_piccolo && g.SL.Save.data.whatIf.missions.whatif_piccolo.completed, 'recorded on the What-If track');
      eq(JSON.stringify(g.SL.Save.data.story), canonBefore, 'canon story progress untouched');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('What If "Piccolo survived Nappa": failing to hold the blast back ends the branch (retry from the checkpoint)', () => {
      const g = H.create({ quiet: true, seed: 3 });
      const b = g.mission('whatif_piccolo', { startPhase: 1 });
      g.until(b, () => b.mission.state !== 'running', 60 * 30, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.mission.state, 'failed', 'no mashing means Piccolo falls');
    });

    test('Chapter 2 "Ten Times Gravity": careful Kaioken use clears it without overloading', () => {
      const g = H.create({ quiet: true, seed: 11 });
      const r = g.playMission('saiyan_kingkai', { maxSeconds: 400 });
      eq(r.state, 'success');
      ok(!r.log.some((x) => x.ev === 'overload'), 'no overload');
      ok(r.log.some((x) => x.ev === 'objectives' && x.id === 'noOverload' && x.done), 'optional objective done');
      ok(g.SL.Save.isUnlocked('stages', 'kingkai'), "King Kai's planet unlocked");
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Ten Times Gravity: never powering down overloads, fails the optional goal and ranks lower', () => {
      const scores = [false, true].map((greedy) => {
        const g = H.create({ quiet: true, seed: 11 });
        const r = g.playMission('saiyan_kingkai', { maxSeconds: 400, greedy, startPhase: 3 });
        eq(r.state, 'success', 'still completable');
        return { overloads: r.log.filter((x) => x.ev === 'overload').length, failed: r.log.some((x) => x.id === 'noOverload' && x.failed), score: r.record.bestScore };
      });
      eq(scores[0].overloads, 0);
      ok(scores[1].overloads >= 1 && scores[1].failed, 'greedy: ' + JSON.stringify(scores[1]));
      ok(scores[1].score < scores[0].score, 'score ' + scores[1].score + ' < ' + scores[0].score);
    });
  }

  console.log('\nGinyu Force: Burter and the speed (headless)');
  {
    const g = H.create({ quiet: true, seed: 23 });
    const { SL } = g;
    const hit = (dmg) => ({ type: 'melee', damage: dmg });

    test('Burter is built on speed rather than on a copy of Recoome', () => {
      const bt = SL.data.characters.burter;
      const rc = SL.data.characters.recoome;
      eq(SL.Schema.validateCharacter(bt).join(' | '), '', 'schema');
      // the quickest of his own era (the Buu Saga's absorbed Buu is faster, and should be)
      const fastest = Object.values(SL.data.characters).filter((c) => c.era === bt.era).reduce((a, c) => (c.stats && c.stats.speed > a ? c.stats.speed : a), 0);
      eq(bt.stats.speed, fastest, 'nobody in the Namek cast is quicker: ' + bt.stats.speed);
      ok(bt.stats.hp < rc.stats.hp && bt.poise.max < rc.poise.max, 'thinner than Recoome: ' + JSON.stringify({ hp: bt.stats.hp, poise: bt.poise.max }));
      ok(bt.boss.evade && bt.boss.evade.damageMul < 1 && bt.boss.evade.minSpeed > 0, 'motion is his defence: ' + JSON.stringify(bt.boss.evade));
      // a different signature and a different rush shape, not the same kit with new numbers
      eq(bt.specials.special1.type, 'speedOrbit', 'Blue Hurricane is its own technique');
      const btRush = bt.specials.special2.hits, rcRush = rc.specials.special1.hits;
      ok(btRush.length > rcRush.length, 'his rush is a flurry, not a haymaker: ' + btRush.length + ' vs ' + rcRush.length);
      const btAvg = btRush.reduce((a, h) => a + h.damage, 0) / btRush.length;
      const rcAvg = rcRush.reduce((a, h) => a + h.damage, 0) / rcRush.length;
      ok(btAvg < rcAvg, 'and each blow is lighter: ' + Math.round(btAvg) + ' vs ' + Math.round(rcAvg));
      ok(bt.specials.special2.armor === false && rc.specials.special1.armor, 'Recoome runs through hits, Burter does not');
      const btStart = bt.moves.light.reduce((a, m) => a + m.startup, 0) / bt.moves.light.length;
      const rcStart = rc.moves.light.reduce((a, m) => a + m.startup, 0) / rc.moves.light.length;
      ok(btStart < rcStart, 'his chain starts faster: ' + btStart.toFixed(1) + ' vs ' + rcStart.toFixed(1));
      eq(bt.boss.phases.map((x) => x.id).join(','), 'sprint,frantic', 'two phases');
      ok(!bt.boss.phases[0].patterns.mach && bt.boss.phases[1].patterns.mach > 0, 'the Mach Attack belongs to the second phase only');
    });

    test('motion is his armour: hits slide off a moving Burter and land in full the moment he stops', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'burter', distance: 6 });
      const bt = b.fighters.find((f) => f.def.id === 'burter');
      let evades = 0;
      b.on('speedEvade', () => evades++);
      bt.setState('free');
      bt.vel.set(0, 0, 30);
      const moving = SL.mech(bt, 'damageIn', hit(1000));
      ok(moving < 0.5, 'most of a hit slides off while he is moving: ' + moving);
      eq(evades, 1, 'and it reads as an evade, not as armour');
      bt.vel.set(0, 0, 0);
      eq(SL.mech(bt, 'damageIn', hit(1000)), 1, 'standing still he takes everything');
      // regression: f.speed only refreshes in the free state, so a stale reading would
      // have kept him evasive through his own recovery — the whole punish window
      bt.setState('recover', { frames: 40 });
      bt.vel.set(0, 0, 30);
      eq(SL.mech(bt, 'damageIn', hit(1000)), 1, 'recovery is open even at full speed');
      bt.setState('stagger', { frames: 40 });
      eq(SL.mech(bt, 'damageIn', hit(1000)), 1, 'so is a stagger');
      bt.setState('free');
      bt.vel.set(0, 0, 30);
      eq(SL.mech(bt, 'damageIn', { type: 'throw', damage: 1000 }), 1, 'a throw catches him regardless');
      b.dispose();
    });

    test('the evasion is worth beating: the same blow hurts far more once he is stopped', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'burter', distance: 4 });
      const bt = b.fighters.find((f) => f.def.id === 'burter');
      const vg = b.fighters.find((f) => f.def.id === 'vegeta');
      const strike = { type: 'melee', damage: 2000, knock: 'none', hitstun: 0 };
      bt.setState('free');
      bt.vel.set(0, 0, 30);
      const h0 = bt.hp;
      bt.takeHit(vg, strike);
      const slipped = h0 - bt.hp;
      bt.setState('recover', { frames: 60 });
      bt.vel.set(0, 0, 0);
      const h1 = bt.hp;
      bt.takeHit(vg, strike);
      const clean = h1 - bt.hp;
      ok(slipped > 0, 'a moving Burter still takes something: ' + Math.round(slipped));
      ok(clean > slipped * 2, 'catching him is worth it: ' + Math.round(clean) + ' vs ' + Math.round(slipped));
      b.dispose();
    });

    test('Blue Hurricane circles the target, hits from every angle and hands control back', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'burter', distance: 6 });
      const bt = b.fighters.find((f) => f.def.id === 'burter');
      const vg = b.fighters.find((f) => f.def.id === 'vegeta');
      bt.ki = bt.kiMax;
      const spec = bt.specFor('special1');
      const seen = { start: 0, end: 0, blocked: 0, hits: 0 };
      b.on('speedOrbit', () => seen.start++);
      b.on('speedOrbitEnd', (e) => {
        seen.end++;
        seen.hits = e.hits;
      });
      b.on('speedOrbitBlocked', () => seen.blocked++);
      const angles = new Set();
      const hp0 = vg.hp;
      ok(SL.Techniques.speedOrbit.start(bt, spec, 'special1', spec.kiCost), 'the technique starts');
      const orbit = g.until(b, () => bt.state !== 'speedOrbit', 60 * 8, () => {
        angles.add(Math.floor(((Math.atan2(bt.pos.x - vg.pos.x, bt.pos.z - vg.pos.z) + Math.PI * 3) % (Math.PI * 2)) / (Math.PI / 2)));
      });
      ok(orbit > 0, 'it runs for a while: ' + orbit + ' frames');
      eq(angles.size, 4, 'he passes through every quadrant around the target');
      eq(seen.blocked, 0, 'nothing was guarded');
      eq(seen.end, 1, 'it ends on its own');
      ok(seen.hits >= 4, 'several passes land: ' + seen.hits);
      ok(hp0 - vg.hp > 1500, 'and they add up: ' + Math.round(hp0 - vg.hp));
      eq(bt.state, 'recover', 'he comes out of it into recovery, not into another attack');
      eq(SL.mech(bt, 'damageIn', hit(1000)), 1, 'which is the opening it pays for');
      const back = g.until(b, () => bt.state === 'free', 60 * 4);
      ok(back > 0, 'control returns (' + back + ' frames), no softlock');
      b.dispose();
    });

    test('guarding a Hurricane pass bounces him off it: no damage, and a long opening', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'burter', distance: 6 });
      const bt = b.fighters.find((f) => f.def.id === 'burter');
      const vg = b.fighters.find((f) => f.def.id === 'vegeta');
      vg.controller = new SL.AIController(b, { difficulty: 'normal', dummy: 'guard' });
      bt.ki = bt.kiMax;
      const spec = bt.specFor('special1');
      let blocked = 0, ended = 0;
      b.on('speedOrbitBlocked', () => blocked++);
      b.on('speedOrbitEnd', () => ended++);
      const hp0 = vg.hp;
      SL.Techniques.speedOrbit.start(bt, spec, 'special1', spec.kiCost);
      const frames = g.until(b, () => bt.state !== 'speedOrbit', 60 * 8);
      eq(blocked, 1, 'the guarded pass bounces him');
      eq(ended, 0, 'the technique never reaches its full length');
      ok(frames <= spec.interval + 6, 'it ends on the first pass: ' + frames + ' frames');
      eq(Math.round(hp0 - vg.hp), 0, 'the guard costs the defender no health');
      eq(bt.state, 'stagger', 'and leaves him staggered');
      eq(SL.mech(bt, 'damageIn', hit(1000)), 1, 'fully open while he is staggered');
      const back = g.until(b, () => bt.state === 'free', 60 * 4);
      ok(back >= 40, 'the opening is long enough to punish: ' + back + ' frames');
      b.dispose();
    });

    test('his phases own his specials: no Mach Attack while he is still sprinting, and it arrives when he panics', () => {
      const run = (hpFrac, seconds) => {
        const gg = H.create({ quiet: true, seed: 5 });
        const b = gg.battle({ p1: 'goku', p2: 'burter', distance: 9 });
        const bt = b.fighters.find((f) => f.def.id === 'burter');
        const gk = b.fighters.find((f) => f.def.id === 'goku');
        bt.controller = new gg.SL.AIController(b, { difficulty: 'hard' });
        gk.controller = new gg.SL.AIController(b, { difficulty: 'normal' });
        gk.infiniteHp = true;
        bt.cannotDie = true;
        const held = Math.round(bt.hpMax * hpFrac);
        bt.hp = held;
        const used = {};
        b.on('special', (e) => {
          if (e.fighter === bt && e.spec) used[e.spec.id] = (used[e.spec.id] || 0) + 1;
        });
        b.on('speedOrbit', (e) => {
          if (e.fighter === bt) used.blueHurricane = (used.blueHurricane || 0) + 1;
        });
        gg.step(b, 60 * seconds, () => {
          bt.ki = bt.kiMax; // never let a ki shortage stand in for a phase rule
          if (bt.hp > held) bt.hp = held;
        });
        const phase = gg.SL.Mechanics.boss.phaseOf(bt).id;
        const errors = gg.errors.length;
        b.dispose();
        return { phase, used, errors };
      };
      const sprint = run(1, 60);
      eq(sprint.phase, 'sprint', 'held in the first phase');
      ok(!sprint.used.machAttack, 'the ultimate never leaks into it: ' + JSON.stringify(sprint.used));
      ok(sprint.used.blueHurricane >= 1 && sprint.used.afterimageStrike >= 1, 'but the phase patterns do fire: ' + JSON.stringify(sprint.used));
      eq(sprint.errors, 0, 'no engine errors in the first phase');
      const frantic = run(0.3, 60);
      eq(frantic.phase, 'frantic', 'second phase reached');
      eq(frantic.errors, 0, 'no engine errors in the second phase');
      // whether a weighted roll happens to pick it inside a minute is luck; whether it is
      // on the table at all is the rule, so ask the scoring pass directly
      const offered = (hpFrac) => {
        const gg = H.create({ quiet: true, seed: 2 });
        const b = gg.battle({ p1: 'goku', p2: 'burter', distance: 14 });
        const bt = b.fighters.find((f) => f.def.id === 'burter');
        bt.controller = new gg.SL.AIController(b, { difficulty: 'hard' });
        bt.cannotDie = true;
        bt.hp = Math.round(bt.hpMax * hpFrac);
        gg.step(b, 30); // let the phase controller catch up with the health
        bt.ki = bt.kiMax; // he spends ki while those frames run; the question here is the phase, not his meter
        const scores = { melee: 1, blast: 0.5, strafe: 0.3 };
        bt.controller.patternCd = {};
        // ask at a fixed distance, so the answer is about the phase and not about where he drifted to
        gg.SL.AIHooks.boss.scores(bt.controller, bt, bt.target, 14, null, scores, false);
        const phase = gg.SL.Mechanics.boss.phaseOf(bt).id;
        b.dispose();
        return { phase, mach: scores.p_mach || 0, hurricane: scores.p_hurricane || 0 };
      };
      const early = offered(1);
      eq(early.phase, 'sprint', 'scoring the first phase');
      eq(early.mach, 0, 'the Mach Attack is not even offered there');
      ok(early.hurricane > 0, 'while the Hurricane is: ' + early.hurricane);
      const late = offered(0.3);
      eq(late.phase, 'frantic', 'scoring the second phase');
      ok(late.mach > 0, 'and in the second phase it is on the table: ' + late.mach);
    });
  }


  console.log('\nGinyu Force: Jeice, and the pair (headless)');
  {
    const g = H.create({ quiet: true, seed: 29 });
    const { SL } = g;

    test('Jeice is a zoner, and his kit shares nothing with Burter', () => {
      const jc = SL.data.characters.jeice;
      const bt = SL.data.characters.burter;
      eq(SL.Schema.validateCharacter(jc).join(' | '), '', 'schema');
      eq(jc.specials.special1.type, 'projectile', 'the Crusher Ball is a thrown ball');
      eq(jc.specials.special2.type, 'scatter', 'the Purple Comet volley falls on an area');
      eq(jc.specials.ultimate.type, 'projectile', 'and the ultimate is the big one');
      const ids = (c) => Object.values(c.specials).map((x) => x.id);
      eq(ids(jc).filter((x) => ids(bt).includes(x)).length, 0, 'no shared moves: ' + ids(jc).join(',') + ' vs ' + ids(bt).join(','));
      ok(jc.ai.preferredRange > bt.ai.preferredRange * 3, 'they want to stand in very different places: ' + jc.ai.preferredRange + ' vs ' + bt.ai.preferredRange);
      ok(jc.stats.ki > bt.stats.ki && jc.stats.speed < bt.stats.speed, 'more ki, less speed: ' + JSON.stringify({ ki: jc.stats.ki, speed: jc.stats.speed }));
      const kick = jc.boss.techniques.kickoff;
      eq(kick.type, 'retreatVolley', 'his answer to pressure is a spacing move');
      ok(kick.backDistance > 10 && kick.shots >= 2, 'it buys real distance and costs the attacker something: ' + JSON.stringify({ back: kick.backDistance, shots: kick.shots }));
      ok(jc.boss.patterns.kickoff.maxDist <= 7, 'and it only comes out when someone is actually close: ' + jc.boss.patterns.kickoff.maxDist);
      eq(jc.boss.phases.map((x) => x.id).join(','), 'spacing,cornered', 'two phases');
      for (const name of ['crusher', 'volley', 'volcano']) ok(jc.boss.patterns[name].ranged, name + ' is marked as a ranged pattern');
    });

    test('the kick-off buys distance and fires on the way out, then gives control back', () => {
      const b = g.battle({ p1: 'vegeta', p2: 'jeice', distance: 3 });
      const jc = b.fighters.find((f) => f.def.id === 'jeice');
      const vg = b.fighters.find((f) => f.def.id === 'vegeta');
      jc.ki = jc.kiMax;
      const spec = jc.def.boss.techniques.kickoff;
      const before = jc.pos.distanceTo(vg.pos);
      let fired = 0, shots = 0;
      b.on('retreatVolleyEnd', (e) => { shots = e.shots; });
      const seen = new Set();
      ok(SL.Techniques.retreatVolley.start(jc, spec, 'boss', spec.kiCost), 'it starts');
      const frames = g.until(b, () => jc.state !== 'retreatVolley', 60 * 4, () => {
        for (const pr of b.projectiles.list) if (pr.owner === jc && !seen.has(pr)) { seen.add(pr); fired++; }
      });
      eq(frames, spec.frames, 'it runs its full length');
      eq(shots, spec.shots, 'every shot goes out');
      eq(fired, spec.shots, 'and each one is a real projectile');
      const after = jc.pos.distanceTo(vg.pos);
      ok(after - before > 10, 'he ends up far away: ' + before.toFixed(1) + ' → ' + after.toFixed(1));
      // boss techniques are free to fire; the cooldown is the limit, and it is a long one
      ok(jc.def.boss.patterns.kickoff.cooldown >= 240, 'he cannot spam it: ' + jc.def.boss.patterns.kickoff.cooldown + ' frames');
      eq(jc.state, 'recover', 'the landing is recovery, not a free cancel');
      ok(g.until(b, () => jc.state === 'free', 60 * 3) > 0, 'control returns, no softlock');
      b.dispose();
    });

    test('left to himself he fights at range: he keeps his distance and uses the whole kit', () => {
      const gg = H.create({ quiet: true, seed: 4 });
      const b = gg.battle({ p1: 'goku', p2: 'jeice', distance: 10 });
      const jc = b.fighters.find((f) => f.def.id === 'jeice');
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      jc.controller = new gg.SL.AIController(b, { difficulty: 'hard' });
      gk.controller = new gg.SL.AIController(b, { difficulty: 'normal' });
      gk.infiniteHp = true;
      jc.cannotDie = true;
      const used = {};
      b.on('special', (e) => { if (e.fighter === jc && e.spec) used[e.spec.id] = (used[e.spec.id] || 0) + 1; });
      b.on('retreatVolley', (e) => { if (e.fighter === jc) used.kickoff = (used.kickoff || 0) + 1; });
      const dists = [];
      gg.step(b, 60 * 60, (i) => {
        jc.ki = jc.kiMax;
        if (i % 10 === 0) dists.push(jc.pos.distanceTo(gk.pos));
      });
      dists.sort((a, c) => a - c);
      const median = dists[Math.floor(dists.length / 2)];
      ok(median > 6, 'he does not stand in melee range: median ' + median.toFixed(1) + ' m');
      ok(used.crusherBall >= 1, 'Crusher Balls go out: ' + JSON.stringify(used));
      ok(used.kickoff >= 1, 'and he kicks off when crowded: ' + JSON.stringify(used));
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('the pair splits up instead of dogpiling one hero', () => {
      const gg = H.create({ quiet: true, seed: 13 });
      const b = gg.battle({ p1: 'goku', p2: 'burter', distance: 10 });
      const gohan = b.spawn({ charId: 'kid_gohan', team: 0, pos: new gg.V3(6, 0, 4) });
      const jeice = b.spawn({ charId: 'jeice', team: 1, pos: new gg.V3(-6, 0, 12) });
      const burter = b.fighters.find((f) => f.def.id === 'burter');
      const goku = b.fighters.find((f) => f.def.id === 'goku');
      for (const f of [burter, jeice]) f.controller = new gg.SL.AIController(b, { difficulty: 'hard' });
      for (const f of [goku, gohan]) {
        f.controller = new gg.SL.AIController(b, { difficulty: 'normal' });
        f.infiniteHp = true;
      }
      for (const f of [burter, jeice]) f.cannotDie = true;
      let same = 0, samples = 0;
      const pressured = new Set();
      gg.step(b, 60 * 40, (i) => {
        burter.ki = burter.kiMax;
        jeice.ki = jeice.kiMax;
        if (i % 15) return;
        samples++;
        if (burter.target === jeice.target) same++;
        for (const f of [burter, jeice]) if (f.target) pressured.add(f.target.def.id);
      });
      ok(same / samples < 0.5, 'they mostly watch different heroes: ' + (same / samples).toFixed(2) + ' of samples shared');
      eq(pressured.size, 2, 'and both heroes get looked after: ' + [...pressured].join(','));
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('Jeice will not shoot through Burter, and stops holding back once Burter is down', () => {
      const gg = H.create({ quiet: true, seed: 21 });
      const b = gg.battle({ p1: 'goku', p2: 'jeice', distance: 12 });
      const jc = b.fighters.find((f) => f.def.id === 'jeice');
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      const bt = b.spawn({ charId: 'burter', team: jc.team, pos: new gg.V3(1.5, 0, 1.5) });
      for (const f of [jc, bt]) f.controller = new gg.SL.AIController(b, { difficulty: 'hard' });
      jc.ki = jc.kiMax;
      const events = [];
      b.on('squadRole', (e) => { if (e.fighter === jc) events.push(e.holding); });
      const score = () => {
        const scores = { melee: 1, blast: 1, strafe: 0.3, retreat: 0 };
        jc.controller.patternCd = {};
        gg.SL.AIHooks.boss.scores(jc.controller, jc, jc.target, jc.distTo(jc.target), null, scores, false);
        return scores;
      };
      jc.target = gk;
      bt.target = gk;
      bt.pos.set(gk.pos.x + 1, gk.pos.y, gk.pos.z + 1);
      const crowded = score();
      ok(!crowded.p_crusher && !crowded.p_volley, 'no ranged patterns while his partner is on top of the hero: ' + JSON.stringify(crowded));
      ok(crowded.blast < 0.2, 'not even loose ki blasts: ' + crowded.blast);
      eq(events[events.length - 1], true, 'and it is announced, so it can be read from outside');
      bt.pos.set(gk.pos.x + 25, gk.pos.y, gk.pos.z + 25);
      const clear = score();
      ok(clear.p_crusher > 0 && clear.p_volley > 0, 'with the lane clear he fires again: ' + JSON.stringify(clear));
      eq(events[events.length - 1], false, 'and stops holding');
      bt.hp = 0;
      bt.alive = false;
      const alone = score();
      ok(alone.p_crusher > clear.p_crusher, 'with Burter gone he presses harder: ' + alone.p_crusher + ' > ' + clear.p_crusher);
      b.dispose();
    });

    test('the pair is coordination, not padded numbers', () => {
      const bt = SL.data.characters.burter;
      const jc = SL.data.characters.jeice;
      for (const c of [bt, jc]) {
        const sq = c.ai.squad;
        ok(sq && typeof sq.role === 'string', c.id + ' has a role');
        for (const k of Object.keys(sq)) ok(['role', 'holdRange', 'line'].includes(k), c.id + '.squad.' + k + ' is positioning, not a multiplier');
      }
      ok(bt.ai.squad.role !== jc.ai.squad.role, 'the two halves do different jobs');
      // the same two fighters, alone and as a pair: identical health and damage
      const solo = g.battle({ p1: 'goku', p2: 'burter', distance: 8 });
      const soloBt = solo.fighters.find((f) => f.def.id === 'burter');
      const soloStats = { hp: soloBt.hpMax, out: soloBt.damageDealtMul || 1, in: soloBt.damageTakenMul || 1 };
      solo.dispose();
      const pair = g.battle({ p1: 'goku', p2: 'burter', distance: 8 });
      pair.spawn({ charId: 'jeice', team: 1, pos: new g.V3(-5, 0, 6) });
      const pairBt = pair.fighters.find((f) => f.def.id === 'burter');
      eq(pairBt.hpMax, soloStats.hp, 'health is the same in a pair');
      eq(pairBt.damageDealtMul || 1, soloStats.out, 'damage dealt is the same in a pair');
      eq(pairBt.damageTakenMul || 1, soloStats.in, 'damage taken is the same in a pair');
      pair.dispose();
    });
  }

  console.log('\nNamek: "Two Against One" (headless)');
  {
    const g = H.create({ quiet: true, seed: 31 });
    const { SL } = g;

    test('"Two Against One" follows "Recoome\'s Show" in Chapter 4 and waits for it', () => {
      const order = SL.data.storyOrder();
      const iR = order.indexOf('namek_recoome'), iP = order.indexOf('namek_ginyu_pair');
      ok(iR > 0 && iP === iR + 1, 'order: ' + order.slice(-3).join(' → '));
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_ginyu_pair', results([])), 'locked at the start of the chapter');
      ok(SL.data.storyLocked('namek_ginyu_pair', results(['namek_guldo'])), 'still locked after Guldo');
      ok(!SL.data.storyLocked('namek_ginyu_pair', results(['namek_recoome'])), "opens after Recoome's Show");
      const def = SL.data.missions.namek_ginyu_pair;
      eq(def.phases.map((p) => p.id).join(','), 'landing,pair,down,alone,flight', 'five phases');
      eq(def.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'pair,alone', 'the two fights are the checkpoints');
    });

    test('the pair fight is set up the way the story needs it: Burter can fall, Jeice cannot', () => {
      const b = g.mission('namek_ginyu_pair', { startPhase: 1 });
      const S = b.story;
      g.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.player.def.id, 'goku', 'played as Goku');
      ok(!S.burter.cannotDie, 'Burter is the one who has to go down');
      ok(S.jeice.cannotDie, 'Jeice survives to fetch the captain');
      ok(S.recoome.untargetable && S.recoome.state === 'scripted', 'Recoome is already out of it');
      ok(S.goku.lockedForms && S.goku.lockedForms.kaioken, 'the Kaioken is saved for Ginyu');
      ok(S.burter.controller && S.jeice.controller, 'both are being driven');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('a bot plays "Two Against One" start to finish: Burter falls, Jeice runs', () => {
      const r = g.playMission('namek_ginyu_pair', { maxSeconds: 420 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'landing,pair,down,alone,flight', 'every phase played');
      const done = new Set(r.log.filter((x) => x.ev === 'objectives' && x.done).map((x) => x.id));
      ok(done.has('burter'), 'Burter was put down (done: ' + [...done].join(',') + ')');
      ok(done.has('breakThrough'), 'and Jeice was broken through');
      ok(!S.burter.alive, 'Burter stays down');
      ok(S.jeice.alive && S.jeice.hidden, 'Jeice leaves the field alive');
      ok(m.flags.caught >= 1, 'the bot caught Burter while he was stopped: ' + m.flags.caught);
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('replaying from the Jeice checkpoint starts alone and finishes again', () => {
      const gg = H.create({ quiet: true, seed: 5 });
      const snap = gg.mission('namek_ginyu_pair', { startPhase: 3 });
      gg.step(snap, 60, () => {
        if (snap.inputLocked) snap.skipRequested = true;
      });
      eq(snap.mission.checkpoint, 3, 'checkpoint registered');
      ok(!snap.story.burter.alive, 'Burter is already down at this checkpoint');
      ok(snap.story.jeice.alive && !snap.story.jeice.hidden, 'and Jeice is the fight');
      snap.dispose();
      const r = gg.playMission('namek_ginyu_pair', { maxSeconds: 300, startPhase: 3 });
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(r.m.state, 'success', 'completes from the checkpoint (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'alone,flight', 'and only replays what comes after it');
      ok(r.b.story.jeice.hpFrac <= 0.31, 'Jeice is broken through again: ' + r.b.story.jeice.hpFrac.toFixed(2));
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });
  }


  console.log('\nCaptain Ginyu and the Body Change (headless)');
  {
    const g = H.create({ quiet: true, seed: 33 });
    const { SL } = g;
    const CHANGE = SL.data.characters.ginyu.boss.techniques.change;

    // a fight with the captain, the player's hero and (optionally) a bystander
    const stage = (opts = {}) => {
      const b = g.battle({ p1: opts.hero || 'goku', p2: 'ginyu', distance: opts.distance || 6 });
      const gy = b.fighters.find((f) => f.def.id === 'ginyu');
      const hero = b.fighters.find((f) => f !== gy);
      b.setParty([hero]);
      gy.ki = gy.kiMax;
      gy.target = hero;
      const log = [];
      b.on('bodyChangeStart', () => log.push('start'));
      b.on('bodyChanged', () => log.push('changed'));
      b.on('bodyChangeMissed', (e) => log.push('missed:' + e.reason));
      b.on('bodyChangeIntercepted', (e) => log.push('intercept:' + e.victim.def.id));
      return { b, gy, hero, log };
    };
    const fireAt = (s, prep) => {
      SL.Techniques.bodyChange.start(s.gy, CHANGE, 'boss', 0);
      g.until(s.b, () => s.gy.stateFrame >= CHANGE.startup - 2 || s.gy.state !== 'bodyChange', 60 * 4);
      if (prep) prep();
      g.until(s.b, () => s.gy.state !== 'bodyChange', 60 * 2);
    };

    test('Captain Ginyu is a real character before he is a gimmick', () => {
      const gy = SL.data.characters.ginyu;
      eq(SL.Schema.validateCharacter(gy).join(' | '), '', 'schema');
      eq(gy.specials.special1.type, 'beam', 'the Milky Cannon is a beam');
      eq(gy.boss.phases.map((x) => x.id).join(','), 'captain,covetous', 'two phases');
      ok(!gy.boss.phases[0].patterns.change, 'he does not reach for the body while the fight is going his way');
      ok(gy.boss.phases[1].patterns.change > 0, 'and reaches for it when it is not');
      eq(gy.boss.techniques.change.type, 'bodyChange', 'the Body Change is a technique, not a cutscene');
      ok(CHANGE.startup >= 60, 'with a telegraph long enough to react to: ' + CHANGE.startup + ' frames');
      ok(CHANGE.failStagger >= 60, 'and a real punish when it misses: ' + CHANGE.failStagger + ' frames');
      ok(CHANGE.penalty < 1, 'a stolen body is worth less than its owner made it: ' + CHANGE.penalty);
    });

    test('target acquisition: in range, alive, allowed — or it never starts', () => {
      const near = stage({ distance: 6 });
      ok(SL.Techniques.bodyChange.start(near.gy, CHANGE, 'boss', 0), 'a valid target starts it');
      eq(near.gy.state, 'bodyChange', 'and he commits to the telegraph');
      near.b.dispose();
      const far = stage({ distance: 6 });
      far.hero.setPosition(far.gy.pos.clone().add(new g.V3(0, 0, CHANGE.range + 12)));
      ok(!SL.Techniques.bodyChange.start(far.gy, CHANGE, 'boss', 0), 'out of range it does not start');
      eq(far.gy.state, 'free', 'and costs him nothing');
      far.b.dispose();
      const guarded = stage({ distance: 6 });
      guarded.hero.tags = { noBodyChange: true };
      ok(!SL.Techniques.bodyChange.start(guarded.gy, CHANGE, 'boss', 0), 'a protected body cannot be taken');
      guarded.b.dispose();
      const gone = stage({ distance: 6 });
      gone.hero.hidden = true;
      ok(!SL.Techniques.bodyChange.start(gone.gy, CHANGE, 'boss', 0), 'neither can one that is not there');
      gone.b.dispose();
    });

    test('the beam is dodged, not blocked: moving beats it and guarding does not', () => {
      const dodging = stage();
      fireAt(dodging, () => dodging.hero.setState('dodge', { dir: new g.V3(1, 0, 0) }));
      eq(dodging.log.join(','), 'start,missed:dodge', 'dodging beats it');
      eq(dodging.gy.state, 'stagger', 'and leaves him staggered');
      eq(dodging.b.player, dodging.hero, 'the player keeps their own body');
      eq(dodging.b.mindOf(dodging.hero).id, 'goku', 'and their own mind stays in it');
      dodging.b.dispose();

      const running = stage();
      fireAt(running, () => running.hero.setPosition(running.hero.pos.clone().add(new g.V3(0, 0, 40))));
      eq(running.log.join(','), 'start,missed:range', 'so does being somewhere else entirely');
      running.b.dispose();

      const guarding = stage();
      fireAt(guarding, () => guarding.hero.setState('guard'));
      eq(guarding.log.join(','), 'start,changed', 'guarding does not: you cannot block a mind');
      guarding.b.dispose();
    });

    test('a successful change moves control, sides, names and the party seat together', () => {
      const s = stage();
      const hero = s.hero, gy = s.gy;
      const heroTeam = hero.team, gyTeam = gy.team;
      const heroHp = hero.hp, gyHp = gy.hp;
      fireAt(s);
      eq(s.log.join(','), 'start,changed', 'it lands');
      // the minds moved
      eq(s.b.mindOf(gy).id, 'goku', "Goku's mind is in the captain's body");
      eq(s.b.mindOf(hero).id, 'ginyu', "and the captain is in Goku's");
      eq(hero.name, 'Captain Ginyu', 'the names follow the minds (stolen body)');
      eq(gy.name, 'Goku', 'and the borrowed one');
      // the player follows their own mind
      eq(s.b.player, gy, 'the player now holds the body their mind is in');
      ok(gy.isPlayer && !hero.isPlayer, 'exactly one body is player-controlled');
      eq(gy.controller.constructor.name, 'PlayerController', 'and it has the player controller');
      eq(hero.controller.constructor.name, 'AIController', 'while the stolen one is driven by the AI');
      // sides and party
      eq(hero.team, gyTeam, 'the stolen body fights for the captain now');
      eq(gy.team, heroTeam, 'and the borrowed one for the heroes');
      eq(s.b.party.length, 1, 'the party still has one seat');
      eq(s.b.party[0], gy, 'and it points at the body the player is in, not at a body they lost');
      ok(!s.b.party.includes(hero), 'no dangling reference to the stolen body');
      // bodies keep what belongs to bodies
      eq(hero.hp, heroHp, 'health stays with the body');
      eq(gy.hp, gyHp, 'for both of them');
      eq(hero.def.id, 'goku', 'and so does the body itself');
      // nobody is left aiming at their own side
      for (const f of s.b.fighters) ok(!f.target || f.target.team !== f.team, f.def.id + ' is not aiming at an ally');
      s.b.dispose();
    });

    test('the thief cannot use what he stole, and gives it back on the way out', () => {
      const s = stage();
      fireAt(s);
      const stolen = s.hero;
      eq(Math.round((stolen.damageDealtMul || 1) * 100) / 100, CHANGE.penalty, 'the stolen body hits softer: ' + stolen.damageDealtMul);
      eq(s.gy.damageDealtMul || 1, 1, "the body the player was left is not penalised on top of being a wreck");
      // and a second change puts everything back
      s.b.swapBodies(s.gy, stolen, { penalty: CHANGE.penalty, penalize: null, silent: true });
      eq(s.b.mindOf(stolen).id, 'goku', 'the mind is home');
      eq(stolen.damageDealtMul || 1, 1, 'and the body works properly again');
      eq(s.b.player, stolen, 'the player is back in their own body');
      eq(s.b.party[0], stolen, 'and so is the party seat');
      eq(stolen.name, 'Goku', 'with the right name on it');
      s.b.dispose();
    });

    test('the AI that drives a stolen body is the thief, and it keeps fighting', () => {
      const gg = H.create({ quiet: true, seed: 8 });
      const b = gg.battle({ p1: 'goku', p2: 'ginyu', distance: 6 });
      const gy = b.fighters.find((f) => f.def.id === 'ginyu');
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      b.setParty([gk]);
      gy.target = gk;
      gy.ki = gy.kiMax;
      gg.SL.Techniques.bodyChange.start(gy, CHANGE, 'boss', 0);
      gg.until(b, () => gy.state !== 'bodyChange', 60 * 4);
      eq(b.mindOf(gk).id, 'ginyu', 'the captain has the body');
      const states = {};
      let damage = 0;
      b.on('damage', (e) => {
        if (e.attacker === gk) damage += e.amount || 0;
      });
      gg.step(b, 60 * 15, () => {
        states[gk.state] = (states[gk.state] || 0) + 1;
      });
      eq(gk.controller.p.personality, SL.data.characters.ginyu.ai.personality, 'it fights with the captain\'s profile, not with Goku\'s');
      ok((states.attack || 0) > 30, 'and it actually fights: ' + JSON.stringify(states).slice(0, 90));
      ok(damage > 0, 'landing real damage: ' + Math.round(damage));
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('stepping into a beam meant for somebody else takes it instead', () => {
      const gg = H.create({ quiet: true, seed: 6 });
      const b = gg.battle({ p1: 'vegeta', p2: 'ginyu', distance: 12 });
      const gy = b.fighters.find((f) => f.def.id === 'ginyu');
      const vg = b.fighters.find((f) => f.def.id === 'vegeta');
      const gk = b.spawn({ charId: 'goku', team: vg.team, pos: new gg.V3(0, 0, 0) });
      b.setParty([vg]);
      gy.target = vg;
      gy.ki = gy.kiMax;
      const log = [];
      b.on('bodyChangeIntercepted', (e) => log.push('intercept:' + e.victim.def.id + '<-' + e.intended.def.id));
      b.on('bodyChanged', () => log.push('changed'));
      gg.SL.Techniques.bodyChange.start(gy, CHANGE, 'boss', 0);
      gg.until(b, () => gy.stateFrame >= CHANGE.startup - 2 || gy.state !== 'bodyChange', 60 * 4);
      gk.setPosition(gy.pos.clone().lerp(vg.pos, 0.5));
      gg.until(b, () => gy.state !== 'bodyChange', 60 * 2);
      eq(log.join(','), 'intercept:goku<-vegeta,changed', 'the one in the way is the one it takes');
      eq(b.mindOf(gk).id, 'ginyu', 'so the captain lands in the body that blocked it');
      ok(!vg.mind || b.mindOf(vg).id === 'vegeta', 'and the intended target keeps their own');
      b.dispose();
    });
  }

  console.log('\nNamek: "The Captain" (headless)');
  {
    const g = H.create({ quiet: true, seed: 17 });
    const { SL } = g;

    test('"The Captain" follows "Two Against One" and is built around its two fights', () => {
      const order = SL.data.storyOrder();
      const iP = order.indexOf('namek_ginyu_pair'), iG = order.indexOf('namek_ginyu');
      ok(iP > 0 && iG === iP + 1, 'order: ' + order.slice(-3).join(' → '));
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_ginyu', results(['namek_recoome'])), 'locked until the pair are beaten');
      ok(!SL.data.storyLocked('namek_ginyu', results(['namek_ginyu_pair'])), 'and opens after them');
      const def = SL.data.missions.namek_ginyu;
      eq(def.phases.map((p) => p.id).join(','), 'arrival,captain,change,stolen,retake,after', 'six phases');
      eq(def.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'captain,stolen,retake', 'three checkpoints');
    });

    test('a bot plays "The Captain" start to finish and comes out in its own body', () => {
      // its own context, for the same reason as the Zarbon playthrough
      const g = H.create({ quiet: true, seed: 5 });
      const r = g.playMission('namek_ginyu', { maxSeconds: 480 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'arrival,captain,change,stolen,retake,after', 'every phase played');
      ok(m.flags.swapped, 'the story swap happened');
      ok(m.flags.retakeAttempts >= 1, 'and he went for Vegeta afterwards: ' + m.flags.retakeAttempts);
      eq(b.mindOf(S.goku).id, 'goku', 'Goku ends the mission in his own body');
      eq(b.mindOf(S.ginyu).id, 'ginyu', 'and the captain in his');
      eq(S.goku.name, 'Goku', 'with the right names on both');
      eq(S.ginyu.name, 'Captain Ginyu', '');
      eq(S.goku.damageDealtMul || 1, 1, 'and no borrowed-body penalty left behind');
      ok(r.record && r.record.completed, 'the clear is recorded for progression');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the stolen checkpoint stages the swap itself, so a retry is not stuck in the wrong body', () => {
      const gg = H.create({ quiet: true, seed: 23 });
      const b = gg.mission('namek_ginyu', { startPhase: 3 });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.mindOf(S.ginyu).id, 'goku', 'the player starts in the captain\'s body');
      eq(b.player, S.ginyu, 'and holds it');
      eq(b.mindOf(S.goku).id, 'ginyu', 'while the captain has theirs');
      ok(b.party.includes(S.ginyu) && !b.party.includes(S.goku), 'the party seats are the heroes, not the stolen body');
      ok(S.goku.team !== S.ginyu.team, 'and the two are on opposite sides');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('replaying from the retake checkpoint still ends with the bodies back where they belong', () => {
      const gg = H.create({ quiet: true, seed: 17 });
      const r = gg.playMission('namek_ginyu', { maxSeconds: 300, startPhase: 4 });
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(r.m.state, 'success', 'completes from the checkpoint (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'retake,after', 'and only replays what comes after it');
      eq(r.b.mindOf(r.b.story.goku).id, 'goku', 'Goku has his body back');
      eq(r.b.player, r.b.story.goku, 'and the player is in it');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });
  }


  console.log('\nNamek: "Nothing Like a Frog" (headless)');
  {
    const g = H.create({ quiet: true, seed: 19 });
    const { SL } = g;

    test('the frog is a body like any other, which is the whole point of it', () => {
      const frog = SL.data.characters.namek_frog;
      eq(SL.Schema.validateCharacter(frog).join(' | '), '', 'schema');
      ok(frog.cinematicOnly && !frog.playable, 'story-only');
      ok(frog.appearance.height < 0.5, 'and very small: ' + frog.appearance.height);
      const order = SL.data.storyOrder();
      const iG = order.indexOf('namek_ginyu'), iF = order.indexOf('namek_frog');
      ok(iG > 0 && iF === iG + 1, 'order: ' + order.slice(-3).join(' → '));
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_frog', results(['namek_ginyu_pair'])), 'locked until the captain is dealt with');
      ok(!SL.data.storyLocked('namek_frog', results(['namek_ginyu'])), 'and opens after him');
    });

    test('a bot plays "Nothing Like a Frog": Jeice falls and the captain ends up somewhere much smaller', () => {
      const r = g.playMission('namek_frog', { maxSeconds: 300 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'cleanup,lastTry,armour', 'every phase played');
      ok(!S.jeice.alive, 'Jeice does not leave this one');
      ok(m.flags.frogged, 'and the last Body Change went off');
      // the same system as the captain's fight, pointed at a frog
      eq(b.mindOf(S.frog).id, 'ginyu', 'the captain is in the frog');
      eq(b.mindOf(S.ginyu).id, 'namek_frog', 'and the frog is in the body he wrecked');
      eq(S.frog.name, 'Captain Ginyu', 'the names moved with the minds');
      eq(S.ginyu.name, 'Namekian Frog', '');
      eq(b.player, S.vegeta, 'the player was never part of that trade');
      ok(!S.vegeta.mind || b.mindOf(S.vegeta).id === 'vegeta', 'and keeps his own mind');
      for (const f of b.fighters) ok(!f.isPlayer || f === b.player, 'only one body is player-controlled');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Jeice alone is still Jeice: he keeps buying distance, and it is not enough', () => {
      const gg = H.create({ quiet: true, seed: 19 });
      const r = gg.playMission('namek_frog', { maxSeconds: 300 });
      eq(r.m.state, 'success', 'the fight is winnable');
      ok(r.m.flags.jeiceSeconds >= 5, 'it was a fight rather than a formality: ' + r.m.flags.jeiceSeconds + ' s');
      // and the spacing move is genuinely on the table whenever he is crowded
      const b2 = gg.battle({ p1: 'vegeta', p2: 'jeice', distance: 3 });
      const jc = b2.fighters.find((f) => f.def.id === 'jeice');
      jc.controller = new gg.SL.AIController(b2, { difficulty: 'hard' });
      jc.controller.update(jc);
      jc.ki = jc.kiMax;
      const scores = { melee: 1, blast: 0.6, strafe: 0.3 };
      jc.controller.patternCd = {};
      gg.SL.AIHooks.boss.scores(jc.controller, jc, jc.target, 3, null, scores, false);
      ok(scores.p_kickoff > 0, 'crowded, he reaches for the kick-off: ' + JSON.stringify(scores));
      b2.dispose();
      ok(r.b.story.vegeta.alive, 'the prince finishes it standing');
    });
  }


  console.log('\nFrieza: first form (headless)');
  {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;

    test('Frieza is a fighter now, and the prologue prop survived the change', () => {
      const fz = SL.data.characters.frieza;
      eq(SL.Schema.validateCharacter(fz).join(' | '), '', 'schema');
      ok(fz.stats.hp > 0 && fz.stats.hp < 99999, 'real health instead of the prop placeholder: ' + fz.stats.hp);
      ok(fz.moves.light.length >= 3 && fz.moves.heavy[0], 'he has a kit');
      ok(fz.poise && fz.poise.max > 0, 'and poise like any other boss: ' + fz.poise.max);
      eq(fz.specials.special1.id, 'deathBeam', 'the Death Beam is his opener');
      eq(fz.boss.phases[0].id, 'amused', 'the fight opens in the first form');
      eq(fz.boss.phases.length, 4, 'and runs through four of them');
      // the prologue drives him seated in a pod; those poses had to keep working
      for (const k of ['fz_pod', 'fz_finger', 'fz_laugh']) ok(fz.poses[k], 'prologue pose kept: ' + k);
      ok(typeof fz.poses.idle === 'function', 'and idle is now a standing stance');
      eq(fz.forms[0].id, 'base', 'the first form is the base form');
    });

    test('the Death Beam goes through a guard; his ordinary ki blasts do not', () => {
      // one shot each at a defender who really is holding guard (the dummy controller
      // presses it every frame, which a hand-set state does not)
      const shoot = (pierce) => {
        const b = g.battle({ p1: 'goku', p2: 'frieza', distance: 16 });
        const fz = b.fighters.find((f) => f.def.id === 'frieza');
        const gk = b.fighters.find((f) => f.def.id === 'goku');
        gk.controller = new SL.AIController(b, { difficulty: 'normal', dummy: 'guard' });
        gk.infiniteHp = true;
        fz.cannotDie = true;
        let blocked = 0, through = 0;
        b.on('damage', (e) => {
          if (e.target !== gk) return;
          if (e.blocked) blocked += e.amount || 0;
          else through += e.amount || 0;
        });
        g.step(b, 20); // let him settle into the guard
        const origin = fz.handPos('R');
        const dir = gk.chest().sub(origin).normalize();
        // his own Death Beam numbers, with only guardPierce varied
        const spec = Object.assign({}, fz.specFor('special1').projectile, { guardPierce: pierce });
        b.projectiles.spawnBlast(fz, origin, dir, spec);
        g.until(b, () => blocked > 0 || through > 0, 60 * 4);
        b.dispose();
        return { blocked: Math.round(blocked), through: Math.round(through) };
      };
      const beam = shoot(true);
      ok(beam.through > 1000, 'the Death Beam lands in full on a guarding target: ' + JSON.stringify(beam));
      eq(beam.blocked, 0, 'none of it is blocked');
      const plain = shoot(false);
      ok(plain.blocked > 0, 'the same shot without guardPierce is blocked: ' + JSON.stringify(plain));
      eq(plain.through, 0, 'and none of it goes through');
      ok(plain.blocked < beam.through * 0.5, 'for a fraction of the damage: ' + plain.blocked + ' vs ' + beam.through);
      eq(SL.data.characters.frieza.specials.special1.projectile.guardPierce, true, 'and that flag is what the Death Beam carries');
    });

    test('his phases own his kit: the first form never reaches for a later form\'s moves', () => {
      const fz = SL.data.characters.frieza;
      const first = fz.boss.phases[0].patterns;
      for (const name of ['charge', 'storm', 'barrage', 'rush', 'wave3', 'saucers', 'beam4', 'ball']) {
        ok(!first[name], 'the first form is not offered ' + name);
      }
      ok(first.beam > 0 && first.melee > 0, 'it has its own: ' + JSON.stringify(first));
      const gg = H.create({ quiet: true, seed: 5 });
      const b = gg.battle({ p1: 'goku', p2: 'frieza', distance: 14 });
      const f = b.fighters.find((x) => x.def.id === 'frieza');
      const gk = b.fighters.find((x) => x.def.id === 'goku');
      f.controller = new gg.SL.AIController(b, { difficulty: 'hard' });
      gk.controller = new gg.SL.AIController(b, { difficulty: 'normal', dummy: 'guard' });
      gk.infiniteHp = true;
      f.cannotDie = true;
      const used = {};
      b.on('special', (e) => {
        if (e.fighter === f && e.spec) used[e.spec.id] = (used[e.spec.id] || 0) + 1;
      });
      gg.step(b, 60 * 45, () => {
        f.ki = f.kiMax;
        if (f.hp < f.hpMax) f.hp = f.hpMax; // hold him in the first phase
      });
      eq(gg.SL.Mechanics.boss.phaseOf(f).id, 'amused', 'held in the first phase');
      ok(used.deathBeam >= 1, 'the Death Beam does come out: ' + JSON.stringify(used));
      // the first form has its own beam and wave; what it must never reach for is a
      // later form's kit, which only exists after a transformation
      const later = ['deathBeam2', 'hornRush', 'deathStorm', 'beamBarrage', 'clawRush', 'deathWave3', 'deathSaucers', 'deathBeam4', 'deathBall'];
      for (const id of later) ok(!used[id], id + ' belongs to a later form: ' + JSON.stringify(used));
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });
  }


  console.log('\nFrieza: four forms, cruelty and the transformation cinematic (headless)');
  {
    const g = H.create({ quiet: true, seed: 31 });
    const { SL } = g;
    const FZ = SL.data.characters.frieza;

    test('the four forms are four different fighters, not one with a tint', () => {
      eq(SL.Schema.validateCharacter(FZ).join(' | '), '', 'schema');
      // four forms, plus the story-only 100% (namek_end) built on the final form — and, since Movie 2 · Super Broly
      // (2026-10-10), the film-only Golden form after it, story-locked as well
      eq(FZ.forms.map((f) => f.id).join(','), 'base,second,third,final,full,golden', 'four forms, then 100%, then Golden');
      ok(FZ.forms[4].storyLocked, 'and 100% is a story form');
      ok(FZ.forms[5].storyLocked, 'and so is Golden');
      const ids = (i) => Object.values((FZ.forms[i].specials) || FZ.specials).map((x) => x.id).join(',');
      const moveIds = (i) => ((FZ.forms[i].moves || FZ.moves).light || []).map((x) => x.id).join(',');
      const seenSpecials = new Set();
      const seenMoves = new Set();
      for (let i = 0; i < 4; i++) {
        for (const id of ids(i).split(',')) {
          ok(!seenSpecials.has(id), 'special ' + id + ' belongs to one form only');
          seenSpecials.add(id);
        }
        for (const id of moveIds(i).split(',')) {
          ok(!seenMoves.has(id), 'move ' + id + ' belongs to one form only');
          seenMoves.add(id);
        }
      }
      // silhouette, not palette: each form carries its own size and its own horns
      const scales = FZ.forms.map((f) => (f.look && f.look.scale) || 1);
      ok(new Set(scales).size >= 3, 'the forms are different sizes: ' + scales.join(', '));
      const horns = FZ.forms.map((f) => (f.look && f.look.headExtras ? f.look.headExtras.length : (FZ.appearance.headExtras || []).length));
      ok(new Set(horns).size >= 3, 'and different heads: ' + horns.join(', '));
      const auras = FZ.forms.map((f) => f.aura && f.aura.color);
      eq(new Set(auras).size, FZ.forms.length, 'an aura each');
      // and they are meant to play differently
      const sp = FZ.forms[3].specials;
      eq(sp.special1.type, 'deathSaucer', 'the final form throws saucers');
      eq(sp.ultimate.id, 'deathBall', 'and the Death Ball is its ultimate');
      eq(FZ.forms[1].specials.special2.type, 'rush', 'the second form charges');
      eq(FZ.forms[2].specials.special2.hits.length, 4, 'the third form claws in a flurry');
      for (let i = 1; i < 4; i++) ok(FZ.forms[i].sequence && FZ.forms[i].sequence.length >= 180, 'form ' + FZ.forms[i].id + ' has a real transformation sequence');
    });

    test('applying a form swaps the kit the fighter actually uses', () => {
      const b = g.battle({ p1: 'goku', p2: 'frieza', distance: 10 });
      const fz = b.fighters.find((f) => f.def.id === 'frieza');
      const seen = [];
      for (let i = 0; i < 4; i++) {
        fz.applyForm(i);
        seen.push({
          form: fz.form.id,
          s1: fz.specFor('special1').id,
          ult: fz.specFor('ultimate').id,
          light: fz.moveSet.light[0].id,
          speed: +fz.mult().speed.toFixed(2),
          damage: +fz.mult().damage.toFixed(2),
        });
      }
      eq(seen.map((x) => x.s1).join(','), 'deathBeam,deathBeam2,beamBarrage,deathSaucers', 'special 1 per form');
      eq(seen.map((x) => x.ult).join(','), 'deathBeamVolley,deathStorm,deathWave3,deathBall', 'ultimate per form');
      eq(new Set(seen.map((x) => x.light)).size, 4, 'and a different chain in each: ' + seen.map((x) => x.light).join(','));
      ok(seen[3].speed > seen[1].speed, 'the final form moves better than the second: ' + seen[3].speed + ' vs ' + seen[1].speed);
      ok(seen[1].damage > seen[0].damage && seen[3].damage > seen[1].damage, 'and they hit harder as they go: ' + seen.map((x) => x.damage).join(' → '));
      b.dispose();
    });

    test('his phases own his forms: each phase enters the transformation that belongs to it', () => {
      const phases = FZ.boss.phases;
      eq(phases.map((x) => x.id).join(','), 'amused,annoyed,angry,dominating', 'four phases');
      eq(phases.map((x) => x.enter || '-').join(','), '-,toSecond,toThird,toFinal', 'and three transformations');
      for (const [k, t] of Object.entries(FZ.boss.techniques)) {
        if (t.type !== 'bossTransform') continue;
        ok(FZ.forms[t.form], k + ' points at a real form');
        ok(t.frames >= 180, k + ' is not a two-second shrug: ' + t.frames + ' frames');
      }
      // a mission can hold him where the story needs him
      const b = g.battle({ p1: 'goku', p2: 'frieza', distance: 10 });
      const fz = b.fighters.find((f) => f.def.id === 'frieza');
      fz.cannotDie = true;
      fz.infiniteHp = false;
      fz.bossPhaseCap = 0;
      fz.hp = Math.round(fz.hpMax * 0.1);
      g.step(b, 60);
      eq(fz.mech.phase, 0, 'capped at the first phase even at 10% health');
      eq(fz.formIndex, 0, 'so he never leaves the first form');
      fz.bossPhaseCap = 3;
      g.step(b, 30);
      ok(fz.mech.phase > 0, 'lifting the cap lets the fight move on: phase ' + fz.mech.phase);
      b.dispose();
    });

    test('cruelty: he hits the wounded harder, and only the wounded', () => {
      const b = g.battle({ p1: 'goku', p2: 'frieza', distance: 4 });
      const fz = b.fighters.find((f) => f.def.id === 'frieza');
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      let events = 0;
      b.on('cruelty', () => events++);
      const hit = { type: 'melee', damage: 1000, knock: 'none', hitstun: 0 };
      // both measurements are the first hit of a combo: the damage formula tapers
      // later hits, and that taper is not what this test is about
      const swing = (hpFrac) => {
        fz.combo.hits = 0;
        fz.combo.timer = 0;
        gk.hp = Math.round(gk.hpMax * hpFrac);
        const before = gk.hp;
        gk.takeHit(fz, hit);
        return before - gk.hp;
      };
      const healthy = swing(1);
      eq(events, 0, 'nothing special about hitting somebody who is fine');
      const hurt = swing(0.2);
      ok(hurt > healthy * 1.2, 'the same blow hurts more when they are nearly done: ' + Math.round(hurt) + ' vs ' + Math.round(healthy));
      eq(events, 1, 'and it announces itself once');
      const ratio = hurt / healthy;
      ok(Math.abs(ratio - FZ.cruelty.mul) < 0.03, 'by the documented multiplier: ' + ratio.toFixed(2) + ' vs ' + FZ.cruelty.mul);
      b.dispose();
    });

    test('his AI punishes a charging opponent instead of waiting politely', () => {
      const b = g.battle({ p1: 'goku', p2: 'frieza', distance: 14 });
      const fz = b.fighters.find((f) => f.def.id === 'frieza');
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      fz.controller = new SL.AIController(b, { difficulty: 'hard' });
      fz.ki = fz.kiMax;
      fz.controller.update(fz); // builds the profile the hook reads
      const score = () => {
        const scores = { melee: 1, blast: 0.5, strafe: 0.4, wait: 0.5 };
        fz.controller.patternCd = {};
        // the delayed view he reacts to shows what Goku is doing (fairness pass: he punishes a
        // charge he has seen, not the frame it starts — frieza-fair-tests covers the unseen case)
        SL.AIHooks.frieza.scores(fz.controller, fz, gk, 14, { state: gk.state }, scores, false);
        return scores;
      };
      gk.setState('free');
      const idle = score();
      gk.setState('charge');
      const charging = score();
      ok(charging.p_beam > idle.p_beam, 'the beam is far more attractive against a charging target: ' + charging.p_beam + ' vs ' + idle.p_beam);
      ok(charging.wait < idle.wait, 'and standing around is less so: ' + charging.wait + ' vs ' + idle.wait);
      gk.setState('free');
      // crowded: since playtest round 2 he fights up close first (he used to back off every time,
      // and the owner could never close on him), and only breaks away after being crowded a while
      const close = { melee: 1, blast: 0.5, strafe: 0.4, wait: 0.5 };
      fz.controller.patternCd = {};
      SL.AIHooks.frieza.scores(fz.controller, fz, gk, 2, null, close, false);
      ok(!close.retreat, 'freshly crowded, he stays and fights: retreat ' + close.retreat);
      fz.controller.frame += 200;
      const later = { melee: 1, blast: 0.5, strafe: 0.4, wait: 0.5 };
      SL.AIHooks.frieza.scores(fz.controller, fz, gk, 2, null, later, false);
      ok(later.retreat > 0.5, 'crowded for a while, he backs off: ' + later.retreat);
      ok(close.melee < 1, 'rather than trading: ' + close.melee);
      b.dispose();
    });

    test('Death Saucers chase, and a saucer that has been chasing long enough stops taking sides', () => {
      const gg = H.create({ quiet: true, seed: 3 });
      const b = gg.battle({ p1: 'goku', p2: 'frieza', distance: 14 });
      const fz = b.fighters.find((f) => f.def.id === 'frieza');
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      fz.applyForm(3);
      fz.ki = fz.kiMax;
      fz.target = gk;
      fz.cannotDie = true;
      fz.infiniteHp = false;
      gk.infiniteHp = true;
      const spec = fz.specFor('special1');
      let loose = 0, dmg = 0;
      b.on('deathSaucerLoose', () => loose++);
      b.on('damage', (e) => {
        if (e.target === gk) dmg += e.amount || 0;
      });
      ok(gg.SL.Techniques.deathSaucer.start(fz, spec, 'special1', spec.kiCost), 'the technique starts');
      let discs = 0;
      gg.step(b, 60 * 4, () => {
        discs = Math.max(discs, b.projectiles.list.filter((x) => x.kind === 'disc').length);
      });
      eq(discs, spec.count, 'both saucers are in the air');
      ok(dmg > 0, 'and they reach a target that stands still: ' + Math.round(dmg));
      b.dispose();

      // now a target that keeps running: the leash runs out instead
      const b2 = gg.battle({ p1: 'goku', p2: 'frieza', distance: 14 });
      const fz2 = b2.fighters.find((f) => f.def.id === 'frieza');
      const gk2 = b2.fighters.find((f) => f.def.id === 'goku');
      fz2.applyForm(3);
      fz2.ki = fz2.kiMax;
      fz2.target = gk2;
      fz2.cannotDie = true;
      fz2.infiniteHp = false;
      gk2.infiniteHp = true;
      let loose2 = 0;
      b2.on('deathSaucerLoose', () => loose2++);
      gg.SL.Techniques.deathSaucer.start(fz2, spec, 'special1', spec.kiCost);
      gg.step(b2, 60 * 8, () => {
        gk2.setPosition(gk2.pos.clone().add(new gg.V3(0.9, 0, 0.4)));
      });
      eq(loose2, spec.count, 'every saucer eventually turns on the field: ' + loose2);
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b2.dispose();
    });

    test('a transformation cinematic leaves the same state whether it is watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 9 });
        const b = gg.mission('namek_frieza1', { startPhase: 2 });
        const m = b.mission;
        const fz = b.story.frieza;
        let frames = 0, done = null;
        // the cinematic announces its own end; sample the world at that moment
        b.on('transformCinematic', () => {
          done = {
            form: fz.form.id,
            formIndex: fz.formIndex,
            state: fz.state,
            mood: b.stage.mood ? b.stage.mood.target : 0,
            transformed: m.flags.transformed,
            skipped: !!skip,
          };
        });
        gg.until(b, () => !!done, 60 * 90, () => {
          frames++;
          if (skip && b.inputLocked) b.skipRequested = true;
        });
        // a couple of frames later the mission has moved on and control is back
        gg.step(b, 6);
        const out = Object.assign({ frames, locked: b.inputLocked && m.phase && m.phase.id === 'second', errors: gg.errors.length }, done || {});
        b.dispose();
        return out;
      };
      const watched = run(false);
      const skipped = run(true);
      eq(watched.form, 'second', 'watched: he is in the second form');
      eq(skipped.form, 'second', 'skipped: same');
      eq(watched.formIndex, skipped.formIndex, 'same form index either way');
      eq(watched.transformed, skipped.transformed, 'the cinematic is counted once either way');
      eq(watched.mood, 0, 'watched: the lighting is put back');
      eq(skipped.mood, 0, 'skipped: the lighting is put back');
      eq(watched.state, 'free', 'watched: he is free to fight again');
      eq(skipped.state, 'free', 'skipped: he is free to fight again');
      eq(watched.locked, false, 'watched: the cinematic does not hold input after it ends');
      eq(skipped.locked, false, 'skipped: the cinematic does not hold input after it ends');
      ok(skipped.frames < watched.frames, 'and skipping is actually faster: ' + skipped.frames + ' vs ' + watched.frames + ' frames');
      eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
    });
  }

  console.log('\nNamek: "The Emperor" (headless)');
  {
    const g = H.create({ quiet: true, seed: 21 });
    const { SL } = g;

    test('"The Emperor" follows the Ginyu Force and is shaped as cinematic, fight, transformation, fight', () => {
      const order = SL.data.storyOrder();
      const iN = order.indexOf('namek_nail'), iE = order.indexOf('namek_frieza1');
      ok(iN > 0 && iE === iN + 1, 'order: ' + order.slice(-3).join(' → '));
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_frieza1', results(['namek_frog'])), "locked until Nail's stand");
      ok(!SL.data.storyLocked('namek_frieza1', results(['namek_nail'])), 'and opens after it');
      const def = SL.data.missions.namek_frieza1;
      eq(def.phases.map((p) => p.id).join(','), 'arrival,firstForm,second,hold,after', 'five phases');
      eq(def.phases.filter((p) => p.checkpoint).map((p) => p.id).join(','), 'firstForm,hold', 'the two fights are the checkpoints');
      eq(def.character, 'vegeta', 'played as Vegeta');
    });

    test('the first-form fight really is first form, and he is held there', () => {
      const b = g.mission('namek_frieza1', { startPhase: 1 });
      const S = b.story;
      g.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.frieza.form.id, 'base', 'first form');
      eq(S.frieza.bossPhaseCap, 0, 'and capped there');
      ok(S.frieza.cannotDie, 'canon: nobody finishes him in this mission');
      eq(b.player.def.id, 'vegeta', 'played as Vegeta');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('a bot plays "The Emperor" start to finish and sees the second form arrive', () => {
      const r = g.playMission('namek_frieza1', { maxSeconds: 600 });
      const b = r.b, m = r.m;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'arrival,firstForm,second,hold,after', 'every phase played');
      ok(m.flags.secondForm, 'the transformation happened');
      eq(b.story.frieza.form.id, 'second', 'and he is still in it at the end');
      eq(b.story.frieza.formIndex, 1, '');
      ok(b.story.vegeta.alive, 'Vegeta survives the mission (canon)');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the hold checkpoint stages the second form itself, so a retry is not fighting the wrong body', () => {
      const gg = H.create({ quiet: true, seed: 7 });
      const b = gg.mission('namek_frieza1', { startPhase: 3 });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.frieza.form.id, 'second', 'second form from the checkpoint');
      eq(S.frieza.bossPhaseCap, 1, 'and held there');
      ok(b.party && b.party.length === 3, 'the party is all three heroes: ' + (b.party || []).length);
      ok(!S.krillin.untargetable && !S.gohan.untargetable, 'who are all really in the fight');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });
  }


  console.log('\nNamek: "The Warrior" — Nail, regeneration and the fusion (headless)');
  {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;

    test('Nail is a real fighter built around lasting, not winning', () => {
      const n = SL.data.characters.nail;
      eq(SL.Schema.validateCharacter(n).join(' | '), '', 'schema');
      eq(n.mechanic.type, 'regenerator', 'Namekian regeneration is his mechanic');
      ok(n.regen && n.regen.perSecond > 0 && n.regen.maxFrac <= 1, 'with real numbers: ' + JSON.stringify(n.regen));
      ok(n.stats.defense > 1.1 && n.ratings.defense >= 4, 'and he is built to be hit');
      ok(n.moves.light.length >= 3 && n.specials.special1, 'he has a kit of his own');
    });

    test('holding guard knits him back together, and only while he holds it', () => {
      const b = g.battle({ p1: 'nail', p2: 'frieza', distance: 8 });
      const nl = b.fighters.find((f) => f.def.id === 'nail');
      const cap = nl.hpMax * SL.data.characters.nail.regen.maxFrac;
      nl.hp = Math.round(nl.hpMax * 0.3);
      const start = nl.hp;
      // standing about does nothing
      nl.setState('free');
      g.step(b, 120);
      eq(Math.round(nl.hp), Math.round(start), 'no free healing');
      // guarding does
      const hold = () => {
        if (nl.state !== 'guard') nl.setState('guard');
      };
      g.step(b, 300, hold);
      ok(nl.hp > start * 1.1, 'a held guard closes wounds: ' + Math.round(start) + ' → ' + Math.round(nl.hp));
      // ...up to a cap, so he can never guard his way to full health
      g.step(b, 60 * 30, hold);
      ok(nl.hp <= cap + 1, 'and it stops at the cap: ' + Math.round(nl.hp) + ' <= ' + Math.round(cap));
      b.dispose();
    });

    test('"The Warrior" sits between the frog and Frieza, and is played as Nail', () => {
      const order = SL.data.storyOrder();
      const iF = order.indexOf('namek_frog'), iN = order.indexOf('namek_nail');
      ok(iF > 0 && iN === iF + 1, 'order: ' + order.slice(-4).join(' → '));
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_nail', results(['namek_ginyu'])), 'locked until the frog');
      ok(!SL.data.storyLocked('namek_nail', results(['namek_frog'])), 'and opens after it');
      const def = SL.data.missions.namek_nail;
      eq(def.character, 'nail', 'played as Nail');
      eq(def.phases.map((x) => x.id).join(','), 'stand,stall,arm,fusion,after', 'five phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'stall', 'the stall is the checkpoint');
    });

    test("Piccolo's fused form is a story grant: never on the wheel until the mission hands it over", () => {
      const pc = SL.data.characters.piccolo;
      eq(pc.forms.map((f) => f.id).join(','), 'base,nail', 'he has a second form now');
      const fused = pc.forms[1];
      ok(fused.storyLocked && fused.noCost, 'which the player never buys: ' + JSON.stringify({ storyLocked: fused.storyLocked, noCost: fused.noCost }));
      ok(fused.mult.damage > 1.3 && fused.sequence, 'and it is a real power-up with a sequence');
      const b = g.battle({ p1: 'piccolo', p2: 'frieza', distance: 8 });
      const p2 = b.fighters.find((f) => f.def.id === 'piccolo');
      p2.ki = p2.kiMax;
      ok(p2.lockedForms && p2.lockedForms.nail, 'a freshly spawned Piccolo has it locked');
      const wheel = SL.RadialMenu.buildEntries(p2, b).map((e) => e.id);
      ok(!wheel.includes('transform'), 'and it is not advertised on the wheel: ' + wheel.join(','));
      eq(p2._tryTransform ? p2._tryTransform() : false, false, 'pressing transform does nothing');
      eq(p2.formIndex, 0, 'he stays himself');
      b.dispose();
    });

    test('a bot plays "The Warrior": the stall holds, the regeneration matters, and Piccolo leaves it fused', () => {
      const r = g.playMission('namek_nail', { maxSeconds: 400 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'stand,stall,arm,fusion,after', 'every phase played');
      ok(m.flags.regenerated > 500, 'guarding healed real damage: ' + m.flags.regenerated);
      ok(m.flags.friezaLeft, 'Frieza leaves for the Dragon Balls');
      ok(m.flags.fused, 'and Nail goes into Piccolo');
      eq(S.piccolo.form.id, 'nail', 'who ends the mission fused');
      eq(S.piccolo.formIndex, 1, '');
      ok(S.nail.hidden, 'Nail is off the field afterwards');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }


  console.log('\nNamek: "Two More Shapes" — the third and final forms (headless)');
  {
    const g = H.create({ quiet: true, seed: 9 });
    const { SL } = g;

    test('"Two More Shapes" follows "The Emperor" and is played as the fused Piccolo', () => {
      const order = SL.data.storyOrder();
      const iE = order.indexOf('namek_frieza1'), iC = order.indexOf('namek_gohan_frieza2'), iT = order.indexOf('namek_frieza2');
      ok(iE > 0 && iC === iE + 1 && iT === iC + 1, 'order: ' + order.slice(iE, iT + 1).join(' → '));
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_frieza2', results(['namek_frieza1'])), 'locked until The Child is cleared');
      ok(!SL.data.storyLocked('namek_frieza2', results(['namek_gohan_frieza2'])), 'and opens after it');
      const def = SL.data.missions.namek_frieza2;
      eq(def.character, 'piccolo', 'played as Piccolo');
      eq(def.phases.map((x) => x.id).join(','), 'arrive,even,third,outclassed,final,after', 'six phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'even,outclassed', 'the two fights are the checkpoints');
    });

    test('it starts where the last mission left off: a fused Piccolo against the second form', () => {
      const b = g.mission('namek_frieza2', { startPhase: 1 });
      const S = b.story;
      g.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.piccolo.form.id, 'nail', 'Piccolo is carrying Nail');
      eq(S.frieza.form.id, 'second', 'and Frieza is already in his second form');
      eq(S.frieza.bossPhaseCap, 1, 'held there until the story says otherwise');
      eq(b.player, S.piccolo, 'the player is Piccolo');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('the survival checkpoint stages the third form itself', () => {
      const gg = H.create({ quiet: true, seed: 4 });
      const b = gg.mission('namek_frieza2', { startPhase: 3 });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.frieza.form.id, 'third', 'third form from the checkpoint');
      eq(S.frieza.bossPhaseCap, 2, 'and held there');
      ok(S.frieza.infiniteHp, 'this one is survived rather than won');
      eq(S.piccolo.form.id, 'nail', 'Piccolo is still fused');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('a bot plays "Two More Shapes": both transformations happen, and he ends it in his final form', () => {
      const r = g.playMission('namek_frieza2', { maxSeconds: 600 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'arrive,even,third,outclassed,final,after', 'every phase played');
      ok(m.flags.thirdForm && m.flags.finalForm, 'both transformations played');
      eq(m.flags.transformed, 2, 'both staged through the cinematic system');
      eq(S.frieza.form.id, 'final', 'he ends the mission as himself');
      eq(S.frieza.formIndex, 3, '');
      ok(S.piccolo.alive, 'Piccolo survives it (canon)');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }


  console.log('\nCinema: data-driven scenes, voice cues and Goku on Namek (headless)');
  {
    const g = H.create({ quiet: true, seed: 12 });
    const { SL } = g;

    test('scenes are data, and the runner understands the storyboard', () => {
      const sc = SL.data.scenes.goku_namek_arrival;
      ok(sc && Array.isArray(sc.events) && sc.events.length >= 10, 'the arrival is a list of beats: ' + (sc.events || []).length);
      ok(typeof sc.end === 'function', 'and it declares the state it guarantees');
      ok(typeof sc.cast === 'function', 'with a cast the events address by name');
      // the beats are made of the documented primitives, not of ad-hoc code
      const kinds = new Set();
      for (const ev of sc.events) for (const k of Object.keys(ev)) kinds.add(k);
      for (const k of ['cam', 'hold', 'say', 'pose']) ok(kinds.has(k), 'uses ' + k);
      ok(kinds.has('vfx') || kinds.has('call'), 'and stages the landing itself');
      // the owner's line is carried exactly, with its translation under it
      const line = sc.events.find((e) => e.say && e.say.jp);
      ok(line, 'the arrival has an original-language line');
      eq(line.say.jp, '待たせたな…みんな', 'kept exactly as given');
      ok(/waiting/i.test(line.say.line), 'with an English rendering: ' + line.say.line);
      eq(line.say.style, 'quiet', 'delivered quietly rather than shouted');
      ok(line.hold >= 3, 'and given room to land: ' + line.hold + ' s');
    });

    test('a spoken line raises a voice cue and can carry the original text', () => {
      const b = g.mission('namek_goku', { startPhase: 0 });
      const m = b.mission;
      const said = [];
      b.on('say', (e) => said.push(e));
      m.say('goku', 'Sorry to have kept you waiting... everyone.', 3, { jp: '待たせたな…みんな', style: 'quiet', voice: 'goku_namek_arrival' });
      eq(said.length, 1, 'the line was emitted');
      eq(said[0].jp, '待たせたな…みんな', 'with the original text');
      eq(said[0].style, 'quiet', 'and its delivery');
      const cue = SL.Voice.lastCue;
      eq(cue.speaker, 'goku', 'a voice cue was raised for it');
      eq(cue.key, 'goku_namek_arrival', 'under the name the scene gave it');
      eq(cue.language, 'off', 'and voice playback is off by default (nothing ships)');
      // a provider (a voice pack somebody installs) receives cues once enabled
      let heard = null;
      SL.Voice.provider = { play: (c) => (heard = c) };
      SL.Settings.data.audio.voice = 'jp';
      m.say('goku', 'again', 1, { jp: 'もう一度', voice: 'goku_again' });
      eq(heard && heard.key, 'goku_again', 'the provider is called');
      eq(heard.jp, 'もう一度', 'with the original line');
      // and a provider that throws can never take the game down
      SL.Voice.provider = { play: () => { throw new Error('bad voice pack'); } };
      m.say('goku', 'and again', 1, { voice: 'x' });
      SL.Voice.provider = null;
      SL.Settings.data.audio.voice = 'off';
      b.dispose();
    });

    test('the arrival scene ends in the same state watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 12 });
        const b = gg.mission('namek_vegeta_end', { startPhase: 0 });
        const m = b.mission;
        let frames = 0, out = null;
        b.on('sceneEnd', (e) => {
          if (e.id !== 'goku_namek_arrival' || out) return;
          const S = b.story;
          out = {
            skipped: e.skipped,
            hidden: !!S.goku.hidden,
            state: S.goku.state,
            target: S.goku.target === S.frieza,
            friezaTarget: S.frieza.target === S.goku,
            dist: +S.goku.pos.distanceTo(S.frieza.pos).toFixed(1),
            arrived: !!m.flags.gokuArrived,
            mood: b.stage.mood ? +b.stage.mood.target.toFixed(2) : 0,
          };
        });
        gg.until(b, () => !!out, 60 * 120, () => {
          frames++;
          if (skip && b.inputLocked) b.skipRequested = true;
        });
        const errors = gg.errors.length;
        b.dispose();
        return Object.assign({ frames, errors }, out || {});
      };
      const watched = run(false);
      const skipped = run(true);
      ok(watched.frames > skipped.frames, 'skipping is faster: ' + skipped.frames + ' vs ' + watched.frames + ' frames');
      for (const k of ['hidden', 'state', 'target', 'friezaTarget', 'dist', 'arrived', 'mood']) {
        eq(String(skipped[k]), String(watched[k]), k + ' matches (' + watched[k] + ')');
      }
      eq(watched.hidden, false, 'Goku is on the field either way');
      eq(watched.arrived, true, 'and the story flag is set either way');
      eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
    });

    test('the Kaioken scene is what unlocks it, watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 6 });
        const b = gg.mission('namek_goku', { startPhase: 2 });
        const m = b.mission;
        let out = null;
        b.on('sceneEnd', (e) => {
          if (e.id !== 'goku_kaioken_escalation' || out) return;
          const S = b.story;
          out = {
            form: S.goku.form.id,
            formIndex: S.goku.formIndex,
            locked: !!(S.goku.lockedForms && S.goku.lockedForms.kaioken),
            shown: !!m.flags.kaiokenShown,
            state: S.goku.state,
          };
        });
        gg.until(b, () => !!out, 60 * 120, () => {
          if (skip && b.inputLocked) b.skipRequested = true;
        });
        const errors = gg.errors.length;
        b.dispose();
        return Object.assign({ errors }, out || {});
      };
      const watched = run(false);
      const skipped = run(true);
      eq(watched.form, 'kaioken', 'watched: the Kaioken is lit');
      eq(skipped.form, 'kaioken', 'skipped: the Kaioken is lit');
      eq(watched.locked, false, 'watched: and unlocked for the rest of the fight');
      eq(skipped.locked, false, 'skipped: and unlocked for the rest of the fight');
      eq(watched.shown, true, '');
      eq(skipped.shown, true, '');
      eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
    });

    test('the Kaioken costs what it is supposed to cost', () => {
      const b = g.battle({ p1: 'goku', p2: 'frieza', distance: 8 });
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      gk.ki = gk.kiMax;
      const before = { hp: gk.hp, strain: gk.strain };
      gk.applyForm(1);
      eq(gk.form.id, 'kaioken', 'in the Kaioken');
      g.step(b, 60 * 4);
      ok(gk.hp < before.hp, 'it burns health while it is lit: ' + Math.round(before.hp - gk.hp));
      ok(gk.strain > before.strain, 'and builds strain: ' + Math.round(gk.strain));
      const mult = gk.mult();
      ok(mult.damage > 1 && mult.speed > 1, 'for real power: ' + JSON.stringify({ damage: +mult.damage.toFixed(2), speed: +mult.speed.toFixed(2) }));
      b.dispose();
    });

    test('"The Emperor\'s True Power" is base Goku overwhelmed, then the Kaioken climbing to x4', () => {
      const order = SL.data.storyOrder();
      const iV = order.indexOf('namek_vegeta_end'), iG = order.indexOf('namek_goku'), iK = order.indexOf('namek_kaioken20');
      ok(iV > 0 && iG === iV + 1 && iK === iG + 1, 'the prince dies first, then the two Kaioken missions: ' + order.slice(iV, iK + 1).join(' → '));
      const def = SL.data.missions.namek_goku;
      eq(def.character, 'goku', 'played as Goku');
      eq(def.phases.map((x) => x.id).join(','), 'open,base,lake,kaioken,rising,after', 'six phases (the lake: moveset roadmap #24)');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'base,rising', 'the two fights are the checkpoints');
    });

    test('a bot plays it: base Goku survives the emperor, then lights the Kaioken and climbs it', () => {
      const r = g.playMission('namek_goku', { maxSeconds: 600 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'open,base,lake,kaioken,rising,after', 'every phase played');
      ok(m.flags.kaiokenShown, 'and the Kaioken escalation');
      ok(m.flags.kaiokenSeconds >= 3, 'and spent real time in the Kaioken: ' + m.flags.kaiokenSeconds + ' s');
      eq(S.goku.form.id, 'kaioken', 'which is still lit at the end');
      ok(S.frieza.formIndex === 3, 'and he was fighting the final form the whole way');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the second checkpoint hands the Kaioken over, so a retry is not fighting without it', () => {
      const gg = H.create({ quiet: true, seed: 3 });
      const idx = SL.data.missions.namek_goku.phases.findIndex((x) => x.id === 'rising');
      const b = gg.mission('namek_goku', { startPhase: idx });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      ok(!(S.goku.lockedForms && S.goku.lockedForms.kaioken), 'the Kaioken is unlocked from the checkpoint');
      eq(S.goku.formIndex, 1, 'and already lit');
      eq(b.player, S.goku, 'the player is Goku');
      ok(S.goku.controller, 'with a controller driving him');
      eq(S.frieza.form.id, 'final', 'against the final form');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });
  }


  console.log('\nNamek climax: Vegeta\'s end and the Spirit Bomb (headless)');
  {
    const g = H.create({ quiet: true, seed: 8 });
    const { SL } = g;

    test('the quiet scenes are staged as quiet: no music, no effects, long holds', () => {
      const words = SL.data.scenes.vegeta_final_words;
      const burial = SL.data.scenes.goku_buries_vegeta;
      ok(words && burial, 'both scenes exist');
      eq(burial.music.song, null, 'the burial runs with the music off');
      eq(burial.music.level, 0, '');
      const bigVfx = (burial.events || []).filter((e) => e.vfx && !['dust'].includes(e.vfx.kind));
      eq(bigVfx.length, 0, 'and with nothing but dust for effects');
      const longest = Math.max(...(words.events || []).map((e) => e.hold || 0));
      ok(longest >= 4, 'the death scene holds a shot for at least four seconds: ' + longest);
      const total = (burial.events || []).reduce((a, e) => a + (e.hold || 0), 0);
      ok(total >= 18, 'and the burial is given real time: ' + total.toFixed(0) + ' s');
      ok(typeof words.end === 'function' && typeof burial.end === 'function', 'both declare their end state');
    });

    test('"The Prince\'s Last Words" ends with Vegeta dead and buried, watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 8 });
        const r = gg.playMission('namek_vegeta_end', { maxSeconds: 420, skipCinematics: skip });
        const b = r.b, m = r.m, S = b.story;
        const out = {
          state: m.state,
          phases: r.log.filter((x) => x.ev === 'phase').map((x) => x.id).join(','),
          fell: !!m.flags.vegetaFell,
          buried: !!m.flags.vegetaBuried,
          alive: S.vegeta.alive,
          hidden: !!S.vegeta.hidden,
          grave: !!(S.grave && S.grave.object && S.grave.object.visible),
          errors: gg.errors.length,
        };
        return out;
      };
      const played = run(false);
      eq(played.state, 'success', 'mission state (' + played.phases + ')');
      eq(played.phases, 'arrival,confront,beam,words,burial,after', 'every phase played (the landing belongs to this mission now)');
      ok(played.fell && played.buried, 'both story flags set');
      eq(played.alive, false, 'Vegeta does not survive this one');
      eq(played.hidden, true, 'he is in the ground by the end');
      eq(played.grave, true, 'and there is a grave to show for it');
      eq(played.errors, 0, 'no engine errors');
    });

    test('the Spirit Bomb gathering is played as Piccolo while Goku holds it up for real', () => {
      const idx = SL.data.missions.namek_spirit_bomb.phases.findIndex((x) => x.id === 'hold');
      const b = g.mission('namek_spirit_bomb', { startPhase: idx });
      const S = b.story;
      g.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.player, S.piccolo, 'the player is Piccolo');
      eq(S.piccolo.form.id, 'nail', 'still carrying Nail');
      const spec = S.goku.specFor('ultimate');
      eq(spec.type, 'spiritBomb', 'Goku\'s ultimate is the Spirit Bomb');
      ok(spec.chargeFrames >= 1200, 'and this mission makes it a set piece: ' + spec.chargeFrames + ' frames');
      ok(S.goku.infiniteKi, 'the energy is everybody else\'s, so his own ki does not gate it');
      eq(S.goku.state, 'spiritBomb', 'Goku is holding it up');
      ok([S.krillin, S.gohan].every((f) => f.controller && f.controller.constructor.name === 'AIController'), 'Gohan and Krillin fight beside Piccolo');
      ok(S.frieza.infiniteHp, 'nothing here kills Frieza');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays the Spirit Bomb: the gathering, the hit, the quiet, the cliff and the Death Beam', () => {
      const r = g.playMission('namek_spirit_bomb', { maxSeconds: 600 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'call,hold,impact,quiet,return,sacrifice,after', 'every phase played');
      ok(m.flags.bombCalled, 'he asked for it');
      eq(m.flags.chargeFrac, 100, 'the gathering finished');
      ok(m.flags.bombThrown && m.flags.falseVictory, 'it was thrown, and everybody believed it');
      ok(m.flags.friezaSurvived, 'and it was not enough');
      ok(m.flags.piccoloDown && S.piccolo.alive, 'Piccolo took the beam and is still alive');
      ok(S.frieza.alive && !S.frieza.hidden, 'Frieza is standing at the end of it');
      ok(S.frieza.model.tailCut, 'with part of his tail gone');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the climax missions sit in chronological order', () => {
      const order = SL.data.storyOrder();
      const want = ['namek_vegeta_end', 'namek_goku', 'namek_kaioken20', 'namek_spirit_bomb'];
      const idx = want.map((id) => order.indexOf(id));
      ok(idx.every((i) => i > 0), 'all four are in the story: ' + JSON.stringify(idx));
      for (let i = 1; i < idx.length; i++) eq(idx[i], idx[i - 1] + 1, want[i] + ' follows ' + want[i - 1]);
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_spirit_bomb', results(['namek_goku'])), 'locked until the x20 mission is cleared');
      ok(!SL.data.storyLocked('namek_spirit_bomb', results(['namek_kaioken20'])), 'and open after it');
    });
  }


  console.log('\nNamek climax: Super Saiyan, 100% Frieza and a dying planet (headless)');
  {
    const g = H.create({ quiet: true, seed: 13 });
    const { SL } = g;

    test('the breaking point shows the reaction, not the event', () => {
      const sc = SL.data.scenes.krillin_taken;
      ok(sc && sc.events.length >= 4, 'the scene exists');
      // the camera is on Goku for the flash, and Krillin is only ever hidden
      const flash = sc.events.find((e) => e.screen && e.screen.flash);
      ok(flash, 'there is a flash');
      ok(flash.cam && flash.cam.from && String(flash.cam.from.at).indexOf('goku') === 0, 'and the camera is on Goku while it happens');
      const hidden = sc.events.find((e) => e.hide === 'krillin');
      ok(hidden, 'Krillin leaves the field by being hidden, with nothing shown');
      const quiet = sc.events.find((e) => e.music && e.music.song === null);
      ok(quiet, 'and the music cuts out for it');
      ok(typeof sc.end === 'function', 'the scene declares its end state');
    });

    test('the Super Saiyan scene is the longest in the chapter and hands the change to the engine', () => {
      const sc = SL.data.scenes.goku_super_saiyan;
      const total = sc.events.reduce((a, e) => a + (e.hold || 0), 0);
      ok(total >= 30, 'it runs for at least thirty seconds of staging: ' + total.toFixed(0) + ' s');
      ok(sc.events.length >= 9, 'across many beats: ' + sc.events.length);
      const kinds = new Set();
      for (const e of sc.events) for (const k of Object.keys(e)) kinds.add(k);
      for (const k of ['vfx', 'shake', 'screen', 'say', 'cam', 'mood']) ok(kinds.has(k), 'it uses ' + k);
      // the form change itself is the engine's transform sequence, not a stat write
      const ci = sc.events.findIndex((e) => e.call && String(e.call).includes("'transform'"));
      ok(ci > 0, 'the change runs through the engine transform state');
      // the owner's nine-shot restoration (2026-10-14) replaced the earlier double orbit: the camera circles him once, at
      // the change itself; the whisper on his face comes before it, the close on his eyes after it
      const orbits = sc.events.map((e, i) => (e.cam && e.cam.orbit ? i : -1)).filter((i) => i >= 0);
      ok(orbits.includes(ci), 'the camera circles him at the change: ' + orbits.join(','));
      const whisper = sc.events.findIndex((e) => e.say && /I tried to end this/.test(e.say.line));
      ok(whisper >= 0 && whisper < ci, 'the whisper on his face comes first: ' + whisper + ' < ' + ci);
      const eyes = sc.events.findIndex((e, i) => i > ci && e.cam && e.cam.from && e.cam.from.at === 'goku:head' && e.cam.fov <= 32);
      ok(eyes > ci, 'then in on his eyes: ' + eyes);
    });

    test('Super Saiyan arrives whether the cinematic is watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 13 });
        const ti = SL.data.missions.namek_super_saiyan.phases.findIndex((x) => x.id === 'awaken');
        const b = gg.mission('namek_super_saiyan', { startPhase: ti });
        const m = b.mission;
        let out = null;
        b.on('sceneEnd', (e) => {
          if (e.id !== 'goku_super_saiyan' || out) return;
          const S = b.story;
          out = {
            form: S.goku.form.id,
            locked: !!(S.goku.lockedForms && S.goku.lockedForms.ssj),
            flag: !!m.flags.superSaiyan,
            gohanAway: !!S.gohan.hidden,
            mood: b.stage.mood ? +b.stage.mood.target.toFixed(2) : 0,
          };
        });
        gg.until(b, () => !!out, 60 * 160, () => {
          if (skip && b.inputLocked) b.skipRequested = true;
        });
        const errors = gg.errors.length;
        b.dispose();
        return Object.assign({ errors }, out || {});
      };
      const watched = run(false);
      const skipped = run(true);
      eq(watched.form, 'ssj', 'watched: he is Super Saiyan');
      eq(skipped.form, 'ssj', 'skipped: he is Super Saiyan');
      eq(watched.locked, false, 'and the form is unlocked either way');
      eq(skipped.locked, false, '');
      eq(watched.flag, true, '');
      eq(skipped.flag, true, '');
      eq(watched.gohanAway && skipped.gohanAway, true, 'Gohan has been sent away either way');
      eq(String(skipped.mood), String(watched.mood), 'and the storm is the same either way (' + watched.mood + ')');
      ok(watched.mood > 0.2, 'the storm stays on after the change');
      eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
    });

    test('a bot plays "The Legendary Super Saiyan": Krillin, the change, the reversal, the core', () => {
      const r = g.playMission('namek_super_saiyan', { maxSeconds: 700 });
      const b = r.b, m = r.m, S = b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'krillin,awaken,reversal,legend,desperation,core', 'every phase played');
      ok(m.flags.krillinTaken, 'the breaking point happened');
      ok(m.flags.superSaiyan && m.flags.payLine, 'the transformation, and the answer to it');
      ok(m.flags.legendNamed, 'the legend was named');
      ok(m.flags.friezaBroken, 'and the desperation phase broke Frieza');
      ok(m.flags.planetDying, 'so he shot the planet');
      eq(S.goku.form.id, 'ssj', 'Goku ends it Super Saiyan');
      eq(!!S.goku.torn, false, 'with his gi still on: the 100% fight has not happened yet');
      ok(!S.krillin.alive, 'Krillin does not come back in this mission');
      ok(S.piccolo.alive, 'Piccolo is alive, off the field with Gohan');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the planet is a hazard, not scenery', () => {
      const idx = SL.data.missions.namek_end.phases.findIndex((x) => x.id === 'full');
      const b = g.mission('namek_end', { startPhase: idx });
      const m = b.mission, S = b.story;
      let hit = 0;
      b.on('damage', (e) => {
        if (e.source === 'Eruption') hit++;
      });
      // stand still on the ground and it will find you
      g.step(b, 60 * 45, () => {
        if (b.inputLocked) b.skipRequested = true;
        S.goku.grounded = true;
      });
      ok((m.flags.eruptions || 0) >= 3, 'eruptions keep coming: ' + m.flags.eruptions);
      ok(hit >= 1, 'and they hurt whoever is standing on them: ' + hit + ' hits');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('a bot plays "Five Minutes": the dying planet, 100% Frieza, the gi, the line and the escape', () => {
      const r = g.playMission('namek_end', { maxSeconds: 600 });
      const b = r.b, m = r.m;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'dying,wish,hundred,full,krillin,finish,saucers,mercy,betrayal,escape,after', 'every phase played');
      eq(b.stage.def.id, 'namek_ruin', 'fought on the dying planet');
      ok(m.flags.fullPower, 'Frieza went to one hundred percent');
      ok(m.flags.giTorn, 'the fight tore the gi');
      ok(m.flags.krillinMentionedByFrieza, 'the line landed');
      ok(m.flags.friezaDown && m.flags.friezaHalved, 'he is broken in gameplay, and his own saucer finishes the fight');
      ok(m.flags.mercyGiven && m.flags.betrayal, 'the mercy, and what he did with it');
      ok(m.flags.friezaSurvivedNamek && b.story.frieza.alive, 'and he is left alive: Chapter 5 is Frieza arriving at Earth');
      ok((m.flags.eruptions || 0) >= 10, 'the ground opened repeatedly: ' + m.flags.eruptions);
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the whole climax is in chronological order and each mission gates the next', () => {
      const order = SL.data.storyOrder();
      const want = ['namek_vegeta_end', 'namek_goku', 'namek_kaioken20', 'namek_spirit_bomb', 'namek_super_saiyan', 'namek_end'];
      const idx = want.map((id) => order.indexOf(id));
      ok(idx.every((i) => i > 0), 'all six are in the story');
      for (let i = 1; i < idx.length; i++) eq(idx[i], idx[i - 1] + 1, want[i] + ' follows ' + want[i - 1]);
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_end', results(['namek_spirit_bomb'])), 'the last one waits for the transformation mission');
      ok(!SL.data.storyLocked('namek_end', results(['namek_super_saiyan'])), 'and opens after it');
    });
  }


  console.log('\nNamek revision: Gohan, the torn gi, the rage chain and Frieza going down (headless)');
  {
    const g = H.create({ quiet: true, seed: 6 });
    const { SL } = g;

    test('"The Child" is a real playable fight, and the rage is the mechanic Gohan owns', () => {
      const order = SL.data.storyOrder();
      const iE = order.indexOf('namek_frieza1'), iC = order.indexOf('namek_gohan_frieza2'), iT = order.indexOf('namek_frieza2');
      ok(iE > 0 && iC === iE + 1 && iT === iC + 1, 'it sits between The Emperor and Two More Shapes: ' + order.slice(iE, iT + 1).join(' → '));
      const def = SL.data.missions.namek_gohan_frieza2;
      eq(def.character, 'kid_gohan', 'played as Gohan');
      eq(def.phases.map((x) => x.id).join(','), 'taunt,rage,assault,spent,after', 'five phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'assault', 'the fight is the checkpoint');
      // the rage is hiddenPotential, not a damage number
      const b = g.mission('namek_gohan_frieza2', { startPhase: 2 });
      const S = b.story;
      g.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.player, S.gohan, 'the player controls Gohan');
      ok(S.gohan.mech && S.gohan.mech.unleashed, 'and he is unleashed when the fight starts');
      eq(S.frieza.form.id, 'second', 'against the second form');
      eq(S.frieza.bossPhaseCap, 1, 'held there');
      ok(!S.frieza.infiniteHp, 'and damage to him has to stick for the objective to mean anything');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays "The Child": the rage lands and it costs Frieza real health', () => {
      const r = g.playMission('namek_gohan_frieza2', { maxSeconds: 420 });
      const m = r.m;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'taunt,rage,assault,spent,after', 'every phase played');
      ok(m.flags.gohanRaged && m.flags.unleashed, 'the rage scene ran and the mechanic fired');
      ok(m.flags.gohanDamage >= 18, 'and Frieza felt it: ' + m.flags.gohanDamage + '%');
      ok(m.flags.rageFrames > 300, 'the window was a real one: ' + m.flags.rageFrames + ' frames');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('battle damage is a state, not a repaint: the gi comes off and stays off through a transformation', () => {
      const b = g.battle({ p1: 'goku', p2: 'frieza', distance: 8 });
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      ok(typeof gk.setTorn === 'function', 'fighters carry the state');
      eq(!!gk.torn, false, 'and start dressed');
      let ev = null;
      b.on('tornState', (e) => (ev = e));
      gk.setTorn(true);
      eq(gk.torn, true, 'the state is on');
      eq(ev && ev.torn, true, 'and it is announced');
      // a transformation must not mend his clothes
      gk.ki = gk.kiMax;
      const ssj = gk.def.forms.findIndex((f) => f.id === 'ssj');
      gk.applyForm(ssj);
      eq(gk.form.id, 'ssj', 'now Super Saiyan');
      eq(gk.torn, true, 'still torn');
      gk.setTorn(false);
      eq(gk.torn, false, 'and it can be put back for other missions');
      b.dispose();
    });

    test('the climax mission is a fight with cinematics inside it, not the other way round', () => {
      const def = SL.data.missions.namek_super_saiyan;
      eq(def.phases.map((x) => x.id).join(','), 'krillin,awaken,reversal,legend,desperation,core', 'the phase order alternates scene and fight');
      const checkpoints = def.phases.filter((x) => x.checkpoint).map((x) => x.id);
      eq(checkpoints.join(','), 'krillin,awaken,reversal,desperation', 'Krillin, the transformation and both fights are checkpoints');
      // the two lines the owner specified, kept exactly (the answer in its round-4 wording)
      const line = SL.data.scenes.frieza_krillin_line;
      const said = line.events.map((e) => (e.say ? e.say.line : '')).join(' | ');
      ok(said.includes("I'll just blast you into oblivion like I did that other Earthling."), 'Frieza says it: ' + said.slice(0, 80));
      ok(said.includes("DON'T YOU DARE TALK ABOUT KRILLIN!"), 'and Goku answers it');
      const pay = SL.data.scenes.goku_pays_for_that;
      ok(pay.events.some((e) => e.say && e.say.line === "You monster, you'll pay for that!"), 'and the line after the transformation is there');
      // the rage beat is staged rather than announced: stillness, shaking, silence
      const silent = line.events.find((e) => e.music && e.music.song === null);
      ok(silent, 'the music drops under it');
      ok(line.events.filter((e) => e.shake).length >= 3, 'he shakes for several beats');
      ok(line.events.some((e) => e.cam && e.cam.fov2 && e.cam.fov2 <= 26), 'and the camera gets very close: ' + JSON.stringify(line.events.map((e) => (e.cam ? e.cam.fov2 || e.cam.fov : null))));
      // round 4: the line no longer tears the gi itself; the 100% fight has to have done it
      ok(!line.events.some((e) => e.torn), 'the scene does not tear the gi on its own');
    });

    test('the Super Saiyan checkpoint hands back a transformed Goku against a shaken Frieza', () => {
      const gg = H.create({ quiet: true, seed: 9 });
      const idx = SL.data.missions.namek_super_saiyan.phases.findIndex((x) => x.id === 'reversal');
      const b = gg.mission('namek_super_saiyan', { startPhase: idx });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.goku.form.id, 'ssj', 'Super Saiyan from the checkpoint');
      eq(b.player, S.goku, 'and the player has him');
      ok(S.goku.controller, 'with a controller attached');
      ok(S.goku.storySpeed && S.goku.storyEvade, 'faster than Frieza now, as a mechanic');
      eq(S.frieza.form.id, 'final', 'Frieza is in his final form');
      eq(S.frieza.aiPhase, 'shaken', 'and his brain knows he is losing');
      ok(!S.frieza.infiniteHp, 'and he can be hurt');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('Frieza\'s brain changes phase with the story: dominant, then shaken, then full power', () => {
      const phaseOf = (id, phase) => {
        const gg = H.create({ quiet: true, seed: 4 });
        const idx = SL.data.missions[id].phases.findIndex((x) => x.id === phase);
        const b = gg.mission(id, { startPhase: idx });
        gg.until(b, () => !b.inputLocked && b.mission.phaseIndex >= idx, 60 * 40, () => {
          if (b.inputLocked) b.skipRequested = true;
        });
        const fz = b.story.frieza;
        const out = { ai: fz.aiPhase, form: fz.form.id, hooks: fz.controller && fz.controller.p ? fz.controller.p.hooks : null, errors: gg.errors.length };
        b.dispose();
        return out;
      };
      const a = phaseOf('namek_goku', 'base');
      const b2 = phaseOf('namek_super_saiyan', 'reversal');
      const c = phaseOf('namek_end', 'full');
      eq(a.ai, 'dominant', 'toying with base Goku');
      eq(b2.ai, 'shaken', 'shaken once Goku is a Super Saiyan');
      eq(c.ai, 'full', 'and all-in at one hundred percent');
      eq(c.form, 'full', 'in his 100% form');
      eq(a.errors + b2.errors + c.errors, 0, 'no engine errors');
    });

    test('Frieza is broken in gameplay, cut down by his own saucer, spared, and left alive', () => {
      const def = SL.data.missions.namek_end;
      eq(def.phases.map((x) => x.id).join(','), 'dying,wish,hundred,full,krillin,finish,saucers,mercy,betrayal,escape,after', 'the fight, the saucers, the mercy and the betrayal each have their own phase');
      for (const id of ['finish', 'saucers', 'mercy', 'betrayal']) ok(def.phases.find((x) => x.id === id).checkpoint, id + ' is a checkpoint');
      const gg = H.create({ quiet: true, seed: 5 });
      const b = gg.mission('namek_end', { startPhase: def.phases.findIndex((x) => x.id === 'finish') });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.frieza.cannotDie, true, 'nothing in the fight kills him: his own saucer ends it');
      ok(!S.frieza.infiniteHp, 'but he can be broken');
      ok(S.frieza.hpFrac <= 0.2, 'and he comes into it already broken: ' + Math.round(S.frieza.hpFrac * 100) + '%');
      eq(S.frieza.form.id, 'full', 'still at one hundred percent');
      b.dispose();
      const r = gg.playMission('namek_end', { maxSeconds: 700 });
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(r.m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      ok(r.m.flags.friezaDown, 'the fight breaks him');
      ok(r.m.flags.friezaHalved, 'his own Death Saucer cuts him down');
      ok(r.m.flags.mercyGiven, 'Goku gives him the energy to leave');
      ok(r.m.flags.betrayal && r.m.flags.angryKameAvg !== undefined, 'he fires at Goku\'s back, and the answer is pushed by the player');
      eq(r.b.story.frieza.alive, true, 'and he is alive at the end of it — Chapter 5 is Frieza at Earth');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });
  }


  console.log('\nNamek revision, part two: checkpoints, hazards, stale state and the HUD (headless)');
  {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;

    test('every checkpoint in the climax hands back a playable state, not a replay of the cinematics', () => {
      const want = [
        { id: 'namek_gohan_frieza2', phase: 'assault', who: 'gohan', form: 'base' },
        { id: 'namek_goku', phase: 'base', who: 'goku', form: 'base' },
        { id: 'namek_goku', phase: 'rising', who: 'goku', form: 'kaioken' },
        { id: 'namek_kaioken20', phase: 'ten', who: 'goku', form: 'kaioken' },
        { id: 'namek_kaioken20', phase: 'desperate', who: 'goku', form: 'kaioken' },
        { id: 'namek_spirit_bomb', phase: 'hold', who: 'piccolo', form: 'nail' },
        { id: 'namek_super_saiyan', phase: 'reversal', who: 'goku', form: 'ssj' },
        { id: 'namek_super_saiyan', phase: 'desperation', who: 'goku', form: 'ssj' },
        { id: 'namek_end', phase: 'full', who: 'goku', form: 'ssj' },
        { id: 'namek_end', phase: 'finish', who: 'goku', form: 'ssj', torn: true },
        { id: 'namek_end', phase: 'escape', who: 'goku', form: 'ssj', torn: true },
      ];
      for (const w of want) {
        const def = SL.data.missions[w.id];
        const idx = def.phases.findIndex((x) => x.id === w.phase);
        ok(idx >= 0 && def.phases[idx].checkpoint, w.id + '/' + w.phase + ' is a checkpoint');
        const gg = H.create({ quiet: true, seed: 3 });
        const b = gg.mission(w.id, { startPhase: idx });
        const m = b.mission;
        // a checkpoint may open on a short beat, but it must hand back control
        gg.until(b, () => !b.inputLocked && m.phaseIndex >= idx, 60 * 40, () => {
          if (b.inputLocked) b.skipRequested = true;
        });
        const who = b.story[w.who];
        eq(m.state, 'running', w.id + '/' + w.phase + ': the mission is live');
        eq(b.player, who, w.id + '/' + w.phase + ': the player has ' + w.who);
        ok(who.controller, w.id + '/' + w.phase + ': with a controller');
        eq(b.inputLocked, false, w.id + '/' + w.phase + ': and control is returned');
        eq(who.form.id, w.form, w.id + '/' + w.phase + ': in the right form');
        if (w.torn) eq(!!who.torn, true, w.id + '/' + w.phase + ': and the gi is still ruined');
        eq(m.checkpoint, idx, w.id + '/' + w.phase + ': a retry would come back here, not to the start');
        eq(gg.errors.length, 0, w.id + '/' + w.phase + ' engine errors: ' + gg.errors.slice(0, 2).join(' | '));
        b.dispose();
      }
    });

    test('the dying planet does not take sides: the eruptions hurt Frieza too', () => {
      const gg = H.create({ quiet: true, seed: 11 });
      const idx = SL.data.missions.namek_end.phases.findIndex((x) => x.id === 'full');
      const b = gg.mission('namek_end', { startPhase: idx });
      const S = b.story;
      const hit = {};
      b.on('damage', (e) => {
        if (e.source !== 'Eruption') return;
        hit[e.target.def.id] = (hit[e.target.def.id] || 0) + 1;
      });
      gg.until(b, () => (hit.goku && hit.frieza) || b.mission.state !== 'running', 60 * 240, () => {
        if (b.inputLocked) b.skipRequested = true;
        // stand them on the same ground so one eruption can reach both
        if (!b.inputLocked && S.frieza.grounded && S.goku.grounded) {
          S.frieza.pos.x = S.goku.pos.x + 0.9;
          S.frieza.pos.z = S.goku.pos.z;
          S.frieza.pos.y = S.goku.pos.y;
        }
      });
      ok(b.mission.flags.eruptions > 0, 'the ground opened ' + b.mission.flags.eruptions + ' times');
      ok(hit.goku > 0, 'and it caught the player: ' + (hit.goku || 0) + ' hits');
      ok(hit.frieza > 0, 'and the emperor: ' + (hit.frieza || 0) + ' hits');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
      b.dispose();
    });

    test('the transformation happens once, and the cinematic that carries it plays once', () => {
      const gg = H.create({ quiet: true, seed: 7 });
      const scenes = [], forms = [];
      const r = gg.playMission('namek_super_saiyan', {
        maxSeconds: 800,
        onBattle: (b) => {
          b.on('sceneStart', (e) => scenes.push(e.id));
          b.on('formChanged', (e) => forms.push(e.fighter.def.id + ':' + e.form.id));
        },
      });
      eq(r.m.state, 'success', 'mission state');
      eq(scenes.filter((x) => x === 'goku_super_saiyan').length, 1, 'one transformation cinematic: ' + scenes.join(','));
      eq(forms.filter((x) => x === 'goku:ssj').length, 1, 'and Goku becomes Super Saiyan exactly once: ' + forms.join(','));
      eq(forms.filter((x) => x.indexOf('goku:') === 0).slice(-1)[0], 'goku:ssj', 'and it is the last thing he becomes: ' + forms.join(','));
      // Frieza stays in his final form here: 100% belongs to the dying planet
      eq(new Set(forms.filter((x) => x.indexOf('frieza:') === 0)).size, 1, 'Frieza does not keep transforming: ' + forms.join(','));
      ok(!forms.includes('frieza:full'), 'and does not reach 100% before the planet is dying');
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('the boss carries no stale form and no stale brain into the payoff fight', () => {
      const gg = H.create({ quiet: true, seed: 8 });
      const idx = SL.data.missions.namek_super_saiyan.phases.findIndex((x) => x.id === 'reversal');
      const b = gg.mission('namek_super_saiyan', { startPhase: idx });
      const fz = b.story.frieza;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(fz.form.id, 'final', 'the final form');
      eq(fz.mech.phase, 3, 'and the boss phase that belongs to it');
      eq(fz.specFor('special1').id, 'deathSaucers', 'the kit is the final form kit');
      eq(fz.specFor('ultimate').id, 'deathBall', '');
      ok(fz.specFor('special1').id !== 'deathBeam', 'not the first form kit he opened the chapter with');
      eq(fz.controller && fz.controller.p && fz.controller.p.hooks, 'frieza', 'and he is driven by his own brain, not a generic CPU');
      eq(fz.bossPhaseCap, 3, 'with nothing left to transform into');
      b.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('the fields the HUD reads follow the fighter the story hands you', () => {
      const gg = H.create({ quiet: true, seed: 2 });
      const ci = SL.data.missions.namek_gohan_frieza2.phases.findIndex((x) => x.id === 'assault');
      const b1 = gg.mission('namek_gohan_frieza2', { startPhase: ci });
      gg.step(b1, 90, () => {
        if (b1.inputLocked) b1.skipRequested = true;
      });
      eq(b1.player.def.id, 'kid_gohan', 'the panel is drawn from Gohan');
      eq(b1.player.name, SL.data.characters.kid_gohan.name, 'with his name: ' + b1.player.name);
      eq(b1.player.formIndex, 0, 'and no form badge');
      eq(b1.player.target.def.id, 'frieza', 'facing Frieza');
      eq(b1.player.target.formLabel, SL.data.characters.frieza.forms[1].name, 'whose badge reads ' + b1.player.target.formLabel);
      b1.dispose();
      const gi = SL.data.missions.namek_super_saiyan.phases.findIndex((x) => x.id === 'reversal');
      const b2 = gg.mission('namek_super_saiyan', { startPhase: gi });
      gg.step(b2, 90, () => {
        if (b2.inputLocked) b2.skipRequested = true;
      });
      eq(b2.player.def.id, 'goku', 'the panel follows Goku into the climax');
      ok(b2.player.formIndex > 0, 'in a transformed state');
      eq(b2.player.formLabel, SL.data.characters.goku.forms[b2.player.formIndex].name, 'badge: ' + b2.player.formLabel);
      eq(b2.player.target.formLabel, SL.data.characters.frieza.forms[3].name, 'against ' + b2.player.target.formLabel);
      b2.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('the Krillin line ends in the same state watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 15 });
        const idx = SL.data.missions.namek_end.phases.findIndex((x) => x.id === 'krillin');
        const b = gg.mission('namek_end', { startPhase: idx });
        const m = b.mission;
        let frames = 0, out = null;
        b.on('sceneEnd', (e) => {
          if (e.id !== 'frieza_krillin_line' || out) return;
          const S = b.story;
          out = {
            skipped: e.skipped,
            flag: !!m.flags.krillinMentionedByFrieza,
            rage: !!m.flags.rageShown,
            torn: !!S.goku.torn,
            form: S.goku.form.id,
            friezaForm: S.frieza.form.id,
            dist: +S.goku.pos.distanceTo(S.frieza.pos).toFixed(1),
          };
        });
        gg.until(b, () => !!out, 60 * 120, () => {
          frames++;
          if (skip && b.inputLocked) b.skipRequested = true;
        });
        const errors = gg.errors.length;
        b.dispose();
        return Object.assign({ frames, errors }, out || {});
      };
      const watched = run(false), skipped = run(true);
      ok(watched.frames > skipped.frames, 'skipping is faster: ' + skipped.frames + ' vs ' + watched.frames + ' frames');
      for (const k of ['flag', 'rage', 'torn', 'form', 'friezaForm', 'dist']) {
        eq(String(skipped[k]), String(watched[k]), k + ' matches (' + watched[k] + ')');
      }
      eq(watched.flag, true, 'the story flag is set either way');
      eq(watched.torn, true, 'and he is in the ruined gi either way');
      eq(watched.friezaForm, 'full', 'against 100% Frieza either way');
      eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
    });

    test('every phase after the breaking point is staged the same way whichever phase you enter on', () => {
      // Krillin is dead from the Krillin scene onward, Piccolo is alive, Gohan is out of reach,
      // Frieza's tail is cut, and the gi is still on. Entering a phase directly must not undo that.
      for (const phase of ['awaken', 'reversal', 'legend', 'desperation', 'core']) {
        const gg = H.create({ quiet: true, seed: 5 });
        const idx = SL.data.missions.namek_super_saiyan.phases.findIndex((x) => x.id === phase);
        const b = gg.mission('namek_super_saiyan', { startPhase: idx });
        const S = b.story;
        gg.step(b, 30);
        eq(!!S.goku.torn, false, phase + ': the gi is still on (the 100% fight takes it)');
        eq(S.krillin.hidden, true, phase + ': Krillin is off the field');
        eq(S.krillin.alive, false, phase + ': and he is not coming back');
        ok(S.piccolo.alive && S.piccolo.hp > 0, phase + ': Piccolo is alive');
        eq(S.gohan.untargetable, true, phase + ': Gohan cannot be hit in this stretch');
        ok(S.frieza.model.tailCut, phase + ': Frieza is missing part of his tail');
        eq(gg.errors.length, 0, phase + ' engine errors: ' + gg.errors.slice(0, 2).join(' | '));
        b.dispose();
      }
    });

    test('the rage scene ends in the same state watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 15 });
        const b = gg.mission('namek_gohan_frieza2', { startPhase: 1 });
        const m = b.mission;
        let frames = 0, out = null;
        b.on('sceneEnd', (e) => {
          if (e.id !== 'gohan_rage' || out) return;
          const S = b.story;
          out = {
            skipped: e.skipped,
            raged: !!m.flags.gohanRaged,
            unleashed: !!(S.gohan.mech && S.gohan.mech.unleashed),
            flagged: !!m.flags.unleashed,
            hidden: !!S.gohan.hidden,
            friezaForm: S.frieza.form.id,
          };
        });
        gg.until(b, () => !!out, 60 * 120, () => {
          frames++;
          if (skip && b.inputLocked) b.skipRequested = true;
        });
        const errors = gg.errors.length;
        b.dispose();
        return Object.assign({ frames, errors }, out || {});
      };
      const watched = run(false), skipped = run(true);
      ok(watched.frames > skipped.frames, 'skipping is faster: ' + skipped.frames + ' vs ' + watched.frames + ' frames');
      for (const k of ['raged', 'unleashed', 'flagged', 'hidden', 'friezaForm']) {
        eq(String(skipped[k]), String(watched[k]), k + ' matches (' + watched[k] + ')');
      }
      eq(watched.unleashed, true, 'the rage is on either way');
      eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
    });
  }


  console.log('\nNamek epilogue: "What He Left Behind" (headless)');
  {
    const g = H.create({ quiet: true, seed: 4 });
    const { SL } = g;

    test('the chapter ends with a mission that has no opponent in it', () => {
      const order = SL.data.storyOrder();
      const namek = order.filter((id) => id.indexOf('namek_') === 0);
      eq(namek[namek.length - 1], 'namek_aftermath', 'it closes Chapter 4: ' + namek.slice(-3).join(' → '));
      eq(order[order.indexOf('namek_aftermath') + 1], 'android_trunks', 'and Chapter 5 follows it');
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('namek_aftermath', results(['namek_super_saiyan'])), 'locked until the planet mission is cleared');
      ok(!SL.data.storyLocked('namek_aftermath', results(['namek_end'])), 'and opens after it');
      const def = SL.data.missions.namek_aftermath;
      eq(def.character, 'goku', 'played as Goku');
      eq(def.phases.map((x) => x.id).join(','), 'wishes,search,ship,pods,gone,after', 'six phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'search,pods', 'the two runs are the checkpoints');
      const b = g.mission('namek_aftermath', { startPhase: 0 });
      eq(b.fighters.filter((f) => f.team === 1).length, 0, 'nobody is on the other side');
      eq(b.story.goku.form.id, 'ssj', 'he is still Super Saiyan');
      eq(b.story.goku.torn, true, 'and still in the ruined gi');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays the epilogue: both runs are made and the chapter closes', () => {
      const r = g.playMission('namek_aftermath', { maxSeconds: 420 });
      const m = r.m;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'wishes,search,ship,pods,gone,after', 'every phase played');
      ok(m.flags.wishesMade, 'the wishes were granted');
      ok(m.flags.reachedShip, 'the ship was reached');
      ok(m.flags.shipDead, 'and it was useless');
      ok(m.flags.reachedPod, 'a pod was reached');
      ok(m.flags.podSeconds <= 50, 'inside the clock: ' + m.flags.podSeconds + ' s');
      ok(m.flags.namekGone && m.flags.epilogue, 'the planet goes and the epilogue plays');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('both runs are navigation, not combat: a beacon to fly to and ground that is not safe', () => {
      const gg = H.create({ quiet: true, seed: 8 });
      // start a phase earlier so the listener is attached before the run begins
      const b = gg.mission('namek_aftermath', { startPhase: 0 });
      const m = b.mission, S = b.story;
      let markers = null;
      b.on('markers', (e) => (markers = e.list));
      gg.until(b, () => m.def.phases[m.phaseIndex] && m.def.phases[m.phaseIndex].id === 'search' && !b.inputLocked, 60 * 120, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      ok(markers && markers.length === 1, 'the HUD is given one marker to point at');
      const ship = b.stage.props.find((x) => x.id === 'friezaShip');
      ok(ship && ship.alive, 'which is a real object in the world');
      ok(ship.pos.distanceTo(S.goku.pos) > 60, 'and it is a long way off: ' + Math.round(ship.pos.distanceTo(S.goku.pos)) + ' m');
      ok(m.objectives.some((o) => o.id === 'reach'), 'the objective is to get there');
      // the ground keeps opening under him while he crosses
      let hits = 0;
      b.on('damage', (e) => {
        if (e.source === 'Eruption') hits++;
      });
      gg.step(b, 60 * 30, () => {
        if (b.inputLocked) b.skipRequested = true;
        S.goku.grounded = true; // stand still on the floor and it finds you
      });
      ok((m.flags.eruptions || 0) >= 2, 'eruptions keep coming: ' + m.flags.eruptions);
      ok(hits >= 1, 'and they hurt whoever is standing on them: ' + hits);
      eq(S.goku.cannotDie, true, 'the planet cannot kill him outright — it can only run out the clock');
      b.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('the wish scene ends the same way watched or skipped', () => {
      const run = (skip) => {
        const gg = H.create({ quiet: true, seed: 14 });
        const b = gg.mission('namek_aftermath', { startPhase: 0 });
        const m = b.mission;
        let frames = 0, out = null;
        b.on('sceneEnd', (e) => {
          if (e.id !== 'namek_wishes' || out) return;
          const S = b.story;
          out = {
            skipped: e.skipped,
            wished: !!m.flags.wishesMade,
            dende: !!S.dende.hidden,
            dendeAlive: S.dende.alive,
            elder: !!S.elder.hidden,
            goku: S.goku.state,
            torn: !!S.goku.torn,
          };
        });
        gg.until(b, () => !!out, 60 * 120, () => {
          frames++;
          if (skip && b.inputLocked) b.skipRequested = true;
        });
        const errors = gg.errors.length;
        b.dispose();
        return Object.assign({ frames, errors }, out || {});
      };
      const watched = run(false), skipped = run(true);
      ok(watched.frames > skipped.frames, 'skipping is faster: ' + skipped.frames + ' vs ' + watched.frames + ' frames');
      for (const k of ['wished', 'dende', 'dendeAlive', 'elder', 'goku', 'torn']) {
        eq(String(skipped[k]), String(watched[k]), k + ' matches (' + watched[k] + ')');
      }
      eq(watched.dende, true, 'the Namekians are gone either way');
      eq(watched.errors + skipped.errors, 0, 'no engine errors either way');
    });
  }


  console.log('\nChapter 5: Future Trunks, the Cold family and "The Stranger" (headless)');
  {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;

    test('Future Trunks is a swordsman, and his kit shares nothing with the other blade in the cast', () => {
      const t = SL.data.characters.future_trunks;
      const y = SL.data.characters.yajirobe;
      eq(JSON.stringify(SL.Schema.validateCharacter(t)), '[]', 'he validates');
      eq(t.playable, true, 'and he is playable');
      eq(t.assetLevel, 1, 'Level 1 prototype art');
      const mine = (c) => (c.moves.light.map((m) => m.id)).concat(Object.values(c.moves.heavy).map((m) => m.id)).concat(Object.values(c.specials).map((x) => x.id));
      const shared = mine(t).filter((id) => mine(y).includes(id));
      eq(shared.length, 0, 'no move or special is shared with Yajirobe: ' + shared.join(','));
      // the sword is real geometry on the hand, not a texture
      const props = (t.appearance.props || []).map((x) => x.id + ':' + x.shape).join(',');
      eq(props, 'sword:broadsword,scabbard:sheath', 'he carries a blade and a scabbard: ' + props);
      // and the transformation is the same system every other Saiyan uses
      const ssj = t.forms.find((f) => f.id === 'ssj');
      ok(ssj && ssj.sequence && ssj.sequence.steps.some((st) => st.burst), 'Super Saiyan is a staged sequence');
      ok(ssj.look.hair.style === 'trunks_ssj' && SL.data.hair.trunks_ssj, 'with its own hair silhouette');
      ok(ssj.mult.damage > 1.3 && ssj.mult.speed > 1.1, 'and it is worth using: ×' + ssj.mult.damage + ' damage');
    });

    test('the Cold family are two different problems, not one boss twice', () => {
      const mf = SL.data.characters.mecha_frieza, kc = SL.data.characters.king_cold;
      for (const c of [mf, kc]) eq(JSON.stringify(SL.Schema.validateCharacter(c)), '[]', c.id + ' validates');
      ok(mf.stats.speed > kc.stats.speed * 1.25, 'Frieza is far quicker: ' + mf.stats.speed + ' vs ' + kc.stats.speed);
      ok(kc.stats.power > mf.stats.power && kc.appearance.height > mf.appearance.height * 1.4, 'his father is heavier and much bigger');
      const ids = (c) => Object.values(c.specials).map((x) => x.id);
      eq(ids(mf).filter((id) => ids(kc).includes(id)).length, 0, 'they share no special');
      eq(mf.boss.phases.map((x) => x.id).join(','), 'arrogant,furious', 'Frieza has two tempers');
      eq(kc.boss.phases.map((x) => x.id).join(','), 'amused,offended', 'and so does Cold');
      // he is the same person as the Namek boss, and the file says so by reusing his body language
      ok(mf.poses.fz_jab && mf.poses.mf_sweep, 'Mecha Frieza keeps Frieza\'s poses and adds his own');
      // Mecha Frieza is a separate fighter: the Namek boss keeps his own four forms plus the story-only 100%
      // (and, since Movie 2 · Super Broly, 2026-10-10, the film-only Golden form after them, story-locked too)
      eq(SL.data.characters.frieza.forms.map((f) => f.id).join(','), 'base,second,third,final,full,golden', 'the Namek boss is untouched by the Android saga');
      ok(SL.data.characters.frieza.forms.find((f) => f.id === 'golden').storyLocked, 'Golden is story-only');
    });

    // the missions themselves (rebuilt 2026-09-24) are covered in tests/trunks-arrival-tests.js
  }


  console.log('\nAndroids 19 and 20: energy absorption and "Ten in the Morning" (headless)');
  {
    const g = H.create({ quiet: true, seed: 7 });
    const { SL, V3 } = g;

    test('ki does not work on them: a blast heals them and costs the attacker the ki', () => {
      for (const id of ['android_19', 'android_20']) eq(JSON.stringify(SL.Schema.validateCharacter(SL.data.characters[id])), '[]', id + ' validates');
      const b = g.battle({ p1: 'goku', p2: 'android_19', distance: 9 });
      const gk = b.fighters.find((f) => f.def.id === 'goku');
      const a = b.fighters.find((f) => f.def.id === 'android_19');
      a.hp = Math.round(a.hpMax * 0.5);
      const hp0 = a.hp, ki0 = gk.ki;
      let ev = null;
      b.on('absorbed', (e) => (ev = e));
      const hit = (type) => a.takeHit(gk, { type, damage: 2000, knock: 'flinch', hitstun: 10, impact: 1, dir: new V3(0, 0, 1), point: a.chest() });
      hit('projectile');
      const afterKi = a.hp;
      ok(afterKi > hp0, 'the blast healed him: ' + hp0 + ' → ' + afterKi);
      ok(gk.ki < ki0, 'and it cost the attacker ki: ' + ki0.toFixed(0) + ' → ' + gk.ki.toFixed(0));
      ok(ev && ev.fighter === a && ev.attacker === gk, 'the absorption is announced as an event');
      hit('melee');
      ok(a.hp < afterKi, 'a fist still lands: ' + afterKi + ' → ' + a.hp);
      // and the ceiling holds
      a.hp = a.hpMax;
      hit('beam');
      eq(a.hp, a.hpMax, 'absorbing cannot take him past full health');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the two of them are built differently, and both are bosses', () => {
      const a19 = SL.data.characters.android_19, a20 = SL.data.characters.android_20;
      ok(a19.stats.hp > a20.stats.hp * 1.2, '19 is the heavier body: ' + a19.stats.hp + ' vs ' + a20.stats.hp);
      ok(a20.stats.speed > a19.stats.speed, 'and the doctor is quicker: ' + a20.stats.speed + ' vs ' + a19.stats.speed);
      eq(a19.mechanic.type, 'absorber', 'both carry the absorption mechanic');
      eq(a20.mechanic.type, 'absorber', '');
      ok(SL.Mechanics.boss.isPrototypeOf(SL.Mechanics.absorber), 'which is built on the boss mechanic, so phases still work');
      eq(a19.boss.phases.map((x) => x.id).join(','), 'patient,greedy', '19 gets greedy');
      eq(a20.boss.phases.map((x) => x.id).join(','), 'watching,cornered', 'and the doctor gets cornered');
      const ids = (c) => Object.values(c.specials).map((x) => x.id);
      eq(ids(a19).filter((id) => ids(a20).includes(id)).length, 0, 'they share no special id');
    });

    test('"Ten in the Morning" hands the fight from one hero to another', () => {
      const order = SL.data.storyOrder();
      const ch5 = order.filter((id) => id.indexOf('android_') === 0);
      eq(ch5.indexOf('android_nineteen'), ch5.indexOf('android_warning') + 1, 'it follows the warning: ' + ch5.join(' → '));
      const def = SL.data.missions.android_nineteen;
      eq(def.phases.map((x) => x.id).join(','), 'arrive,goku,virus,vegeta,flee,after', 'six phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'goku,vegeta', 'both halves are checkpoints');
      // the Goku half cannot be won: canon says the virus stops it
      const gi = def.phases.findIndex((x) => x.id === 'goku');
      const b = g.mission('android_nineteen', { startPhase: gi });
      const S = b.story;
      g.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.player, S.goku, 'the player starts as Goku');
      eq(S.goku.form.id, 'ssj', 'as a Super Saiyan');
      eq(S.a19.cannotDie, true, 'and 19 cannot be finished by him');
      b.dispose();
      // the Vegeta half can
      const vi = def.phases.findIndex((x) => x.id === 'vegeta');
      const gg = H.create({ quiet: true, seed: 7 });
      const b2 = gg.mission('android_nineteen', { startPhase: vi });
      const S2 = b2.story;
      gg.step(b2, 90, () => {
        if (b2.inputLocked) b2.skipRequested = true;
      });
      eq(b2.player, S2.vegeta, 'control moves to Vegeta');
      eq(S2.vegeta.form.id, 'ssj', 'who has been hiding a Super Saiyan for three years');
      // the fight breaks him; the kill is Vegeta's, on camera (vegeta_rips: the arms, the Big Bang)
      eq(S2.a19.cannotDie, true, 'and the fight cannot kill 19: the scene does');
      eq(S2.goku.untargetable, true, 'Goku is down and out of the fight');
      b2.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays it: the virus lands, the hero changes, and 19 goes down', () => {
      const r = g.playMission('android_nineteen', { maxSeconds: 900 });
      const m = r.m, S = r.b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'arrive,goku,virus,vegeta,flee,after', 'every phase played');
      ok(m.flags.androidsArrived && m.flags.virusStruck, 'they arrive and the virus stops the first half');
      ok(m.flags.gokuDamage >= 30, 'Goku hurt him with his hands first: ' + m.flags.gokuDamage + '%');
      ok(m.flags.vegetaArrived && m.flags.nineteenDown, 'Vegeta arrives and finishes it');
      ok(m.flags.geroFled, 'and the doctor runs');
      eq(S.a19.alive, false, '');
      eq(r.b.player, S.vegeta, 'the mission ends with Vegeta in hand');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }


  console.log('\nAndroids 17 and 18: infinite energy and "The Laboratory Door" (headless)');
  {
    const g = H.create({ quiet: true, seed: 12 });
    const { SL, V3 } = g;

    test('the pair never run out: stamina and ki are held up, and that is the whole difference', () => {
      for (const id of ['android_17', 'android_18', 'android_16']) eq(JSON.stringify(SL.Schema.validateCharacter(SL.data.characters[id])), '[]', id + ' validates');
      const b = g.battle({ p1: 'goku', p2: 'android_17', distance: 8 });
      const a = b.fighters.find((f) => f.def.id === 'android_17');
      a.stamina = 5;
      a.winded = true;
      a.ki = 1;
      g.step(b, 10);
      eq(a.stamina, a.staminaMax, 'stamina is back to full');
      eq(a.winded, false, 'and he is not winded');
      ok(a.ki >= a.kiMax * 0.5, 'ki is topped up to the floor: ' + Math.round(a.ki));
      // it is not damage reduction: a hit still lands normally
      const hp0 = a.hp;
      a.takeHit(b.fighters[0], { type: 'melee', damage: 2000, knock: 'flinch', hitstun: 10, impact: 1, dir: new V3(0, 0, 1), point: a.chest() });
      ok(a.hp < hp0, 'and he still takes damage like anybody else: ' + hp0 + ' → ' + a.hp);
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('17 and 18 are a matched pair, not one character twice', () => {
      const a17 = SL.data.characters.android_17, a18 = SL.data.characters.android_18;
      const ids = (c) => Object.values(c.specials).map((x) => x.id);
      eq(ids(a17).filter((id) => ids(a18).includes(id)).length, 0, 'no shared special');
      eq(a17.specials.special2.type, 'bomberWave', 'he answers a crowd with a field');
      eq(a18.specials.special2.type, 'rush', 'she answers it by getting closer');
      eq(a17.boss.phases.map((x) => x.id).join(','), 'bored,interested', '');
      eq(a18.boss.phases.map((x) => x.id).join(','), 'unimpressed,annoyed', '');
      eq(a17.mechanic.type, 'tireless', 'both are tireless');
      eq(a18.mechanic.type, 'tireless', '');
      ok(SL.Mechanics.boss.isPrototypeOf(SL.Mechanics.tireless), 'and the mechanic is built on the boss one');
      // 16 exists as a body in a capsule and is never switched on in this chapter; since the roster expansion
      // (2026-10-14) he is a Free Battle fighter — but only once "Gohan's Turn" is cleared, long after this chapter
      ok(SL.data.characters.android_16, 'Android 16 exists');
      const u16 = SL.data.unlocks.find((u) => u.type === 'characters' && u.target === 'android_16');
      ok(u16 && u16.condition.missionComplete === 'cell_gohan', 'playable only after "Gohan\'s Turn": ' + JSON.stringify(u16 && u16.condition));
      ok(!SL.Save.fresh().unlocks.characters.includes('android_16'), 'and locked in a fresh save');
    });

    test('"The Laboratory Door" is a race and a room, not a boss fight', () => {
      const order = SL.data.storyOrder();
      const ch5 = order.filter((id) => id.indexOf('android_') === 0);
      // the heart virus scene ('The Fever') sits between the fight with 19 and the lab
      eq(ch5.indexOf('android_lab'), ch5.indexOf('android_fever') + 1, 'it follows the fever at home: ' + ch5.join(' → '));
      const def = SL.data.missions.android_lab;
      eq(def.character, 'future_trunks', 'played as Trunks');
      eq(def.phases.map((x) => x.id).join(','), 'chase,door,capsules,wake,after', 'five phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'chase,capsules', 'the race and the room are the checkpoints');
      const b = g.mission('android_lab', { startPhase: 0 });
      const S = b.story;
      let markers = null;
      b.on('markers', (e) => (markers = e.list));
      g.step(b, 60, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.fighters.filter((f) => f.team === 1 && !f.untargetable).length, 0, 'nothing on the other side is fightable');
      eq(S.trunks.cannotDie, true, 'and nothing here can kill him');
      const lab = b.stage.props.find((x) => x.id === 'labDoor');
      ok(lab && lab.alive, 'the laboratory is a real object to fly to');
      ok(lab.pos.distanceTo(S.trunks.pos) > 60, 'a long way off: ' + Math.round(lab.pos.distanceTo(S.trunks.pos)) + ' m');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('the capsules are objects with health, and breaking them is the point of the room', () => {
      const gg = H.create({ quiet: true, seed: 12 });
      const ci = SL.data.missions.android_lab.phases.findIndex((x) => x.id === 'capsules');
      const b = gg.mission('android_lab', { startPhase: ci });
      const S = b.story;
      gg.step(b, 60, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      const caps = b.stage.props.filter((x) => String(x.id).indexOf('capsule') === 0);
      eq(caps.length, 3, 'three capsules in the room: ' + caps.map((c) => c.id).join(','));
      ok(caps.every((c) => c.hp > 0 && !c.invulnerable), 'each one can be destroyed');
      const obj = b.mission.objectives.find((o) => o.id === 'break');
      ok(obj && obj.target === 3, 'and the objective counts them');
      // proving they break: hit one until it goes
      const c = caps[0];
      while (c.alive) b.stage.damageProp(c, 900, S.trunks);
      eq(c.alive, false, 'a broken capsule stays broken');
      b.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('"The Pair on the Road" is the fight Vegeta loses, and it is built out of what it costs him', () => {
      const order = SL.data.storyOrder();
      const ch5 = order.filter((id) => id.indexOf('android_') === 0);
      eq(ch5.indexOf('android_road'), ch5.indexOf('android_lab') + 1, 'it follows the laboratory: ' + ch5.join(' → '));
      const def = SL.data.missions.android_road;
      eq(def.character, 'vegeta', 'it opens as Vegeta');
      eq(def.phases.map((x) => x.id).join(','), 'road,vegeta,turn,trunks,call,after', 'six phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'vegeta,trunks', 'both playable halves are checkpoints');
      const gg = H.create({ quiet: true, seed: 13 });
      const vi = def.phases.findIndex((x) => x.id === 'vegeta');
      const b = gg.mission('android_road', { startPhase: vi });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.player, S.vegeta, 'the player has Vegeta');
      eq(S.vegeta.form.id, 'ssj', 'as a Super Saiyan');
      eq(S.a18.cannotDie, true, 'and she is never in danger in this mission');
      ok(S.a18.damageDealtMul < 1, 'she is not trying yet: ×' + S.a18.damageDealtMul);
      // the point of the fight: he spends, she does not
      S.vegeta.ki = 10;
      S.a18.ki = 10;
      S.a18.stamina = 10;
      gg.step(b, 30);
      ok(S.a18.ki >= S.a18.kiMax * 0.5, 'her ki refills itself: ' + Math.round(S.a18.ki));
      eq(S.a18.stamina, S.a18.staminaMax, 'and her stamina is never spent');
      b.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('control moves to Trunks for the second half, with his father down behind him', () => {
      const gg = H.create({ quiet: true, seed: 13 });
      const ti = SL.data.missions.android_road.phases.findIndex((x) => x.id === 'trunks');
      const b = gg.mission('android_road', { startPhase: ti });
      const S = b.story;
      gg.step(b, 90, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(b.player, S.trunks, 'the player has Trunks');
      eq(S.trunks.form.id, 'ssj', '');
      eq(S.vegeta.untargetable, true, 'Vegeta is down and out of the fight');
      eq(S.a18.damageDealtMul, 1, 'and she has stopped pulling her strikes');
      const obj = b.mission.objectives.find((o) => o.id === 'hold');
      ok(obj && obj.target === 30, 'the objective is thirty seconds of keeping her off him');
      b.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays the road: the push, the arm, the hold and the call', () => {
      const r = g.playMission('android_road', { maxSeconds: 900 });
      const m = r.m, S = r.b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'road,vegeta,turn,trunks,call,after', 'every phase played');
      ok(m.flags.roadMet, 'they meet on the road');
      ok(m.flags.vegetaDamage >= 40, 'he pushes her to the mark: ' + m.flags.vegetaDamage + '%');
      ok(m.flags.armBroken, 'and then she stops playing');
      eq(m.flags.heldSeconds, 30, 'Trunks holds the line for the full thirty seconds');
      ok(m.flags.calledOff && m.flags.roadDone, '17 calls it off and they leave');
      eq(S.a18.alive, true, 'nobody kills anybody here');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays it: the race, the room, the switch, and the pair walking out', () => {
      const r = g.playMission('android_lab', { maxSeconds: 900 });
      const m = r.m, S = r.b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'chase,door,capsules,wake,after', 'every phase played');
      ok(m.flags.reachedLab && m.flags.atTheDoor, 'the race ends at the door');
      ok(m.flags.capsulesBroken >= 1, 'at least one capsule was broken: ' + m.flags.capsulesBroken);
      ok(m.flags.pairAwake, '17 and 18 are switched on anyway');
      ok(m.flags.geroDown, 'and the doctor does not survive his own project');
      ok(m.flags.pairGone && m.flags.labDone, 'they leave, and the mission ends on that');
      eq(S.gero.alive, false, '');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }


  console.log('\nCell: three forms, regeneration and the Chapter 6 missions (headless)');
  {
    const g = H.create({ quiet: true, seed: 21 });
    const { SL, V3 } = g;

    test('Cell is three fighters in one body, the way Frieza was four', () => {
      const c = SL.data.characters.cell;
      eq(JSON.stringify(SL.Schema.validateCharacter(c)), '[]', 'he validates');
      eq(c.forms.map((f) => f.id).join(','), 'base,semi_perfect,perfect', 'three forms');
      eq(c.forms.map((f) => f.name).join(','), 'Imperfect,Semi-Perfect,Perfect', 'named the way the story names them');
      const b = g.battle({ p1: 'piccolo', p2: 'cell', distance: 10 });
      const cl = b.fighters.find((f) => f.def.id === 'cell');
      const seen = [];
      for (let i = 0; i < 3; i++) {
        cl.applyForm(i);
        seen.push({ form: cl.form.id, s1: cl.specFor('special1').id, ult: cl.specFor('ultimate').id, light: cl.moveSet.light[0].id, speed: +cl.mult().speed.toFixed(2), damage: +cl.mult().damage.toFixed(2) });
      }
      eq(new Set(seen.map((x) => x.s1)).size, 3, 'a different special 1 per form: ' + seen.map((x) => x.s1).join(','));
      eq(new Set(seen.map((x) => x.light)).size, 3, 'and a different chain: ' + seen.map((x) => x.light).join(','));
      ok(seen[1].damage > seen[0].damage && seen[2].damage > seen[1].damage, 'they hit harder as they go: ' + seen.map((x) => x.damage).join(' → '));
      ok(seen[1].speed < seen[0].speed, 'the bloated middle form is slower: ' + seen[1].speed + ' vs ' + seen[0].speed);
      ok(seen[2].speed > seen[0].speed, 'and the finished one is the fastest: ' + seen[2].speed);
      const scales = c.forms.map((f) => (f.look && f.look.scale) || 1);
      ok(scales[1] > scales[0] && scales[2] < scales[1], 'the silhouette grows and then tightens: ' + scales.join(' → '));
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('he grows the damage back, and only pressure stops it', () => {
      // p2InfiniteHp is the training default: turn it off so his own regeneration is what we measure
      const b = g.battle({ p1: 'piccolo', p2: 'cell', distance: 9, p2InfiniteHp: false });
      const p = b.fighters.find((f) => f.def.id === 'piccolo');
      const c = b.fighters.find((f) => f.def.id === 'cell');
      c.hp = Math.round(c.hpMax * 0.5);
      const hurt = () => c.takeHit(p, { type: 'melee', damage: 500, knock: 'flinch', hitstun: 6, impact: 1, dir: new V3(0, 0, 1), point: c.chest() });
      hurt();
      const low = c.hp;
      // left alone past the idle window, he heals
      g.step(b, 60 * 6);
      ok(c.hp > low, 'left alone he regrows: ' + low + ' → ' + Math.round(c.hp));
      // kept under pressure, he does not
      const held = c.hp;
      for (let i = 0; i < 180; i++) {
        if (i % 30 === 0) hurt();
        g.frame(b);
      }
      ok(c.hp < held, 'under pressure the damage sticks: ' + Math.round(held) + ' → ' + Math.round(c.hp));
      ok(SL.Mechanics.boss.isPrototypeOf(SL.Mechanics.bioRegen), 'the mechanic is built on the boss one, so his phases still work');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('Chapter 6 opens with a town nobody is left in', () => {
      const order = SL.data.storyOrder();
      const ch6 = order.filter((id) => id.indexOf('cell_') === 0);
      eq(ch6.indexOf('cell_first'), 0, 'it opens Chapter 6: ' + ch6.join(' → '));
      eq(ch6[1], 'cell_semi', 'and the absorption mission follows it');
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('cell_first', results(['android_lab'])), 'locked until Chapter 5 is finished');
      ok(!SL.data.storyLocked('cell_first', results(['android_road'])), 'and opens after it');
      const def = SL.data.missions.cell_first;
      eq(def.character, 'piccolo', 'played as Piccolo');
      eq(def.phases.map((x) => x.id).join(','), 'town,talk,fight,gone,after', 'five phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'fight', 'the fight is the checkpoint');
      const b = g.mission('cell_first', { startPhase: 2 });
      const S = b.story;
      g.step(b, 60, () => {
        if (b.inputLocked) b.skipRequested = true;
      });
      eq(S.cell.form.id, 'base', 'he is still imperfect here');
      eq(S.cell.bossPhaseCap, 1, 'and held there: he has not eaten anybody who matters yet');
      eq(S.cell.cannotDie, true, 'canon says he leaves rather than dies');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays "The Town That Stopped": the pressure lesson lands', () => {
      const r = g.playMission('cell_first', { maxSeconds: 900 });
      const m = r.m;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'town,talk,fight,gone,after', 'every phase played');
      ok(m.flags.sighted && m.flags.named, 'the town and the explanation');
      ok(m.flags.cellHurt >= 45, 'he was taken apart faster than he rebuilt: ' + m.flags.cellHurt + '%');
      ok(m.flags.cellRegrown > 0, 'and he did regrow some of it: ' + m.flags.cellRegrown + ' health');
      ok(m.flags.cellEscaped, 'then he leaves through a Solar Flare');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('"Seventeen" is a holding action twice, and the transformation is staged in the middle of it', () => {
      const def = SL.data.missions.cell_semi;
      eq(def.phases.map((x) => x.id).join(','), 'duel,hold,take,stand,tien,after', 'six phases: the Hellzone Grenade opens it');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'hold,tien', 'both holding actions are checkpoints');
      const r = g.playMission('cell_semi', { maxSeconds: 900 });
      const m = r.m, S = r.b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(m.flags.heldSeconds, 40, 'Piccolo buys the full forty seconds');
      ok(m.flags.hellzone, 'Piccolo and 17: the Hellzone Grenade');
      ok(m.flags.seventeenTaken, 'and loses 17 anyway');
      ok(m.flags.semiPerfect, 'the transformation runs and ends in the semi-perfect form');
      eq(S.cell.form.id, 'semi_perfect', '');
      eq(m.flags.tienSeconds, 30, 'then Tien buys thirty more');
      eq(S.a17.alive, false, '17 is gone');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('"Let Him Finish" makes the player win a fight and then play the consequence', () => {
      const def = SL.data.missions.cell_perfect;
      eq(def.character, 'vegeta', 'played as Vegeta');
      eq(def.phases.map((x) => x.id).join(','), 'semi,let,perfect,beaten,flash,after', 'six phases: the Final Flash before the end');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'semi,beaten', 'the win and the consequence are both played');
      const r = g.playMission('cell_perfect', { maxSeconds: 900 });
      const m = r.m, S = r.b.story;
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s)');
      ok(m.flags.semiHurt >= 45, 'he genuinely beats the semi-perfect form: ' + m.flags.semiHurt + '%');
      ok(m.flags.eighteenTaken && m.flags.perfect, 'then lets him finish, and the transformation runs');
      eq(S.cell.form.id, 'perfect', 'Cell ends the mission perfect');
      eq(m.flags.survivedSeconds, 35, 'and Vegeta survives the phase that follows rather than winning it');
      ok(m.flags.finalFlashCharged && m.flags.finalFlash, 'then the Final Flash: charged by the player, fired, survived');
      // the numbers say it out loud: the same man, the opposite fight
      const gg = H.create({ quiet: true, seed: 21 });
      const si = def.phases.findIndex((x) => x.id === 'semi');
      const bi = def.phases.findIndex((x) => x.id === 'beaten');
      const b1 = gg.mission('cell_perfect', { startPhase: si });
      gg.step(b1, 60, () => {
        if (b1.inputLocked) b1.skipRequested = true;
      });
      const before = b1.story.vegeta.damageDealtMul;
      b1.dispose();
      const b2 = gg.mission('cell_perfect', { startPhase: bi });
      gg.step(b2, 60, () => {
        if (b2.inputLocked) b2.skipRequested = true;
      });
      const after = b2.story.vegeta.damageDealtMul;
      ok(before > 2 && after < 1, 'his damage goes from ×' + before + ' to ×' + after + ' without him changing at all');
      eq(b2.story.cell.infiniteHp, true, 'and the perfect form is not pretending to be in danger');
      b2.dispose();
      eq(g.errors.length + gg.errors.length, 0, 'engine errors: ' + g.errors.concat(gg.errors).slice(0, 2).join(' | '));
    });
  }


  console.log('\nThe Cell Games: Gohan at eleven, Super Saiyan 2 and the end of Cell (headless)');
  {
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;

    test('Gohan grows up into a playable fighter with a third form the story controls', () => {
      const t = SL.data.characters.teen_gohan;
      eq(JSON.stringify(SL.Schema.validateCharacter(t)), '[]', 'he validates');
      eq(t.playable, true, 'and he is playable');
      eq(t.forms.map((f) => f.id).join(','), 'base,ssj,ssj2', 'three forms');
      const ssj = t.forms[1], ssj2 = t.forms[2];
      ok(ssj2.mult.damage > ssj.mult.damage * 1.4, 'the second one is a jump, not a tier: ×' + ssj.mult.damage + ' → ×' + ssj2.mult.damage);
      ok(ssj2.look.hair.style === 'gohan_ssj2' && SL.data.hair.gohan_ssj2, 'with its own hair silhouette');
      ok(ssj2.sequence && ssj2.sequence.length > ssj.sequence.length, 'and a longer transformation than the first: ' + ssj.sequence.length + ' → ' + ssj2.sequence.length);
      ok(ssj2.sequence.steps.some((st) => st.skyBolts) && ssj2.sequence.steps.some((st) => st.burst), 'staged with sky bolts and a burst');
      eq(t.mechanic.type, 'hiddenPotential', 'the same mechanic he had as a five-year-old');
      eq(t.specials.ultimate.id, 'fatherSon', 'and the ultimate the arc is pointing at');
      // the kid and the boy are different fighters, not one scaled
      const kid = SL.data.characters.kid_gohan;
      const ids = (c) => c.moves.light.map((x) => x.id).concat(Object.values(c.specials).map((x) => x.id));
      eq(ids(t).filter((id) => ids(kid).includes(id)).length, 0, 'no move id is shared with Kid Gohan');
      ok(t.stats.hp > kid.stats.hp * 1.5, 'and he is a different size of fighter: ' + t.stats.hp + ' vs ' + kid.stats.hp);
    });

    // The Cell Games mission itself is tested in tests/cell-games-tests.js (rebuilt 2026-09-17).

    test('a boss-derived mechanic on somebody who is not a boss does not crash the frame', () => {
      // Android 16 carries the tireless mechanic and has no boss block at all
      const a16 = SL.data.characters.android_16;
      ok(!a16.boss, '16 has no boss phases');
      eq(a16.mechanic.type, 'tireless', 'but he carries a boss-derived mechanic');
      const b = g.battle({ p1: 'goku', p2: 'android_16', distance: 8 });
      g.step(b, 120);
      eq(g.errors.length, 0, 'and a hundred and twenty frames run clean: ' + g.errors.slice(0, 2).join(' | '));
      b.dispose();
    });
  }


  console.log('\nChapter 7: the Majin mark (headless)');
  {
    const g = H.create({ quiet: true, seed: 19 });
    const { SL } = g;

    test('the Majin form is a story decision, not something the wheel offers', () => {
      const v = SL.data.characters.vegeta;
      eq(JSON.stringify(SL.Schema.validateCharacter(v)), '[]', 'Vegeta still validates');
      // since Chapter 10 (2026-09-24) Super Saiyan 2 sits between the first level and the mark; since
      // the Final Flash rebuild (2026-10-03) the story-only Super Vegeta (Cell saga) comes after it;
      // since Movie 2 (2026-10-10) the film's God and Blue sit after SSJ2 (Free Battle only once the film gives them);
      // since the Tournament of Power, Blue Evolution comes last (Free Battle after "Toppo", top_toppo)
      eq(v.forms.map((f) => f.id).join(','), 'base,ssj,ssj2,god,blue,majin,super_vegeta,blueEvo', 'eight forms now');
      const majin = v.forms.find((f) => f.id === 'majin');
      eq(majin.storyLocked, true, 'the Majin state is story-locked');
      eq(v.forms.find((f) => f.id === 'super_vegeta').storyLocked, true, 'and so is Super Vegeta');
      ok(majin.mult.damage > v.forms[1].mult.damage * 1.25, 'and it is a real jump over Super Saiyan: ×' + v.forms[1].mult.damage + ' → ×' + majin.mult.damage);
      ok(majin.sequence && majin.sequence.steps.some((st) => st.burst), 'with a staged transformation');
      ok(majin.aura.color !== v.forms[1].aura.color, 'and its own aura colour');
      // a fighter spawned in Free Battle cannot simply pick it
      const b = g.battle({ p1: 'vegeta', p2: 'goku', distance: 8 });
      const vf = b.fighters.find((f) => f.def.id === 'vegeta');
      eq(!!(vf.lockedForms && vf.lockedForms.majin), true, 'it is locked at spawn');
      eq(!!(vf.lockedForms && vf.lockedForms.super_vegeta), true, 'Super Vegeta too');
      eq(!!(vf.lockedForms && vf.lockedForms.god && vf.lockedForms.blue), true, 'and God and Blue before the film has given them');
      eq(!!(vf.lockedForms && vf.lockedForms.blueEvo), true, 'and Blue Evolution before the Tournament has given it');
      b.dispose();
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });

    test('"The Mark" follows the Demon King and plays the corruption, the mark and the price — the duel is the next mission now', () => {
      const order = SL.data.storyOrder();
      eq(order.indexOf('buu_majin'), order.indexOf('buu_dabura') + 1, 'straight after the Demon King');
      eq(order.indexOf('buu_pride'), order.indexOf('buu_majin') + 1, 'and the fight it asks for comes next');
      const results = (done) => (id) => (done.includes(id) ? { completed: true } : null);
      ok(SL.data.storyLocked('buu_majin', results(['cell_games'])), 'locked until the seven years are played');
      ok(!SL.data.storyLocked('buu_majin', results(['buu_dabura'])), 'and opens after the Demon King');
      const def = SL.data.missions.buu_majin;
      eq(def.character, 'vegeta', 'played as Vegeta (and then as Goku)');
      eq(def.phases.map((x) => x.id).join(','), 'spell,resist,mark,stands,stop,agree', 'six phases');
      eq(def.phases.filter((x) => x.checkpoint).map((x) => x.id).join(','), 'resist,stop', 'the struggle and the stands are checkpoints');
      const gg = H.create({ quiet: true, seed: 19 });
      const ri = def.phases.findIndex((x) => x.id === 'resist');
      const si = def.phases.findIndex((x) => x.id === 'stop');
      const b1 = gg.mission('buu_majin', { startPhase: ri });
      gg.step(b1, 30);
      eq(b1.story.vegeta.form.id, 'ssj', 'at the struggle he is still himself');
      ok(b1.story.vegeta.lockedForms.majin, 'and the mark is not his to take');
      eq(b1.player, b1.story.vegeta, 'the player is Vegeta');
      eq(b1.stage.def.id, 'babidi_crater', 'in the crater');
      b1.dispose();
      const b2 = gg.mission('buu_majin', { startPhase: si });
      gg.step(b2, 60, () => {
        if (b2.inputLocked) b2.skipRequested = true;
      });
      eq(b2.stage.def.id, 'tournament', 'the stands checkpoint rebuilds the tournament');
      eq(b2.story.vegeta.form.id, 'majin', 'Vegeta wears the mark from the checkpoint');
      eq(b2.story.vegeta.team, 1, 'and is on the other side');
      ok(b2.stage.crowd.people.some((p) => p.gone), 'the first section of the stands is already gone');
      eq(b2.player, b2.story.goku, 'the player is Goku');
      b2.dispose();
      eq(gg.errors.length, 0, 'engine errors: ' + gg.errors.slice(0, 2).join(' | '));
    });

    test('a bot plays "The Mark": the spell, the struggle he stops, the mark, the stands and the jump to the wastes', () => {
      const r = g.playMission('buu_majin', { maxSeconds: 900 });
      const m = r.m, S = r.b.story;
      const phases = r.log.filter((x) => x.ev === 'phase').map((x) => x.id);
      eq(m.state, 'success', 'mission state (' + r.seconds.toFixed(0) + ' s, phases ' + phases.join(',') + ')');
      eq(phases.join(','), 'spell,resist,mark,stands,stop,agree', 'every phase played');
      ok(m.flags.spellCast && m.flags.majin && m.flags.awake, 'the spell, the mark and the Majin who answers to nobody');
      eq(m.flags.resistMemories, 3, 'the memories came up while he pushed');
      ok(m.flags.letGoAt >= 70, 'and he let go near the top, not because the player stopped: ' + m.flags.letGoAt);
      ok(m.flags.firstBlast, 'the blast into the stands lands as a scene');
      ok(m.flags.savedStand || m.flags.secondBlast, 'the second one is stopped or it is not');
      eq(r.b.stage.def.id, 'majin_wastes', 'Babidi sends them to the wastes');
      eq(S.vegeta.form.id, 'majin', '');
      eq(S.vegeta.alive, true, 'nobody dies in this one');
      eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
    });
  }

  require('./cell-games-tests')({ test, eq, ok });
  require('./power-gap-tests')({ test, eq, ok });
  require('./trunks-arrival-tests')({ test, eq, ok });
  require('./character-pass-tests')({ test, eq, ok });
  require('./buu-tournament-tests')({ test, eq, ok });
  require('./buu-fusion-tests')({ test, eq, ok });
  require('./buu-split-tests')({ test, eq, ok });
  require('./buu-chamber-tests')({ test, eq, ok });
  require('./buu-ultimate-tests')({ test, eq, ok });
  require('./buu-tests')({ test, eq, ok });
  require('./buu-b-tests')({ test, eq, ok });
  require('./buu-c-tests')({ test, eq, ok });
  require('./buu-kid-tests')({ test, eq, ok });
  require('./feel-tests')({ test, eq, ok });
  require('./playtest2-tests')({ test, eq, ok });
  require('./playtest3-tests')({ test, eq, ok });
  require('./playtest4-tests')({ test, eq, ok });
  require('./whatif-tests')({ test, eq, ok });
  require('./fusion-reborn-tests')({ test, eq, ok });
  require('./super-broly-tests')({ test, eq, ok });
  require('./rof-tests')({ test, eq, ok });
  require('./rof-goku-tests')({ test, eq, ok });
  require('./rof-finale-tests')({ test, eq, ok });
  require('./universe6-tests')({ test, eq, ok });
  require('./moveset-tests')({ test, eq, ok });
  require('./frieza-fair-tests')({ test, eq, ok });
  require('./immersion-tests')({ test, eq, ok });
  require('./wardrobe-tests')({ test, eq, ok });
};
