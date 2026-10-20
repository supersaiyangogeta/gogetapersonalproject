/*
 * TOURNAMENT OF POWER KIT — staging shared by Chapter 22's missions (top_jiren, top_saiyans, top_kefla, top_toppo,
 * top_vegeta, top_mui, top_finale). Built on the arena of stage_top.js (the platform in the void, the stands, the
 * Grand Priest's dais, Zeno's box), SL.Tournament.match (ring-out and knockout are real) and the buuKit staging
 * helpers. Nothing here is a new system: it seats the watchers, puts the fighters on the platform, hands a stretch of
 * the fight to the tournament rules, and stages an elimination the way the tournament does it — over the edge, the
 * Grand Priest's call, and a flash that takes the loser to the stands.
 *
 *   TK.setup(b, opts)         spawn the mission's cast: opts.fight [ids on the platform], opts.player (id), opts.seat
 *                             [ids in the stands], opts.zeno (the two Zenos and the Grand Priest, default true),
 *                             opts.chars { id: charId } (a cast key played by another definition: android_17 ->
 *                             'android_17_top'); returns b.story
 *   TK.seat(m, ids?)          the watchers back in their seats (all of them, or the listed ones)
 *   TK.place(m, id, [x, z])   a fighter on the platform at x, z (metres from the centre)
 *   TK.control(m, id)         the player drives this fighter
 *   TK.bout(m, opts)          one stretch of the tournament: { a, c, ai, during, ringOut, keepPlaces }. A ring-out or
 *                             knockout of the player's fighter is a mission failure (retry from the checkpoint)
 *   TK.eliminate(m, f, opts)  the elimination: the Grand Priest's call, the flash, and the loser in the stands
 *   TK.fall(m, f, dir, opts)  a body thrown off the platform into the void (generator)
 *   TK.halo(f) / TK.unhalo(f) the dead man's halo over Frieza's head (he is alive for this tournament only)
 *   TK.ruin(b, level)         the platform broken by the fighting: cracks and fallen slabs (scenery)
 *   TK.priest(m, line, s)     the Grand Priest speaks (and turns to the platform)
 *   TK.cheer(m)               the two Zenos throw up their hands
 *   TK.mood(m, mood, ids?)    the stands react: excitement, concern, shock, disbelief, frustration, pride, silent,
 *                             celebration (null = back to how each one watches). Neighbours take different poses;
 *                             the angels and the Grand Priest stay composed; the two Zenos react together
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;

  // who sits where in the stands: [row, k across (-1 left .. 1 right)], and how they watch
  const SEATS = {
    // Universe 7
    piccolo: [0, -0.9], adult_gohan: [0, -0.8], krillin: [0, -0.7], tien: [0, -0.6], android_18: [0, -0.5],
    android_17: [0, -0.4], frieza: [0, -0.3], vegeta: [1, -0.85], goku: [1, -0.75], roshi: [1, -0.62],
    beerus: [2, -0.7], whis: [3, -0.7], supreme_kai: [2, -0.58],
    // Universe 6
    caulifla: [0, 0.06], kale: [0, 0.15], cabba: [0, 0.24], hit: [0, 0.33], champa: [2, 0.12], vados: [3, 0.12],
    // Universe 11
    toppo: [0, 0.6], dyspo: [0, 0.67], jiren: [0, 0.74],
  };
  const WATCH = {
    piccolo: ['armsCrossed', 'serious'], adult_gohan: ['armsCrossed', 'serious'], krillin: ['idle', 'serious'], tien: ['armsCrossed', 'serious'], roshi: ['armsCrossed', 'calm'],
    android_18: ['armsCrossed', 'calm'], android_17: ['a17_bored', 'calm'], frieza: ['idle', 'smirk'], vegeta: ['armsCrossed', 'serious'],
    goku: ['g_handsHips', 'serious'], beerus: ['bs_idle', 'serious'], whis: ['w_idle', 'calm'], supreme_kai: ['idle', 'serious'],
    caulifla: ['cf_stance', 'smirk'], kale: ['ka_shy', 'sad'], cabba: ['cb_idle', 'determined'], hit: ['ht_pockets', 'cold'],
    champa: ['ch6_idle', 'smirk'], vados: ['w_idle', 'calm'], toppo: ['tp_idle', 'serious'], dyspo: ['dy_idle', 'cocky'], jiren: ['jr_idle', 'cold'],
  };
  const TEAM = { caulifla: 1, kale: 1, cabba: 1, hit: 1, champa: 1, vados: 1, kefla: 1, toppo: 2, dyspo: 2, jiren: 2 };
  // the stands' reactions (TK.mood): two variants per mood so neighbours never move as one
  const MOODS = {
    excitement: [['sp_cheer', 'grin'], ['sp_point', 'grin']],
    concern: [['sp_lean', 'nervous'], ['sp_lean', 'serious']],
    shock: [['sp_shock', 'shock'], ['sp_lean', 'shock']],
    disbelief: [['sp_shock', 'shock'], ['stand', 'shock']],
    frustration: [['sp_frustrate', 'angry'], ['sp_frustrate', 'grit']],
    pride: [['armsCrossed', 'smirk'], ['armsCrossed', 'cocky']],
    silent: [['sp_lean', 'focused'], ['armsCrossed', 'serious']],
    celebration: [['sp_fist', 'grin'], ['sp_cheer', 'grin']],
  };
  const COMPOSED = new Set(['whis', 'vados', 'grandpriest']);
  // generic spectator bodies (any humanoid rig): leaning in, recoiling, a fist up, both fists, fists down, pointing
  Object.assign(SL.data.poses, {
    sp_lean: (t) => {
      const b = Math.sin(t * 1.4);
      return { root: { y: -0.05 }, spine: [16, 0, 0], chest: [12, 0, 0], head: [-16 + b * 2, 0, 0], shoulderL: [-50, 0, 18], elbowL: [-70, 0, 0], shoulderR: [-50, 0, -18], elbowR: [-70, 0, 0], thighL: [-8, 0, 10], kneeL: [12, 0, 0], thighR: [-8, 0, -10], kneeR: [12, 0, 0] };
    },
    sp_shock: { root: { y: 0, rx: -6 }, spine: [-8, 0, 0], chest: [-10, 0, 0], head: [-8, 0, 0], shoulderL: [-50, 0, 46], elbowL: [-70, 0, 0], shoulderR: [-50, 0, -46], elbowR: [-70, 0, 0], thighL: [-6, 0, 8], kneeL: [8, 0, 0], thighR: [8, 0, -8], kneeR: [4, 0, 0] },
    sp_cheer: (t) => {
      const b = Math.sin(t * 6);
      return { root: { y: Math.abs(b) * 0.02 }, spine: [-4, 0, 0], chest: [-6, 0, 0], head: [-10, 0, 0], shoulderR: [-165, 0, -12 + b * 6], elbowR: [-20, 0, 0], shoulderL: [-20, 0, 22], elbowL: [-90, 0, 0], thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0], hands: ['fist', 'fist'] };
    },
    sp_fist: (t) => {
      const b = Math.sin(t * 7);
      return { root: { y: Math.abs(b) * 0.03 }, spine: [-6, 0, 0], chest: [-8, 0, 0], head: [-14, 0, 0], shoulderR: [-160, 0, -24], elbowR: [-30, 0, 0], shoulderL: [-160, 0, 24], elbowL: [-30, 0, 0], thighL: [-4, 0, 8], kneeL: [6, 0, 0], thighR: [-4, 0, -8], kneeR: [6, 0, 0], hands: ['fist', 'fist'] };
    },
    sp_frustrate: { root: { y: -0.03 }, spine: [10, 0, 0], chest: [8, 0, 0], head: [14, 0, 0], shoulderL: [6, 0, 22], elbowL: [-30, 0, 0], shoulderR: [6, 0, -22], elbowR: [-30, 0, 0], thighL: [-4, 0, 10], kneeL: [6, 0, 0], thighR: [-4, 0, -10], kneeR: [6, 0, 0], hands: ['fist', 'fist'] },
    sp_point: { root: { y: 0 }, spine: [2, 0, 0], chest: [0, -14, 0], head: [-4, -6, 0], shoulderR: [-95, 0, -8], elbowR: [-4, 0, 0], shoulderL: [-10, 0, 16], elbowL: [-30, 0, 0], thighL: [-4, 0, 8], kneeL: [4, 0, 0], thighR: [-4, 0, -8], kneeR: [4, 0, 0] },
  });
  const NAME = { roshi: 'Master Roshi', goku: 'Son Goku', vegeta: 'Vegeta', frieza: 'Frieza', android_17: 'Android 17', caulifla: 'Caulifla', kale: 'Kale', kefla: 'Kefla', toppo: 'Toppo', dyspo: 'Dyspo', jiren: 'Jiren' };
  const UNIVERSE = { roshi: 7, goku: 7, vegeta: 7, frieza: 7, android_17: 7, caulifla: 6, kale: 6, kefla: 6, toppo: 11, dyspo: 11, jiren: 11 };
  const DEFAULT_CHARS = { android_17: 'android_17_top' };
  const L = (b) => b.stage.landmarks;
  const on = (b, x, z) => K.ground(b, new V3(x, 0, z));

  const TK = (SL.data.topKit = {
    SEATS, WATCH, NAME, UNIVERSE,
    setup(b, opts) {
      const S = {};
      const chars = Object.assign({}, DEFAULT_CHARS, opts.chars || {});
      const add = (id, team, pos, player) => {
        const f = b.spawn({ charId: chars[id] || id, team, player: !!player, pos, startKi: player ? 80 : 40 });
        f.cannotDie = true;
        S[id] = f;
        return f;
      };
      (opts.fight || []).forEach((id, i) => add(id, TEAM[id] || 0, on(b, (i % 2 ? -1 : 1) * 6, i < 2 ? 0 : 6), id === opts.player));
      for (const id of opts.seat || []) if (!S[id]) add(id, TEAM[id] || 0, L(b).stand(SEATS[id][0], SEATS[id][1]), false);
      // fighters still in the tournament, watching from the broken edges of the platform: { id: [x, z] }
      for (const id of Object.keys(opts.edge || {})) {
        if (S[id]) continue;
        const f = add(id, TEAM[id] || 0, on(b, opts.edge[id][0], opts.edge[id][1]), false);
        K.watcher(f, (WATCH[id] || ['idle'])[0], (WATCH[id] || [0, 'calm'])[1]);
        K.faceTo(f, new V3(0, f.pos.y, 0));
      }
      if (opts.zeno !== false) {
        S.zeno = add('zeno', 0, L(b).zeno(0), false);
        S.zeno2 = b.spawn({ charId: 'zeno', team: 0, pos: L(b).zeno(1), startKi: 0 });
        S.zeno2.cannotDie = true;
        S.grandpriest = add('grandpriest', 0, L(b).priest.clone(), false);
      }
      b.story = S;
      b.top = { opts, seated: new Set(opts.seat || []) };
      if (opts.player && S[opts.player]) S[opts.player]._playerController = S[opts.player].controller;
      TK.seat({ battle: b });
      for (const id of opts.fight || []) {
        const f = S[id];
        if (id !== opts.player) K.watcher(f, (WATCH[id] || ['idle'])[0], (WATCH[id] || [0, 'calm'])[1]);
        f.untargetable = f.intangible = false;
      }
      return S;
    },
    /** The watchers in their seats, facing the platform; the Zenos in their box; the Grand Priest on his dais. */
    seat(m, ids) {
      const b = m.battle, S = b.story, Lm = L(b);
      for (const id of ids || [...b.top.seated]) {
        const f = S[id];
        if (!f || !SEATS[id]) continue;
        b.top.seated.add(id);
        f.setHidden(false);
        K.place(f, Lm.stand(SEATS[id][0], SEATS[id][1]), 0);
        f.setPosition(Lm.stand(SEATS[id][0], SEATS[id][1]));
        f.grounded = true;
        K.watcher(f, (WATCH[id] || ['idle'])[0], (WATCH[id] || [0, 'calm'])[1]);
        K.faceTo(f, Lm.standFacing);
      }
      if (S.zeno) {
        for (const [z, k] of [[S.zeno, 0], [S.zeno2, 1]]) {
          z.setPosition(Lm.zeno(k));
          z.grounded = true;
          K.watcher(z, 'zn_idle', 'calm');
          K.faceTo(z, Lm.standFacing);
        }
        S.grandpriest.setPosition(Lm.priest.clone());
        S.grandpriest.grounded = true;
        K.watcher(S.grandpriest, 'gp_idle', 'calm');
        K.faceTo(S.grandpriest, Lm.standFacing);
      }
    },
    /** The edge watchers back at their places on the platform (setup's opts.edge), unless they have been seated. */
    edge(m) {
      const b = m.battle, S = b.story, E = b.top.opts.edge || {};
      for (const id of Object.keys(E)) {
        const f = S[id];
        if (!f || b.top.seated.has(id)) continue;
        f.setHidden(false);
        K.place(f, on(b, E[id][0], E[id][1]), 0);
        f.grounded = true;
        K.watcher(f, (WATCH[id] || ['idle'])[0], (WATCH[id] || [0, 'calm'])[1]);
        K.faceTo(f, new V3(0, f.pos.y, 0));
      }
    },
    /** Off the platform and into a seat (an eliminated fighter, or one who has not fought yet). */
    toSeat(m, id) {
      const b = m.battle, f = b.story[id];
      if (!f) return;
      f.untargetable = f.intangible = true;
      f.ringedOut = false;
      b.top.seated.add(id);
      TK.seat(m, [id]);
    },
    /** A fighter onto the platform at x, z. */
    place(m, id, xz, faceId) {
      const b = m.battle, f = b.story[id];
      b.top.seated.delete(id);
      f.setHidden(false);
      f.untargetable = f.intangible = false;
      f.ringedOut = false;
      K.place(f, on(b, xz[0], xz[1]), f.yaw);
      f.grounded = true;
      if (faceId && b.story[faceId]) K.faceTo(f, b.story[faceId].pos);
      return f;
    },
    control(m, id) {
      const b = m.battle, f = b.story[id];
      b.setParty([f], {});
      f.controller = f._playerController || (f._playerController = new SL.PlayerController(b));
      b.switchPlayer(f, { force: true, quiet: true });
      return f;
    },
    /** One stretch under the tournament's rules. The player's fighter out or down = mission failure. */
    *bout(m, o) {
      const b = m.battle, A = o.a, C = o.c;
      TK.control(m, o.playerId || A.def.id);
      A.cannotDie = true;
      C.cannotDie = true;
      const ai = Object.assign({}, C.def.ai, (C.form && C.form.ai) || {}, o.ai || {});
      const r = yield* SL.Tournament.match(m, {
        a: A, b: C, player: A, intro: false, begin: false, fresh: false, keepPlaces: o.keepPlaces !== false,
        ringOut: o.ringOut || [A], ai, difficulty: SL.Settings.data.gameplay.difficulty, during: o.during,
      });
      if (r.pause) return r;
      if (r.loser === A) m.fail(r.how === 'ringout' ? 'ringout' : 'defeated');
      return r;
    },
    /**
     * A free stretch on the platform, any number of fighters (two on one, three against one): opts { hero, allies
     * [fighters on the hero's side, CPU], foes [{ f, floor, dealt, taken, ai }], seconds, until(t), heroDealt, ease }.
     * Ring-outs are real for the hero (a mission failure, like a knockout); the foes stop on their story floors. Ends
     * when every foe is floored, opts.until says so, or the clock runs out. Returns true while the mission runs.
     */
    *brawl(m, o) {
      const b = m.battle, g = o.hero;
      TK.control(m, Object.keys(b.story).find((k) => b.story[k] === g));
      const diff = SL.Settings.data.gameplay.difficulty;
      g.cannotDie = false;
      const foes = o.foes || [];
      const allies = o.allies || [];
      for (const f of [g, ...allies, ...foes.map((x) => x.f)]) {
        f.setHidden(false);
        f.untargetable = f.intangible = false;
        f.ringedOut = false;
        f.setState('free');
      }
      for (const x of foes) {
        x.f.cannotDie = true;
        x.f.target = g;
        x.f.controller = new SL.AIController(b, { difficulty: diff, profile: Object.assign({}, x.f.def.ai, (x.f.form && x.f.form.ai) || {}, { transformHp: 0 }, x.ai || {}) });
      }
      for (const a of allies) {
        a.cannotDie = true;
        a.target = foes.length ? foes[0].f : null;
        a.controller = new SL.AIController(b, { difficulty: diff, profile: Object.assign({}, a.def.ai, (a.form && a.form.ai) || {}, { transformHp: 0 }) });
      }
      g.target = foes.length ? foes[0].f : null;
      const sf = m.storyFight({
        floors: foes.map((x) => ({ f: x.f, at: x.floor })),
        dealt: foes.map((x) => ({ f: x.f, mul: x.dealt })).concat(o.heroDealt ? [{ f: g, mul: o.heroDealt }] : []),
        taken: foes.map((x) => ({ f: x.f, mul: x.taken })),
        ease: o.ease === false || !foes.length ? null : { foe: foes[0].f, hero: g, below: 0.4, min: 0.5 },
      });
      b.rules.ringOut = { fighters: [g] };
      let out = false;
      const offR = b.on('ringOut', (e) => {
        if (e.fighter === g) out = true;
      });
      m.limits({ revert: false });
      m.lock(false);
      b.aiLocked = false;
      let t = 0;
      // only the hero can be rung out: the CPU fighters stay over the platform (a foe floating out over the void
      // drew the hero after him and off the edge)
      const A = b.stage.arena, lim = A ? A.half - 1.5 : 0;
      const clock = () => {
        if (!b.inputLocked) t += 1 / 60;
        if (!A) return;
        for (const f of [...allies, ...foes.map((x) => x.f)]) {
          if (Math.abs(f.pos.x) <= lim && Math.abs(f.pos.z) <= lim) continue;
          f.setPosition(new V3(U.clamp(f.pos.x, -lim, lim), f.pos.y, U.clamp(f.pos.z, -lim, lim)));
          f.vel.x = f.vel.z = 0;
        }
      };
      m.tickHooks.push(clock);
      yield () => out || m.state !== 'running' || (foes.length && foes.every((x) => sf.floored(x.f))) || (o.seconds && t >= o.seconds) || (o.until && o.until(t));
      K.unhook(m, clock);
      offR();
      sf.off();
      b.rules.ringOut = null;
      g.cannotDie = true;
      m.lock(true);
      b.aiLocked = true;
      K.clearCombat(b);
      if (out && m.state === 'running') m.fail('ringout');
      return m.state === 'running';
    },
    /** The Grand Priest's ruling: "<name> of Universe N — eliminated." Then the flash that takes them to the stands. */
    *eliminate(m, f, opts = {}) {
      const b = m.battle, id = opts.id || f.def.id;
      yield* TK.priest(m, opts.line || (NAME[id] || f.def.name) + ' of Universe ' + (UNIVERSE[id] || '?') + ' — eliminated.', 2.8);
      const p = f.pos.clone();
      b.vfx.flash(p.clone().add(new V3(0, 1, 0)), 3, 0xeef4ff, 0.4, SL.Toon.tex.glow);
      b.sfx('teleport', f, { vol: 0.8 });
      if (SEATS[id]) TK.toSeat(m, id);
      else f.setHidden(true);
    },
    /** f thrown off the edge into the void along dir: an arc out over the drop, then falling away. */
    *fall(m, f, dir, opts = {}) {
      const b = m.battle, A = b.stage.arena;
      const d = dir.clone().setY(0).normalize();
      const from = f.pos.clone();
      // far enough along d to be past the edge
      const p = from.clone();
      let k = 0;
      while (Math.max(Math.abs(p.x), Math.abs(p.z)) < A.half + 6 && k < 120) {
        p.addScaledVector(d, 1);
        k++;
      }
      p.y = A.y - (opts.depth || 26);
      f.setState('scripted', { pose: opts.pose || 'tumble', expression: opts.expression || 'hurt', speed: 14 });
      const t0 = performance.now(), ms = opts.ms || 1500, h = opts.height === undefined ? 3 : opts.height;
      yield () => {
        const t = Math.min(1, (performance.now() - t0) / ms);
        const q = from.clone().lerp(p, t);
        q.y = U.lerp(from.y, p.y, t * t) + Math.sin(t * Math.PI) * h;
        f.setPosition(q);
        f.vel.set(0, 0, 0);
        return t >= 1;
      };
      f.ringedOut = true;
    },
    /** The halo of the dead over his head (Frieza fights this tournament on a one-day pass). */
    halo(f) {
      if (!f || f._halo) return;
      const j = f.model.joints && f.model.joints.head;
      if (!j) return;
      const geo = new THREE.TorusGeometry(0.12, 0.012, 6, 28);
      const mat = new THREE.MeshBasicMaterial({ color: 0xfff6c8 });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, (f.model.b ? f.model.b.headR : 0.12) * 2.1, 0);
      j.add(ring);
      f._halo = { ring, geo, mat };
      if (f.battle.mission) f.battle.mission.onDispose(() => TK.unhalo(f));
    },
    unhalo(f) {
      const h = f && f._halo;
      if (!h) return;
      if (h.ring.parent) h.ring.parent.remove(h.ring);
      h.geo.dispose();
      h.mat.dispose();
      f._halo = null;
    },
    /** The platform broken by the fighting: cracks across it and fallen slabs (scenery: nothing a fight catches on). */
    ruin(b, level = 1) {
      const st = b.stage, A = st.arena;
      if (!A || st._topRuin >= level) return;
      st._topRuin = level;
      const rng = U.mulberry32(4100 + level);
      for (let i = 0; i < 10 * level; i++) {
        const x = (rng() - 0.5) * A.half * 1.7, z = (rng() - 0.5) * A.half * 1.7;
        st.ringCrack(new V3(x, A.y, z), 2 + rng() * 4, 1, null);
      }
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = SL.Toon.mat(0xa29884);
      const g = new THREE.Group();
      for (let i = 0; i < 8 * level; i++) {
        const x = (rng() - 0.5) * A.half * 1.8, z = (rng() - 0.5) * A.half * 1.8;
        if (Math.hypot(x, z) < 12) continue;
        // low slabs: rubble you read and fight round, never a wall between the camera and the fight
        const s = 0.8 + rng() * 1.6;
        const m = new THREE.Mesh(geo, mat);
        m.scale.set(s * (1 + rng() * 0.8), s * 0.42, s);
        m.position.set(x, A.y + s * 0.2, z);
        m.rotation.set((rng() - 0.5) * 0.6, rng() * 6, (rng() - 0.5) * 0.6);
        SL.Toon.addOutline(m, 1.4);
        g.add(m);
      }
      st.scene.add(g);
      st.disposables.push(geo);
    },
    *priest(m, line, s = 2.8) {
      const b = m.battle, S = b.story;
      if (S.grandpriest) K.watcher(S.grandpriest, 'gp_announce', 'calm');
      m.say('grandpriest', line, s);
      yield* m.cine(s);
      if (S.grandpriest) K.watcher(S.grandpriest, 'gp_idle', 'calm');
    },
    cheer(m, on = true) {
      const S = m.battle.story;
      for (const z of [S.zeno, S.zeno2]) if (z) K.watcher(z, on ? 'zn_cheer' : 'zn_idle', on ? 'grin' : 'calm');
    },
    /** The stands react (see MOODS); null puts everyone back to how they watch. */
    mood(m, mood, ids) {
      const b = m.battle, S = b.story;
      const list = ids || [...b.top.seated];
      list.forEach((id, i) => {
        const f = S[id];
        if (!f || f.hidden) return;
        const w = WATCH[id] || ['idle', 'calm'];
        if (!mood || !MOODS[mood]) return K.watcher(f, w[0], w[1]);
        // the angels do not leave their composure; a shock only sharpens it
        if (COMPOSED.has(id)) return K.watcher(f, w[0], mood === 'shock' || mood === 'disbelief' ? 'serious' : 'calm');
        const o = MOODS[mood][i % 2];
        K.watcher(f, o[0], o[1]);
      });
      if (!ids) TK.cheer(m, mood === 'excitement' || mood === 'celebration');
    },
    /** A shot at a spectator group: the camera on one watcher's upper body. */
    react(m, id, line, s, opts) {
      const S = m.battle.story;
      if (!S[id]) return;
      SL.Cinema.shotOn(m, S, { subject: id, focus: 'upper', angle: 'three' }, 999, { cut: true, blendIn: 0, hold: true });
      if (line) m.say(opts && opts.speaker ? opts.speaker : id, line, s, opts);
    },
  });
})();
