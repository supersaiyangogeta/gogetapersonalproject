/*
 * Character schema validation.
 *
 * Every character is plain data (see src/data/characters/*.js and
 * docs in STATUS.md "Adding a character"). This validator checks a
 * definition against the engine's expectations so that mistakes show up as
 * readable messages at boot and in `node tests/run-tests.js` instead of as
 * crashes mid-fight.
 *
 * SL.Schema.validateCharacter(def) -> array of problem strings (empty = valid)
 */
(function () {
  'use strict';

  // built into Fighter, plus techniques registered in src/game/techniques.js (with their required numbers)
  const TECHNIQUE_FIELDS = {
    latch: ['range', 'crouch', 'leapSpeed', 'grabDamage', 'fuse', 'blastDamage', 'blastRadius', 'mashGain', 'holdGain', 'escapeDecay', 'cpuEscape'],
    burrow: ['digFrames', 'maxFrames', 'speed', 'warnFrames', 'riseSpeed', 'radius', 'damage', 'knockSpeed', 'recovery'],
    scatter: ['windup', 'rise', 'height', 'count', 'damage', 'speed', 'range', 'recovery'],
    solarFlare: ['startup', 'recovery', 'range', 'stunFrames', 'cooldown'],
    stretchGrab: ['reach', 'extendFrames', 'pullFrames', 'damage', 'hitstunAfter', 'recovery', 'armLength'],
    groundSlam: ['crouch', 'hang', 'height', 'maxRange', 'radius', 'clearHeight', 'damage', 'knockSpeed', 'recovery'],
    eruption: ['count', 'interval', 'delay', 'lead', 'radius', 'columnHeight', 'damage', 'knockSpeed', 'recovery'],
    bomberWave: ['charge', 'radius', 'damage', 'knockSpeed', 'recovery'],
    bossRoar: ['frames', 'blastAt', 'radius', 'knockSpeed'],
    bossTaunt: ['frames'],
    // a boss changing form mid-fight (Zarbon); `form` is the index in def.forms
    bossTransform: ['form'],
    // Guldo stops time while he holds his breath: nobody else acts until he runs out of air
    timeFreeze: ['range', 'startup', 'holdFrames', 'kiPerSecond', 'recovery'],
    // Burter circles the target and strikes from a new angle each pass; guarding bounces him off
    speedOrbit: ['range', 'frames', 'radius', 'interval', 'damage', 'speed', 'recovery'],
    // Frieza's final form throws discs that follow you, and eventually stop taking sides
    deathSaucer: ['count', 'startup', 'interval', 'recovery', 'damage', 'speed', 'radius', 'life', 'seek', 'turnFrames'],
    // Captain Ginyu trades bodies with whoever the beam reaches
    bodyChange: ['range', 'startup', 'recovery', 'failStagger', 'penalty', 'interceptRadius'],
    // Jeice refuses to be crowded: he kicks off backwards and fires on the way out
    retreatVolley: ['backDistance', 'frames', 'shots', 'interval', 'damage', 'speed', 'recovery'],
    // Recoome stops to pose: an opening for you, a damage buff for him if you let him finish.
    // breakDamage is how much damage during the pose cancels it outright.
    bossPose: ['frames', 'buffFrames', 'damageBuff', 'breakDamage'],
    giantStomp: ['windup', 'reach', 'radius', 'clearHeight', 'damage', 'knockSpeed', 'recovery'],
    giantSweep: ['windup', 'range', 'half', 'height', 'damage', 'knockSpeed', 'recovery'],
    senzu: ['count', 'eatAt', 'recovery', 'heal', 'ki', 'tossRange', 'allyBelow'],
    telekinesis: ['range', 'startup', 'maxFrames', 'bossFrames', 'kiPerSecond', 'releaseStagger', 'recovery', 'mashGain', 'escapeDecay', 'cpuEscape'],
    giantGrab: ['reach', 'windup', 'grabRadius', 'grabHeight', 'grabDamage', 'holdFrames', 'crushEvery', 'crushDamage', 'throwDamage', 'mashGain', 'holdGain', 'escapeDecay', 'cpuEscape', 'escapeStagger', 'missRecovery', 'recovery'],
  };
  const SPECIAL_TYPES = ['beam', 'projectile', 'rush', 'teleport', 'spiritBomb'].concat(Object.keys(TECHNIQUE_FIELDS));
  const TELEPORT_MODES = ['behind', 'front', 'away', 'above'];
  const HAND_SHAPES = ['fist', 'open', 'point'];
  const KNOCKS = ['flinch', 'push', 'crumple', 'launch', 'smash', 'heavy', 'held'];
  const EXPRESSIONS = ['neutral', 'angry', 'shout', 'grit', 'hurt', 'smirk', 'grin', 'calm', 'ko', 'shock', 'soft', 'sad', 'majin', 'cocky', 'wicked'];
  const MOVE_NUMBERS = ['startup', 'active', 'recovery', 'damage', 'reach', 'radius'];

  const isNum = (v) => typeof v === 'number' && isFinite(v);
  const isPair = (v) => Array.isArray(v) && v.length === 2 && isNum(v[0]) && isNum(v[1]);

  /**
   * Asset quality of a character's body, so nobody mistakes a prototype for final art:
   *   1 functional prototype  — procedural model, enough for gameplay, rigs, hitboxes, VFX and story
   *   2 polished prototype    — improved proportions, silhouette, clothing, animation; still not final
   *   3 production asset      — a real professionally made model imported through the .glb pipeline
   */
  SL.ASSET_LEVELS = {
    1: { name: 'Functional prototype', short: 'PROTOTYPE' },
    2: { name: 'Polished prototype', short: 'PROTOTYPE+' },
    3: { name: 'Production asset', short: 'PRODUCTION' },
  };

  function validateCharacter(c) {
    const out = [];
    const err = (msg) => out.push((c && c.id ? c.id : '?') + ': ' + msg);
    if (!c || typeof c !== 'object') return ['definition is not an object'];
    if (!c.id) err('missing id');
    if (!c.name) err('missing name');
    if (![1, 2, 3].includes(c.assetLevel)) err('assetLevel must be 1 (functional prototype), 2 (polished prototype) or 3 (production asset)');
    if (c.assetLevel === 3 && !(c.model && c.model.type === 'glb' && c.model.production === true)) err('assetLevel 3 needs a production .glb model (model.type "glb" with model.production: true)');
    if (c.model && c.model.production && c.model.asset === 'test_dummy') err('the test mannequin can never be a production asset');

    const poses = Object.assign({}, (SL.data && SL.data.poses) || {}, c.poses || {});
    const pose = (name, where) => {
      if (!name) err(where + ': pose name missing');
      else if (!poses[name]) err(where + ': pose "' + name + '" does not exist');
    };

    // stats
    const s = c.stats || {};
    for (const k of ['hp', 'ki', 'stamina']) if (!isNum(s[k]) || s[k] <= 0) err('stats.' + k + ' must be a positive number');

    // appearance
    const a = c.appearance;
    if (!a) err('missing appearance');
    else if (a.hair && SL.data.hair && !SL.data.hair[a.hair.style]) err('appearance.hair.style "' + a.hair.style + '" does not exist');

    // hand shapes on static poses
    for (const [name, p] of Object.entries(c.poses || {})) {
      if (p && typeof p === 'object' && p.hands) {
        if (!Array.isArray(p.hands) || p.hands.length !== 2 || !p.hands.every((h) => HAND_SHAPES.includes(h))) err('pose ' + name + ': hands must be [L, R] of ' + HAND_SHAPES.join('/'));
      }
    }

    // forms
    const forms = c.forms || [];
    if (!forms.length || forms[0].id !== 'base') err('forms[0] must be the base form');
    const formIds = forms.map((f) => f.id);
    forms.forEach((f, i) => {
      const w = 'form ' + f.id;
      // a form the player never buys — a boss enters it on its own (Frieza), or the
      // story hands it over once (Piccolo after Nail) — has nothing to charge for
      if (i > 0 && !f.noCost && !(f.kiCost > 0)) err(w + ': kiCost must be > 0 (or noCost: true for a form the player never buys)');
      if (f.look && f.look.hair && SL.data.hair && !SL.data.hair[f.look.hair.style]) err(w + ': hair style "' + f.look.hair.style + '" does not exist');
      if (f.levels) {
        if (!Array.isArray(f.levels) || !f.levels.length) err(w + ': levels must be a non-empty array');
        else f.levels.forEach((lv, j) => {
          if (!lv.name) err(w + ' level ' + j + ': missing name');
          if (!lv.mult) err(w + ' level ' + j + ': missing mult');
        });
      }
      if (f.sequence) {
        const q = f.sequence;
        if (!(q.length > 0) || !(q.applyAt > 0) || q.applyAt >= q.length) err(w + ': sequence needs 0 < applyAt < length');
        let last = -1;
        for (const st of q.steps || []) {
          if (!isNum(st.at) || st.at < last || st.at >= q.length) err(w + ': sequence step "at" must ascend and stay below length');
          last = st.at;
          if (st.pose) pose(st.pose, w + ' sequence');
          if (st.expression && !EXPRESSIONS.includes(st.expression)) err(w + ': unknown expression "' + st.expression + '"');
        }
        if (!(q.steps || []).some((st) => st.burst)) err(w + ': sequence has no burst step (the form would never apply mid-sequence)');
      }
    });

    // moves
    const mv = c.moves || {};
    const checkMove = (m, where) => {
      if (!m) return err(where + ': missing');
      for (const k of MOVE_NUMBERS) if (!isNum(m[k])) err(where + ' (' + (m.id || '?') + '): ' + k + ' must be a number');
      if (m.knock && !KNOCKS.includes(m.knock)) err(where + ': unknown knock "' + m.knock + '"');
      if (!m.pose) err(where + ': missing pose block');
      else {
        pose(m.pose.wind, where + ' wind');
        pose(m.pose.strike, where + ' strike');
        if (m.pose.follow) pose(m.pose.follow, where + ' follow');
      }
      if (m.hitPose) pose(m.hitPose, where + ' hitPose');
      if (m.multi) {
        if (!Array.isArray(m.multi) || m.multi.some((v, i) => i > 0 && v <= m.multi[i - 1])) err(where + ': multi windows must ascend');
        else if (m.multi[m.multi.length - 1] >= m.active) err(where + ': last multi window must start before active ends');
      }
      if (m.teleport && !['above', 'behind', 'front'].includes(m.teleport.to)) err(where + ': teleport.to must be above/behind/front');
    };
    if (c.playable) {
      if (!Array.isArray(mv.light) || mv.light.length < 3) err('moves.light needs at least 3 strikes');
      if (!mv.heavy || !mv.heavy[0]) err('moves.heavy needs a standalone heavy at key 0');
    }
    (mv.light || []).forEach((m, i) => checkMove(m, 'light[' + i + ']'));
    for (const [k, m] of Object.entries(mv.heavy || {})) checkMove(m, 'heavy[' + k + ']');
    for (const [k, m] of Object.entries(mv.airHeavy || {})) checkMove(m, 'airHeavy[' + k + ']');
    if (mv.chase) for (const k of ['smash', 'strike']) if (mv.chase[k]) checkMove(mv.chase[k], 'chase.' + k);
    if (mv.dash) checkMove(mv.dash, 'dash');
    if (mv.throw) {
      // a plain throw lists its poses in order; a technique throw (Tail Grapple) names them by role
      const tp = mv.throw.poses || [];
      for (const [k, p] of Object.entries(tp)) pose(p, 'throw pose ' + k);
      if (mv.throw.technique && !(SL.Techniques && SL.Techniques[mv.throw.technique]) && SL.Techniques) err('throw technique "' + mv.throw.technique + '" is not registered');
      if (mv.throw.technique === 'tailGrapple') for (const [k, p] of Object.entries(mv.throw.followUps || {})) pose(p.pose, 'throw follow-up ' + k);
    }

    // specials
    const sp = c.specials || {};
    if (c.playable) for (const slot of ['special1', 'special2', 'ultimate']) if (!sp[slot]) err('specials.' + slot + ' missing');
    if (c.extras !== undefined && !Array.isArray(c.extras)) err('extras must be a list');
    const extraIds = new Set();
    for (const x of c.extras || []) {
      if (!x.id) err('extras: every technique needs an id');
      else if (extraIds.has(x.id)) err('extras: duplicate id "' + x.id + '"');
      extraIds.add(x.id);
    }
    const allSpecials = Object.entries(sp).concat((c.extras || []).map((x) => ['extra', x]));
    for (const [slot, x] of allSpecials) {
      const w = slot + ' ' + (x.id || '?');
      if (!SPECIAL_TYPES.includes(x.type)) {
        err(w + ': unknown type "' + x.type + '"');
        continue;
      }
      if (x.type !== 'teleport' && !isNum(x.kiCost)) err(w + ': kiCost must be a number');
      // a technique that costs more ki than the fighter can hold is a button that never works
      if (isNum(x.kiCost) && c.stats && isNum(c.stats.ki) && x.kiCost > c.stats.ki) err(w + ': kiCost ' + x.kiCost + ' is more than this fighter can hold (' + c.stats.ki + ')');
      if (!x.name) err(w + ': missing name');
      if (x.poses) for (const p of Object.values(x.poses)) pose(p, w);
      if (typeof x.pose === 'string') pose(x.pose, w);
      else if (x.pose) for (const p of Object.values(x.pose)) pose(p, w);
      if (x.type === 'beam') {
        if (!isPair(x.damage) || !isPair(x.radius)) err(w + ': damage and radius must be [min, max]');
        if (!(x.chargeMin <= x.chargeMax)) err(w + ': chargeMin must be <= chargeMax');
        // a beam without these never reaches anything (playtest round 2: Nail's and Ginyu's beams did nothing)
        for (const k of ['speed', 'range', 'sustain']) if (!(isNum(x[k]) && x[k] > 0)) err(w + ': ' + k + ' must be a positive number');
        if (x.tiers && (x.tiers.some((t, i) => i > 0 && t <= x.tiers[i - 1]) || x.tiers[x.tiers.length - 1] > x.chargeMax)) err(w + ': tiers must ascend and stay within chargeMax');
        if (x.callout && (!Array.isArray(x.callout) || x.callout.length < 2)) err(w + ': callout must list at least 2 syllables');
        if (x.instant && !(x.instant.chargeMin <= x.instant.chargeMax)) err(w + ': instant variant needs chargeMin <= chargeMax');
        for (const fid of Object.keys(x.formVariants || {})) if (!formIds.includes(fid)) err(w + ': formVariants refers to unknown form "' + fid + '"');
      }
      if (x.type === 'teleport') {
        for (const k of ['kiCost', 'escapeKiCost', 'startup', 'recovery', 'cooldown']) if (!isNum(x[k])) err(w + ': ' + k + ' must be a number');
        for (const m of Object.keys(x.modes || {})) if (!TELEPORT_MODES.includes(m)) err(w + ': unknown teleport mode "' + m + '"');
        if (x.fatigue && !(x.fatigue.window > 0 && x.fatigue.max > 0)) err(w + ': fatigue needs window and max');
      }
      if (x.type === 'spiritBomb') {
        for (const k of ['radius', 'damage', 'explode']) if (!isPair(x[k]) && !isNum(x[k])) err(w + ': ' + k + ' must be a number or [min, max]');
        if (!(x.chargeFrames > 0)) err(w + ': chargeFrames must be > 0');
        if (x.holdToCharge && !(x.chargeMin > 0 && x.chargeMin < x.chargeFrames)) err(w + ': holdToCharge needs 0 < chargeMin < chargeFrames');
      }
      if (x.type === 'projectile' && !x.projectile) err(w + ': missing projectile block');
      if (x.type === 'rush' && !(Array.isArray(x.hits) && x.hits.length)) err(w + ': rush needs hits');
      if (TECHNIQUE_FIELDS[x.type]) for (const k of TECHNIQUE_FIELDS[x.type]) if (!isNum(x[k])) err(w + ': ' + k + ' must be a number');
      if (x.hits) x.hits.forEach((h, i) => pose(h.pose, w + ' hit ' + i));
    }

    // bosses: phases, patterns and the techniques they start
    if (c.boss) {
      const B = c.boss;
      if (!Array.isArray(B.phases) || !B.phases.length) err('boss.phases must be a non-empty list');
      else {
        B.phases.forEach((ph, i) => {
          if (!isNum(ph.hpAbove)) err('boss phase ' + i + ': hpAbove must be a number');
          if (i > 0 && !(ph.hpAbove < B.phases[i - 1].hpAbove)) err('boss phase ' + i + ': hpAbove must go down phase by phase');
          for (const name of Object.keys(ph.patterns || {})) if (name !== 'melee' && !(B.patterns || {})[name]) err('boss phase ' + ph.id + ': unknown pattern "' + name + '"');
          if (ph.enter && !(B.techniques || {})[ph.enter]) err('boss phase ' + ph.id + ': unknown enter technique "' + ph.enter + '"');
        });
      }
      for (const [name, pat] of Object.entries(B.patterns || {})) {
        if (pat.technique && !(B.techniques || {})[pat.technique]) err('boss pattern ' + name + ': unknown technique "' + pat.technique + '"');
        if (pat.slot && !sp[pat.slot]) err('boss pattern ' + name + ': character has no ' + pat.slot);
        if (!pat.technique && !pat.slot && !pat.inputs) err('boss pattern ' + name + ': needs a technique, slot or inputs');
      }
      for (const [name, t] of Object.entries(B.techniques || {})) {
        if (!TECHNIQUE_FIELDS[t.type]) err('boss technique ' + name + ': unknown type "' + t.type + '"');
        else for (const k of TECHNIQUE_FIELDS[t.type]) if (!isNum(t[k])) err('boss technique ' + name + ': ' + k + ' must be a number');
        for (const p of Object.values(t.poses || {})) pose(p, 'boss technique ' + name);
      }
      if (c.mechanic && c.mechanic.type !== 'boss') {
        // a mechanic that inherits from the boss mechanic still is one (Mechanics.frieza)
        const M = SL.Mechanics || {};
        const m = M[c.mechanic.type];
        if (!m || !M.boss || !M.boss.isPrototypeOf(m)) err('boss characters use the "boss" mechanic, or one built on it');
      }
    }
    if (c.poise && typeof c.poise === 'object') {
      for (const k of ['max', 'regen', 'regenDelay', 'armor', 'breakFrames']) if (!isNum(c.poise[k])) err('poise.' + k + ' must be a number');
      if (!c.poise.cost || !isNum(c.poise.cost[1])) err('poise.cost needs per-impact costs');
    }

    // presentation sequences
    const seqs = c.sequences || {};
    const checkSeq = (steps, where) => {
      if (!Array.isArray(steps) || !steps.length) return err(where + ': must be a non-empty step list');
      steps.forEach((st, i) => {
        pose(st.pose, where + ' step ' + i);
        if (!(st.dur > 0)) err(where + ' step ' + i + ': dur must be > 0');
        if (st.expression && !EXPRESSIONS.includes(st.expression)) err(where + ' step ' + i + ': unknown expression "' + st.expression + '"');
      });
    };
    if (seqs.intro) checkSeq(seqs.intro, 'sequences.intro');
    if (seqs.defeat) checkSeq(seqs.defeat, 'sequences.defeat');
    if (seqs.victory) {
      if (Array.isArray(seqs.victory[0])) seqs.victory.forEach((v, i) => checkSeq(v, 'sequences.victory[' + i + ']'));
      else checkSeq(seqs.victory, 'sequences.victory');
    }
    if (c.intro) pose(c.intro.pose, 'intro');
    if (c.victory) (c.victory.poses || []).forEach((p) => pose(p, 'victory'));
    if (c.defeat) pose(c.defeat.pose, 'defeat');

    // voice barks must point at real dialogue lines
    const D = SL.data.dialogue;
    if (c.barks && D && D.lines) for (const [k, key] of Object.entries(c.barks)) if (!D.lines[key]) err('barks.' + k + ': dialogue line "' + key + '" does not exist');
    for (const f of forms) {
      if (f.line && D && D.lines && !D.lines[f.line]) err('form ' + f.id + ': line "' + f.line + '" does not exist');
      for (const lv of f.levels || []) if (lv.line && D && D.lines && !D.lines[lv.line]) err('form ' + f.id + ': level line "' + lv.line + '" does not exist');
    }

    if (c.mechanic && SL.Mechanics && !SL.Mechanics[c.mechanic.type]) err('mechanic "' + c.mechanic.type + '" does not exist');
    if (c.ai && c.ai.hooks && SL.AIHooks && !SL.AIHooks[c.ai.hooks]) err('ai.hooks "' + c.ai.hooks + '" is not registered');
    return out;
  }

  function validateAll() {
    const problems = [];
    for (const c of Object.values(SL.data.characters || {})) problems.push(...validateCharacter(c));
    return problems;
  }

  SL.Schema = { validateCharacter, validateAll, SPECIAL_TYPES, TECHNIQUE_FIELDS, TELEPORT_MODES, HAND_SHAPES };
})();
