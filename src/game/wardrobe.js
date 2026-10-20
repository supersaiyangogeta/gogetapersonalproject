/*
 * SL.Wardrobe — resolves what a character wears (data: src/data/wardrobe.js).
 *
 *   CANON STORY   the era's canon look (profile.canonByEra, plus a mission's own `appearance`
 *                 override). The player's choice is never read: story continuity always wins.
 *   WHAT-IF       the canon look of the era it branches from, plus the mission's What-If
 *                 variants; the player's own look only for the player's fighter, only when the
 *                 player allowed it (prefs.whatIfCustom) and the mission forces nothing.
 *   FREE BATTLE / TRAINING / MENUS   the player's saved selection, validated: a locked, planned,
 *                 unknown or incompatible piece falls back to the default and never crashes.
 *
 * It is applied at one place — the Fighter builds its body from `dress()` — so every mission,
 * scene and mode gets it without knowing it exists. Transformations (form.look), battle damage
 * (setTorn, damageArmor) and story states (rage, stone, spirit) all work on top of the dressed
 * body, because they work on whatever the model was built from.
 */
(function () {
  'use strict';
  const NONE = 'none';
  const OPTIONAL = ['armor', 'emblem', 'scouter', 'tail', 'hair'];

  const data = () => SL.data.wardrobe || { slots: [], pieces: {}, profiles: {} };
  const piece = (id) => (id && id !== NONE && data().pieces[id]) || null;
  const profile = (charId) => data().profiles[charId] || null;
  const fits = (p, charId) => p.chars === '*' || p.chars.includes(charId);
  const eraIndex = (id) => SL.data.eras.findIndex((e) => e.id === id);
  const unlockType = (p) => (p.slot === 'outfit' ? 'outfits' : 'accessories');
  /*
   * BODIES: an outfit is made for a body ('adult' default, or 'young'). A profile wears one body (profile.body), or
   * offers several (profile.bodies: { [body]: appearance fields }): then the outfit picks the body, and that body's
   * fields (height, build, hair, face, headExtras, props) replace the character's own — young Chi-Chi's helmet armour is
   * the young body, her 23rd World Tournament dress the grown one, so neither can end up on the other's body.
   */
  const bodyOf = (p) => trait(p, 'body') || 'adult';
  const fitsBody = (p, pr) => (pr && pr.bodies ? !!pr.bodies[bodyOf(p)] : bodyOf(p) === ((pr && pr.body) || 'adult'));

  /**
   * A property of a piece, inherited through `base` like its look: an outfit built on another one
   * (Bardock's damaged and movie variants on his classic armor) also takes its compatibility —
   * armorOk, armors, emblemOk, defaults, palettes, face, body — unless it says otherwise. (Only the
   * look used to be inherited, so those variants refused their own default armor and the Outfit row
   * could not leave Bardock's classic armor.)
   */
  function trait(p, key, depth = 0) {
    if (!p) return undefined;
    if (p[key] !== undefined) return p[key];
    return p.base && depth < 8 ? trait(piece(p.base), key, depth + 1) : undefined;
  }

  /** Can armor / an emblem go on this outfit? null when it can, else the reason. */
  function clash(p, slot, o) {
    if (slot === 'armor') {
      const list = trait(o, 'armors');
      if (list) return list.includes(p.id) ? null : 'is not one of the armors for ' + o.id;
      return trait(o, 'armorOk') ? null : 'cannot be worn over ' + o.id;
    }
    if (slot === 'emblem') return trait(o, 'emblemOk') ? null : 'cannot go on ' + o.id;
    return null;
  }

  /**
   * An outfit's model fields, inherited through `base`; a null value removes a field. `start`: the fields it is laid
   * over (an `own` outfit's authored ones), so a null can remove an authored field too (18's stripes, her skirt).
   */
  function outfitLook(p, depth = 0, start) {
    if (!p) return Object.assign({}, start);
    const out = p.base && depth < 8 ? outfitLook(piece(p.base), depth + 1, start) : Object.assign({}, start);
    for (const [k, v] of Object.entries(p.look || {})) {
      if (v === null) delete out[k];
      else out[k] = v;
    }
    return out;
  }

  /*
   * BODY CONTROLS (profile.bodyControls): bounded appearance sliders for a character that offers them (Kefla). A selection
   * may carry body = { [control id]: value } with value in [-1, 1] in steps of 0.25; 0 (or absent) is the authored
   * build. Each control lists the build keys it moves: [path, value at -1, value at +1]; the value at 0 is read from
   * the character's own build, so the default never changes. Nothing here writes to a character definition.
   */
  const BODY_STEP = 0.25;
  const bodyControls = (charId) => {
    const pr = profile(charId);
    return (pr && pr.bodyControls) || null;
  };
  const getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  /** The character's build with a selection's body values applied (copies only what it touches). */
  function bodyBuild(def, body) {
    const ctl = bodyControls(def.id);
    const build = Object.assign({}, def.appearance.build);
    if (!ctl || !body) return build;
    for (const c of ctl) {
      const v = body[c.id];
      if (!v) continue;
      for (const [path, lo, hi] of c.keys) {
        const base = getPath(def.appearance.build, path);
        if (typeof base !== 'number') continue;
        const val = v < 0 ? base + (lo - base) * -v : base + (hi - base) * v;
        const parts = path.split('.');
        let o = build;
        for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]] = Object.assign({}, o[parts[i]]);
        o[parts[parts.length - 1]] = val;
      }
    }
    return build;
  }

  const Wardrobe = (SL.Wardrobe = {
    NONE,
    OPTIONAL,
    piece,
    profile,
    outfitLook,
    trait,
    bodyControls,
    BODY_STEP,

    has(charId) {
      return !!profile(charId);
    },

    /** Characters with a wardrobe the player can dress (developer-only ones only in dev mode). */
    characters() {
      return Object.keys(data().profiles).filter((id) => SL.data.characters[id] && (!profile(id).devOnly || (SL.Dev && SL.Dev.active)));
    },

    eraLabel(id) {
      const e = SL.data.eras.find((x) => x.id === id);
      return e ? e.label : '';
    },

    /** Can the player wear it outside the story? Drawable and, when it has a condition, unlocked. */
    available(p) {
      if (typeof p === 'string') p = piece(p);
      if (!p) return false;
      if (p.status !== 'prototype') return false;
      if (!p.unlock || !SL.Save) return true;
      return SL.Save.isUnlocked(unlockType(p), p.id);
    },

    /** Fills the slots a partial selection leaves open from the outfit's own defaults. */
    complete(charId, partial = {}) {
      const pr = profile(charId);
      const sel = Object.assign({}, !partial.outfit && pr ? pr.default : {}, partial);
      const d = trait(piece(sel.outfit), 'defaults') || {};
      for (const s of OPTIONAL) if (sel[s] === undefined) sel[s] = d[s] || NONE;
      if (!sel.palette) sel.palette = 'default';
      return sel;
    },

    /**
     * Checks a selection piece by piece. Anything wrong is reported and replaced (the outfit by
     * the character's default, an optional piece by the outfit's default or none), so a bad
     * save or bad data can never reach the model builder.
     * opts.checkUnlock: also refuse what the player has not unlocked (Free Battle and menus).
     */
    sanitize(charId, sel, opts = {}) {
      const pr = profile(charId);
      if (!pr) return { selection: null, problems: ['no wardrobe for ' + charId] };
      const problems = [];
      const s = Object.assign({}, sel || {});
      const refuse = (p, slot) => {
        if (!p) return 'unknown piece';
        if (p.slot !== slot) return 'is a ' + p.slot + ', not a ' + slot;
        if (!fits(p, charId)) return 'does not fit ' + charId;
        if (p.status !== 'prototype') return 'is planned, not built (' + (p.needs || 'no model yet') + ')';
        if (opts.checkUnlock && !Wardrobe.available(p)) return 'is locked';
        if (p.modes && opts.mode && !p.modes.includes(opts.mode)) return 'is not allowed in ' + opts.mode;
        // a young body's clothes need a young body (and the other way round)
        if (!fitsBody(p, pr)) return 'is made for a ' + bodyOf(p) + ' body';
        return null;
      };
      let o = piece(s.outfit);
      const why = refuse(o, 'outfit');
      if (why) {
        problems.push('outfit "' + s.outfit + '" ' + why);
        o = piece(pr.default.outfit);
        s.outfit = pr.default.outfit;
        for (const k of OPTIONAL) delete s[k];
        delete s.palette;
      }
      const d = Wardrobe.complete(charId, { outfit: s.outfit });
      // what a slot may hold on this outfit (the fallback is checked the same way, so a fallback
      // can never be another invalid piece: the outfit's default when it fits, otherwise none)
      const bad = (p, slot) => refuse(p, slot) || clash(p, slot, o);
      const fallback = (slot) => (d[slot] !== NONE && !bad(piece(d[slot]), slot) ? d[slot] : NONE);
      for (const slot of OPTIONAL) {
        const v = s[slot];
        if (v === undefined || v === NONE) {
          s[slot] = v === NONE ? NONE : fallback(slot);
          continue;
        }
        const why2 = bad(piece(v), slot);
        if (why2) {
          problems.push(slot + ' "' + v + '" ' + why2);
          s[slot] = fallback(slot);
        }
      }
      if (s.body !== undefined) {
        const ctl = bodyControls(charId);
        const raw = s.body;
        delete s.body;
        if (!ctl) {
          if (raw && typeof raw === 'object' && Object.keys(raw).length) problems.push('body controls are not offered for ' + charId);
        } else if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
          problems.push('body is not a set of values');
        } else {
          const out = {};
          for (const k of Object.keys(raw)) if (!ctl.some((c) => c.id === k)) problems.push('body control "' + k + '" does not exist');
          for (const c of ctl) {
            if (raw[c.id] === undefined) continue;
            const n = Number(raw[c.id]);
            if (!isFinite(n)) {
              problems.push('body ' + c.id + ' is not a number');
              continue;
            }
            const v = Math.round(Math.max(-1, Math.min(1, n)) / BODY_STEP) * BODY_STEP;
            if (v !== n) problems.push('body ' + c.id + ' ' + n + ' adjusted to ' + v);
            if (v) out[c.id] = v;
          }
          if (Object.keys(out).length) s.body = out;
        }
      }
      if (!s.palette) s.palette = 'default';
      const palettes = trait(o, 'palettes');
      if (s.palette !== 'default' && !(palettes && palettes[s.palette])) {
        problems.push('palette "' + s.palette + '" is not offered by ' + o.id);
        s.palette = 'default';
      }
      return { selection: s, problems };
    },

    /** The canon look for a character in a mission (What-If: the era it branches from). */
    canonFor(charId, missionId) {
      const pr = profile(charId);
      if (!pr) return null;
      const era = SL.data.eraOf ? SL.data.eraOf(missionId) : null;
      let entry = null;
      for (let i = era ? eraIndex(era) : -1; i >= 0 && !entry; i--) entry = pr.canonByEra[SL.data.eras[i].id] || null;
      const m = SL.data.missions && SL.data.missions[missionId];
      const over = m && m.appearance && m.appearance[charId];
      const base = entry || pr.default;
      // an override that changes the outfit takes that outfit's own defaults, not the era's
      const sel = over && over.outfit ? Object.assign({}, over) : Object.assign({}, base, over || {});
      return Wardrobe.complete(charId, sel);
    },

    /** Where a battle stands: 'canon' | 'whatif' | 'custom' | 'none'. */
    context(battle) {
      if (!battle) return { kind: 'none' };
      if (battle.mode === 'story') {
        const id = battle.missionId || (battle.mission && battle.mission.def && battle.mission.def.id);
        const m = id && SL.data.missions && SL.data.missions[id];
        if (!m) return { kind: 'none' };
        return { kind: m.whatIf ? 'whatif' : 'canon', missionId: id, era: SL.data.eraOf(id) };
      }
      if (battle.mode === 'free' || battle.mode === 'training' || battle.mode === 'menu') return { kind: 'custom', mode: battle.mode };
      return { kind: 'none' };
    },

    /** The selection a fighter of `charId` wears in this context (null: no wardrobe). */
    selectionFor(charId, ctx, opts = {}) {
      if (!profile(charId)) return null;
      if (opts.selection) return Wardrobe.sanitize(charId, opts.selection).selection;
      if (ctx.kind === 'canon') return Wardrobe.sanitize(charId, Wardrobe.canonFor(charId, ctx.missionId)).selection;
      if (ctx.kind === 'whatif') {
        const m = SL.data.missions[ctx.missionId];
        const forced = m && m.appearance && m.appearance[charId];
        const mine = Wardrobe.saved(charId);
        if (opts.isPlayer && !forced && mine && Wardrobe.prefs().whatIfCustom) return Wardrobe.sanitize(charId, mine, { checkUnlock: true, mode: 'whatif' }).selection;
        return Wardrobe.sanitize(charId, Wardrobe.canonFor(charId, ctx.missionId)).selection;
      }
      if (ctx.kind === 'custom') return Wardrobe.sanitize(charId, Wardrobe.saved(charId) || profile(charId).default, { checkUnlock: true, mode: ctx.mode }).selection;
      return null;
    },

    /** The appearance object the model builder reads, for a def in a selection. */
    appearance(def, sel) {
      const app = Object.assign({}, def.appearance);
      const o = piece(sel.outfit);
      const pr = profile(def.id);
      if (pr && pr.bodies) Object.assign(app, pr.bodies[bodyOf(o)]);
      // an outfit marked `own` is the character's authored outfit (Caulifla, Kefla), with the piece's own changes on top
      const look = outfitLook(o, 0, trait(o, 'own') ? def.appearance.outfit : null);
      if (sel.body) app.build = bodyBuild(def, sel.body);
      const palettes = trait(o, 'palettes');
      const pal = sel.palette && sel.palette !== 'default' && palettes && palettes[sel.palette];
      if (pal) Object.assign(look, pal.look);
      // the armor slot owns the armor of an outfit that takes armor; an outfit whose construction
      // includes an armor-like piece (Yardrat's vest) keeps it
      if (trait(o, 'armorOk') || trait(o, 'armors')) {
        const a = piece(sel.armor);
        if (a) look.armor = Object.assign({}, a.look);
        else delete look.armor;
      }
      // the emblem slot owns a gi's marks; any other outfit keeps its own print (a shirt's lettering)
      if (trait(o, 'emblemOk')) {
        const e = piece(sel.emblem);
        if (e) look.emblem = Object.assign({ fg: '#111111', bg: '#ffffff' }, e.look);
        else delete look.emblem;
      }
      const sc = piece(sel.scouter);
      if (sc) look.scouter = Object.assign({}, sc.look);
      else delete look.scouter;
      const t = piece(sel.tail);
      if (t) {
        look.tail = t.look.color === 'auto' ? (def.appearance.outfit && def.appearance.outfit.tail) || 0x4a2a18 : t.look.color;
        look.tailStyle = t.look.style || 'wrapped';
      } else {
        delete look.tail;
        delete look.tailStyle;
      }
      // an outfit can change the face it goes with (Super-era Bardock has no scar yet)
      const face = trait(o, 'face');
      if (face) app.face = Object.assign({}, app.face, face);
      // ...and the hair (Future Trunks' outfits after the Room of Spirit and Time have it grown to the shoulders); a hair
      // piece chosen in the hair slot still wins
      const oh = trait(o, 'hair');
      if (oh) app.hair = Object.assign({}, app.hair, oh);
      const h = piece(sel.hair);
      if (h) app.hair = Object.assign({}, app.hair, h.look);
      // ...and the things worn with it (props: Android 18's Buu Saga pearls, earrings, wallet chain and bangle)
      const op = trait(o, 'props');
      if (op) app.props = (app.props || []).concat(op);
      app.outfit = look;
      return app;
    },

    /**
     * A def to build the body from. Procedural bodies read the appearance; an imported body
     * (def.model type 'glb') keeps its model, and an outfit can bring its own production data:
     * glb.model (a skeleton-compatible replacement body), glb.materials (colour overrides by
     * material name) and glb.attach (meshes on joint sockets). The same outfit id works for both.
     */
    modelDef(def, sel) {
      const out = Object.assign({}, def, { appearance: Wardrobe.appearance(def, sel) });
      const g = piece(sel.outfit).glb;
      const assets = (SL.assets && SL.assets.glb) || {};
      // a replacement body whose file is not loaded falls back to the character's own body
      const own = g && g.model && assets[g.model.asset] ? g.model : null;
      if (g && g.model && !own) SL.warn('outfit model skipped (not loaded):', g.model.asset);
      const base = own || def.model;
      if (g && base) out.model = Object.assign({}, base, { materials: g.materials || base.materials, attach: g.attach || base.attach });
      return out;
    },

    /** For the Fighter: { def, selection, kind } or null when the character has no wardrobe here. */
    dress(battle, def, opts = {}) {
      if (!profile(def.id)) return null;
      const ctx = Wardrobe.context(battle);
      if (ctx.kind === 'none' && !opts.wardrobe) return null;
      const selection = Wardrobe.selectionFor(def.id, ctx, { selection: opts.wardrobe, isPlayer: opts.isPlayer });
      if (!selection) return null;
      return { def: Wardrobe.modelDef(def, selection), selection, kind: opts.wardrobe ? 'explicit' : ctx.kind };
    },

    /**
     * A look as a portable preset (the file-based viewer and the game do not share browser storage): JSON text the
     * other side reads with importPreset.
     */
    exportPreset(charId, sel) {
      return JSON.stringify({ format: 'saiyan-legacy.look', version: 1, character: charId, selection: sel }, null, 2);
    },
    /**
     * Reads a preset. Returns { ok, charId, selection, problems }: the selection is always sanitized (unknown pieces
     * replaced, body values clamped), and problems say what was adjusted. opts.checkUnlock: refuse locked pieces too.
     */
    importPreset(text, opts = {}) {
      let o;
      try {
        o = typeof text === 'string' ? JSON.parse(text) : text;
      } catch (e) {
        return { ok: false, problems: ['not valid JSON'] };
      }
      if (!o || o.format !== 'saiyan-legacy.look' || typeof o.character !== 'string') return { ok: false, problems: ['not a Saiyan Legacy look preset'] };
      if (opts.charId && o.character !== opts.charId) return { ok: false, problems: ['the preset is for ' + o.character] };
      if (!profile(o.character)) return { ok: false, problems: ['no wardrobe for ' + o.character] };
      const r = Wardrobe.sanitize(o.character, Wardrobe.complete(o.character, o.selection && typeof o.selection === 'object' ? o.selection : {}), opts);
      return { ok: true, charId: o.character, selection: r.selection, problems: r.problems };
    },

    /* ---------------- the player's choices (in the existing save) ---------------- */
    store() {
      const d = SL.Save.data;
      d.wardrobe = d.wardrobe || {};
      d.wardrobe.selected = d.wardrobe.selected || {};
      d.wardrobe.prefs = d.wardrobe.prefs || {};
      return d.wardrobe;
    },
    saved(charId) {
      return (SL.Save && SL.Save.data && SL.Save.data.wardrobe && SL.Save.data.wardrobe.selected && SL.Save.data.wardrobe.selected[charId]) || null;
    },
    prefs() {
      return (SL.Save && SL.Save.data && SL.Save.data.wardrobe && SL.Save.data.wardrobe.prefs) || {};
    },
    /** The look the player has chosen for a character (their default when nothing is saved). */
    current(charId) {
      return Wardrobe.sanitize(charId, Wardrobe.saved(charId) || profile(charId).default, { checkUnlock: true }).selection;
    },

    /**
     * Saves a selection for Free Battle / Training / menus. A selection with any problem
     * (locked, planned, unknown, incompatible) is refused and nothing changes.
     */
    select(charId, sel) {
      const r = Wardrobe.sanitize(charId, sel, { checkUnlock: true });
      if (!r.selection || r.problems.length) return { ok: false, problems: r.problems };
      Wardrobe.store().selected[charId] = r.selection;
      SL.Save.write();
      return { ok: true, selection: r.selection };
    },

    /**
     * Cleans every saved look (called by SL.Save.load): an unknown, incompatible or no longer valid
     * piece is replaced by the outfit's default or none. Returns what changed.
     */
    migrate() {
      const d = SL.Save && SL.Save.data;
      const sel = d && d.wardrobe && d.wardrobe.selected;
      const changed = [];
      if (!sel) return changed;
      for (const charId of Object.keys(sel)) {
        if (!profile(charId)) {
          delete sel[charId];
          changed.push(charId);
          continue;
        }
        const r = Wardrobe.sanitize(charId, sel[charId], { checkUnlock: true });
        if (r.problems.length) {
          sel[charId] = r.selection;
          changed.push(charId);
        }
      }
      return changed;
    },

    /**
     * Free Battle / Training's opponent: an outfit picked for this one battle, or 'auto' — their saved look, except in a
     * mirror match (the player's own character), where they wear the next outfit the player owns (or the next colours)
     * so the two read apart. Returns a selection, or null when nothing changes (the fighter dresses as usual).
     * Nothing is saved: the player's looks stay as they are.
     */
    opponentLook(charId, outfit, playerId) {
      if (!profile(charId)) return null;
      const mine = Wardrobe.current(charId);
      let sel = null;
      if (outfit && outfit !== 'auto') sel = Wardrobe.complete(charId, { outfit, body: mine.body });
      else if (charId === playerId) {
        const own = Wardrobe.options(charId, 'outfit', mine).filter((o) => !o.locked && !o.planned);
        const pals = Wardrobe.options(charId, 'palette', mine);
        const next = (list, id) => list[(list.findIndex((x) => x.id === id) + 1) % list.length].id;
        if (own.length > 1) sel = Wardrobe.complete(charId, { outfit: next(own, mine.outfit), body: mine.body });
        else if (pals.length > 1) sel = Object.assign({}, mine, { palette: next(pals, mine.palette) });
      }
      return sel && Wardrobe.sanitize(charId, sel, { checkUnlock: true }).selection;
    },

    /** RESTORE CANON DEFAULT: forget the player's choice; the character wears their default again. */
    restoreDefault(charId) {
      delete Wardrobe.store().selected[charId];
      SL.Save.write();
      return Wardrobe.current(charId);
    },

    setPref(key, value) {
      Wardrobe.store().prefs[key] = value;
      SL.Save.write();
    },

    /**
     * What the player can pick in a slot, with the current selection in mind: only pieces that
     * fit the character (and, for armor and emblems, the outfit). Locked and planned pieces are
     * listed so the screen can show what is coming, flagged so it never lets them be worn.
     */
    options(charId, slot, sel) {
      const o = piece(sel && sel.outfit);
      if (slot === 'palette') {
        const list = [{ id: 'default', name: 'Default', locked: false }];
        for (const [id, p] of Object.entries((o && trait(o, 'palettes')) || {})) list.push({ id, name: p.name, locked: false });
        return list.length > 1 ? list : [];
      }
      if (slot === 'armor' && !(o && (trait(o, 'armorOk') || trait(o, 'armors')))) return [];
      if (slot === 'emblem' && !(o && trait(o, 'emblemOk'))) return [];
      const pr = profile(charId);
      const list = Object.values(data().pieces)
        .filter((p) => p.slot === slot && fits(p, charId) && !(o && slot !== 'outfit' && clash(p, slot, o)))
        .filter((p) => slot !== 'outfit' || p.status === 'planned' || fitsBody(p, pr))
        .sort((a, b) => eraIndex(a.era) - eraIndex(b.era))
        .map((p) => ({ id: p.id, piece: p, name: p.name, era: p.era, planned: p.status !== 'prototype', locked: !Wardrobe.available(p) }));
      if (slot !== 'outfit' && list.length) list.unshift({ id: NONE, name: 'None', locked: false });
      return list;
    },

    /**
     * Wear and tear on a dressed fighter, in the order the story uses it:
     * 0 intact · 1 damaged (dirt, rips, cracked armor) · 2 heavily damaged (more rips, shoulder
     * guards gone) · 3 torn. An outfit with its own `damage` data (the Buu-era gi and suit) says
     * where it rips and when the gi comes off (`tearAt`); one without it tears the gi at 2, as
     * before. Fighter.setDamage is the story's way in; scripts may still call setTorn /
     * damageArmor directly for their own beats.
     */
    applyDamage(f, level) {
      const m = f.model;
      const o = (m.app && m.app.outfit) || {};
      const tearAt = o.damage && o.damage.tearAt !== undefined ? o.damage.tearAt : 2;
      if (m.repairArmor) m.repairArmor();
      if (f.setTorn) f.setTorn(level >= tearAt);
      if (m.setWorn) m.setWorn(level >= 1 || !!o.worn);
      // torn.armor 'off': at the tear the armour goes completely (Vegeta after the Final Explosion)
      const shed = level >= tearAt && o.torn && o.torn.armor === 'off';
      if (m.damageArmor && level >= 1) m.damageArmor(shed ? 4 : level >= 2 ? 3 : 1);
      if (m.setDamage) m.setDamage(level);
      f.wearLevel = level;
      f.damageLevel = level;
    },

    /** Data problems (unknown ids, missing models, incompatible canon looks, saga violations). */
    validate() {
      const out = [];
      const W = data();
      const slots = new Set(W.slots.map((s) => s.id));
      const KINDS = ['canon', 'casual', 'training', 'movie', 'gt', 'event', 'whatif'];
      for (const [id, p] of Object.entries(W.pieces)) {
        const at = 'wardrobe ' + id + ': ';
        if (!slots.has(p.slot)) out.push(at + 'unknown slot ' + p.slot);
        if (p.chars !== '*' && (!Array.isArray(p.chars) || !p.chars.length)) out.push(at + 'no characters');
        else if (p.chars !== '*') for (const c of p.chars) if (!SL.data.characters[c]) out.push(at + 'unknown character ' + c);
        if (eraIndex(p.era) < 0) out.push(at + 'unknown era ' + p.era);
        if (!KINDS.includes(p.kind)) out.push(at + 'unknown kind ' + p.kind);
        if (p.status !== 'prototype' && p.status !== 'planned') out.push(at + 'status must be prototype or planned');
        if (p.status === 'planned' && !p.needs) out.push(at + 'a planned piece says what it needs');
        if (p.status === 'prototype' && !p.look && !p.base) out.push(at + 'a prototype piece needs a look');
        if (p.base && (!piece(p.base) || piece(p.base).slot !== p.slot)) out.push(at + 'base ' + p.base + ' is not a ' + p.slot);
        if (p.unlock && p.unlock.missionComplete && SL.data.missions && !SL.data.missions[p.unlock.missionComplete]) out.push(at + 'unlock mission ' + p.unlock.missionComplete + ' does not exist');
        for (const [slot, did] of Object.entries(p.defaults || {})) {
          if (did === NONE) continue;
          const dp = piece(did);
          if (!dp || dp.slot !== slot) out.push(at + 'default ' + slot + ' ' + did + ' is not a ' + slot);
          else if (p.chars !== '*' && p.chars.some((c) => !fits(dp, c))) out.push(at + 'default ' + did + ' does not fit its characters');
        }
        if (p.slot === 'hair' && p.look && p.look.style && !SL.data.hair[p.look.style]) out.push(at + 'hair style ' + p.look.style + ' does not exist');
        if (p.slot === 'tail' && p.look && !['wrapped', 'free'].includes(p.look.style || 'wrapped')) out.push(at + 'unknown tail style ' + p.look.style);
        if (!['adult', 'young'].includes(trait(p, 'body') || 'adult')) out.push(at + 'unknown body ' + trait(p, 'body'));
        for (const aid of trait(p, 'armors') || []) if (!piece(aid) || piece(aid).slot !== 'armor') out.push(at + 'allowed armor ' + aid + ' is not an armor');
        // an outfit worn with its own defaults must be a valid combination for every character it fits
        if (p.slot === 'outfit' && p.status === 'prototype' && p.chars !== '*') {
          for (const c of p.chars) {
            if (!profile(c)) continue;
            const r = Wardrobe.sanitize(c, Wardrobe.complete(c, { outfit: id }));
            for (const x of r.problems) out.push(at + 'with its own defaults, ' + x);
          }
        }
        const g = p.glb;
        const assets = (SL.assets && SL.assets.glb) || {};
        if (g && g.model && !assets[g.model.asset]) out.push(at + 'model asset ' + g.model.asset + ' is not loaded');
        for (const a of (g && g.attach) || []) if (!assets[a.asset]) out.push(at + 'attached asset ' + a.asset + ' is not loaded');
      }
      for (const [charId, pr] of Object.entries(W.profiles)) {
        const at = 'wardrobe profile ' + charId + ': ';
        if (!SL.data.characters[charId]) {
          out.push(at + 'unknown character');
          continue;
        }
        const dr = Wardrobe.sanitize(charId, pr.default);
        for (const x of dr.problems) out.push(at + 'default ' + x);
        for (const k of Object.keys(pr.bodies || {})) if (!['adult', 'young'].includes(k)) out.push(at + 'unknown body ' + k);
        for (const [era, entry] of Object.entries(pr.canonByEra || {})) {
          const ei = eraIndex(era);
          if (ei < 0) {
            out.push(at + 'unknown era ' + era);
            continue;
          }
          const r = Wardrobe.sanitize(charId, entry);
          for (const x of r.problems) out.push(at + era + ' ' + x);
          // saga restriction: the story cannot dress anybody in what comes later
          for (const slot of ['outfit'].concat(OPTIONAL)) {
            const p = piece(entry[slot]);
            if (p && eraIndex(p.era) > ei) out.push(at + era + ' wears ' + p.id + ' from the later era ' + p.era);
          }
        }
      }
      return out;
    },
  });
})();
