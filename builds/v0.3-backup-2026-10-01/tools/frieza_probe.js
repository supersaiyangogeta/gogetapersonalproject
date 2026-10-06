// Frieza fairness probe (dev tool): plays one Frieza fight phase with a HUMAN-SCALE player
// and measures whether the fight gives that player readable turns — not whether a perfect
// bot can win it.
//
// Usage: node tools/frieza_probe.js <missionId> <phaseId> [seconds] [runs] [reactionFrames]
//        node tools/frieza_probe.js free <formIndex> [seconds] [runs] [reactionFrames] [difficulty]
//
// The player bot sees Frieza only as he was `reactionFrames` ago (default 18, ~0.3 s): it
// sidesteps a technique once it has seen the tell, times a sidestep on an arriving saucer
// (±5 frames of error), guards when it has seen him coming in fast or a close strike start,
// attacks whenever it has seen an opening, and otherwise presses forward like a player does.
// PROBE_DEBUG=1 prints what Frieza and the player were doing before each string landed.
//
// Reports: Frieza's attack starts per minute, the longest run of attacks with no breath
// between them, clear openings per minute (the player free and Frieza quiet for 1 s), how long
// each technique shows its tell before it is dangerous, how often each one hits a player who
// reacted, how long he stays open after a whiffed strike and how often that is punished, how
// fast he answers a charge, how often he vanishes from a player attack, how far away and how
// far off camera he spends the fight, the damage the player takes (and from what), and how
// long the player spends below 15% health.
const H = require('../tests/headless');
const [missionId = 'namek_goku', phaseArg = 'base', secStr = '40', runStr = '4', reactStr = '18', diffArg = 'normal'] = process.argv.slice(2);
const REACT = +reactStr;
const PASSIVE = new Set(['free', 'guard', 'charge', 'dash', 'dodge', 'vanish', 'recover', 'recoverSpecial', 'hitstun', 'knockback', 'knockdown', 'getup', 'stagger', 'guardBreak', 'bossTaunt', 'transform', 'held', 'scripted', 'ko', 'teleport']);
const TELLS = new Set(['specialThrow', 'deathSaucer', 'scatter', 'bomberWave', 'eruption', 'beamCharge', 'rush']);
const OPEN = new Set(['recover', 'recoverSpecial', 'stagger', 'guardBreak', 'knockdown', 'getup', 'hitstun', 'bossTaunt', 'charge']);

function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}

