/*
 * Combat Lab — deterministic in-engine tests for gameplay that needs the
 * renderer. Button presses are scripted on exact simulation frames, so the
 * results do not depend on browser timer throttling.
 *
 * Usage (browser console on index.html):
 *   const s = document.createElement('script'); s.src = 'tools/lab.js'; document.body.appendChild(s);
 *   // then: SLLab.runAll().then(r => console.table(r))
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;

  function press(frame, intent) {
    return { f: frame, i: intent };
  }
  function hold(from, to, intent) {
    const out = [];
    for (let f = from; f <= to; f++) out.push({ f, i: intent });
    return out;
  }

  const SCENARIOS = [
    {
      name: 'Vegeta: light, light, heavy launches; heavy again chases and smashes',
      p1: 'vegeta', p2: 'bardock', ticks: 150,
      script: [press(1, { light: true }), press(13, { light: true }), press(25, { heavy: true }), press(50, { heavy: true })],
      check: (r) => r.moves.includes('hook') && r.moves.includes('risingKnee') && r.knocks.includes('launch') && r.events.chase >= 1 && r.moves.includes('chaseSmash'),
    },
    {
      name: 'Goku: 4-hit light string into spinning heel finisher',
      p1: 'goku', p2: 'vegeta', ticks: 170,
      script: [press(1, { light: true }), press(13, { light: true }), press(26, { light: true }), press(40, { light: true }), press(58, { heavy: true })],
      check: (r) => ['jab', 'cross', 'elbow', 'roundhouse', 'spinHeel'].every((m) => r.moves.includes(m)) && r.maxHits >= 5,
    },
    {
      name: 'Heavy guard-crush breaks a guarding dummy',
      p1: 'bardock', p2: 'goku', dummy: 'guard', ticks: 200, setupP2: (d) => (d.stamina = 25),
      script: [press(5, { heavy: true })],
      check: (r) => r.events.guardBreak >= 1,
    },
    {
      name: 'Guard + Heavy throws a guarding opponent',
      p1: 'goku', p2: 'vegeta', dummy: 'guard', ticks: 90,
      script: [press(5, { guard: true, heavy: true })],
      check: (r) => r.events.throw >= 1 && r.p2States.includes('knockback'),
    },
    {
      name: 'Dodge timed just before a hit vanishes behind the attacker',
      p1: 'goku', p2: 'vegeta', ticks: 80, distance: 2.2, p2Script: [press(5, { light: true })],
      script: [press(7, { dodge: true })],
      check: (r) => r.events.vanish >= 1,
    },
    {
      name: 'Guard pressed just before a hit is a Perfect Guard and staggers',
      p1: 'vegeta', p2: 'goku', ticks: 90, distance: 2.2, p2Script: [press(5, { light: true })],
      script: hold(6, 60, { guard: true }),
      check: (r) => r.events.perfectGuard >= 1 && r.p2States.includes('stagger'),
    },
    {
      name: 'Dodge during a long hitstun bursts free',
      p1: 'bardock', p2: 'vegeta', ticks: 120, p2Script: [press(3, { heavy: true })], setupP1: (p) => (p.stamina = 100),
      script: [press(24, { dodge: true })],
      check: (r) => r.events.burst >= 1 || r.p1States.includes('recover'),
    },
    {
      name: 'Goku Instant Transmission reappears behind the target',
      p1: 'goku', p2: 'vegeta', ticks: 60, distance: 20,
      script: [press(3, { s2: true })],
      check: (r) => r.events.teleported >= 1 && r.finalDistance < 4,
    },
    {
      name: 'Kamehameha charges, fires and hits for beam damage',
      p1: 'goku', p2: 'vegeta', ticks: 160, distance: 22,
      script: hold(2, 40, { s1: true, s1Held: true }).map((s, i) => (i === 0 ? s : { f: s.f, i: { s1Held: true } })),
      check: (r) => r.damageTypes.includes('beam'),
    },
    {
      name: 'Spirit Bomb charges above Goku, launches and explodes',
      p1: 'goku', p2: 'vegeta', ticks: 330, distance: 30,
      script: [press(2, { ult: true })],
      check: (r) => r.events.bombLaunch >= 1 && r.damageTypes.includes('explosion'),
    },
    {
      name: 'Vegeta Big Bang Attack hits',
      p1: 'vegeta', p2: 'goku', ticks: 120, distance: 18,
      script: [press(2, { s2: true })],
      check: (r) => r.damageTypes.includes('ki'),
    },
    {
      name: 'Vegeta Final Flash fires',
      p1: 'vegeta', p2: 'bardock', ticks: 200, distance: 30,
      script: [press(2, { ult: true })],
      check: (r) => r.damageTypes.includes('beam'),
    },
    {
      name: 'Bardock Riot Javelin hits',
      p1: 'bardock', p2: 'goku', ticks: 90, distance: 20,
      script: [press(2, { s1: true })],
      check: (r) => r.damageTypes.includes('ki'),
    },
    {
      name: 'Bardock Saiyan Assault rush lands its 3-hit sequence',
      p1: 'bardock', p2: 'goku', ticks: 160, distance: 14,
      script: [press(2, { s2: true })],
      check: (r) => r.p1States.includes('rush') && r.damageCount >= 4 && r.p2States.includes('knockback'),
    },
    {
      name: 'Bardock Final Spirit Cannon fires',
      p1: 'bardock', p2: 'vegeta', ticks: 180, distance: 30,
      script: [press(2, { ult: true })],
      check: (r) => r.damageTypes.includes('beam'),
    },
    {
      name: 'Goku transforms to Kaioken then Super Saiyan',
      p1: 'goku', p2: 'vegeta', ticks: 200,
      script: [press(2, { transform: true }), press(60, { transform: true })],
      check: (r) => r.formsSeen.includes('kaioken') && r.formsSeen.includes('ssj'),
    },
    {
      name: 'Vegeta transforms to Super Saiyan and powers down',
      p1: 'vegeta', p2: 'goku', ticks: 170,
      script: [press(2, { transform: true }), press(150, { revert: true })],
      check: (r) => r.formsSeen.includes('ssj') && r.finalForm === 'base',
    },
    {
      name: 'Tap ki blast fires; holding it releases a charged blast',
      p1: 'goku', p2: 'vegeta', ticks: 140, distance: 14,
      script: [press(2, { blast: true, blastHeld: true })].concat(hold(3, 50, { blastHeld: true })),
      check: (r) => r.blastsSpawned >= 2,
    },
    {
      name: 'Boost tap with direction dashes; light during dash is a dash attack',
      p1: 'vegeta', p2: 'goku', ticks: 60, distance: 16,
      script: [press(2, { boostPressed: true, boost: true, my: 1 }), press(5, { light: true })],
      check: (r) => r.p1States.includes('dash') && r.moves.includes('dashPunch'),
    },
    {
      name: 'Charging ki fills the ki bar',
      p1: 'bardock', p2: 'goku', ticks: 120, setupP1: (p) => (p.ki = 0),
      script: hold(2, 110, { charge: true }),
      check: (r) => r.finalKi > 60,
    },
  ];

  function run(sc) {
    return new Promise((resolve) => {
      const prev = SL.App.battle;
      SL.App.startTraining({
        p1: sc.p1, p1Form: 0, cpu: sc.p2, cpuForm: 0, stage: 'wasteland', dummy: sc.dummy || 'idle', difficulty: 'normal',
        infHp: true, infKi: false, infStamina: false, dummyInfHp: true,
      });
      const wait = () => {
        const b = SL.App.battle;
        if (!b || b === prev || b.phase !== 'fight') return setTimeout(wait, 50);
        const p = b.player, d = b.fighters[1];
        const dist = sc.distance || 3;
        p.setPosition(new V3(-dist / 2, b.stage.heightAt(-dist / 2, 0), 0));
        d.setPosition(new V3(dist / 2, b.stage.heightAt(dist / 2, 0), 0));
        p.grounded = d.grounded = true;
        p.target = d;
        d.target = p;
        p.faceTarget(100);
        d.faceTarget(100);
        p.ki = 100;
        d.ki = 100;
        if (sc.setupP1) sc.setupP1(p);
        if (sc.setupP2) sc.setupP2(d);
        const r = { moves: [], knocks: [], events: {}, p1States: [], p2States: [], damageTypes: [], damageCount: 0, maxHits: 0, formsSeen: [], blastsSpawned: 0 };
        const listen = ['chase', 'throw', 'vanish', 'perfectGuard', 'guardBreak', 'burst', 'teleported', 'bombLaunch', 'transformStart'];
        for (const n of listen) b.on(n, () => (r.events[n] = (r.events[n] || 0) + 1));
        b.on('damage', (e) => {
          if (e.attacker === p) {
            r.damageTypes.push(e.type);
            r.damageCount++;
          }
        });
        const start = b.frame;
        const mk = (script) => ({
          update: () => {
            const it = SL.emptyIntent();
            const n = b.frame - start;
            for (const s of script || []) if (s.f === n) Object.assign(it, s.i);
            return it;
          },
        });
        p.controller = mk(sc.script);
        if (sc.p2Script) d.controller = mk(sc.p2Script);
        const origTick = b.tick;
        b.tick = function () {
          origTick.call(b);
          const n = b.frame - start;
          if (p.sd.move && !r.moves.includes(p.sd.move.id)) r.moves.push(p.sd.move.id);
          if (d.sd.knock && !r.knocks.includes(d.sd.knock)) r.knocks.push(d.sd.knock);
          if (!r.p1States.includes(p.state)) r.p1States.push(p.state);
          if (!r.p2States.includes(d.state)) r.p2States.push(d.state);
          if (!r.formsSeen.includes(p.form.id)) r.formsSeen.push(p.form.id);
          r.maxHits = Math.max(r.maxHits, p.combo.hits);
          r.blastsSpawned = Math.max(r.blastsSpawned, b.projectiles.list.filter((x) => x.owner === p).length + (r._blastTotal || 0));
          if (b.projectiles.list.some((x) => x.owner === p && !x._counted)) {
            for (const x of b.projectiles.list) if (x.owner === p && !x._counted) {
              x._counted = true;
              r._blastTotal = (r._blastTotal || 0) + 1;
            }
            r.blastsSpawned = r._blastTotal;
          }
          if (n === sc.ticks) {
            b.tick = origTick;
            r.finalDistance = p.distTo(d);
            r.finalForm = p.form.id;
            r.finalKi = p.ki;
            let pass = false;
            try {
              pass = !!sc.check(r);
            } catch (e) {
              r.error = String(e);
            }
            resolve({ scenario: sc.name, pass, detail: pass ? '' : JSON.stringify({ moves: r.moves, knocks: r.knocks, events: r.events, p1: r.p1States, p2: r.p2States, dmg: r.damageTypes.slice(0, 6), forms: r.formsSeen }) });
          }
        };
      };
      setTimeout(wait, 200);
    });
  }

  window.SLLab = {
    SCENARIOS,
    run,
    async runAll(filter) {
      const out = [];
      SL.Audio.init();
      for (const sc of SCENARIOS) {
        if (filter && !sc.name.toLowerCase().includes(filter.toLowerCase())) continue;
        out.push(await run(sc));
      }
      window.__labResults = out;
      return out;
    },
  };
})();
