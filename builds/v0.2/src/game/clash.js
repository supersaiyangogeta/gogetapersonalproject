/*
 * Beam clash: when two opposing beams meet head-on, both fighters lock into
 * a struggle. Beam power, form and the player's input rate decide who pushes
 * the collision point back. The winner's beam overpowers the loser.
 */
(function () {
  'use strict';
  const U = SL.util;
  const R = SL.Rules;
  const V3 = THREE.Vector3;
  const TICK = SL.TICK;

  const MASH_ACTIONS = ['special1', 'special2', 'ultimate', 'light', 'heavy', 'blast'];

  class BeamClash {
    constructor(battle) {
      this.battle = battle;
      this.active = null;
    }

    update() {
      if (this.active) {
        this._step();
        return;
      }
      const beams = this.battle.projectiles.beams;
      for (let i = 0; i < beams.length; i++) {
        const a = beams[i];
        if (a.done || (a.state !== 'extend' && a.state !== 'sustain')) continue;
        for (let j = i + 1; j < beams.length; j++) {
          const b = beams[j];
          if (b.done || b.team === a.team || (b.state !== 'extend' && b.state !== 'sustain')) continue;
          if (a.dir.dot(b.dir) > -0.55) continue;
          if (a.head.distanceTo(b.head) < a.radius + b.radius + 1.5) {
            this._start(a, b);
            return;
          }
        }
        // beam meets a flying Spirit Bomb head-on
        for (const bomb of this.battle.projectiles.bombs) {
          if (bomb.done || bomb.state !== 'flying' || bomb.team === a.team) continue;
          if (a.dir.dot(bomb.dir) > -0.2) continue;
          if (!bomb.owner.alive || !a.owner.alive) continue;
          if (a.head.distanceTo(bomb.pos) < a.radius + bomb.radius + 1) {
            this._start(a, bomb);
            return;
          }
        }
      }
    }

    _start(a, b) {
      const battle = this.battle;
      const oa = a.owner, ob = b.owner;
      if (!oa.alive || !ob.alive) return;
      a.state = b.state = 'clash';
      const mid = a.head.add(b.head).multiplyScalar(0.5);
      const total = a.origin.distanceTo(b.origin);
      const startT = a.origin.distanceTo(mid) / Math.max(1, total);
      this.active = {
        a, b, push: (0.5 - startT) * -2 * 0.4, t: 0, point: mid,
        pressesA: [], pressesB: [], aiRateA: this._aiRate(oa), aiRateB: this._aiRate(ob), mashPulse: 0,
      };
      if (b.isBomb) b.origin = ob.chest();
      oa.setState('clash', { beam: a });
      ob.setState('clash', { beam: b, bomb: !!b.isBomb });
      battle.beginCinematic([oa, ob]);
      battle.clashShot(oa, ob, this);
      battle.musicBoost(3);
      battle.emit('clashStart', { a: oa, b: ob, bomb: !!b.isBomb, player: battle.player && (oa === battle.player || ob === battle.player) });
      SL.ScreenFX.flash(0.5);
      battle.sfx('explosionBig', null, { at: mid, vol: 0.7 });
    }

    _aiRate(f) {
      if (f.isPlayer) return 0;
      const diff = R.DIFFICULTY[f.controller && f.controller.difficulty] || R.DIFFICULTY.normal;
      return diff.mash;
    }

    /** Player input rate in presses/second (hold mode gives a steady rate). */
    _playerRate(list) {
      const I = SL.Input;
      const now = this.active.t;
      const mode = SL.Settings.data.gameplay.beamClashInput;
      const assist = SL.Settings.data.gameplay.qteAssist;
      if (mode === 'hold') {
        const held = MASH_ACTIONS.some((a) => I.held(a));
        return held ? (assist ? 10.5 : 8.6) : 0;
      }
      if (MASH_ACTIONS.some((a) => I.pressed(a))) {
        list.push(now);
        SL.Audio.play('mash');
        this.active.mashPulse = 1;
        SL.Input.rumble(0.3, 0.2, 40);
      }
      while (list.length && now - list[0] > 1) list.shift();
      return list.length * (assist ? 1.3 : 1);
    }

    _step() {
      const battle = this.battle;
      const c = this.active;
      const { a, b } = c;
      const oa = a.owner, ob = b.owner;
      c.t += TICK;
      if (a.done || b.done || !oa.alive || !ob.alive || oa.state !== 'clash' || ob.state !== 'clash') {
        this._abort();
        return;
      }
      const wobble = (x) => x * (0.85 + 0.3 * (0.5 + 0.5 * Math.sin(c.t * 2.3 + x)));
      const rateA = oa.isPlayer ? this._playerRate(c.pressesA) : wobble(c.aiRateA);
      const rateB = ob.isPlayer ? this._playerRate(c.pressesB) : wobble(c.aiRateB);
      c.rateA = rateA;
      c.rateB = rateB;
      c.push = R.clashStep(c.push, a.power, b.power, rateA, rateB, TICK, c.t);
      c.mashPulse = Math.max(0, c.mashPulse - TICK * 6);

      const t = 0.5 + 0.5 * c.push * 0.9;
      c.point = a.origin.clone().lerp(b.origin, t);
      a.headOverride = c.point;
      b.headOverride = c.point;
      a.update();
      b.update();

      const vfx = battle.vfx;
      if (battle.frame % 2 === 0) {
        const ca = new THREE.Color(a.spec.color), cb = new THREE.Color(b.spec.color);
        const r = (a.radius + b.radius) * 0.8;
        for (let i = 0; i < 5; i++) {
          const v = new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize().multiplyScalar(U.rand(8, 20));
          const col = i % 2 ? ca : cb;
          vfx.add.emit(c.point.x, c.point.y, c.point.z, v.x, v.y, v.z, col.r, col.g, col.b, 0.9, r * U.rand(0.1, 0.28), U.rand(0.3, 0.6), { drag: 2 });
        }
        if (battle.frame % 6 === 0) vfx.flash(c.point, r * U.rand(3, 5), Math.random() < 0.5 ? a.spec.color : b.spec.color, 0.12);
        if (Math.random() < 0.4) vfx.bolt(c.point.clone().add(new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1))), r * 2.5);
      }
      if (battle.frame % 20 === 0) vfx.ring(c.point, (a.radius + b.radius) * 3, 0xffffff, 0.35);
      vfx.light(c.point, 0xffffff, 5, 50, 0.1);
      battle.camera.addTrauma(0.035);
      SL.ScreenFX.setSpeed(0.45);
      if (battle.stage.hasGround && battle.frame % 10 === 0) {
        const gh = battle.stage.heightAt(c.point.x, c.point.z);
        if (c.point.y - gh < 8) battle.vfx.dust(new V3(c.point.x, gh, c.point.z), 3, 6);
      }

      if (Math.abs(c.push) >= 1) this._resolve(c.push > 0 ? a : b, c.push > 0 ? b : a);
      else if (c.t >= 7) {
        if (Math.abs(c.push) < 0.12) this._mutual();
        else this._resolve(c.push > 0 ? a : b, c.push > 0 ? b : a);
      }
    }

    _resolve(win, lose) {
      const battle = this.battle;
      const c = this.active;
      this.active = null;
      const ow = win.owner, ol = lose.owner;
      lose.headOverride = null;
      if (lose.isBomb) lose.stop();
      else lose.dispose();
      if (win.isBomb) {
        // the Spirit Bomb overpowers the beam and keeps going
        win.resumeToward(ol, c.point);
        battle.endCinematic();
        ow.setState('recoverSpecial', { frames: 30 });
        ol.setState('stagger', { frames: 50 });
        ow.stats.clashesWon++;
        battle.vfx.explosion(c.point, 6, win.spec.color, { smoke: false });
        SL.ScreenFX.flash(0.6);
        battle.camera.addTrauma(0.7);
        battle.sfx('explosionBig', null, { at: c.point });
        battle.camera.endShot();
        battle.emit('clashEnd', { winner: ow, loser: ol, bomb: true });
        return;
      }
      win.headOverride = null;
      win.headDist = win.origin.distanceTo(c.point);
      win.state = 'extend';
      win.hitSet.clear();
      win.damage *= 1.2;
      win.speed *= 1.6;
      win.sustain = Math.max(win.sustain, 30);
      win.baseDir.copy(ol.chest().sub(win.origin).normalize());
      win.aimYaw = win.aimPitch = 0;
      battle.endCinematic();
      ow.setState('beamFire', { spec: win.spec, beam: win, frac: win.frac, aimYaw: 0, aimPitch: 0 });
      ol.setState('stagger', { frames: 40 });
      ow.stats.clashesWon++;
      battle.vfx.explosion(c.point, 5, win.spec.color, { smoke: false });
      SL.ScreenFX.flash(0.6);
      battle.camera.addTrauma(0.7);
      battle.sfx('explosionBig', null, { at: c.point });
      battle.camera.endShot();
      battle.emit('clashEnd', { winner: ow, loser: ol });
    }

    _mutual() {
      const battle = this.battle;
      const c = this.active;
      this.active = null;
      const { a, b } = c;
      a.headOverride = b.headOverride = null;
      a.dispose();
      b.dispose();
      battle.endCinematic();
      battle.camera.endShot();
      battle.vfx.explosion(c.point, 9, 0xffffff);
      SL.ScreenFX.flash(0.8);
      battle.sfx('explosionHuge', null, { at: c.point });
      battle.camera.addTrauma(1);
      for (const o of [a.owner, b.owner]) {
        o.setState('free');
        o.takeHit(null, { type: 'explosion', damage: 900, knock: 'heavy', knockSpeed: 26, hitstun: 40, impact: 4, dir: o.chest().sub(c.point).normalize(), point: c.point.clone() });
      }
      battle.stage.explode(c.point, 14, 3000, null, null);
      battle.emit('clashEnd', { winner: null });
    }

    _abort() {
      const c = this.active;
      this.active = null;
      for (const bm of [c.a, c.b]) {
        bm.headOverride = null;
        if (!bm.done) bm.dispose();
        if (bm.owner.alive && bm.owner.state === 'clash') bm.owner.setState('free');
      }
      this.battle.endCinematic();
      this.battle.camera.endShot();
      this.battle.emit('clashEnd', { winner: null, aborted: true });
    }

    /** 0..1 position of the clash from the player's point of view (1 = winning). */
    playerProgress() {
      const c = this.active;
      if (!c) return 0.5;
      const p = this.battle.player;
      const sign = p === c.a.owner ? 1 : p === c.b.owner ? -1 : 1;
      return 0.5 + 0.5 * c.push * sign;
    }
  }

  SL.BeamClash = BeamClash;
})();
