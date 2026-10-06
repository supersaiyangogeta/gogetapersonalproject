/*
 * DEVELOPER / TEST MODE — a local QA tool (owner request, human playtest round 2).
 *
 * The point is fast human testing: unlock everything, jump into any mission at any phase,
 * test a form or a technique, restart — without replaying the campaign each time.
 *
 * It is kept apart from the game on purpose:
 *   - it is off by default, and switched on in Settings → Developer / Test;
 *   - while it is on, the game reads and writes a SEPARATE save slot (SL.Save.DEV_KEY), which
 *     starts as a copy of the real progress. Nothing cleared, unlocked or won in test mode
 *     reaches the real save; switching the mode off puts the real save back exactly as it was;
 *   - every cheat is a setting under `dev.*` and only acts while the mode is on.
 *
 *   SL.Dev.active            is the mode on
 *   SL.Dev.unlockAll()       every mission, character, stage and What-If open (asked by Save/story)
 *   SL.Dev.tick(battle)      applies the player cheats once per simulation tick
 *   SL.Dev.noKiCost(f)       asked by the ki rule
 *   SL.Dev.actions           mission and battle tools the pause menu and the dev menu call
 *   SL.Dev.overlayText(b)    the debug overlay (camera, lock-on, loops, state, phase)
 */
