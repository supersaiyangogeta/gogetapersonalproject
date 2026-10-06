// Encounter probe (dev tool): plays a story phase with a simple human-like player
// and measures how readable the fight is — not whether a perfect bot can win.
//
// Usage: node tools/encounter_probe.js <missionId> <startPhase> [seconds] [seed] [skill]
//   skill: novice (default) | average
//
// Reports per run: damage taken per 10 s, the share of hits that came from
// attackers outside the camera view, how many different enemies hit the player
// within any 2-second window (dogpiling), the longest chain of hits taken
// without a gap (stun lock), incoming ki blasts per 10 s, time spent stunned,
// and whether the player was knocked out.
const H = require('../tests/headless');
const [missionId = 'prologue_final_stand', phaseStr = '1', secStr = '60', seedStr = '1', skill = 'novice'] = process.argv.slice(2);

function run(seed) {
  const g = H.create({ quiet: true, seed });
  const { SL, THREE } = g;
  // the probe bot rolls on the same seeded generator as the engine, so a run is reproducible
  const rnd = () => g.ctx.Math.random();
  const b = g.mission(missionId, { startPhase: +phaseStr });
  // follow whoever the player controls (party battles switch heroes)
  let p = b.player;
  const out = { hits: 0, dmg: 0, offscreen: 0, blasts: 0, maxAttackersIn2s: 0, longestChain: 0, stunFrames: 0, frames: 0, ko: false, kills: 0, phaseAtEnd: 0, heroesDown: 0, switches: 0, allyDmg: 0 };
  const recent = []; // [frame, attacker]
  let chain = 0, lastHit = -999;
  b.on('damage', (e) => {
    // party battles: how the enemies' damage is shared between the controlled hero and the CPU allies
    if (!e.blocked && e.target && e.target !== b.player && e.attacker && e.target.team === b.player.team) out.allyDmg += e.amount;
    if (e.target !== b.player || e.blocked) return;
    out.hits++;
    out.dmg += e.amount;
    if (e.attacker) {
      recent.push([b.frame, e.attacker]);
      // outside the camera view: more than ~50 degrees off the camera's forward direction
      const cam = b.camera;
      const fwd = cam.look.clone().sub(cam.pos).normalize();
      const to = e.attacker.chest().sub(cam.pos).normalize();
      if (fwd.dot(to) < Math.cos((50 * Math.PI) / 180)) out.offscreen++;
    }
    if (b.frame - lastHit < 45) chain++;
    else chain = 1;
    lastHit = b.frame;
    out.longestChain = Math.max(out.longestChain, chain);
  });
  b.on('ko', (e) => {
    if (e.fighter && e.fighter.team === b.player.team) {
      if (e.fighter === b.player) out.heroesDown++;
    } else if (e.fighter && e.fighter.team !== p.team) out.kills++;
  });
  // a human-like player: engages the locked target, sometimes guards incoming blasts,
  // sometimes bursts out of a combo; reacts late and makes mistakes
  const react = skill === 'average' ? { guard: 0.45, burst: 0.35, delay: 14 } : { guard: 0.2, burst: 0.12, delay: 22 };
  const st = {};
  let guardUntil = 0;
  const ctl = {
    update: () => {
      const it = SL.emptyIntent();
      if (b.inputLocked) return it;
      it.camYaw = b.cameraYaw();
      const n = (st.n = (st.n || 0) + 1);
      if (p.state === 'hitstun' && p.stateFrame === react.delay && rnd() < react.burst) {
        it.dodge = true;
        return it;
      }
      const incoming = b.projectiles.list.find((pr) => pr.alive && pr.team !== p.team && pr.pos.distanceTo(p.chest()) < 9);
      if (incoming && !incoming._probeSeen) {
        incoming._probeSeen = true;
        if (rnd() < react.guard) guardUntil = b.frame + react.delay + 20;
      }
      if (b.frame < guardUntil && b.frame > guardUntil - 20) {
        it.guard = true;
        return it;
      }
      const t = p.target;
      if (!t || !t.alive) return it;
      const d = p.distTo(t);
      it.my = d > 2.3 ? 1 : 0;
      it.boost = d > 12;
      if (t.pos.y - p.pos.y > 1.2) it.up = true;
      else if (p.pos.y - t.pos.y > 1.2) it.down = true;
      if (d < 2.8) {
        const k = n % 50;
        if (k === 0 || k === 12 || k === 24) it.light = true;
        if (k === 36) it.heavy = true;
      } else if (d > 14 && n % 45 === 0) it.blast = true;
      return it;
    },
  };
  const attach = () => {
    p = b.player;
    p.controller = ctl;
  };
  attach();
  const frames = +secStr * 60;
  for (let i = 0; i < frames; i++) {
    g.step(b, 1);
    if (b.player !== p) {
      out.switches++;
      attach();
    }
    if (b.inputLocked) b.skipRequested = true;
    if (!b.inputLocked && b.phase === 'fight') out.frames++;
    if (['hitstun', 'knockback', 'knockdown', 'getup', 'guardBreak', 'stagger'].includes(p.state)) out.stunFrames++;
    for (const pr of b.projectiles.list) if (!pr._probeCounted && pr.team !== p.team) {
      pr._probeCounted = true;
      out.blasts++;
    }
    while (recent.length && b.frame - recent[0][0] > 120) recent.shift();
    out.maxAttackersIn2s = Math.max(out.maxAttackersIn2s, new Set(recent.map((r) => r[1])).size);
    const partyUp = b.party && b.party.length ? b.party.some((h) => h.alive && !h.benched && h.hp > 1) : p.alive && p.hp > 1;
    if (!partyUp) out.ko = true;
    if (!partyUp || b.mission.state !== 'running') break;
  }
  out.phaseAtEnd = b.mission.phaseIndex;
  out.state = b.mission.state;
  out.hpLeft = Math.round((p.hp / p.hpMax) * 100);
  out.hpMax = p.hpMax;
  out.seconds = +(out.frames / 60).toFixed(1);
  b.dispose();
  return out;
}

