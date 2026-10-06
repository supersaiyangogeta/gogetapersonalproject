// First-launch visual experience setup and Display & Immersion (2026-09-23): presets, the saved
// choice, and what the real HUD actually puts on screen under each setting — attached to real
// headless battles through a small DOM (tests/minidom.js), not by reading setting variables.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const H = require('./headless');
const MiniDom = require('./minidom');

const SETTINGS_KEY = 'saiyanLegacy.settings.v1';

module.exports = function ({ test, eq, ok }) {
  console.log('\nFirst-launch visual setup / Display & Immersion');

  /** A headless game with the UI scripts loaded over a small DOM. */
  function uiGame(files = ['src/ui/ui.js', 'src/ui/hud.js'], seed = 3) {
    const gg = H.create({ quiet: true, seed });
    const dom = MiniDom.create();
    gg.ctx.document = dom.document;
    for (const f of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), gg.ctx, { filename: f });
    const { SL } = gg;
    SL.Portraits.get = () => '';
    SL.Audio.init = () => {};
    const subs = [];
    SL.Subtitles.show = (who, line) => subs.push({ who, line });
    SL.Subtitles.clear = () => {};
    SL.UI.root = dom.document.getElementById('screens');
    SL.App = SL.App || {}; // src/main.js is not loaded headless; menus read SL.App.menuScene
    return { gg, SL, dom, subs };
  }
  const MENUS = ['src/ui/ui.js', 'src/ui/hud.js', 'src/ui/screens_menu.js', 'src/ui/screens_settings.js'];

  /** A 1v1 with the real HUD attached; step() advances the game and the HUD together. */
  function fight(env, preset, o = {}) {
    const { gg, SL } = env;
    if (preset) SL.Settings.applyHudPreset(preset);
    const b = gg.battle(Object.assign({ p1: 'goku', p2: 'vegeta' }, o));
    SL.HUD.attach(b);
    const step = (n, each) => {
      for (let i = 0; i < n; i++) {
        gg.step(b, 1);
        SL.HUD.update(1 / 60);
        if (each && each(i) === false) return i;
      }
      return n;
    };
    return { b, p: b.player, foe: b.fighters[1], HUD: SL.HUD, step };
  }
  const op = (n) => String(n.style.opacity);
  const shown = (n) => !n.hidden && op(n) !== '0';

  /** Title → any button: the setup screen, as a fresh player sees it. */
  function openSetup(env) {
    const { SL } = env;
    SL.Settings.load();
    SL.UI.push(SL.Screens.title());
    SL.UI.top().handleNav({ any: true });
    return SL.UI.top();
  }

  test('first launch: the title leads to "How do you want to experience Saiyan Legacy?", Cinematic is focused and previewed, and each choice changes the preview HUD', () => {
    const env = uiGame(MENUS);
    const { SL } = env;
    const s = openSetup(env);
    ok(!SL.Settings.data.visualExperienceConfigured, 'nothing chosen yet');
    ok(s.el.classList.contains('xp-setup'), 'the setup comes before the main menu: ' + s.el.className);
    ok(/HOW DO YOU WANT TO EXPERIENCE/i.test(s.el.textContent) && /Saiyan Legacy\?/.test(s.el.textContent), 'the question is asked');
    for (const w of ['CINEMATIC', 'STANDARD', 'CUSTOM', 'Less HUD. Fewer interruptions. Focus on the fight.', 'Full gameplay information when you need it.', 'Choose every visual preference yourself.']) ok(s.el.textContent.includes(w), 'shows "' + w + '"');
    eq(s.shown, 'cinematic', 'Cinematic is the first, recommended choice');
    const pv = s.el.querySelector('.xp-hud');
    const vis = (sel) => !pv.querySelector(sel).classList.contains('xp-off');
    ok(pv.classList.contains('mode-cinematic'), 'the preview is in Cinematic');
    ok(!vis('.dmg.big') && !vis('.hud-skills') && !vis('.hud-combo') && !vis('.hud-objectives') && !vis('.lock'), 'Cinematic preview: no numbers, skills, combo, objectives or reticle');
    ok(vis('.xp-sub'), 'but the dialogue subtitle stays');
    ok(pv.querySelector('.fpanel.p1').classList.contains('hp-min'), 'and health is a thin bar');
    s.handleNav({ down: true });
    eq(s.shown, 'standard');
    ok(vis('.dmg.big') && vis('.hud-skills') && vis('.hud-combo') && vis('.hud-objectives') && vis('.lock') && vis('.dmg.word'), 'Standard preview: the full HUD');
    ok(!pv.querySelector('.fpanel.p1').classList.contains('hp-min'), 'with the full health plate');
    s.handleNav({ down: true });
    eq(s.shown, 'custom');
    ok(pv.classList.contains('mode-custom'), 'Custom preview: the configurable HUD');
    s.handleNav({ back: true });
    eq(SL.UI.top(), s, 'Back does not skip the first-launch choice');
  });

  test('choosing Cinematic saves the preset and the first-launch flag, survives a reload, and the next launch goes straight to the main menu', () => {
    const env = uiGame(MENUS);
    const { SL, gg } = env;
    const s = openSetup(env);
    s.handleNav({ confirm: true });
    const h = SL.Settings.data.hud;
    eq(h.preset, 'cinematic');
    eq(h.damageNumbers, 'off');
    eq(h.autoHide, true);
    eq(h.subtitles, 'on', 'story subtitles stay on');
    ok(SL.Settings.data.visualExperienceConfigured, 'visualExperienceConfigured = true');
    const stored = JSON.parse(gg.ctx.localStorage.getItem(SETTINGS_KEY));
    eq(stored.hud.preset, 'cinematic', 'written to the settings store');
    eq(stored.visualExperienceConfigured, true);
    ok(SL.UI.top().el.classList.contains('main-menu'), 'then the main menu');
    // reload
    SL.Settings.data = SL.util.deepClone(SL.Settings.DEFAULTS);
    SL.Settings.load();
    eq(SL.Settings.data.hud.preset, 'cinematic', 'after a reload');
    eq(SL.Settings.data.hud.ki, 'contextual');
    SL.UI.clear();
    SL.UI.push(SL.Screens.title());
    SL.UI.top().handleNav({ any: true });
    ok(SL.UI.top().el.classList.contains('main-menu'), 'second launch: no setup, straight to the menu');
  });

  test('choosing Standard saves the full HUD; choosing Custom keeps every value and opens Display & Immersion, where the preset row and the rows drive each other', () => {
    {
      const env = uiGame(MENUS);
      const s = openSetup(env);
      s.handleNav({ down: true });
      s.handleNav({ confirm: true });
      const h = env.SL.Settings.data.hud;
      eq(h.preset, 'standard');
      for (const [k, v] of Object.entries(env.SL.Settings.HUD_PRESETS.standard)) eq(h[k], v, 'standard ' + k);
      ok(env.SL.Settings.data.visualExperienceConfigured);
    }
    const env = uiGame(MENUS);
    const { SL, gg } = env;
    const s = openSetup(env);
    s.handleNav({ down: true });
    s.handleNav({ down: true });
    s.handleNav({ confirm: true });
    eq(SL.Settings.data.hud.preset, 'custom');
    ok(SL.Settings.data.visualExperienceConfigured);
    const page = SL.UI.top();
    ok(page.el.classList.contains('settings'), 'Custom opens Settings');
    eq(page.el.querySelector('.tab.active').textContent, 'Display & Immersion', 'on the Display & Immersion page');
    const labels = page.el.querySelectorAll('.lbl').map((n) => n.textContent);
    for (const l of ['HUD Preset', 'Damage Numbers', 'Player Health', 'Enemy Health', 'Ki Display', 'Stamina Display', 'Lock-On UI', 'Skill UI', 'Objective Display', 'Tutorial Tips', 'Notifications', 'Auto-Hide HUD', 'Subtitles', 'UI Opacity']) ok(labels.includes(l), 'row "' + l + '"');
    const row = (label) => page.items.find((it) => it.node.querySelector('.lbl') && it.node.querySelector('.lbl').textContent === label);
    const val = (label) => row(label).node.querySelector('.choice').textContent;
    // an individual choice sticks and survives a reload
    row('Damage Numbers').onLeft();
    eq(SL.Settings.data.hud.damageNumbers, 'important');
    eq(SL.Settings.data.hud.preset, 'custom');
    SL.Settings.saveNow();
    SL.Settings.load();
    eq(SL.Settings.data.hud.damageNumbers, 'important', 'the custom value after a reload');
    // the preset row later: Custom → Cinematic rewrites the rows, and the rows show it at once
    row('HUD Preset').onRight();
    eq(SL.Settings.data.hud.preset, 'cinematic');
    eq(val('Damage Numbers'), 'Off', 'the Damage Numbers row follows the preset');
    eq(val('Ki Display'), 'Contextual');
    row('Ki Display').onLeft();
    eq(SL.Settings.data.hud.ki, 'minimal');
    eq(val('HUD Preset'), 'Custom', 'changing a row makes the preset Custom');
    eq(SL.Settings.data.hud.damageNumbers, 'off', 'and keeps the other Cinematic values');
    ok(JSON.parse(gg.ctx.localStorage.getItem(SETTINGS_KEY)).hud.preset, 'stored');
    // the setup can be run again from the page
    ok(page.el.textContent.includes('Experience Setup'), 'Experience Setup is on the page');
  });

  test('settings saved before this existed get safe defaults: old switches become the matching choices, nothing else is lost, progress untouched, and the choice is offered once', () => {
    const gg = H.create({ quiet: true, seed: 1 });
    const { SL } = gg;
    SL.Save.completeMission('prologue_final_stand', { success: true, score: 4000, rank: 'A', time: 90 });
    const legacy = {
      gameplay: { difficulty: 'hard', beamClashInput: 'hold', tutorialPrompts: false, moveNames: false, autoTargetSwitch: true },
      hud: { scale: 1.2, opacity: 0.8, comboCounter: true, damageNumbers: false, lockOn: true, controlHints: true, skillPanel: false },
      camera: { invertY: true },
    };
    gg.ctx.localStorage.setItem(SETTINGS_KEY, JSON.stringify(legacy));
    SL.Settings.load();
    const d = SL.Settings.data;
    eq(d.hud.damageNumbers, 'off', 'Damage Numbers off stays off');
    eq(d.hud.lockOn, 'full', 'Lock-On Marker on = Full Reticle');
    eq(d.hud.skillPanel, 'hidden', 'Skill Panel off = Hidden');
    eq(d.hud.tips, 'off', 'Control Prompts off = Tutorial Tips Off');
    eq(d.hud.moveNames, false, 'Technique Name Banners carried over');
    eq(d.gameplay.tutorialPrompts, undefined, 'the old key is gone');
    eq(d.hud.scale, 1.2);
    eq(d.hud.opacity, 0.8);
    eq(d.gameplay.difficulty, 'hard', 'unrelated settings untouched');
    eq(d.camera.invertY, true);
    eq(d.hud.preset, 'custom', 'values that match no preset are Custom');
    eq(d.hud.playerHealth, 'full', 'new rows start at the readable default');
    eq(d.visualExperienceConfigured, false, 'the first-launch choice is offered once');
    SL.Save.load();
    ok(SL.Save.missionResult('prologue_final_stand').completed, 'story progress untouched');
    // an old save with the old defaults is simply Standard
    gg.ctx.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ gameplay: { tutorialPrompts: true, moveNames: true }, hud: { scale: 1, opacity: 1, comboCounter: true, damageNumbers: true, lockOn: true, controlHints: true, skillPanel: true } }));
    SL.Settings.load();
    eq(SL.Settings.data.hud.preset, 'standard');
  });

  test('damage numbers, the combo counter, combat words and the skill panel really leave the screen under Cinematic, and are there under Standard', () => {
    const out = {};
    for (const preset of ['standard', 'cinematic']) {
      const env = uiGame();
      const F = fight(env, preset, { distance: 2 });
      F.p.controller = env.gg.script(F.b, (n) => (n % 14 === 0 ? { light: true } : {}));
      let numbers = 0, combo = false, hits = 0;
      F.b.on('damage', (e) => {
        if (e.attacker === F.p) hits++;
      });
      F.step(200, () => {
        numbers = Math.max(numbers, F.HUD.dmgLayer.children.filter((n) => n.classList.contains('dmg') && !n.classList.contains('word')).length);
        if (op(F.HUD.combo) === '1') combo = true;
      });
      F.b.emit('vanish', { fighter: F.p });
      const words = F.HUD.dmgLayer.children.filter((n) => n.classList.contains('word')).length;
      F.p.controller = env.gg.script(F.b, () => ({}));
      F.step(60 * 6);
      out[preset] = { hits, numbers, combo, words, skills: op(F.HUD.skills) };
    }
    const S = out.standard, C = out.cinematic;
    ok(S.hits > 3 && C.hits > 3, 'both fights landed hits: ' + JSON.stringify(out));
    ok(S.numbers > 0 && S.combo && S.words > 0 && S.skills === '1', 'Standard shows numbers, combo, words and skills: ' + JSON.stringify(S));
    eq(C.numbers, 0, 'Cinematic: no damage numbers');
    ok(!C.combo, 'Cinematic: no combo counter');
    eq(C.words, 0, 'Cinematic: no PERFECT / VANISH words');
    eq(C.skills, '0', 'Cinematic: the skill panel rests when nothing is being used');
  });

  test('damage numbers "Important Only": ordinary hits say nothing, a blow worth a tenth of the target\'s health is shown', () => {
    const env = uiGame();
    const F = fight(env, null, { distance: 2 });
    env.SL.Settings.set('hud.damageNumbers', 'important');
    F.step(3); // the camera settles on the fight
    const count =() => F.HUD.dmgLayer.children.filter((n) => n.classList.contains('dmg') && !n.classList.contains('word')).length;
    F.b.emit('damage', { target: F.foe, attacker: F.p, amount: F.foe.hpMax * 0.02, point: F.foe.chest() });
    eq(count(), 0, 'a light hit: no number');
    F.b.emit('damage', { target: F.foe, attacker: F.p, amount: F.foe.hpMax * 0.15, point: F.foe.chest() });
    eq(count(), 1, 'a huge blow: its number');
  });

  test('health display: Full has the portrait plate, Minimal is a thin bar, Hidden removes the player bar while the danger vignette still reddens; enemy Minimal/Hidden likewise', () => {
    const env = uiGame();
    const { SL } = env;
    let vig = 0;
    SL.ScreenFX.vignette = (a) => (vig = a);
    const F = fight(env, 'standard', { distance: 4 });
    const P1 = F.HUD.p1, P2 = F.HUD.p2;
    F.step(5);
    ok(!P1.root.classList.contains('hp-min') && shown(P1.hp) && shown(P1.port), 'Full: portrait and bar');
    SL.Settings.set('hud.playerHealth', 'minimal');
    F.step(2);
    ok(P1.root.classList.contains('hp-min') && shown(P1.hp), 'Minimal: the thin bar (no portrait by style)');
    SL.Settings.set('hud.playerHealth', 'hidden');
    F.step(2);
    eq(op(P1.hp), '0', 'Hidden: no health bar');
    eq(op(P1.port), '0', 'and no portrait');
    F.p.hp = F.p.hpMax * 0.1;
    F.step(3);
    ok(vig > 0.2, 'but the screen edge reddens in danger: ' + vig);
    SL.Settings.set('hud.enemyHealth', 'minimal');
    F.step(2);
    ok(P2.root.classList.contains('hp-min') && P2.root.classList.contains('res-off') && op(P2.root) === '1', 'enemy Minimal: a thin bar, no ki or stamina');
    SL.Settings.set('hud.enemyHealth', 'hidden');
    F.step(2);
    eq(op(P2.root), '0', 'enemy Hidden');
  });

  test('Auto-Hide and Contextual: at rest the HUD fades, a real hit brings health back, it fades again, critical health stays up, charging shows ki; Standard never fades', () => {
    const env = uiGame();
    const F = fight(env, 'cinematic', { distance: 3 });
    const P1 = F.HUD.p1;
    F.step(60 * 6);
    for (const [n, name] of [[P1.hp, 'health'], [P1.ki, 'ki'], [P1.stam, 'stamina'], [F.HUD.p2.root, 'enemy'], [F.HUD.skills, 'skills'], [F.HUD.objectives, 'objectives']]) eq(op(n), '0', 'at rest: ' + name + ' hidden');
    // the enemy really hits the player
    F.foe.target = F.p;
    F.foe.controller = env.gg.script(F.b, (n) => (n % 15 === 0 ? { light: true } : {}));
    let hit = false;
    F.b.on('damage', (e) => {
      if (e.target === F.p) hit = true;
    });
    F.step(240, () => !hit);
    F.step(1);
    ok(hit, 'the enemy landed a hit');
    ok(shown(P1.hp), 'health came back with the hit');
    eq(op(F.HUD.p2.root), '1', 'and the enemy plate');
    F.foe.controller = env.gg.script(F.b, () => ({}));
    F.step(60 * 6);
    eq(op(P1.hp), '0', 'and faded again once things were quiet');
    F.p.hp = F.p.hpMax * 0.2;
    F.step(60 * 6);
    ok(shown(P1.hp), 'critical health stays on screen');
    F.p.hp = F.p.hpMax;
    F.p.controller = env.gg.script(F.b, () => ({ charge: true }));
    F.step(20);
    eq(F.p.state, 'charge', 'charging');
    ok(shown(P1.ki), 'charging shows the ki meter');
    F.p.controller = env.gg.script(F.b, () => ({}));
    F.step(60 * 5);
    eq(op(P1.ki), '0', 'and it rests again');
    // Standard: never fades
    const env2 = uiGame();
    const G = fight(env2, 'standard', { distance: 3 });
    G.step(60 * 8);
    ok(shown(G.HUD.p1.hp) && shown(G.HUD.p1.ki) && op(G.HUD.p2.root) === '1' && op(G.HUD.skills) === '1', 'Standard at rest: everything stays');
  });

  test('tutorial tips: Off keeps only the prompts the story needs, Contextual says a hint once per mission, Full repeats as authored, and a learned hint stays learned', () => {
    const def = { id: 'tipTest', phases: [{ id: 'p', run: function* () { yield () => false; } }] };
    const run = (tips, fn) => {
      const gg = H.create({ quiet: true, seed: 2 });
      const { SL } = gg;
      SL.Settings.data.hud.tips = tips;
      const b = gg.battle();
      const m = new SL.Mission(b, def, {});
      const log = [];
      b.on('prompt', (e) => log.push((e.show ? '+' : '-') + e.id));
      fn({ gg, SL, b, m, log });
    };
    run('off', ({ gg, b, m, log }) => {
      m.prompt('tip', 'light', 'Light');
      m.prompt('qte', 'light', 'Break free', { required: true, until: () => false });
      gg.step(b, 30);
      ok(log.includes('+qte'), 'the required prompt shows with tips off');
      ok(!log.includes('+tip'), 'an ordinary hint does not');
    });
    const cycle = ({ gg, b, m, log }) => {
      let active = true;
      m.prompt('cyc', 'light', 'Hit', { when: () => active, until: () => false });
      gg.step(b, 20);
      active = false;
      gg.step(b, 60 * 3);
      active = true;
      gg.step(b, 60 * 6);
      return log.filter((x) => x === '+cyc').length;
    };
    let full = 0, ctxl = 0;
    run('full', (e) => (full = cycle(e)));
    run('contextual', (e) => (ctxl = cycle(e)));
    ok(full >= 2, 'Full: the hint comes back when needed again (' + full + ')');
    eq(ctxl, 1, 'Contextual: said once in this mission');
    run('contextual', ({ gg, b, m, log }) => {
      let learned = false;
      m.prompt('first', 'moveF', 'Move', { until: () => learned });
      m.prompt('second', 'light', 'Attack', { until: () => false });
      m.prompt('must', 'light', 'Break free', { required: true, until: () => false });
      gg.step(b, 30);
      ok(log.includes('+first') && !log.includes('+second'), 'Contextual: one tip at a time — ' + log.join(' '));
      ok(log.includes('+must'), 'a required prompt does not wait its turn');
      learned = true;
      gg.step(b, 90); // a hint stays up at least 1.2 s before it counts as learned
      ok(log.includes('-first') && log.includes('+second'), 'the next tip follows once the first is learned — ' + log.join(' '));
    });
    run('full', ({ gg, b, m, log }) => {
      m.prompt('first', 'moveF', 'Move', { until: () => false });
      m.prompt('second', 'light', 'Attack', { until: () => false });
      gg.step(b, 30);
      ok(log.includes('+first') && log.includes('+second'), 'Full: as authored, together');
    });
    run('contextual', ({ SL, m }) => {
      SL.Save.data.seen.prompts.learnedOne = true;
      m.prompt('learnedOne', 'light', 'Hit', { always: true });
      ok(!m.prompts.has('learnedOne'), 'Contextual: a hint already learned never returns, even an "always" one');
    });
    run('full', ({ SL, m }) => {
      SL.Save.data.seen.prompts.learnedOne = true;
      m.prompt('learnedOne', 'light', 'Hit', { always: true });
      ok(m.prompts.has('learnedOne'), 'Full: "always" hints repeat as authored');
    });
  });

  test('the story\'s struggle, beam and transformation prompts are marked required, so no setting can hide them', () => {
    const dir = path.join(__dirname, '..', 'src', 'data', 'missions');
    const re = /\.prompt\('([^']+)',\s*'([^']*)',\s*'([^']*)',\s*\{([^}]*)/g;
    let required = 0;
    const need = ['cfFsk', 'cfPush', 'finalCannon', 'duelKame', 'clashKame', 'dabura_stone', 'apeMash', 'gapeMash', 'latchMash', 'kaiokenPrompt', 'useForm', 'answer'];
    const found = new Set();
    for (const f of fs.readdirSync(dir)) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      let m;
      while ((m = re.exec(src))) {
        const req = /required:\s*true/.test(m[4]);
        if (req) {
          required++;
          found.add(m[1]);
        }
        // a struggle to mash out of (not the dodge-burst combat tip, which shares the words)
        if (/mash|break free|shake it off|break out/i.test(m[3]) && m[2] !== 'dodge') ok(req, f + ' "' + m[3] + '" is a struggle: it must be required');
      }
    }
    for (const id of need) ok(found.has(id), id + ' is required');
    ok(required >= 40, 'required prompts: ' + required);
  });

  test('lock-on works with its marker hidden: the target locks, the aim follows it and a blast lands; Contextual shows the reticle on a change, then lets it go', () => {
    const env = uiGame();
    const { SL, gg } = env;
    SL.Settings.set('hud.lockOn', 'hidden');
    const F = fight(env, null, { distance: 14 });
    SL.Targeting.unlock(F.b, F.p, true);
    F.step(2);
    SL.Targeting.toggle(F.b, F.p);
    F.step(3);
    eq(F.p.target, F.foe, 'locked on');
    eq(F.p.lockMode, 'locked');
    eq(F.p.aimTarget ? F.p.aimTarget() : F.p.target, F.foe, 'the aim is the target');
    ok(F.HUD.lock.hidden, 'with no reticle on screen');
    let landed = false;
    F.b.on('damage', (e) => {
      if (e.target === F.foe && e.attacker === F.p) landed = true;
    });
    F.p.controller = gg.script(F.b, (n) => (n % 20 === 1 ? { blast: true } : {}));
    F.step(150, () => !landed);
    ok(landed, 'a ki blast found the locked target');
    SL.Settings.set('hud.lockOn', 'contextual');
    F.p.controller = gg.script(F.b, () => ({}));
    SL.Targeting.unlock(F.b, F.p, true);
    F.step(2);
    SL.Targeting.toggle(F.b, F.p);
    F.step(2);
    ok(!F.HUD.lock.hidden, 'Contextual: the reticle marks the new target');
    F.step(150);
    ok(F.HUD.lock.hidden, 'then goes');
    eq(F.p.target, F.foe, 'while the lock holds');
    SL.Settings.set('hud.lockOn', 'full');
    F.step(2);
    ok(!F.HUD.lock.hidden, 'Full: the reticle is back');
  });

  test('the skill wheel opens and fires the technique with the skill panel Hidden', () => {
    const env = uiGame();
    const { SL, gg } = env;
    SL.Settings.set('hud.skillPanel', 'hidden');
    const F = fight(env, null, { distance: 24 });
    const p = F.p;
    p.controller = new SL.PlayerController(F.b);
    p.ki = 100;
    const list = SL.RadialMenu.buildEntries(p, F.b);
    const idx = list.findIndex((e) => e.id === 'special1');
    const ang = (idx / list.length) * Math.PI * 2;
    let open = true;
    const held = SL.Input.held;
    SL.Input.held = (act) => act === 'skillMenu' && open;
    SL.Input.move = { x: Math.sin(ang), y: Math.cos(ang) };
    try {
      F.step(6);
      ok(F.b.radial && F.b.radial.open, 'the wheel is open');
      ok(!F.HUD.radialEl.hidden, 'and drawn');
      eq(op(F.HUD.skills), '0', 'while the skill panel stays hidden');
      open = false;
      SL.Input.move = { x: 0, y: 0 };
      let fired = false;
      F.step(40, () => {
        if (p.state === 'beamCharge' || p.state === 'beamFire') fired = true;
      });
      ok(fired, 'the Kamehameha came out');
    } finally {
      SL.Input.held = held;
      SL.Input.move = { x: 0, y: 0 };
    }
  });

  test('subtitles: story lines stay under Cinematic, Dialogue Only drops combat taunts, Cinematic Only waits for scenes, Off is off', () => {
    const env = uiGame();
    const { SL } = env;
    const F = fight(env, 'cinematic', { distance: 4 });
    const m = new SL.Mission(F.b, { id: 'subTest', phases: [] }, {});
    const said = () => env.subs.length;
    let taunt = null;
    F.b.on('say', (e) => {
      if (e.kind === 'bark') taunt = e;
    });
    m.say('goku', 'A story line.', 2);
    eq(said(), 1, 'Cinematic keeps story dialogue');
    F.b.bark(F.foe, 'taunt', true);
    ok(taunt, 'a combat taunt is tagged as one');
    eq(said(), 2, 'and On shows it');
    SL.Settings.set('hud.subtitles', 'dialogue');
    m.say('goku', 'Another story line.', 2);
    F.b.bark(F.foe, 'taunt', true);
    eq(said(), 3, 'Dialogue Only: the story line, not the taunt');
    SL.Settings.set('hud.subtitles', 'cinematic');
    m.say('goku', 'In the fight.', 2);
    eq(said(), 3, 'Cinematic Only: nothing during play');
    F.b.inputLocked = true;
    m.say('goku', 'In a scene.', 2);
    eq(said(), 4, 'but the scene line');
    F.b.inputLocked = false;
    SL.Settings.set('hud.subtitles', 'off');
    m.say('goku', 'Silence.', 2);
    eq(said(), 4, 'Off');
  });

  test('never hidden: the struggle meter and a required prompt show under Cinematic with tips Off; a boss changing form brings its plate back with the new form and names it once', () => {
    const env = uiGame();
    const { SL } = env;
    const F = fight(env, 'cinematic', { p2: 'frieza', distance: 6 });
    SL.Settings.set('hud.tips', 'off');
    const m = new SL.Mission(F.b, { id: 'qteTest', phases: [] }, {});
    m.prompt('breakFree', 'light', 'Break free', { required: true, until: () => false });
    F.step(5);
    // required prompts sit in their own bottom-right box (2026-10-01, the owner: the F cue went missing in cutscenes)
    eq(F.HUD.cueBox.children.length, 1, 'the required prompt is on screen');
    ok(/Break free/.test(F.HUD.cueBox.textContent) && op(F.HUD.cueBox) === '1', 'readable: ' + F.HUD.cueBox.textContent);
    F.b.emit('struggle', { active: true, progress: 0.4, rate: 1, label: 'PUSH!' });
    F.step(1);
    ok(!F.HUD.struggle.hidden, 'the struggle meter shows');
    ok(/PUSH!/.test(F.HUD.struggle.textContent), 'with its instruction');
    F.b.emit('struggle', { active: false });
    // the boss plate at rest, then a new form
    F.foe.tags.boss = true;
    F.step(60 * 6);
    eq(op(F.HUD.p2.root), '0', 'at rest the enemy plate is hidden');
    SL.Settings.set('hud.damageNumbers', 'important');
    F.foe.applyForm(1);
    const form = F.foe.form;
    F.step(1);
    eq(op(F.HUD.p2.root), '1', 'the boss\'s new phase brings the plate back');
    eq(F.HUD.p2.badge.textContent, F.foe.formLabel, 'showing the new form: ' + F.foe.formLabel);
    ok(F.HUD.dmgLayer.children.some((n) => n.classList.contains('word') && n.textContent === String(form.short || form.name).toUpperCase()), 'and its name once, over him');
    F.step(60 * 6);
    eq(op(F.HUD.p2.root), '0', 'then it rests again');
  });

  test('presentation only: the same seeded story mission plays out identically under Cinematic (tips contextual) and Standard, and records the same progress', () => {
    const results = {};
    for (const preset of ['standard', 'cinematic']) {
      const env = uiGame(['src/ui/ui.js', 'src/ui/hud.js'], 4);
      const { SL, gg } = env;
      SL.Settings.applyHudPreset(preset);
      const r = gg.playMission('buu_saiyaman', {
        maxSeconds: 300,
        onBattle: (b) => {
          SL.HUD.attach(b);
          b.tickHandlers.push(() => {
            SL.HUD.update(1 / 60);
          });
        },
      });
      results[preset] = { state: r.state, frames: r.frames, hp: Math.round(r.b.player.hp), done: !!(r.record && r.record.completed), story: JSON.stringify(Object.keys(SL.Save.data.story.missions)) };
    }
    const S = results.standard, C = results.cinematic;
    eq(S.state, 'success', 'Standard: mission won ' + JSON.stringify(S));
    eq(C.state, S.state, 'same outcome');
    eq(C.frames, S.frames, 'same length to the frame');
    eq(C.hp, S.hp, 'same health at the end');
    ok(S.done && C.done, 'both recorded the clear');
    eq(C.story, S.story, 'same story progress');
  });
};
