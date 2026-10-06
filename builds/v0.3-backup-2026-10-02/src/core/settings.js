/*
 * Settings: defaults, persistence, graphics presets, and the schema that the
 * Settings screen is generated from. Only settings that actually do something
 * are listed here — if it is in the schema, some system reads it.
 */
(function () {
  'use strict';
  const U = SL.util;
  const STORAGE_KEY = 'saiyanLegacy.settings.v1';

  const KEYBOARD_DEFAULTS = {
    moveF: ['KeyW'],
    moveB: ['KeyS'],
    moveL: ['KeyA'],
    moveR: ['KeyD'],
    ascend: ['Space'],
    descend: ['KeyC'],
    boost: ['ShiftLeft'],
    light: ['Mouse0', 'KeyJ'],
    heavy: ['Mouse2', 'KeyK'],
    blast: ['KeyE', 'KeyL'],
    guard: ['KeyF', 'KeyI'],
    dodge: ['KeyQ', 'KeyU'],
    charge: ['KeyR', 'KeyO'],
    special1: ['Digit1'],
    special2: ['Digit2'],
    ultimate: ['Digit3'],
    transform: ['KeyT'],
    revert: ['KeyG'],
    target: ['Tab', 'Mouse1'],
    targetNext: ['KeyX', 'WheelDown'],
    targetPrev: ['WheelUp'],
    partyNext: ['KeyZ'],
    skillMenu: ['KeyV'],
    pause: ['Escape', 'KeyP'],
    resetPos: ['Backspace'],
  };

  // Standard gamepad mapping. "4+2" means "hold LB, press X".
  const GAMEPAD_DEFAULTS = {
    ascend: ['0'],
    blast: ['1'],
    light: ['2'],
    heavy: ['3'],
    dodge: ['5'],
    guard: ['6'],
    boost: ['7'],
    descend: ['10', '13'],
    target: ['11'],
    targetNext: ['14'],
    partyNext: ['15'],
    skillMenu: ['12'],
    charge: ['4'],
    special1: ['4+2'],
    special2: ['4+3'],
    ultimate: ['4+1'],
    transform: ['4+0'],
    revert: ['4+13'],
    pause: ['9'],
    resetPos: ['8'],
  };

  const DEFAULTS = {
    // the first-launch "How do you want to experience Saiyan Legacy?" choice has been made
    // (SL.Screens.visualSetup). Top level so "Reset Display & Immersion" does not ask again.
    visualExperienceConfigured: false,
    gameplay: {
      difficulty: 'normal',
      beamClashInput: 'mash',
      qteAssist: false,
      hitStop: 1,
      shortTransforms: false,
      autoTargetSwitch: true,
      namekEnding: 'classic',
    },
    // things the player has found. A schema row with `secret: '<name>'` stays hidden
    // until its name is true here, so a new secret is one flag plus one row.
    secrets: {
      manga: false,
    },
    camera: {
      mouseCamera: true,
      sensitivityX: 1,
      sensitivityY: 1,
      invertY: false,
      invertX: false,
      style: 'auto',
      distance: 'normal',
      cinematic: 'full',
      autoCorrect: true,
      shake: 1,
    },
    graphics: {
      preset: 'high',
      resolutionScale: 1,
      pixelRatioCap: 2,
      antialias: true,
      shadows: 'high',
      effects: 'high',
      outlines: true,
      drawDistance: 'far',
      fpsLimit: 0,
      showFps: false,
    },
    audio: {
      master: 0.8,
      music: 0.55,
      sfx: 0.9,
      ui: 0.7,
      muteOnBlur: true,
      // dialogue: the project ships no recorded voice, but every line raises a cue
      // (SL.Voice) so a local voice pack can be plugged in later
      voice: 'off',
      subtitleLanguage: 'both',
    },
    // DISPLAY & IMMERSION. Presentation only: none of it changes a fight, a target or a
    // technique, it changes what the HUD says about them. The defaults are the Standard preset.
    hud: {
      preset: 'standard',
      damageNumbers: 'all',
      playerHealth: 'full',
      enemyHealth: 'full',
      ki: 'full',
      stamina: 'full',
      lockOn: 'full',
      skillPanel: 'full',
      moveNames: true,
      controlHints: true,
      objectives: 'full',
      tips: 'full',
      notifications: 'all',
      comboCounter: true,
      autoHide: false,
      subtitles: 'on',
      opacity: 1,
      scale: 1,
    },
    accessibility: {
      subtitleSize: 'm',
      subtitleBg: 0.55,
      speakerNames: true,
      flashReduction: false,
      speedLines: true,
      highContrast: false,
      colorblind: 'off',
      toggleGuard: false,
      toggleCharge: false,
    },
    controls: {
      keyboard: KEYBOARD_DEFAULTS,
      gamepad: GAMEPAD_DEFAULTS,
      deadzone: 0.2,
      vibration: true,
    },
    // DEVELOPER / TEST MODE (local QA tool; src/core/dev.js). Off by default, and while it is on
    // the game reads and writes a separate save slot, so none of this touches real progress.
    dev: {
      enabled: false,
      unlockAll: true,
      infiniteHp: false,
      infiniteKi: false,
      infiniteStamina: false,
      godMode: false,
      noCooldowns: false,
      noKiCost: false,
      oneHitKO: false,
      infiniteTime: false,
      allForms: false,
      overlay: false,
    },
  };

  const PRESETS = {
    low: { resolutionScale: 0.75, pixelRatioCap: 1, antialias: false, shadows: 'off', effects: 'low', outlines: false, drawDistance: 'near' },
    medium: { resolutionScale: 1, pixelRatioCap: 1.25, antialias: true, shadows: 'low', effects: 'medium', outlines: true, drawDistance: 'medium' },
    high: { resolutionScale: 1, pixelRatioCap: 2, antialias: true, shadows: 'high', effects: 'high', outlines: true, drawDistance: 'far' },
    ultra: { resolutionScale: 1, pixelRatioCap: 3, antialias: true, shadows: 'ultra', effects: 'ultra', outlines: true, drawDistance: 'far' },
  };
  const PRESET_KEYS = Object.keys(PRESETS.low);

  // HUD presets. Cinematic: show the fight, hide the interface — what stays is contextual (it
  // appears when it matters, then fades). Scale is not a preset key: it is an accessibility size.
  const HUD_PRESETS = {
    cinematic: {
      damageNumbers: 'off', playerHealth: 'minimal', enemyHealth: 'minimal', ki: 'contextual', stamina: 'contextual',
      lockOn: 'contextual', skillPanel: 'contextual', moveNames: false, controlHints: false, objectives: 'contextual',
      tips: 'contextual', notifications: 'important', comboCounter: false, autoHide: true, subtitles: 'on', opacity: 0.9,
    },
    standard: {
      damageNumbers: 'all', playerHealth: 'full', enemyHealth: 'full', ki: 'full', stamina: 'full',
      lockOn: 'full', skillPanel: 'full', moveNames: true, controlHints: true, objectives: 'full',
      tips: 'full', notifications: 'all', comboCounter: true, autoHide: false, subtitles: 'on', opacity: 1,
    },
  };
  const HUD_PRESET_KEYS = Object.keys(HUD_PRESETS.standard);
  const hudPresetOf = (hud) => Object.keys(HUD_PRESETS).find((n) => HUD_PRESET_KEYS.every((k) => HUD_PRESETS[n][k] === hud[k])) || 'custom';

  const ACTION_LABELS = {
    moveF: 'Move Forward', moveB: 'Move Back', moveL: 'Move Left', moveR: 'Move Right',
    ascend: 'Jump / Fly Up (Ascend)', descend: 'Fly Down / Land (Descend)', boost: 'Boost / Dash',
    light: 'Light Attack', heavy: 'Heavy Attack', blast: 'Ki Blast', guard: 'Guard',
    dodge: 'Dodge / Vanish', charge: 'Charge Ki', special1: 'Special 1', special2: 'Special 2',
    ultimate: 'Ultimate', transform: 'Transform', revert: 'Power Down', target: 'Lock-On / Free Camera', targetNext: 'Next Target', targetPrev: 'Previous Target', partyNext: 'Switch Hero', skillMenu: 'Skill Menu (hold)',
    pause: 'Pause', resetPos: 'Training: Reset Position',
  };

  const pct = (v) => Math.round(v * 100) + '%';

  /* Schema drives the Settings screen. */
  const SCHEMA = [
    { cat: 'gameplay', key: 'difficulty', label: 'Difficulty', desc: 'Changes how the CPU reacts, guards, counters and combos.', type: 'choice',
      options: [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard'], ['veryhard', 'Very Hard']] },
    { cat: 'gameplay', key: 'beamClashInput', label: 'Beam Clash Input', desc: 'Mash the button, or simply hold it.', type: 'choice',
      options: [['mash', 'Mash'], ['hold', 'Hold']] },
    { cat: 'gameplay', key: 'qteAssist', label: 'Struggle Assist', desc: 'Makes beam clashes and struggles easier.', type: 'toggle' },
    { cat: 'gameplay', key: 'hitStop', label: 'Hit-Stop Intensity', desc: 'Freeze-frame on impact.', type: 'slider', min: 0, max: 1, step: 0.1, fmt: pct },
    { cat: 'gameplay', key: 'shortTransforms', label: 'Short Transformations', desc: 'Faster transformation sequences.', type: 'toggle' },
    { cat: 'gameplay', key: 'autoTargetSwitch', label: 'Auto Switch Target', desc: 'Lock onto the next enemy when one falls.', type: 'toggle' },
    { cat: 'gameplay', key: 'namekEnding', label: 'Manga Mode: Namek Ending', secret: 'manga', desc: 'Found it. Classic is the ending as it is meant to be played. Manga Version re-films the betrayal: Goku is already leaving, the shot is taken from behind the emperor hand, and the answer goes out before the beam can reach him. More of this mode later.', type: 'choice',
      options: [['classic', 'Classic'], ['manga', 'Manga Version']] },

    { cat: 'camera', key: 'mouseCamera', label: 'Mouse Camera', desc: 'Capture the mouse in battle to orbit the camera.', type: 'toggle' },
    { cat: 'camera', key: 'sensitivityX', label: 'Horizontal Sensitivity', type: 'slider', min: 0.2, max: 3, step: 0.1, fmt: (v) => v.toFixed(1) },
    { cat: 'camera', key: 'sensitivityY', label: 'Vertical Sensitivity', type: 'slider', min: 0.2, max: 3, step: 0.1, fmt: (v) => v.toFixed(1) },
    { cat: 'camera', key: 'invertY', label: 'Invert Vertical', type: 'toggle' },
    { cat: 'camera', key: 'invertX', label: 'Invert Horizontal', desc: 'Off: moving the mouse or stick right turns the view right.', type: 'toggle' },
    { cat: 'camera', key: 'style', label: 'Camera Style', desc: 'Locked on, the camera always frames you and your target. Unlocked — Adventure: follows behind you as you travel. Free: stays where you point it. Auto: Adventure out of a fight, Free in one.', type: 'choice',
      options: [['auto', 'Auto'], ['adventure', 'Adventure'], ['free', 'Free']] },
    { cat: 'camera', key: 'distance', label: 'Camera Distance', type: 'choice', options: [['near', 'Near'], ['normal', 'Normal'], ['far', 'Far']] },
    { cat: 'camera', key: 'autoCorrect', label: 'Auto Camera Correction', desc: 'While locked on, the camera drifts back behind you after you move it.', type: 'toggle' },
    { cat: 'camera', key: 'cinematic', label: 'Cinematic Camera', desc: 'Camera work for ultimates, clashes and transformations.', type: 'choice',
      options: [['full', 'Full'], ['reduced', 'Reduced'], ['off', 'Off']] },
    { cat: 'camera', key: 'shake', label: 'Camera Shake', type: 'slider', min: 0, max: 1, step: 0.1, fmt: pct },

    { cat: 'graphics', key: 'preset', label: 'Quality Preset', desc: 'Sets everything below at once.', type: 'choice',
      options: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['ultra', 'Ultra'], ['custom', 'Custom']] },
    { cat: 'graphics', key: 'resolutionScale', label: 'Resolution Scale', desc: 'Render resolution relative to the window.', type: 'slider', min: 0.5, max: 1, step: 0.05, fmt: pct },
    { cat: 'graphics', key: 'pixelRatioCap', label: 'Max Pixel Density', desc: 'Limits rendering on high-DPI screens.', type: 'choice',
      options: [[1, '1x'], [1.25, '1.25x'], [1.5, '1.5x'], [2, '2x'], [3, '3x']] },
    { cat: 'graphics', key: 'antialias', label: 'Anti-Aliasing', desc: 'Smooths jagged edges.', type: 'toggle' },
    { cat: 'graphics', key: 'shadows', label: 'Shadows', type: 'choice', options: [['off', 'Off'], ['low', 'Low'], ['high', 'High'], ['ultra', 'Ultra']] },
    { cat: 'graphics', key: 'effects', label: 'Effects Quality', desc: 'Particles, lightning and debris.', type: 'choice',
      options: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['ultra', 'Ultra']] },
    { cat: 'graphics', key: 'outlines', label: 'Cel Outlines', desc: 'Anime-style ink outlines on characters.', type: 'toggle' },
    { cat: 'graphics', key: 'drawDistance', label: 'Draw Distance', type: 'choice', options: [['near', 'Near'], ['medium', 'Medium'], ['far', 'Far']] },
    { cat: 'graphics', key: 'fpsLimit', label: 'Frame Rate Limit', type: 'choice', options: [[30, '30'], [60, '60'], [0, 'Unlimited']] },
    { cat: 'graphics', key: 'showFps', label: 'Show FPS', type: 'toggle' },

    { cat: 'audio', key: 'master', label: 'Master Volume', type: 'slider', min: 0, max: 1, step: 0.05, fmt: pct },
    { cat: 'audio', key: 'music', label: 'Music', type: 'slider', min: 0, max: 1, step: 0.05, fmt: pct },
    { cat: 'audio', key: 'sfx', label: 'Sound Effects', type: 'slider', min: 0, max: 1, step: 0.05, fmt: pct },
    { cat: 'audio', key: 'ui', label: 'Interface Sounds', type: 'slider', min: 0, max: 1, step: 0.05, fmt: pct },
    { cat: 'audio', key: 'muteOnBlur', label: 'Mute When Unfocused', type: 'toggle' },

    { cat: 'hud', key: 'preset', label: 'HUD Preset', desc: 'Sets everything below at once. Changing any row makes it Custom.', type: 'choice',
      options: [['cinematic', 'Cinematic'], ['standard', 'Standard'], ['custom', 'Custom']] },
    { cat: 'hud', key: 'damageNumbers', label: 'Damage Numbers', desc: 'Important Only: exceptionally heavy blows and a boss changing form.', type: 'choice',
      options: [['off', 'Off'], ['important', 'Important Only'], ['all', 'All']] },
    { cat: 'hud', key: 'playerHealth', label: 'Player Health', desc: 'Minimal: a thin bar, no portrait. The screen edge reddens in danger in every mode.', type: 'choice',
      options: [['full', 'Full'], ['minimal', 'Minimal'], ['hidden', 'Hidden']] },
    { cat: 'hud', key: 'enemyHealth', label: 'Enemy Health', desc: 'Minimal: name, form and a thin bar.', type: 'choice',
      options: [['full', 'Full'], ['minimal', 'Minimal'], ['hidden', 'Hidden']] },
    { cat: 'hud', key: 'ki', label: 'Ki Display', desc: 'Contextual: appears while charging, when ki is spent, short or low, then fades.', type: 'choice',
      options: [['full', 'Full'], ['minimal', 'Minimal'], ['contextual', 'Contextual']] },
    { cat: 'hud', key: 'stamina', label: 'Stamina Display', desc: 'Contextual: appears when stamina is spent or runs low, then fades.', type: 'choice',
      options: [['full', 'Full'], ['minimal', 'Minimal'], ['contextual', 'Contextual']] },
    { cat: 'hud', key: 'lockOn', label: 'Lock-On UI', desc: 'Lock-on always works. Contextual: the reticle shows when the target changes, an edge arrow when it is off screen.', type: 'choice',
      options: [['full', 'Full Reticle'], ['minimal', 'Minimal Reticle'], ['contextual', 'Contextual'], ['hidden', 'Hidden']] },
    { cat: 'hud', key: 'skillPanel', label: 'Skill UI', desc: 'The skill wheel always opens. Contextual: the panel shows while you use techniques.', type: 'choice',
      options: [['full', 'Full'], ['minimal', 'Icons Only'], ['contextual', 'Contextual'], ['hidden', 'Hidden']] },
    { cat: 'hud', key: 'moveNames', label: 'Technique Names', desc: 'Banners and callouts when a technique or form is used.', type: 'toggle' },
    { cat: 'hud', key: 'controlHints', label: 'Button Hints', desc: 'Show buttons on the skill panel.', type: 'toggle' },
    { cat: 'hud', key: 'objectives', label: 'Objective Display', desc: 'Minimal: only the current goal. Contextual: shown when it changes. Always listed in the pause menu.', type: 'choice',
      options: [['full', 'Full'], ['minimal', 'Minimal'], ['contextual', 'Contextual']] },
    { cat: 'hud', key: 'tips', label: 'Tutorial Tips', desc: 'Contextual: each hint once, until learned. Off: only prompts the story needs (struggles, required inputs).', type: 'choice',
      options: [['full', 'Full'], ['contextual', 'Contextual'], ['off', 'Off']] },
    { cat: 'hud', key: 'notifications', label: 'Notifications', desc: 'Combat words (PERFECT, VANISH…) and power-up banners. Important Only: new techniques.', type: 'choice',
      options: [['all', 'All'], ['important', 'Important Only'], ['off', 'Off']] },
    { cat: 'hud', key: 'comboCounter', label: 'Combo Counter', type: 'toggle' },
    { cat: 'hud', key: 'autoHide', label: 'Auto-Hide HUD', desc: 'When nothing is happening the HUD fades; it returns when you are hit, use a skill, change target or are in danger.', type: 'toggle' },
    { cat: 'hud', key: 'subtitles', label: 'Subtitles', desc: 'Dialogue Only leaves out combat taunts. Cinematic Only: story scenes.', type: 'choice',
      options: [['on', 'On'], ['dialogue', 'Dialogue Only'], ['cinematic', 'Cinematic Only'], ['off', 'Off']] },
    { cat: 'hud', key: 'opacity', label: 'UI Opacity', type: 'slider', min: 0.3, max: 1, step: 0.05, fmt: pct },
    { cat: 'hud', key: 'scale', label: 'HUD Scale', desc: 'Larger or smaller HUD.', type: 'slider', min: 0.7, max: 1.4, step: 0.05, fmt: pct },

    { cat: 'accessibility', key: 'subtitleSize', label: 'Subtitle Size', type: 'choice', options: [['s', 'Small'], ['m', 'Medium'], ['l', 'Large'], ['xl', 'Extra Large']] },
    { cat: 'accessibility', key: 'subtitleBg', label: 'Subtitle Background', type: 'slider', min: 0, max: 1, step: 0.05, fmt: pct },
    { cat: 'accessibility', key: 'speakerNames', label: 'Speaker Names', type: 'toggle' },
    { cat: 'accessibility', key: 'flashReduction', label: 'Reduce Flashing', desc: 'Dims screen flashes from explosions and impacts.', type: 'toggle' },
    { cat: 'accessibility', key: 'speedLines', label: 'Speed Lines', desc: 'Motion streaks while boosting.', type: 'toggle' },
    { cat: 'accessibility', key: 'highContrast', label: 'High-Contrast Interface', type: 'toggle' },
    { cat: 'accessibility', key: 'colorblind', label: 'Color-Blind Friendly Bars', type: 'choice',
      options: [['off', 'Off'], ['protan', 'Protanopia / Deuteranopia'], ['tritan', 'Tritanopia']] },
    { cat: 'accessibility', key: 'toggleGuard', label: 'Guard: Toggle Instead of Hold', type: 'toggle' },
    { cat: 'accessibility', key: 'toggleCharge', label: 'Charge Ki: Toggle Instead of Hold', type: 'toggle' },

    { cat: 'controls', key: 'deadzone', label: 'Stick Deadzone', type: 'slider', min: 0.05, max: 0.5, step: 0.05, fmt: pct },
    { cat: 'controls', key: 'vibration', label: 'Controller Vibration', type: 'toggle' },
    // developer rows beyond the first only show while the mode is on (screens_settings.js)
    { cat: 'dev', key: 'enabled', label: 'Developer / Test Mode', desc: 'A local testing tool. Uses a SEPARATE save: nothing done here touches your real progress.', type: 'toggle' },
    { cat: 'dev', key: 'unlockAll', label: 'Unlock Everything', desc: 'Every mission, character, stage and What-If is open (test save only).', type: 'toggle', dev: true },
    { cat: 'dev', key: 'allForms', label: 'Allow All Forms & Techniques', desc: 'Lifts story locks on forms, techniques and form caps for the player.', type: 'toggle', dev: true },
    { cat: 'dev', key: 'infiniteHp', label: 'Infinite Health', type: 'toggle', dev: true },
    { cat: 'dev', key: 'infiniteKi', label: 'Infinite Ki', type: 'toggle', dev: true },
    { cat: 'dev', key: 'infiniteStamina', label: 'Infinite Stamina', type: 'toggle', dev: true },
    { cat: 'dev', key: 'godMode', label: 'God Mode', desc: 'No damage taken, cannot be knocked out.', type: 'toggle', dev: true },
    { cat: 'dev', key: 'noCooldowns', label: 'No Cooldowns', type: 'toggle', dev: true },
    { cat: 'dev', key: 'noKiCost', label: 'No Ki Cost', type: 'toggle', dev: true },
    { cat: 'dev', key: 'oneHitKO', label: 'One-Hit KO', desc: 'Your hits finish anything that can be finished.', type: 'toggle', dev: true },
    { cat: 'dev', key: 'infiniteTime', label: 'Infinite Time', desc: 'Battle and mission clocks stop running.', type: 'toggle', dev: true },
    { cat: 'dev', key: 'overlay', label: 'Debug Overlay', desc: 'Camera, lock-on, audio loops, the player\'s state, the mission phase.', type: 'toggle', dev: true },
  ];

  const CATEGORIES = [
    ['gameplay', 'Gameplay'],
    ['camera', 'Camera'],
    ['graphics', 'Graphics'],
    ['audio', 'Audio'],
    ['hud', 'Display & Immersion'],
    ['accessibility', 'Accessibility'],
    ['controls', 'Controls'],
    ['dev', 'Developer / Test'],
  ];

  let saveTimer = null;

  const Settings = (SL.Settings = {
    DEFAULTS,
    PRESETS,
    HUD_PRESETS,
    SCHEMA,
    CATEGORIES,
    ACTION_LABELS,
    data: U.deepClone(DEFAULTS),
    storage: null,

    load() {
      this.storage = this.storage || safeStorage();
      try {
        const raw = this.storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const legacyHud = !parsed.hud || parsed.hud.preset === undefined;
          this.data = U.fillDefaults(parsed, DEFAULTS);
          if (legacyHud) migrateHud(this.data);
          // make sure every action has a binding list (new actions in later builds)
          for (const dev of ['keyboard', 'gamepad']) {
            const defs = DEFAULTS.controls[dev];
            for (const a of Object.keys(defs)) {
              if (!Array.isArray(this.data.controls[dev][a])) this.data.controls[dev][a] = defs[a].slice();
            }
          }
        }
      } catch (err) {
        SL.warn('Settings unreadable, using defaults', err);
        this.data = U.deepClone(DEFAULTS);
      }
      return this.data;
    },

    save() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => this.saveNow(), 250);
    },

    saveNow() {
      try {
        (this.storage || safeStorage()).setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        SL.warn('Could not store settings', err);
      }
    },

    get(path) {
      return U.getPath(this.data, path);
    },

    set(path, value, opts = {}) {
      const old = this.get(path);
      if (old === value) return;
      U.setPath(this.data, path, value);
      const [cat, key] = path.split('.');
      if (cat === 'graphics') {
        if (key === 'preset' && value !== 'custom') this.applyPreset(value, true);
        else if (PRESET_KEYS.includes(key)) U.setPath(this.data, 'graphics.preset', 'custom');
      }
      // Custom keeps every individual choice: picking it changes nothing, changing a row picks it
      if (cat === 'hud') {
        if (key === 'preset' && value !== 'custom') this.applyHudPreset(value);
        else if (HUD_PRESET_KEYS.includes(key)) this.data.hud.preset = 'custom';
      }
      if (opts.save !== false) this.save();
      SL.events.emit('settings:changed', { path, value, old });
    },

    applyPreset(name, silent) {
      const p = PRESETS[name];
      if (!p) return;
      Object.assign(this.data.graphics, p);
      this.data.graphics.preset = name;
      if (!silent) SL.events.emit('settings:changed', { path: 'graphics.preset', value: name });
      else SL.events.emit('settings:changed', { path: 'graphics.*', value: name });
    },

    applyHudPreset(name) {
      const p = HUD_PRESETS[name];
      if (!p) return;
      Object.assign(this.data.hud, p);
      this.data.hud.preset = name;
      SL.events.emit('settings:changed', { path: 'hud.*', value: name });
    },

    resetCategory(cat) {
      this.data[cat] = U.deepClone(DEFAULTS[cat]);
      this.save();
      SL.events.emit('settings:changed', { path: cat + '.*', value: null });
    },

    /** Assign a binding; removes the same input from other actions to avoid conflicts. */
    bind(device, action, slot, code) {
      const map = this.data.controls[device];
      if (code) {
        for (const a of Object.keys(map)) {
          if (a === action) continue;
          const i = map[a].indexOf(code);
          if (i >= 0) map[a].splice(i, 1);
        }
      }
      const list = map[action] || (map[action] = []);
      if (code) list[slot] = code;
      else list.splice(slot, 1);
      map[action] = list.filter(Boolean);
      this.save();
      SL.events.emit('settings:changed', { path: 'controls.' + device, value: action });
    },

    resetBindings(device) {
      this.data.controls[device] = U.deepClone(DEFAULTS.controls[device]);
      this.save();
      SL.events.emit('settings:changed', { path: 'controls.' + device, value: null });
    },
  });

  /**
   * Settings stored before Display & Immersion existed: the old on/off HUD switches become the
   * matching choices, the two story toggles move here from Gameplay, and the preset is whatever
   * those values add up to (usually Standard). The first-launch choice is still offered once.
   */
  function migrateHud(data) {
    const h = data.hud, g = data.gameplay;
    if (typeof h.damageNumbers === 'boolean') h.damageNumbers = h.damageNumbers ? 'all' : 'off';
    if (typeof h.lockOn === 'boolean') h.lockOn = h.lockOn ? 'full' : 'hidden';
    if (typeof h.skillPanel === 'boolean') h.skillPanel = h.skillPanel ? 'full' : 'hidden';
    if (g.tutorialPrompts !== undefined) {
      if (g.tutorialPrompts === false) h.tips = 'off';
      delete g.tutorialPrompts;
    }
    if (g.moveNames !== undefined) {
      h.moveNames = !!g.moveNames;
      delete g.moveNames;
    }
    h.preset = hudPresetOf(h);
  }
  Settings.migrateHud = migrateHud;

  function safeStorage() {
    try {
      const k = '__sl_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch (e) {
      const mem = new Map();
      return {
        getItem: (k) => (mem.has(k) ? mem.get(k) : null),
        setItem: (k, v) => mem.set(k, String(v)),
        removeItem: (k) => mem.delete(k),
      };
    }
  }
  Settings.safeStorage = safeStorage;
})();