const runs = [1, 2, 3, 4].map((k) => run(+seedStr * 10 + k));
const avg = (k) => runs.reduce((a, r) => a + r[k], 0) / runs.length;
const per10 = (k) => (runs.reduce((a, r) => a + r[k], 0) / Math.max(1, runs.reduce((a, r) => a + r.seconds, 0))) * 10;
console.log(`${missionId} from phase ${phaseStr}, ${skill} player, ${runs.length} runs of up to ${secStr}s`);
console.log(`  damage taken per 10 s: ${Math.round(per10('dmg'))} (${(per10('dmg') / runs[0].hpMax * 100).toFixed(1)}% of the player's starting fighter's health)`);
if (runs.some((r) => r.allyDmg > 0)) console.log(`  share of enemy damage taken by the controlled hero (rest by CPU allies): ${Math.round((avg('dmg') / Math.max(1, avg('dmg') + avg('allyDmg'))) * 100)}%`);
console.log(`  hits from outside the camera view: ${Math.round((avg('offscreen') / Math.max(1, avg('hits'))) * 100)}%`);
console.log(`  most different enemies hitting within 2 s: ${runs.map((r) => r.maxAttackersIn2s).join(', ')}`);
console.log(`  longest hit chain without a 0.75 s gap: ${runs.map((r) => r.longestChain).join(', ')}`);
console.log(`  enemy ki blasts per 10 s: ${per10('blasts').toFixed(1)}; time stunned ${Math.round((avg('stunFrames') / Math.max(1, avg('frames'))) * 100)}%`);
console.log(`  outcomes: ${runs.map((r) => (r.ko ? 'KO' : r.state) + ' @' + r.seconds + 's hp ' + r.hpLeft + '% kills ' + r.kills + ' heroes down ' + r.heroesDown + ' switches ' + r.switches + ' phase ' + r.phaseAtEnd).join(' | ')}`);
