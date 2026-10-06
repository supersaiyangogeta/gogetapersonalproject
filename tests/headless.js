// Headless game runtime for Node: loads the real engine scripts (three.js math and
// scene graph, fighters, missions, AI) with the browser-only parts stubbed out
// (WebGL, canvas pixels, Web Audio, DOM). Nothing is rendered; the simulation,
// state machines, missions and AI run exactly as in the browser.
//
//   const H = require('./headless');
//   const game = H.create();
//   const b = game.battle({ p1: 'goku', p2: 'vegeta' });
//   game.step(b, 120);
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

/** A do-anything object: every property is callable and chainable; assignments stick. */
function makeStub(name) {
  const store = new Map();
  const fn = function () {};
  const proxy = new Proxy(fn, {
    get(t, k) {
      if (store.has(k)) return store.get(k);
      if (k === Symbol.toPrimitive) return (hint) => (hint === 'number' ? 0 : '');
      if (k === 'then') return undefined;
      if (k === 'length') return 0;
      if (k === Symbol.iterator) return function* () {};
      const child = makeStub(name + '.' + String(k));
      store.set(k, child);
      return child;
    },
    set(t, k, v) {
      store.set(k, v);
      return true;
    },
    apply() {
      return makeStub(name + '()');
    },
    construct() {
      return makeStub('new ' + name);
    },
  });
  return proxy;
}

/** Math with a deterministic random() when a seed is given (AI rolls become repeatable). */
function seededMath(seed) {
  if (seed === undefined) return Math;
  let a = seed >>> 0;
  const m = Object.create(Math);
  m.random = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return m;
}

function scriptList() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const out = [];
  const re = /<script src="([^"]+)"><\/script>/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  // gameplay only: skip UI screens and the app bootstrap
  return out.filter((s) => !s.startsWith('src/ui/') && s !== 'src/main.js');
}

