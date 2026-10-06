/*
 * THE WORLD TOURNAMENT — a reusable system, not a mission.
 *
 *   SL.Tournament.bracket(entrants)     the draw as data: rounds, the current
 *                                       match, winners advancing, the eliminated,
 *                                       the champion. Entrants are plain ids, so a
 *                                       story, a Free Battle cup or an endgame
 *                                       tournament can all drive the same bracket.
 *   SL.Tournament.match(m, opts)        one match, played: the fighters are put on
 *                                       the ring, the announcer calls it, the fight
 *                                       runs under tournament rules (ring-out,
 *                                       knockout, and a judges' decision if a time
 *                                       limit is set), and the result comes back.
 *   SL.Tournament.announce(m, kind, d)  the announcer: one line, one shot on him or
 *                                       on the fighters, and the crowd reacting.
 *
 * Ring-outs are an engine rule (Battle._ringOutCheck, `rules.ringOut`): touching
 * the ground outside the ring, or dropping below its top outside it, ends it.
 * Nothing here reduces anybody's health to decide a match.
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;

  /* ---------------- the draw ---------------- */

  function bracket(entrants) {
    const B = {
      entrants: entrants.slice(),
      rounds: [],
      eliminated: [],
      champion: null,
      current() {
        for (const r of B.rounds) for (const mt of r) if (!mt.winner) return mt;
        return null;
      },
      /** Record the current match's result and move the winner on. */
      report(winner, how) {
        const mt = B.current();
        if (!mt) throw new Error('Tournament: the bracket is already decided');
        if (winner !== mt.a && winner !== mt.b) throw new Error('Tournament: ' + winner + ' is not in the current match');
        mt.winner = winner;
        mt.how = how || 'ko';
        B.eliminated.push(winner === mt.a ? mt.b : mt.a);
        advance();
        return mt;
      },
      roundOf(mt) {
        return B.rounds.findIndex((r) => r.includes(mt));
      },
      roundName(i) {
        const left = B.totalRounds - 1 - i;
        return left === 0 ? 'Final' : left === 1 ? 'Semi-final' : 'Round ' + (i + 1);
      },
    };
    const pairUp = (ids) => {
      const out = [];
      for (let i = 0; i < ids.length; i += 2) {
        const a = ids[i], b = ids[i + 1] || null;
        // an odd entrant goes through on a bye
        out.push({ a, b, winner: b ? null : a, how: b ? null : 'bye' });
      }
      return out;
    };
    function advance() {
      const last = B.rounds[B.rounds.length - 1];
      if (last.some((mt) => !mt.winner)) return;
      if (last.length === 1) {
        B.champion = last[0].winner;
        return;
      }
      B.rounds.push(pairUp(last.map((mt) => mt.winner)));
      advance();
    }
    B.totalRounds = Math.max(1, Math.ceil(Math.log2(Math.max(2, entrants.length))));
    B.rounds.push(pairUp(entrants));
    advance();
    return B;
  }

  /* ---------------- the announcer ---------------- */

  const LINES = {
    intro: (d) => (d.round ? d.round + '! ' : 'Next match! ') + d.a + ' versus ' + d.b + '!',
    begin: () => 'Begin!',
    ringout: (d) => d.loser + ' is out of the ring! The winner is ' + d.winner + '!',
    ko: (d) => d.loser + ' is down — and not getting up! The winner is ' + d.winner + '!',
    decision: (d) => 'Time! The judges give it to ' + d.winner + '!',
    forfeit: (d) => d.loser + ' forfeits! ' + d.winner + ' goes through!',
    champion: (d) => 'Your champion — ' + d.winner + '!',
  };
  const nameOf = (f) => (typeof f === 'string' ? f : f.def.name);

  /**
   * One announcer beat: the line (subtitled, voiced through the dialogue system),
   * a shot, and the crowd. `wait` false says it over the fight without stopping it.
   */
  function* announce(m, kind, d = {}, opts = {}) {
    const b = m.battle, L = b.stage.landmarks || {};
    const data = Object.assign({}, d);
    for (const k of ['a', 'b', 'winner', 'loser']) if (data[k] && typeof data[k] !== 'string') data[k] = nameOf(data[k]);
    const line = LINES[kind] ? LINES[kind](data) : String(d.line || '');
    const secs = opts.seconds || Math.min(4.2, 1.6 + line.length * 0.035);
    m.say('announcer', line, secs, { style: kind === 'begin' ? 'shout' : undefined });
    b.emit('announce', { kind, line });
    if (b.stage.cheer) b.stage.cheer(kind === 'begin' ? 0.5 : kind === 'intro' ? 0.7 : 1);
    if (opts.wait === false) return;
    if (opts.shot !== false && L.announcer) {
      const ann = L.announcer.clone();
      const on = kind === 'intro' && d.a && d.b && d.a.chest ? null : ann;
      m.shot((t, out) => {
        if (on) {
          // from his side of the ring's edge, never across it (the ring's lip would hide him)
          out.pos.set(on.x - 1.8, on.y + 1.75, on.z + 2.6 - t * 0.4);
          out.look.set(on.x, on.y + 1.35, on.z);
          out.fov = 40;
        } else {
          // the two of them across the ring, from the announcer's side
          const pa = d.a.chest(), pb = d.b.chest();
          const mid = pa.clone().lerp(pb, 0.5);
          out.pos.set(mid.x + 9 - t * 1.2, mid.y + 2.2, mid.z + 1.5);
          out.look.copy(mid);
          out.fov = 44;
        }
      }, secs + 0.2, { cut: true, blendIn: 0 });
    }
    yield* m.cine(secs + 0.2);
  }

  /* ---------------- one match ---------------- */

  /**
   * opts:
   *   a, b         the two fighters (a is placed at +z, b at -z)
   *   player       which of them the player controls (or none: both are CPU)
   *   round        a label for the introduction ("Final", "Round 1")
   *   intro        announce the match (default true)
   *   judges       seconds before a judges' decision (0 = no limit)
   *   ai           AI profile for the CPU side(s)
   *   difficulty   AI difficulty
   *   fresh        restore health and ki before the match (default true)
   *   keepPlaces   leave the fighters where they stand (resuming a match)
   *   ringOut      false: nobody can be rung out (a match the story ends another way);
   *                an array: only those fighters can be (the other one flies back in)
   *   begin        call "Begin!" (default true; false resumes a match the story paused)
   *   keepStates   leave both fighters in whatever state they are in (a knockback already
   *                under way when the match resumes)
   *   keepShot     leave the story camera running when control is handed back
   *   onStart(m)   after the fighters are on the ring, before "Begin!"
   *   during(m)    called every frame of the fight; return a result object to end it. A result
   *                with `pause: true` ends the STRETCH, not the match: no result poses, no
   *                matchEnd, no call — the story takes over and resumes the match afterwards
   * returns { winner, loser, how }
   */
  function* match(m, o) {
    const b = m.battle, A = b.stage.arena;
    if (!A) throw new Error('Tournament.match needs an arena stage');
    const { a, b: c } = o;
    m.lock(true);
    if (b.clash.active) b.clash._abort();
    for (const pr of b.projectiles.list) b.projectiles._explode(pr, true);
    for (const bm of b.projectiles.beams) bm.dispose();
    const off = A.half * 0.45;
    const place = (f, z, yaw) => {
      f.setHidden(false);
      f.untargetable = false;
      f.alive = true;
      f.ringedOut = false;
      f.cannotDie = true; // a knockout is a count, not a death
      if (o.fresh !== false) {
        f.hp = f.hpMax;
        f.ki = Math.max(f.ki, f.kiMax * 0.5);
        f.stamina = f.staminaMax;
      }
      f.setPosition(new V3(0, A.y, z));
      f.vel.set(0, 0, 0);
      f.fallVel = 0;
      f.grounded = true;
      f.yaw = f.prevYaw = yaw;
      f.setState('scripted', { pose: 'idle', expression: 'calm' });
    };
    if (o.keepPlaces) {
      // resuming a paused match: everybody stays where the story left them
      for (const f of [a, c]) {
        f.setHidden(false);
        f.untargetable = false;
        f.ringedOut = false;
        f.cannotDie = true;
      }
    } else {
      place(a, off, Math.PI);
      place(c, -off, 0);
    }
    a.target = c;
    c.target = a;
    if (o.player) b.switchPlayer(o.player, { force: true });
    for (const f of [a, c]) {
      if (f === o.player) continue;
      f.controller = new SL.AIController(b, { difficulty: o.difficulty || 'normal', profile: o.ai || undefined });
      f.target = f === a ? c : a;
    }
    if (o.intro !== false) yield* announce(m, 'intro', { a, b: c, round: o.round });
    if (o.onStart) o.onStart(m);
    if (!o.keepStates) for (const f of [a, c]) f.setState('free');
    b.rules.ringOut = o.ringOut === false ? null : { fighters: Array.isArray(o.ringOut) ? o.ringOut.slice() : [a, c] };
    if (!o.keepShot) m.endShot();
    m.lock(false);
    b.aiLocked = false;
    if (o.begin !== false) yield* announce(m, 'begin', {}, { wait: false });
    let result = null, frames = 0;
    const offR = b.on('ringOut', (e) => {
      if (result || (e.fighter !== a && e.fighter !== c)) return;
      const loser = e.fighter;
      result = { winner: loser === a ? c : a, loser, how: 'ringout' };
    });
    const hook = () => {
      if (result || b.inputLocked) return;
      frames++;
      if (o.during) {
        const r = o.during(m, frames);
        if (r) {
          result = r;
          return;
        }
      }
      for (const f of [a, c]) {
        if (f.hp <= 1 || !f.alive) {
          result = { winner: f === a ? c : a, loser: f, how: 'ko' };
          return;
        }
      }
      if (o.judges && frames >= o.judges * 60) {
        const winner = a.hpFrac >= c.hpFrac ? a : c;
        result = { winner, loser: winner === a ? c : a, how: 'decision' };
      }
    };
    m.tickHooks.push(hook);
    yield () => !!result;
    const i = m.tickHooks.indexOf(hook);
    if (i >= 0) m.tickHooks.splice(i, 1);
    if (offR) offR();
    b.rules.ringOut = null;
    m.lock(true);
    b.aiLocked = true;
    // a stretch the story ends: the match is not over, so nobody is posed and nothing is called
    if (result.pause) return result;
    for (const bm of b.projectiles.beams) bm.dispose();
    const loserPose = result.how === 'ringout' ? 'knockdown' : 'knockdown';
    result.loser.setState('scripted', { pose: loserPose, expression: 'ko', aura: 0 });
    result.winner.setState('scripted', { pose: (result.winner.def.victory && result.winner.def.victory.poses && result.winner.def.victory.poses[0]) || 'idle', expression: 'calm' });
    b.emit('matchEnd', { winner: result.winner, loser: result.loser, how: result.how });
    // the result, from the announcer, over a shot of the winner
    const w = result.winner;
    m.shot((t, out) => {
      const cw = w.chest();
      out.pos.copy(cw).addScaledVector(w.forward, 3.4 - t * 0.6).add(new V3(1.2, 0.6, 0));
      out.look.copy(cw).add(new V3(0, 0.2, 0));
      out.fov = 42;
    }, 3.6, { cut: true, blendIn: 0 });
    // a result the story ends by itself ('held', 'story') is called by the mission, not here
    if (LINES[result.how]) yield* announce(m, result.how, { winner: w, loser: result.loser }, { shot: false, seconds: 3.4 });
    return result;
  }

  /* ---------------- the draw on screen ---------------- */

  const NAMES = { pintar: 'Pintar', mighty_mask: 'Mighty Mask', shin: 'Shin' };
  const label = (id) => (SL.data.characters[id] && SL.data.characters[id].name) || NAMES[id] || id;

  /**
   * A small card with the draw: every match of every round, winners lit, the
   * current match marked. It is the bracket at a glance, not a paragraph; the
   * mission shows it while the announcer talks and hides it for the fight.
   */
  function showBracket(m, B) {
    hideBracket();
    try {
      if (typeof document === 'undefined' || !document.body) return null;
      const el = document.createElement('div');
      el.id = 'sl-bracket';
      el.setAttribute('style', 'position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:30;display:flex;gap:18px;padding:10px 16px;background:rgba(12,14,24,0.78);border:1px solid rgba(255,220,120,0.5);border-radius:6px;font:600 12px/1.35 sans-serif;color:#e8e4dc;pointer-events:none;');
      const cur = B.current();
      B.rounds.forEach((round, i) => {
        const col = document.createElement('div');
        const head = document.createElement('div');
        head.textContent = B.roundName(i).toUpperCase();
        head.setAttribute('style', 'color:#ffd36a;margin-bottom:4px;letter-spacing:1px;');
        col.appendChild(head);
        for (const mt of round) {
          const row = document.createElement('div');
          const now = mt === cur;
          row.setAttribute('style', 'margin:2px 0;padding:2px 6px;border-radius:3px;' + (now ? 'background:rgba(255,211,106,0.25);' : ''));
          const who = (id) => (mt.winner === id ? '<b style="color:#fff">' + label(id) + '</b>' : mt.winner ? '<s style="opacity:.55">' + label(id) + '</s>' : label(id));
          row.innerHTML = mt.b ? who(mt.a) + ' · ' + who(mt.b) : who(mt.a) + ' · bye';
          col.appendChild(row);
        }
        el.appendChild(col);
      });
      document.body.appendChild(el);
      if (m && m.onDispose) m.onDispose(hideBracket);
      return el;
    } catch (e) {
      return null;
    }
  }
  function hideBracket() {
    try {
      const el = typeof document !== 'undefined' && document.getElementById && document.getElementById('sl-bracket');
      if (el && el.remove) el.remove();
    } catch (e) {
      /* headless */
    }
  }

  SL.Tournament = { bracket, match, announce, showBracket, hideBracket, label, LINES };
})();