function run(seed) {
  const g = H.create({ quiet: true, seed });
  const { SL } = g;
  const rnd = () => g.ctx.Math.random();
  let b;
  if (missionId === 'free') {
    b = g.battle({ p1: 'goku', p2: 'frieza', distance: 10, dummy: null, difficulty: diffArg });
    const fz0 = b.fighters[1];
    fz0.controller = new SL.AIController(b, { difficulty: diffArg });
    const form = +phaseArg || 0;
    if (form) {
      fz0.applyForm(form);
      fz0.mech.phase = form;
      fz0.bossPhaseCap = form;
    }
    b.player.cannotDie = true;
  } else {
    const def = SL.data.missions[missionId];
    const idx = def.phases.findIndex((p) => p.id === phaseArg);
    if (idx < 0) throw new Error('no phase ' + phaseArg + ' in ' + missionId + ': ' + def.phases.map((p) => p.id).join(','));
    b = g.mission(missionId, { startPhase: idx });
  }
  // let the phase's own staging run (titles, scenes) until the fight is live
  g.until(b, () => {
    if (b.inputLocked) b.skipRequested = true;
    return !b.inputLocked && b.phase === 'fight' && b.player && b.player.state !== 'scripted';
  }, 60 * 60);
  const p = b.player;
  const fz = b.fighters.find((f) => f.def.id === 'frieza' && f.alive && !f.hidden);
  const startPhase = b.mission ? b.mission.phaseIndex : 0;
  // a wrapper script may adjust the live fight before measuring (e.g. restore older tuning for a comparison)
  if (global.__friezaProbeHook) global.__friezaProbeHook({ SL, b, p, fz, missionId, phase: phaseArg });
  const out = {
    frames: 0, starts: 0, chains: [], openings: 0, techs: {}, whiffs: 0, whiffGaps: [], punished: 0,
    chargeAnswers: [], vanishes: 0, playerAttacks: 0, far: 0, maxDist: 0, offCam: 0, dmg: 0, hits: 0, landed: 0, offCamHits: 0, stun: 0,
    breaths: 0, critical: 0, half: null, hp0: p.hpFrac,
  };
  const tech = (k) => (out.techs[k] = out.techs[k] || { n: 0, tell: [], hit: 0, blocked: 0, dmg: 0 });
  b.on('aiBreath', (e) => e.fighter === fz && out.breaths++);
  let lastWhiff = -999, whiffPunished = true;
  b.on('damage', (e) => {
    if (e.target === fz && e.attacker === p && !e.blocked) {
      out.landed++;
      if (!whiffPunished && b.frame - lastWhiff < 60) {
        whiffPunished = true;
        out.punished++;
      }
    }
    if (e.target !== p || e.attacker !== fz) return;
    if (process.env.PROBE_DEBUG && e.type === 'melee' && !e.blocked && b.frame - (out._lastMelee || -99) > 60) {
      const h = seen.slice(-40).map((x) => x.state + (x.dist ? '@' + x.dist.toFixed(1) : ''));
      const compact = h.filter((x, i) => i === 0 || x.split('@')[0] !== h[i - 1].split('@')[0]);
      console.log('HIT', b.frame, 'p', pHist.slice(-40).filter((x, i, a) => i === 0 || x !== a[i - 1]).join('>'), '| fz', compact.join('>'));
    }
    if (e.type === 'melee') out._lastMelee = b.frame;
    const k = e.type === 'melee' || e.type === 'throw' ? 'melee' : e.source || e.type;
    if (e.blocked) tech(k).blocked++;
    else {
      tech(k).hit++;
      tech(k).dmg += e.amount;
      out.hits++;
      out.dmg += e.amount;
      const cam = b.camera;
      const fwd = cam.look.clone().sub(cam.pos).normalize();
      const to = fz.chest().sub(cam.pos).normalize();
      if (fwd.dot(to) < Math.cos((45 * Math.PI) / 180)) out.offCamHits++;
    }
  });

  // --- the human-scale player ---
  const seen = []; // Frieza as the player last saw him, `REACT` frames late
  const pHist = [];
  let dodgeUntil = 0, dodgeSide = 1, guardUntil = 0, n = 0, lastTell = -1;
  p.controller = {
    update: () => {
      const it = SL.emptyIntent();
      if (b.inputLocked) return it;
      n++;
      it.camYaw = b.cameraYaw ? b.cameraYaw() : 0;
      const v = seen.length > REACT ? seen[seen.length - 1 - REACT] : null;
      p.target = fz;
      const d = p.distTo(fz);
      if (!v) return it;
      // a tell it has now seen: step out of the line (once per tell)
      if (TELLS.has(v.state) && v.start !== lastTell) {
        lastTell = v.start;
        dodgeSide = rnd() < 0.5 ? 1 : -1;
        dodgeUntil = b.frame + (v.state === 'deathSaucer' ? 150 : 30);
        if (v.state === 'specialThrow' || v.state === 'rush') it.dodge = true;
      }
      // a Death Saucer about to arrive: a practiced player times a sidestep on it (time to
      // contact is something people judge well), with a few frames of error either way
      const disc = b.projectiles.list.find((pr) => pr.alive && pr.kind === 'disc' && pr.team !== p.team && !pr._dodged);
      if (disc) {
        const to = p.chest().sub(disc.pos);
        const ttc = (to.length() / disc.speed) * 60;
        if (disc.vel.clone().normalize().dot(to.normalize()) > 0.7 && ttc < 6 + (rnd() * 10 - 5)) {
          disc._dodged = true;
          it.dodge = true;
          it.mx = dodgeSide;
          return it;
        }
      }
      if (b.frame < dodgeUntil) {
        it.mx = dodgeSide;
        it.boost = true;
        if (v.state === 'deathSaucer' || fz.state === 'deathSaucer') it.up = n % 60 < 30;
        if (n % 40 === 0) dodgeSide *= -1;
        return it;
      }
      // a strike it has seen start, close enough to matter: guard
      if (v.state === 'attack' && v.frame <= 6 && d < 4.5) guardUntil = b.frame + 18;
      // he is seen coming in fast (closing more than 12 m/s, and inside 20 m): guard up, as a
      // player does against an approach — unless the player is already swinging
      const v2 = seen.length > REACT + 6 ? seen[seen.length - 7 - REACT] : null;
      if (v2 && v.dist < 20 && v2.dist - v.dist > 1.2 && v.dist > 2.5 && p.state !== 'attack') guardUntil = b.frame + 24;
      if (b.frame < guardUntil) {
        it.guard = true;
        return it;
      }
      const whiff = v.state === 'attack' && v.frame > v.startup + v.active + 2 && !v.hit;
      const open = whiff || OPEN.has(v.state);
      it.my = d > 2.2 ? 1 : 0;
      it.boost = d > 4;
      if (fz.pos.y - p.pos.y > 1.2) it.up = true;
      else if (p.pos.y - fz.pos.y > 1.2) it.down = true;
      if (d < 3 && (open || n % 70 < 40)) {
        const k = n % 36;
        if (k === 0 || k === 9 || k === 18) it.light = true;
        if (k === 27) it.heavy = true;
      } else if (d > 14) {
        if (p.ki < 30 && n % 200 < 60) {
          it.charge = true;
          it.my = 0;
        } else if (n % 40 === 0) it.blast = true;
      }
      return it;
    },
  };

  // --- measurement ---
  let prevState = fz.state, prevFrame = 0, quiet = 0, chain = 0, run = 0, whiffAt = -1, chargeAt = -1, prevP = p.state;
  const maxFrames = +secStr * 60;
  for (let i = 0; i < maxFrames; i++) {
    g.step(b, 1);
    if (b.inputLocked) {
      b.skipRequested = true;
      continue;
    }
    if (b.mission && (b.mission.phaseIndex !== startPhase || b.mission.state !== 'running')) break;
    if (b.phase !== 'fight') continue;
    out.frames++;
    seen.push({ dist: p.distTo(fz), state: fz.state, frame: fz.stateFrame, start: fz.frame - fz.stateFrame, startup: (fz.sd && fz.sd.startup) || 0, active: (fz.sd && fz.sd.move && fz.sd.move.active) || 0, hit: !!(fz.sd && fz.sd.hit) });
    if (seen.length > 90) seen.shift();
    pHist.push(p.state);
    if (pHist.length > 90) pHist.shift();
    const st = fz.state;
    const aggressive = !PASSIVE.has(st);
    // a new action is a new state, or the same state started again (the next strike of a string)
    const restarted = st !== prevState || fz.stateFrame < prevFrame;
    prevFrame = fz.stateFrame;
    if (restarted) {
      if (aggressive) {
        out.starts++;
        if (quiet < 45) chain++;
        else {
          if (chain) out.chains.push(chain);
          chain = 1;
        }
        if (whiffAt >= 0) {
          out.whiffGaps.push(b.frame - whiffAt);
          whiffAt = -1;
        }
        if (chargeAt >= 0 && b.frame - chargeAt < 180) {
          out.chargeAnswers.push(b.frame - chargeAt);
          chargeAt = -1;
        }
      }
      if (prevState === 'attack' && seen.length > 1 && !seen[seen.length - 2].hit) {
        out.whiffs++;
        whiffAt = b.frame;
        lastWhiff = b.frame;
        whiffPunished = false;
      }
      if (st === 'vanish' || st === 'dodge') out.vanishes++;
      if (TELLS.has(st)) tech(st).n++;
      prevState = st;
    }
    quiet = aggressive ? 0 : quiet + 1;
    if (p.state !== prevP) {
      if (p.state === 'attack') out.playerAttacks++;
      if (p.state === 'charge') chargeAt = b.frame;
      prevP = p.state;
    }
    // the moment a Frieza projectile is born: how long its tell was on screen
    for (const pr of b.projectiles.list) {
      if (pr.owner !== fz || pr._probe) continue;
      pr._probe = true;
      if (!pr.name) pr.name = pr.kind === 'disc' ? 'Death Saucer' : 'Ki Blast';
      tech(pr.name).n++;
      tech(pr.name).tell.push(fz.stateFrame + Math.round((pr.pos.distanceTo(p.chest()) / pr.speed) * 60));
    }
    const free = ['free', 'guard', 'charge', 'dash'].includes(p.state);
    if (free && !aggressive && !b.projectiles.list.some((pr) => pr.alive && pr.owner === fz)) {
      run++;
      if (run === 60) out.openings++;
    } else run = 0;
    const d = p.distTo(fz);
    if (d > 20) out.far++;
    out.maxDist = Math.max(out.maxDist, d);
    const cam = b.camera;
    const fwd = cam.look.clone().sub(cam.pos).normalize();
    if (fwd.dot(fz.chest().sub(cam.pos).normalize()) < Math.cos((45 * Math.PI) / 180)) out.offCam++;
    if (['hitstun', 'knockback', 'knockdown', 'getup', 'guardBreak', 'stagger'].includes(p.state)) out.stun++;
    if (p.hpFrac < 0.15) out.critical++;
    if (out.half === null && p.hpFrac < out.hp0 * 0.5) out.half = out.frames / 60;
  }
  if (chain) out.chains.push(chain);
  out.hpMax = p.hpMax;
  out.errors = g.errors.length;
  b.dispose();
  return out;
}