function create(opts = {}) {
  let now = 0;
  const errors = [];
  const warnings = [];
  const timers = [];
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const element = () => {
    const e = makeStub('element');
    e.style = {};
    e.classList = { add() {}, remove() {}, toggle() {}, contains: () => false };
    e.children = [];
    e.appendChild = (c) => c;
    e.addEventListener = () => {};
    e.removeEventListener = () => {};
    e.querySelector = () => null;
    e.querySelectorAll = () => [];
    e.getContext = () => makeStub('ctx2d');
    e.width = 256;
    e.height = 256;
    return e;
  };
  const document = {
    createElement: element,
    createElementNS: element,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    body: element(),
    head: element(),
    documentElement: element(),
    hidden: false,
    pointerLockElement: null,
    exitPointerLock: () => {},
  };
  const ctx = {
    console: {
      log: opts.quiet ? () => {} : console.log,
      info: () => {},
      // three.js complains about textures that only exist as canvas pixels in the browser
      warn: (...a) => {
        if (String(a[0]).startsWith('THREE.')) return;
        warnings.push(a.map(String).join(' '));
        if (!opts.quiet) console.warn(...a);
      },
      error: (...a) => {
        errors.push(a.map(String).join(' '));
        if (!opts.quiet) console.error(...a);
      },
    },
    Math: seededMath(opts.seed), JSON, Date, Map, Set, WeakMap, Symbol, Promise, Proxy, Reflect, Float32Array, Uint8Array, Uint16Array, Uint32Array, Int32Array, Array, Object, Number, String, Boolean, Error, TypeError, RegExp, ArrayBuffer, DataView, Uint8ClampedArray, Int8Array, Int16Array, Float64Array,
    setTimeout: (fn, ms) => (timers.push({ at: now + (ms || 0), fn }), timers.length),
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    performance: { now: () => now },
    localStorage,
    document,
    navigator: { getGamepads: () => [], userAgent: 'node', maxTouchPoints: 0 },
    innerWidth: 1280,
    innerHeight: 720,
    devicePixelRatio: 1,
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    location: { search: '', hash: '', href: 'http://headless/' },
    Image: function () { return element(); },
    HTMLCanvasElement: function () {},
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    TextEncoder,
    TextDecoder,
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  // three.js stamps every material, geometry and texture with a random UUID. With a seed, the
  // context's Math.random is the gameplay stream, so one extra material (a new outfit colour)
  // used to shift every seeded fight. three.js gets its own deterministic Math instead: what a
  // fighter wears can never change how a seeded fight plays.
  ctx.__threeMath = seededMath(opts.seed === undefined ? undefined : 0x7468726565);
  for (const rel of scriptList()) {
    let src = fs.readFileSync(path.join(root, rel), 'utf8');
    if (rel === 'vendor/three.min.js') src = '(function (Math) {' + src + '\n}).call(this, __threeMath);';
    vm.runInContext(src, ctx, { filename: rel });
  }
  const SL = ctx.SL;
  // browser services that have no meaning headless
  SL.Audio.play = () => {};
  SL.Audio.duckMusic = () => {};
  SL.Music.play = () => {};
  SL.Music.stop = () => {};
  SL.Music.setIntensity = () => {};
  SL.Music.stinger = () => {};
  SL.Input.poll = () => {};
  SL.Input.rumble = () => {};
  SL.Input.pressed = () => false;
  SL.Input.held = () => false;
  SL.Input.setBattleMode = () => {};
  SL.Input.exitPointerLock = () => {};
  SL.Input.clearToggles = () => {};
  SL.Input.look = { x: 0, y: 0 };
  const renderer = makeStub('renderer');
  renderer.getPixelRatio = () => 1;
  SL.Render.renderer = renderer;
  // full-screen DOM overlays (flash, vignette) do nothing without a page
  for (const k of Object.keys(SL.ScreenFX)) if (typeof SL.ScreenFX[k] === 'function') SL.ScreenFX[k] = () => {};
  if (!SL.Subtitles) SL.Subtitles = { clear() {}, show() {} };
  SL.Settings.data.hud.tips = 'full';

  const api = {
    ctx,
    SL,
    errors,
    warnings,
    THREE: ctx.THREE,
    V3: ctx.THREE.Vector3,
    get now() {
      return now;
    },
    /** Advance one 60 Hz frame of real game flow (sequences, missions, fixed ticks). */
    frame(b) {
      now += 1000 / 60;
      b.update(1 / 60);
      for (let i = timers.length - 1; i >= 0; i--) {
        if (timers[i].at <= now) {
          const t = timers.splice(i, 1)[0];
          t.fn();
        }
      }
    },
    step(b, frames, each) {
      for (let i = 0; i < frames; i++) {
        api.frame(b);
        if (each && each(i) === false) return i;
      }
      return frames;
    },
    /** Run until pred() is true or the frame budget runs out. Returns frames used or -1. */
    until(b, pred, maxFrames = 60 * 60, each) {
      for (let i = 0; i < maxFrames; i++) {
        if (pred()) return i;
        api.frame(b);
        if (each) each(i);
      }
      return pred() ? maxFrames : -1;
    },
    /** A training-style 1v1 already in the fight phase. */
    battle(o = {}) {
      const V3 = ctx.THREE.Vector3;
      const dist = o.distance || 3;
      const b = new SL.Battle({
        mode: 'training',
        stageId: o.stage || 'wasteland',
        skipIntro: true,
        rules: Object.assign({ timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 100 }, o.rules || {}),
        fighters: [
          { charId: o.p1 || 'goku', player: true, team: 0, pos: new V3(-dist / 2, 0, 0), cannotDie: o.p1CannotDie !== false, infiniteHp: !!o.p1InfiniteHp },
          { charId: o.p2 || 'vegeta', team: 1, pos: new V3(dist / 2, 0, 0), dummy: o.dummy || 'idle', infiniteHp: o.p2InfiniteHp !== false, cannotDie: true, difficulty: o.difficulty || 'normal' },
        ],
        onEnd: () => {},
      });
      b.start();
      const p = b.player, d = b.fighters[1];
      for (const [f, x] of [[p, -dist / 2], [d, dist / 2]]) {
        f.setPosition(new V3(x, b.stage.heightAt(x, 0), 0));
        f.grounded = true;
      }
      p.target = d;
      d.target = p;
      p.faceTarget(100);
      d.faceTarget(100);
      return b;
    },
    /** Controller that sends scripted intents on exact frames: { [frame]: intent } or fn(frame) */
    script(b, spec) {
      const start = b.frame;
      return {
        update: () => {
          const it = SL.emptyIntent();
          const n = b.frame - start;
          if (typeof spec === 'function') Object.assign(it, spec(n) || {});
          else if (spec[n]) Object.assign(it, spec[n]);
          return it;
        },
      };
    },
    /**
     * Play a mission to the end with a bot brain from tools/mission_brains.js. Cutscenes are
     * skipped and struggles are mashed at a human rate (20 presses per second).
     */
    playMission(id, o = {}) {
      const brains = require('../tools/mission_brains');
      const b = api.mission(id, o);
      if (o.onBattle) o.onBattle(b); // listeners attached before the first frame
      const run = brains.attach(SL, b, id, o);
      // struggles are mashed at 20 presses/s; beam clashes at a human 12/s
      SL.Input.pressed = (a) => !!(a === 'light' && ((b.mission && b.mission.struggling && b.frame % 3 === 0) || (b.clash.active && b.frame % 5 === 0)));
      const frames = api.until(b, () => b.mission.state !== 'running' || b.__ended, (o.maxSeconds || 600) * 60, () => {
        if (b.inputLocked && !o.watch) b.skipRequested = true; // o.watch: every scene plays out in full
      });
      SL.Input.pressed = () => false;
      return { b, m: b.mission, log: run.log, frames, seconds: frames / 60, state: b.mission.state, record: SL.Save.missionResult(id) };
    },
    /** Start a story mission exactly like the app does (without HUD/menus). */
    mission(id, o = {}) {
      const def = SL.data.missions[id];
      const b = new SL.Battle({
        mode: 'story',
        missionId: id,
        stageId: def.stage,
        rules: Object.assign({ allowTransform: true, allowUltimates: true, startKi: 40 }, SL.Mission.rulesFor(o.difficulty || 'normal'), def.rules || {}),
        fighters: [],
        onEnd: (bb, r) => {
          b.__ended = r;
        },
      });
      // o.onCreate(b): listeners that must see the very first beats (a phase can start a scene
      // synchronously, before the first frame)
      if (o.onCreate) o.onCreate(b);
      def.setup(b, o.startPhase || 0);
      new SL.Mission(b, def, { startPhase: o.startPhase || 0, retries: 0 });
      b.start();
      return b;
    },
  };
  return api;
}

module.exports = { create, makeStub };
