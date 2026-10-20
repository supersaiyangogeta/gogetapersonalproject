/*
 * Save system: versioned progress data with checksum, automatic backup and
 * corruption recovery. Progress is never silently discarded: an unreadable
 * save is copied to a ".corrupt" key before anything else happens.
 */
(function () {
  'use strict';
  const U = SL.util;
  // Each version keeps its own save slot so frozen builds (builds/v0.1, builds/v0.2) are never modified.
  // The newest older slot is imported once, read-only.
  const KEY = 'saiyanLegacy.save.v3';
  // Developer / Test Mode plays on its own slot: nothing it unlocks or clears touches the real save
  const DEV_KEY = KEY + '.dev';
  const LEGACY_KEYS = ['saiyanLegacy.save.v2', 'saiyanLegacy.save.v1'];
  const BACKUP_KEY = KEY + '.bak';
  const CORRUPT_KEY = KEY + '.corrupt';
  const SAVE_VERSION = 3;

  function fresh() {
    const now = Date.now();
    return {
      version: SAVE_VERSION,
      created: now,
      updated: now,
      playTime: 0,
      story: { started: false, missions: {}, lastMission: null },
      whatIf: { missions: {}, seen: false },
      // Movies & Specials: the films' own progress, never the canon story's
      movies: { missions: {}, seen: false },
      // outfits / accessories: wardrobe pieces earned through the story (src/data/wardrobe.js);
      // pieces with no unlock condition are never listed, they are simply available
      unlocks: { characters: ['goku', 'vegeta'], stages: ['wasteland'], menuScenes: ['default'], modes: [], outfits: [], accessories: [] },
      // the player's looks for Free Battle / Training / menus, per character, and wardrobe
      // preferences (whatIfCustom: the player's own look in What-If missions). The story never reads it.
      wardrobe: { selected: {}, prefs: { whatIfCustom: false } },
      seen: { prompts: {}, unlockNotices: {} },
      stats: { battles: 0, wins: 0, losses: 0, maxCombo: 0, clashesWon: 0, perCharacter: {} },
      flags: {},
      importedFrom: null,
    };
  }

  /** Upgrades older save layouts. Add a case per version bump. */
  function migrate(data) {
    if (!data || typeof data !== 'object') throw new Error('save is not an object');
    if (typeof data.version !== 'number') data.version = 1;
    if (data.version === 1) {
      // v2 adds What-If progress and mode unlocks; everything else carries over
      data.whatIf = data.whatIf || { missions: {}, seen: false };
      data.version = 2;
    }
    if (data.version === 2) {
      // v3 (Version 0.3): nothing removed; new fields are filled from fresh() below
      data.version = 3;
    }
    // (the wardrobe, 2026-09-23, arrived inside v3: fillDefaults adds its empty fields, and
    // Save.load hands over every outfit the progress already earned)
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
    DEV_KEY,
    LEGACY_KEYS,
    BACKUP_KEY,
    CORRUPT_KEY,
    SAVE_VERSION,
    data: fresh(),
    storage: null,
    loadStatus: 'fresh', // fresh | loaded | restoredBackup | corruptReset
    fresh,
    pack,
    unpack,

    /** The slot being read and written: the real one, or the developer one. */
    devSlot: false,
    activeKey() {
      return this.devSlot ? DEV_KEY : KEY;
    },

    /**
     * Switch between the real save and the Developer / Test save. The first time the dev slot
     * is used it starts as a copy of the real progress (so testing starts where the player is);
     * after that the two never touch. Returns the data now in use.
     */
    useDevSlot(on) {
      on = !!on;
      if (on === this.devSlot && this._slotLoaded) return this.data;
      if (this._slotLoaded) this.write();
      this.devSlot = on;
      this._slotLoaded = true;
      const st = this.storage || (this.storage = SL.Settings.safeStorage());
      if (on && !st.getItem(DEV_KEY)) {
        const real = st.getItem(KEY);
        if (real) st.setItem(DEV_KEY, real);
      }
      return this.load();
    },

    load() {
      this.storage = this.storage || SL.Settings.safeStorage();
      this._slotLoaded = true;
      const st = this.storage;
      const KEY = this.activeKey(), BACKUP_KEY = KEY + '.bak', CORRUPT_KEY = KEY + '.corrupt';
      const raw = st.getItem(KEY);
      if (!raw && this.devSlot) {
        this.data = fresh();
        this.loadStatus = 'fresh';
        // starting characters given by a rule with no condition (Caulifla, Kefla) are open on a new save too
        this.evaluateUnlocks();
        return this.data;
      }
      if (!raw) {
        // first launch of this version: import an older version's progress (read-only copy)
        for (const lk of LEGACY_KEYS) {
          const legacy = st.getItem(lk);
          if (!legacy) continue;
          try {
            this.data = unpack(legacy);
            this.data.importedFrom = lk;
            this.loadStatus = 'imported';
            this._afterLoad();
            this.write();
            return this.data;
          } catch (e) {
            SL.warn('Older save could not be imported:', e.message);
          }
        }
        this.data = fresh();
        this.loadStatus = 'fresh';
        // starting characters given by a rule with no condition (Caulifla, Kefla) are open on a new save too
        this.evaluateUnlocks();
        return this.data;
      }
      try {
        this.data = unpack(raw);
        this.loadStatus = 'loaded';
        // content added after this save was written (new outfits) unlocks from progress already made
        this._afterLoad();
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
          this._afterLoad();
          this.write();
        } catch (err2) {
          this.data = fresh();
          this.loadStatus = 'corruptReset';
        }
      }
      return this.data;
    },

    /**
     * After a save is read: content added since it was written unlocks from the progress already
     * made, and saved wardrobe looks that no longer form a valid combination are moved to the
     * nearest valid one (SL.Wardrobe.migrate), so nothing invalid survives a load.
     */
    _afterLoad() {
      this.evaluateUnlocks();
      if (SL.Wardrobe) SL.Wardrobe.migrate();
    },

    write() {
      const st = this.storage || SL.Settings.safeStorage();
      const KEY = this.activeKey(), BACKUP_KEY = KEY + '.bak';
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
      if (SL.Dev && SL.Dev.unlockAll()) return true;
      const list = this.data.unlocks[type];
      return Array.isArray(list) && list.includes(id);
    },

    unlock(type, id) {
      const list = this.data.unlocks[type] || (this.data.unlocks[type] = []);
      if (list.includes(id)) return false;
      list.push(id);
      return true;
    },

    /** What-If missions keep a separate progress track from the canon story. */
    isWhatIf(id) {
      const def = SL.data.missions && SL.data.missions[id];
      return !!(def && def.whatIf);
    },

    /** Side content (the Dragon Ball hunts): its own track — it never moves the story's "continue". */
    isSide(id) {
      const def = SL.data.missions && SL.data.missions[id];
      return !!(def && def.side);
    },

    /** Movie missions (src/data/story.js `movies`): their own track — never canon progress. */
    isMovie(id) {
      const def = SL.data.missions && SL.data.missions[id];
      return !!(def && def.movie);
    },

    track(id) {
      if (this.isMovie(id)) {
        if (!this.data.movies) this.data.movies = { missions: {}, seen: false };
        return this.data.movies.missions;
      }
      if (this.isSide(id)) {
        if (!this.data.side) this.data.side = { missions: {} };
        return this.data.side.missions;
      }
      return this.isWhatIf(id) ? this.data.whatIf.missions : this.data.story.missions;
    },

    missionResult(id) {
      return this.track(id)[id] || null;
    },

    /** Records a mission clear and returns newly unlocked rewards. */
    completeMission(id, result) {
      const track = this.track(id);
      const m = track[id] || { completed: false, clears: 0, bestRank: null, bestScore: 0 };
      m.completed = true;
      m.clears += 1;
      if (result && typeof result.score === 'number' && result.score > m.bestScore) {
        m.bestScore = result.score;
        m.bestRank = result.rank;
      }
      track[id] = m;
      if (this.isWhatIf(id)) this.data.whatIf.seen = true;
      else if (this.isMovie(id)) this.data.movies.seen = true;
      else if (this.isSide(id)) {
        /* side content: no story progress */
      } else {
        this.data.story.started = true;
        this.data.story.lastMission = id;
      }
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
        const r = this.missionResult(id);
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
    // { any: [cond, cond] }: one of them is enough (a What-If the story opens, or a wish does)
    if (cond.any) return cond.any.some((c) => conditionMet(data, c));
    if (cond.missionComplete) {
      const id = cond.missionComplete;
      const m = data.story.missions[id] || (data.whatIf && data.whatIf.missions[id]) || (data.side && data.side.missions[id]) || (data.movies && data.movies.missions[id]);
      if (!m || !m.completed) return false;
    }
    if (cond.wins != null && data.stats.wins < cond.wins) return false;
    if (cond.flag && !data.flags[cond.flag]) return false;
    return true;
  }
  // screens ask through here (What-If locks): Developer / Test Mode can open everything
  Save.conditionMet = (data, cond) => (SL.Dev && SL.Dev.unlockAll()) || conditionMet(data, cond);
})();