const runs = [];
for (let k = 1; k <= +runStr; k++) runs.push(run(k * 7));
const secs = runs.reduce((a, r) => a + r.frames, 0) / 60 || 1;
const sum = (k) => runs.reduce((a, r) => a + r[k], 0);
const perMin = (k) => ((sum(k) / secs) * 60).toFixed(1);
const all = (k) => runs.reduce((a, r) => a.concat(r[k]), []);
console.log(`${missionId} / ${phaseArg}: ${runs.length} runs, ${secs.toFixed(0)} s of fight, player reaction ${REACT} frames`);
console.log(`  Frieza attack starts/min ${perMin('starts')} · breaths/min ${perMin('breaths')} · longest pressure chain ${Math.max(0, ...all('chains'))} (median ${median(all('chains'))})`);
console.log(`  clear 1 s openings/min ${perMin('openings')} · player hits landed/min ${perMin('landed')} · player attacks/min ${perMin('playerAttacks')}`);
console.log(`  whiffs ${sum('whiffs')}, gap after a whiff (frames) median ${median(all('whiffGaps'))}, punished ${sum('punished')}`);
console.log(`  vanishes from player attacks ${sum('vanishes')} / ${sum('playerAttacks')} attacks · answers to a charge (frames) ${JSON.stringify(all('chargeAnswers').slice(0, 12))}`);
console.log(`  time > 20 m away ${((sum('far') / Math.max(1, sum('frames'))) * 100).toFixed(0)}% · max ${Math.max(...runs.map((r) => r.maxDist)).toFixed(0)} m · off camera ${((sum('offCam') / Math.max(1, sum('frames'))) * 100).toFixed(0)}% · hits from off camera ${sum('offCamHits')}/${sum('hits')}`);
console.log(`  player health: starts ${Math.round(runs[0].hp0 * 100)}%, halved after ${runs.map((r) => (r.half === null ? 'never' : r.half.toFixed(0) + ' s')).join(' / ')}, below 15% for ${((sum('critical') / Math.max(1, sum('frames'))) * 100).toFixed(0)}% of the fight`);
console.log(`  damage taken per 10 s ${((sum('dmg') / secs) * 10 / runs[0].hpMax * 100).toFixed(1)}% of max · stunned ${((sum('stun') / Math.max(1, sum('frames'))) * 100).toFixed(0)}% · errors ${sum('errors')}`);
const techs = {};
for (const r of runs) for (const [k, t] of Object.entries(r.techs)) {
  const o = (techs[k] = techs[k] || { n: 0, tell: [], hit: 0, blocked: 0, dmg: 0 });
  o.n += t.n;
  o.tell.push(...t.tell);
  o.hit += t.hit;
  o.blocked += t.blocked;
  o.dmg += t.dmg;
}
for (const [k, t] of Object.entries(techs)) console.log(`  ${k}: used ${t.n}, hit ${t.hit}, blocked ${t.blocked}, ${Math.round((t.dmg / Math.max(1, sum('dmg'))) * 100)}% of damage${t.tell.length ? ', frames from tell to impact: median ' + median(t.tell) + ', min ' + Math.min(...t.tell) : ''}`);
