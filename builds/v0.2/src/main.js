/*
 * App entry: boot, main loop, and transitions between menus, battles,
 * training and story missions. Errors are caught so the game can always
 * return to the menu instead of freezing.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = () => new THREE.Vector3();

  const TIPS = [
    'Light, Light, Heavy launches. Press Heavy again to vanish after them.',
    'Dodge right before a hit lands to vanish behind your attacker.',
    'Guard right before a hit for a Perfect Guard and a free counter.',
    'Guard + Heavy throws opponents who hide behind their guard.',
    'Two beams meeting head-on start a Beam Clash — mash to win it.',
    'Hold Boost with no direction to rush straight at your target.',
    'Charging ki leaves you open. Make space first.',
    'Heavy strikes can bat simple ki blasts back at the shooter.',
  ];

  const App = (SL.App = {
    battle: null,
    menuScene: null,
    selectState: {},
    lastLaunch: null,
    last: 0,
    fpsFrames: 0,
    fpsTime: 0,
    crashed: false,

    init() {
      const bootText = document.querySelector('.boot-text');
      if (!window.THREE) {
        bootText.innerHTML = '<div class="boot-error">The 3D engine file is missing.<br>Make sure <code>vendor/three.min.js</code> (three.js r149) is inside the game folder.<br>A copy is also kept in <code>builds/v0.1/vendor</code>.</div>';
        document.querySelector('.boot-ball').style.animation = 'none';
        return;
      }
      try {
        SL.Settings.load();
        SL.Save.load();
        // data problems are reported loudly instead of crashing mid-fight
        const problems = SL.Schema ? SL.Schema.validateAll() : [];
        if (problems.length) console.warn('[SL] character data problems:\n' + problems.join('\n'));
        SL.dataProblems = problems;
        SL.Toon.init();
        SL.Render.init(document.getElementById('game-canvas'));
        SL.Input.init(SL.Render.canvas);
        SL.ScreenFX.init();
        SL.UI.init();
        SL.Portraits.generateAll();
        SL.Portraits.release();
      } catch (err) {
        console.error(err);
        bootText.innerHTML = '<div class="boot-error">Startup failed: ' + String(err.message || err) + '<br>Your browser may not support WebGL.</div>';
        return;
      }

      SL.events.on('render:rebuilt', () => {
        SL.Input.canvas = SL.Render.canvas;
      });
      SL.events.on('input:pointerlock', (e) => {
        const b = this.battle;
        if (!e.locked && b && !b.paused && b.phase === 'fight' && !SL.UI.top() && this._wantLock) this.pauseBattle();
      });
      SL.events.on('input:blur', () => {
        const b = this.battle;
        if (b && !b.paused && !SL.UI.top() && (b.phase === 'fight' || b.mission)) this.pauseBattle();
      });
      SL.events.on('input:mousedown', (e) => {
        const b = this.battle;
        if (b && e.battle && !b.paused && !SL.UI.top() && SL.Settings.data.camera.mouseCamera) {
          this._wantLock = true;
          SL.Input.requestPointerLock();
        }
      });
      SL.events.on('settings:changed', (e) => this._liveSettings(e));

      this.menuScene = new SL.MenuScene();
      SL.UI.push(SL.Screens.title());
      if (SL.Save.loadStatus === 'restoredBackup') setTimeout(() => SL.Notify.toast('Save restored from backup', 'SAVE DATA', null, 5), 1500);
      if (SL.Save.loadStatus === 'corruptReset') setTimeout(() => SL.Notify.toast('Save unreadable — a copy was kept', 'SAVE DATA', null, 6), 1500);
      const boot = document.getElementById('boot');
      boot.classList.add('fade');
      setTimeout(() => (boot.hidden = true), 700);
      this.last = performance.now();
      requestAnimationFrame((t) => this.loop(t));
      window.addEventListener('error', (e) => this.crash(e.error || e.message));
      window.addEventListener('unhandledrejection', (e) => console.warn('[SL] unhandled promise', e.reason));
    },

    loop(now) {
      requestAnimationFrame((t) => this.loop(t));
      const limit = SL.Settings.data.graphics.fpsLimit;
      if (limit > 0 && now - this.last < 1000 / limit - 2) return;
      const dt = Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      if (this.crashed) {
        this._crashNav();
        return;
      }
      try {
        const b = this.battle;
        const top = SL.UI.top();
        if (b && !b.paused && !top) {
          b.update(Math.min(0.2, dt * (SL.debugSpeed || 1)));
          if (SL.Input.pressed('pause') && b.phase !== 'end' && (b.phase === 'fight' || b.mission || b.phase === 'intro')) {
            SL.Input.consume('pause');
            this.pauseBattle();
          }
          if (b.mode === 'training' && SL.Input.pressed('resetPos')) {
            SL.Input.consume('resetPos');
            this.resetTraining();
          }
        } else {
          let nav = null;
          if (SL.Input.capture) SL.Input.poll();
          else nav = SL.Input.pollMenu(dt * 1000);
          SL.UI.update(dt, nav);
          if (b) b.update(dt);
          else if (this.menuScene) this.menuScene.update(dt);
        }
        SL.HUD.update(dt);
        if (this.battle) this.battle.render();
        else if (this.menuScene) this.menuScene.render();
        else SL.Render.renderer.clear();
      } catch (err) {
        this.crash(err);
      }
      this.fpsFrames++;
      this.fpsTime += dt;
      if (this.fpsTime >= 0.5) {
        const fpsEl = document.getElementById('fps');
        if (!fpsEl.hidden) fpsEl.textContent = Math.round(this.fpsFrames / this.fpsTime) + ' FPS';
        this.fpsFrames = 0;
        this.fpsTime = 0;
      }
    },

    _liveSettings(e) {
      const b = this.battle || (this.menuScene && this.menuScene.battle);
      if (!b) return;
      const g = SL.Settings.data.graphics;
      if (e.path === 'graphics.outlines' || e.path.startsWith('graphics.preset') || e.path === 'graphics.*') {
        for (const f of b.fighters) f.model.setOutlines(g.outlines);
      }
      if (e.path.startsWith('graphics')) {
        b.vfx.level = SL.Render.effectsLevel();
        b.vfx.pScale = SL.Render.particleScale();
        if (b.stage.def.type !== 'space') b.camera.setFar(SL.Render.farDistance());
        if (b.scene.fog && b.stage.def.fog) b.scene.fog.far = Math.min(b.stage.def.fog.far, SL.Render.farDistance());
        const size = SL.Render.shadowMapSize();
        const sun = b.stage.sun;
        if (sun) {
          sun.castShadow = size > 0;
          if (size > 0 && sun.shadow.mapSize.x !== size) {
            sun.shadow.mapSize.set(size, size);
            if (sun.shadow.map) {
              sun.shadow.map.dispose();
              sun.shadow.map = null;
            }
          }
          if (size > 0 && !sun.shadow.camera.userData.configured) {
            const c = sun.shadow.camera;
            c.left = c.bottom = -48;
            c.right = c.top = 48;
            c.far = 320;
            c.updateProjectionMatrix();
            c.userData.configured = true;
          }
        }
      }
    },

    /* ---------------- launching ---------------- */
    _showLoading(tip) {
      const boot = document.getElementById('boot');
      boot.hidden = false;
      boot.classList.remove('fade');
      boot.querySelector('.boot-text').textContent = tip || U.pick(TIPS);
    },

    _hideLoading() {
      const boot = document.getElementById('boot');
      boot.classList.add('fade');
      setTimeout(() => (boot.hidden = true), 650);
    },

    _teardown() {
      if (this.battle) {
        try {
          this.battle.dispose();
        } catch (e) {
          console.warn(e);
        }
        this.battle = null;
      }
      SL.HUD.detach();
      if (this.menuScene) {
        this.menuScene.dispose();
        this.menuScene = null;
      }
      SL.Subtitles.clear();
    },

    _launch(build) {
      SL.Audio.init();
      SL.Music.stop(0.4);
      this._showLoading();
      SL.UI.clear();
      setTimeout(() => {
        try {
          this._teardown();
          const battle = build();
          this.battle = battle;
          SL.HUD.attach(battle);
          battle.start();
          this._hideLoading();
        } catch (err) {
          this._hideLoading();
          this.crash(err);
        }
      }, 60);
    },

    startFreeBattle(cfg) {
      const c = U.deepClone(cfg);
      this.lastLaunch = { kind: 'free', cfg: c };
      this._launch(() => {
        const battle = new SL.Battle({
          mode: 'free',
          stageId: c.stage,
          rules: { timeLimit: c.time, hpMul: c.hp, balance: c.balance, allowTransform: c.transform, allowUltimates: c.ultimates, startKi: 30 },
          fighters: [
            { charId: c.p1, player: true, team: 0, pos: new THREE.Vector3(-10, 0, 6), form: c.p1Form, autopilot: c.autopilot },
            { charId: c.cpu, team: 1, pos: new THREE.Vector3(10, 0, -6), form: c.cpuForm, difficulty: c.difficulty },
          ],
          onEnd: (b, r) => this._onFreeEnd(b, r),
        });
        return battle;
      });
    },

    startTraining(cfg) {
      const c = U.deepClone(cfg);
      this.lastLaunch = { kind: 'training', cfg: c };
      this._launch(() => {
        const battle = new SL.Battle({
          mode: 'training',
          stageId: c.stage,
          skipIntro: true,
          rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 100 },
          fighters: [
            { charId: c.p1, player: true, team: 0, pos: new THREE.Vector3(-6, 0, 0), form: c.p1Form, infiniteHp: c.infHp, infiniteKi: c.infKi, infiniteStamina: c.infStamina, cannotDie: true },
            { charId: c.cpu, team: 1, pos: new THREE.Vector3(6, 0, 0), form: c.cpuForm, difficulty: c.difficulty, dummy: c.dummy, infiniteHp: c.dummyInfHp, cannotDie: true },
          ],
          onEnd: () => {},
        });
        return battle;
      });
    },

    startMission(id, opts = {}) {
      const def = SL.data.missions[id];
      this.lastLaunch = { kind: 'story', id, opts };
      this._launch(() => {
        const diff = SL.Settings.data.gameplay.difficulty;
        const battle = new SL.Battle({
          mode: 'story',
          stageId: def.stage,
          rules: Object.assign({ allowTransform: true, allowUltimates: true, startKi: 40 }, SL.Mission.rulesFor(diff), def.rules || {}),
          fighters: [],
          onEnd: (b, r) => this._onMissionEnd(b, r),
        });
        def.setup(battle, opts.startPhase || 0);
        new SL.Mission(battle, def, { startPhase: opts.startPhase || 0, retries: opts.retries || 0 });
        return battle;
      });
    },

    rematch() {
      const l = this.lastLaunch;
      if (!l) return this.quitToMenu();
      if (l.kind === 'free') this.startFreeBattle(l.cfg);
      else if (l.kind === 'training') this.startTraining(l.cfg);
      else this.startMission(l.id, {});
    },

    resetTraining() {
      const b = this.battle;
      if (!b || b.mode !== 'training') return;
      const pts = [new THREE.Vector3(-6, 0, 0), new THREE.Vector3(6, 0, 0)];
      b.fighters.forEach((f, i) => {
        const p = pts[i] || new THREE.Vector3();
        p.y = b.stage.hasGround ? b.stage.heightAt(p.x, p.z) : 0;
        f.setPosition(p);
        f.vel.set(0, 0, 0);
        f.grounded = b.stage.hasGround;
        f.hp = f.hpMax;
        f.ki = f.kiMax;
        f.stamina = f.staminaMax;
        f.setState('free');
        f.yaw = i === 0 ? Math.PI / 2 : -Math.PI / 2;
      });
      for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
      for (const bm of b.projectiles.beams) bm.dispose();
      if (b.clash.active) b.clash._abort();
      b.camera.cut();
      SL.Audio.play('uiSelect');
    },

    pauseBattle() {
      const b = this.battle;
      if (!b || b.paused) return;
      b.pause();
      SL.UI.push(SL.Screens.pause(b));
    },

    resumeBattle() {
      const b = this.battle;
      while (SL.UI.top()) SL.UI.pop();
      if (b) {
        b.resume();
        SL.Input.consume('pause');
        SL.Input.pollMenu();
      }
    },

    quitToMenu(dest) {
      SL.UI.clear();
      this._showLoading('');
      setTimeout(() => {
        this._teardown();
        this.menuScene = new SL.MenuScene();
        SL.Music.play('menu', { intensity: 1 });
        SL.UI.push(SL.Screens.mainMenu());
        if (dest === 'free') SL.UI.push(SL.Screens.select('free'));
        if (dest === 'training') SL.UI.push(SL.Screens.select('training'));
        if (dest === 'story') SL.UI.push(SL.Screens.story());
        if (dest === 'whatif') SL.UI.push(SL.Screens.whatIf());
        this._hideLoading();
      }, 40);
    },

    _onFreeEnd(b, r) {
      const p = b.player;
      const unlocked = SL.Save.recordBattle({
        won: r.won, maxCombo: p.stats.maxCombo, clashesWon: p.stats.clashesWon, character: p.def.id,
        damage: p.stats.damage, ultimates: p.stats.ultimates, transforms: p.stats.transforms,
      });
      SL.Input.exitPointerLock();
      SL.UI.push(SL.Screens.results(b, r, unlocked));
      if (unlocked.length) SL.Notify.unlocks(unlocked);
    },

    _onMissionEnd(b, r) {
      SL.Input.exitPointerLock();
      if (r.failed) {
        SL.UI.push(SL.Screens.missionFailed(b, r));
        return;
      }
      SL.Music.play('menu', { intensity: 0 });
      SL.UI.push(SL.Screens.missionResults(b, r));
      if (r.unlocked && r.unlocked.length) SL.Notify.unlocks(r.unlocked);
    },

    /* ---------------- failure handling ---------------- */
    crash(err) {
      if (this.crashed) return;
      console.error('[SL] crash', err);
      this.crashed = true;
      SL.Input.exitPointerLock();
      const box = U.el('div', { class: 'panel errorbox' }, [
        U.el('h2', { text: 'Something went wrong' }),
        U.el('p', { class: 'hint', text: 'The game hit an error, but your saved progress is safe. Press Enter (or click here) to return to the main menu.' }),
        U.el('pre', { text: String((err && err.stack) || err) }),
      ]);
      box.addEventListener('click', () => this._recover());
      document.body.appendChild(box);
      this._errorBox = box;
    },

    _crashNav() {
      const nav = SL.Input.pollMenu();
      if (nav.confirm || nav.back) this._recover();
    },

    _recover() {
      if (this._errorBox) this._errorBox.remove();
      this._errorBox = null;
      this.crashed = false;
      try {
        this._teardown();
      } catch (e) {
        this.battle = null;
        this.menuScene = null;
      }
      SL.UI.clear();
      this.quitToMenu();
    },
  });

  window.addEventListener('DOMContentLoaded', () => App.init());
  if (document.readyState !== 'loading') App.init();
})();
