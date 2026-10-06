/*
 * Save system: versioned progress data with checksum, automatic backup and
 * corruption recovery. Progress is never silently discarded: an unreadable
 * save is copied to a ".corrupt" key before anything else happens.
 */
(function () {
  'use strict';
  const U = SL.util;
  const KEY = 'saiyanLegacy.save.v1';
  const BACKUP_KEY = KEY + '.bak';
  const CORRUPT_KEY = KEY + '.corrupt';
  const SAVE_VERSION = 1;

  function fresh() {
    const now = Date.now();
    return {
      version: SAVE_VERSION,
      created: now,
      updated: now,
      playTime: 0,
      story: { started: false, missions: {}, lastMission: null },
      unlocks: { characters: ['goku', 'vegeta'], stages: ['wasteland'], menuScenes: ['default'] },
      seen: { prompts: {}, unlockNotices: {} },
      stats: { battles: 0, wins: 0, losses: 0, maxCombo: 0, clashesWon: 0, perCharacter: {} },
      flags: {},
    };
  }

  /** Upgrades older save layouts. Add a case per version bump. */
  function migrate(data) {
    if (!data || typeof data !== 'object') throw new Error('save is not an object');
    if (typeof data.version !== 'number') data.version = 1;
    // v1 is current. Future: if (data.version === 1) { ...; data.version = 2; }
    U.fillDefaults(data, fresh());
    return data;
  }

  function pack(data) {
    const payload = JSON.stringify(data);
    return JSON.stringify({ sum: U.hash(payload), payload });
  }

  function unpack(raw) {
    const wrapper = JSON.parse(raw);
    if (!wrapper || typeof wrapper.payload !== 'string') throw new Error('bad wrapper');
    if (U.hash(wrapper.payload) !== wrapper.sum) throw new Error('checksum mismatch');
    return migrate(JSON.parse(wrapper.payload));
  }

  const Save = (SL.Save = {
    KEY,
    BACKUP_KEY,
    CORRUPT_KEY,
    SAVE_VERSION,
    data: fresh(),
    storage: null,
    loadStatus: 'fresh', // fresh | loaded | restoredBackup | corruptReset
    fresh,
    pack,
    unpack,

    load() {
      this.storage = this.storage || SL.Settings.safeStorage();
      const st = this.storage;
      const raw = st.getItem(KEY);
      if (!raw) {
        this.data = fresh();
        this.loadStatus = 'fresh';
        return this.data;
      }
      try {
        this.data = unpack(raw);
        this.loadStatus = 'loaded';
      } catch (err) {
        SL.warn('Main save unreadable:', err.message);
        try {
          st.setItem(CORRUPT_KEY, raw);
        } catch (e) { /* storage full — keep going */ }
        const bak = st.getItem(BACKUP_KEY);
        try {
          if (!bak) throw new Error('no backup');
          this.data = unpack(bak);
          this.loadStatus = 'restoredBackup';
          this.write();
        } catch (err2) {
          this.data = fresh();
          this.loadStatus = 'corruptReset';
        }
      }
      return this.data;
    },

    write() {
      const st = this.storage || SL.Settings.safeStorage();
      this.data.updated = Date.now();
      try {
        const prev = st.getItem(KEY);
        if (prev) {
          // only keep a backup that is itself valid
          try {
            unpack(prev);
            st.setItem(BACKUP_KEY, prev);
          } catch (e) { /* previous was bad, don't back it up */ }
        }
        st.setItem(KEY, pack(this.data));
        SL.events.emit('save:written', {});
        return true;
      } catch (err) {
        SL.warn('Save failed', err);
        SL.events.emit('save:failed', { error: err });
        return false;
      }
    },

    hasProgress() {
      return this.data.story.started || this.data.stats.battles > 0;
    },

    isUnlocked(type, id) {
      const list = this.data.unlocks[type];
      return Array.isArray(list) && list.includes(id);
    },

    unlock(type, id) {
      const list = this.data.unlocks[type] || (this.data.unlocks[type] = []);
      if (list.includes(id)) return false;
      list.push(id);
      return true;
    },

    missionResult(id) {
      return this.data.story.missions[id] || null;
    },

    /** Records a mission clear and returns newly unlocked rewards. */
    completeMission(id, result) {
      const m = this.data.story.missions[id] || { completed: false, clears: 0, bestRank: null, bestScore: 0 };
      m.completed = true;
      m.clears += 1;
      if (result && typeof result.score === 'number' && result.score > m.bestScore) {
        m.bestScore = result.score;
        m.bestRank = result.rank;
      }
      this.data.story.missions[id] = m;
      this.data.story.started = true;
      this.data.story.lastMission = id;
      const unlocked = this.evaluateUnlocks();
      this.write();
      return unlocked;
    },

    recordBattle(info) {
      const s = this.data.stats;
      s.battles++;
      if (info.won) s.wins++;
      else s.losses++;
      if (info.maxCombo > s.maxCombo) s.maxCombo = info.maxCombo;
      if (info.clashesWon) s.clashesWon += info.clashesWon;
      if (info.character) {
        const c = s.perCharacter[info.character] || (s.perCharacter[info.character] = { battles: 0, wins: 0, damage: 0, ultimates: 0, transforms: 0 });
        c.battles++;
        if (info.won) c.wins++;
        c.damage += Math.round(info.damage || 0);
        c.ultimates += info.ultimates || 0;
        c.transforms += info.transforms || 0;
      }
      const unlocked = this.evaluateUnlocks();
      this.write();
      return unlocked;
    },

    /** Checks data-driven unlock conditions (src/data/unlocks.js). */
    evaluateUnlocks() {
      const newly = [];
      for (const u of SL.data.unlocks) {
        if (this.isUnlocked(u.type, u.target)) continue;
        if (conditionMet(this.data, u.condition)) {
          this.unlock(u.type, u.target);
          newly.push(u);
        }
      }
      return newly;
    },

    /** Weighted completion percentage over content that exists in this build. */
    completion() {
      const missions = Object.keys(SL.data.missions);
      let got = 0, total = 0;
      for (const id of missions) {
        total += 3;
        const r = this.data.story.missions[id];
        if (r && r.completed) got += r.bestRank === 'S' ? 3 : 2;
      }
      // only content that is earned counts; starting fighters are not progress
      for (const u of SL.data.unlocks) {
        if (!u.title) continue;
        total += 1;
        if (this.isUnlocked(u.type, u.target)) got += 1;
      }
      return total ? Math.round((got / total) * 100) : 0;
    },

    markSeen(group, id) {
      this.data.seen[group] = this.data.seen[group] || {};
      if (this.data.seen[group][id]) return false;
      this.data.seen[group][id] = true;
      return true;
    },
  });

  function conditionMet(data, cond) {
    if (!cond) return true;
    if (cond.missionComplete) {
      const m = data.story.missions[cond.missionComplete];
      if (!m || !m.completed) return false;
    }
    if (cond.wins != null && data.stats.wins < cond.wins) return false;
    if (cond.flag && !data.flags[cond.flag]) return false;
    return true;
  }
  Save.conditionMet = conditionMet;
})();