(function () {
  'use strict';

  const opt = (k) => !!(SL.Settings && SL.Settings.data.dev && SL.Settings.data.dev[k]);

  const Dev = (SL.Dev = {
    get active() {
      return opt('enabled');
    },

    /** Called once at boot, after settings and save are loaded. */
    init() {
      if (this.active) SL.Save.useDevSlot(true);
      if (SL.events) {
        SL.events.on('settings:changed', (e) => {
          if (e.path === 'dev.enabled' || e.path === 'dev.*') this.setEnabled(opt('enabled'));
        });
      }
    },

    /** Switching the mode switches the save slot, both ways. */
    setEnabled(on) {
      if (SL.Settings.data.dev.enabled !== !!on) SL.Settings.data.dev.enabled = !!on;
      SL.Save.useDevSlot(!!on);
      if (SL.events) SL.events.emit('dev:changed', { active: !!on });
    },

    unlockAll() {
      return this.active && opt('unlockAll');
    },

    noKiCost(f) {
      return this.active && opt('noKiCost') && f && f.isPlayer;
    },

    /** The player cheats, applied every tick (missions re-apply their own locks each phase). */
    tick(b) {
      const p = b.player;
      if (!p) return;
      if (!this.active) {
        // switched off mid-fight: hand back what god mode and one-hit KO took over
        if (p._devGod || p._devKO) this.restore(p);
        return;
      }
      if (!p.alive) return;
      if (opt('infiniteHp')) p.hp = p.hpMax;
      if (opt('infiniteKi') || opt('noKiCost')) p.ki = Math.max(p.ki, opt('infiniteKi') ? p.kiMax : p.ki);
      if (opt('infiniteStamina')) p.stamina = p.staminaMax;
      if (opt('godMode')) {
        if (!p._devGod) p._devGod = { cannotDie: p.cannotDie, taken: p.damageTakenMul };
        p.cannotDie = true;
        p.damageTakenMul = 0;
      } else if (p._devGod) {
        p.cannotDie = p._devGod.cannotDie;
        p.damageTakenMul = p._devGod.taken;
        p._devGod = null;
      }
      if (opt('noCooldowns')) for (const k in p.cooldowns) p.cooldowns[k] = 0;
      if (opt('oneHitKO')) {
        if (!p._devKO) p._devKO = { dealt: p.damageDealtMul };
        p.damageDealtMul = 999;
      } else if (p._devKO) {
        p.damageDealtMul = p._devKO.dealt;
        p._devKO = null;
      }
      if (opt('allForms')) {
        p.lockedForms = {};
        p.lockedSlots = {};
        p.formCaps = {};
      }
      if (opt('infiniteTime')) b.fightTime = Math.min(b.fightTime, 1);
    },

    restore(p) {
      if (p._devGod) {
        p.cannotDie = p._devGod.cannotDie;
        p.damageTakenMul = p._devGod.taken;
        p._devGod = null;
      }
      if (p._devKO) {
        p.damageDealtMul = p._devKO.dealt;
        p._devKO = null;
      }
    },

    actions: {
      /** A scene that is playing ends now (its end state is applied, exactly as a skip does). */
      skipScene(b) {
        if (b && b.inputLocked) b.skipRequested = true;
      },
      forceWin(b) {
        if (b && b.mission && b.mission.state === 'running') b.mission.succeed();
        else if (b && !b.mission && b.player) b.finish({ winnerTeam: b.player.team, reason: 'dev' });
      },
      forceLoss(b) {
        if (b && b.mission && b.mission.state === 'running') b.mission.fail('dev');
        else if (b && !b.mission && b.player) b.finish({ winnerTeam: -1, loser: b.player, reason: 'dev' });
      },
      /** Start any mission from any phase (a phase index, or its id). */
      startMission(id, phase) {
        const def = SL.data.missions[id];
        if (!def) return false;
        const i = typeof phase === 'string' ? def.phases.findIndex((p) => p.id === phase) : phase || 0;
        if (i < 0 || i >= def.phases.length) return false;
        SL.App.startMission(id, { startPhase: i });
        return true;
      },
      restartPhase(b) {
        if (!b || !b.mission) return false;
        return Dev.actions.startMission(b.mission.def.id, b.mission.phaseIndex);
      },
      nextPhase(b) {
        if (!b || !b.mission) return false;
        const i = b.mission.phaseIndex + 1;
        if (i >= b.mission.def.phases.length) return false;
        return Dev.actions.startMission(b.mission.def.id, i);
      },
      /** Cycle the player's form (ignoring story locks); wraps back to base. */
      forceForm(b) {
        const p = b && b.player;
        if (!p || !p.def.forms || p.def.forms.length < 2) return false;
        const next = (p.formIndex + 1) % p.def.forms.length;
        p.applyForm(next);
        return p.form.id;
      },
      resetPower(b) {
        const p = b && b.player;
        if (!p) return;
        if (p.formIndex !== 0) p.applyForm(0);
        p.hp = p.hpMax;
        p.ki = p.kiMax;
        p.stamina = p.staminaMax;
        for (const k in p.cooldowns) p.cooldowns[k] = 0;
      },
      /** Put a fighter next to the player: an enemy (CPU), an ally (CPU) or a practice target. */
      spawn(b, kind, charId) {
        const p = b && b.player;
        if (!p) return null;
        const at = p.pos.clone().addScaledVector(p.forward, kind === 'ally' ? -3 : 6);
        if (b.stage.hasGround) at.y = b.stage.heightAt(at.x, at.z);
        if (kind === 'target') {
          const pr = b.stage.addProp({ kind: 'pod', pos: at.clone().add(new THREE.Vector3(0, 1.4, 0)), r: 1.4, hp: 3000, id: 'devTarget' + b.frame });
          b.emit('devSpawn', { kind, prop: pr });
          return pr;
        }
        const id = charId || (kind === 'ally' ? 'krillin' : 'saibaman');
        if (!SL.data.characters[id]) return null;
        const f = b.spawn({ charId: id, team: kind === 'ally' ? p.team : p.team === 0 ? 1 : 0, pos: at });
        f.controller = new SL.AIController(b, { difficulty: SL.Settings.data.gameplay.difficulty });
        f.target = kind === 'ally' ? b.pickTarget(f) : p;
        if (kind === 'ally' && b.party && !b.party.includes(f)) b.party.push(f);
        b.emit('devSpawn', { kind, fighter: f });
        return f;
      },
      resetHints() {
        SL.Save.data.seen.prompts = {};
        SL.Save.write();
      },
      /** Test-save tools: they only ever touch the developer slot. */
      backupTestSave() {
        if (!SL.Save.devSlot) return false;
        SL.Save.write();
        const st = SL.Save.storage;
        const raw = st.getItem(SL.Save.DEV_KEY);
        if (raw) st.setItem(SL.Save.DEV_KEY + '.backup', raw);
        return !!raw;
      },
      restoreTestSave() {
        if (!SL.Save.devSlot) return false;
        const st = SL.Save.storage;
        const raw = st.getItem(SL.Save.DEV_KEY + '.backup');
        if (!raw) return false;
        st.setItem(SL.Save.DEV_KEY, raw);
        SL.Save.load();
        return true;
      },
      /** The test save becomes a fresh copy of the real progress again. */
      resetTestSave() {
        if (!SL.Save.devSlot) return false;
        const st = SL.Save.storage;
        const real = st.getItem(SL.Save.KEY);
        if (real) st.setItem(SL.Save.DEV_KEY, real);
        else st.removeItem(SL.Save.DEV_KEY);
        SL.Save.load();
        return true;
      },
      /** The test save forgets everything (a brand-new game, still separate from the real one). */
      clearTestProgress() {
        if (!SL.Save.devSlot) return false;
        SL.Save.data = SL.Save.fresh();
        SL.Save.write();
        return true;
      },
    },

    /** The debug overlay's lines (plain text; the HUD draws them). */
    overlayText(b) {
      if (!b) return '';
      const p = b.player;
      const cam = b.camera;
      const lines = [];
      lines.push('DEV · ' + (b.mission ? b.mission.def.id + ' › ' + ((b.mission.def.phases[b.mission.phaseIndex] || {}).id || 'end') + ' (' + b.mission.state + ')' : b.mode));
      lines.push('camera ' + (b.camMode || '?') + (cam.shot ? ' · shot' : '') + (cam.inShot ? ' (story)' : ''));
      if (p) {
        const lt = p.aimTarget ? p.aimTarget() : p.target;
        lines.push('lock ' + (p.lockMode || 'locked') + ' → ' + (lt ? lt.name || (lt.def && lt.def.name) : 'none'));
        const mind = p.mind && p.mind.own !== p ? ' [mind: ' + p.mind.name + ']' : '';
        lines.push(p.name + mind + ' · ' + p.state + ' · ' + p.form.id + ' · hp ' + Math.round(p.hp) + '/' + p.hpMax + ' · ki ' + Math.round(p.ki));
      }
      const loops = SL.Audio.liveLoops ? SL.Audio.liveLoops((h) => !h.ui) : [];
      lines.push('audio loops ' + loops.length + (loops.length ? ': ' + loops.map((h) => h.name + (h.tag ? '/' + h.tag : '')).join(', ') : '') + (b.silenced ? ' · silenced' : ''));
      if (b.mission && b.mission.flags.bodyState) lines.push('body state ' + b.mission.flags.bodyState);
      return lines.join('\n');
    },
  });
})();
