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
      script: [press(2, { ult: true, ultHeld: true })],
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
    /* ---------- V0.2 Goku showcase ---------- */
    {
      name: 'Goku V0.2: light into heavy is a multi-hit flurry with a push finisher',
      p1: 'goku', p2: 'vegeta', ticks: 110,
      script: [press(1, { light: true }), press(13, { heavy: true })],
      check: (r) => r.moves.includes('flurry') && r.damageCount >= 5,
    },
    {
      name: 'Goku V0.2: 3 lights into heavy is Meteor Crash (teleports above, smashes down)',
      p1: 'goku', p2: 'vegeta', ticks: 150,
      script: [press(1, { light: true }), press(13, { light: true }), press(26, { light: true }), press(40, { heavy: true })],
      probe: (p, d, r) => {
        if (p.sd.move && p.sd.move.id === 'meteorCrash' && p.pos.y > d.pos.y + 2) r.custom.above = true;
      },
      check: (r) => r.moves.includes('meteorCrash') && r.custom.above && r.knocks.includes('smash'),
    },
    {
      name: 'Goku V0.2: heavy with both fighters airborne uses the aerial heavy set',
      p1: 'goku', p2: 'vegeta', ticks: 80,
      setupP1: (p) => {
        p.pos.y += 8;
        p.prevPos.copy(p.pos);
        p.grounded = false;
      },
      setupP2: (d) => {
        d.pos.y += 8;
        d.prevPos.copy(d.pos);
        d.grounded = false;
      },
      script: [press(2, { heavy: true })],
      check: (r) => r.moves.includes('airHammer'),
    },
    {
      name: 'Goku V0.2: Instant Transmission + Up reappears above; heavy becomes an axe smash',
      p1: 'goku', p2: 'vegeta', ticks: 90, distance: 18,
      script: [press(3, { s2: true, up: true }), press(20, { heavy: true })],
      probe: (p, d, r) => {
        if (p.followMode === 'above') r.custom.above = true;
      },
      check: (r) => r.custom.above && r.moves.includes('chaseAxe'),
    },
    {
      name: 'Goku V0.2: Instant Transmission + Forward reappears in front with a strike',
      p1: 'goku', p2: 'vegeta', ticks: 70, distance: 20,
      script: [press(3, { s2: true, my: 1 })],
      check: (r) => r.events.teleported >= 1 && r.moves.includes('cross') && r.damageCount >= 1,
    },
    {
      name: 'Goku V0.2: repeated Instant Transmission gets more expensive (fatigue)',
      p1: 'goku', p2: 'vegeta', ticks: 200, distance: 18, setupP1: (p) => (p.infiniteKi = true),
      script: [press(3, { s2: true }), press(70, { s2: true }), press(150, { s2: true })],
      probe: (p, d, r) => {
        r.custom.costs = r.custom.costs || [];
        const c = p.skillCost('special2');
        if (!r.custom.costs.includes(c)) r.custom.costs.push(c);
      },
      check: (r) => r.events.teleported >= 3 && Math.max(...r.custom.costs) > Math.min(...r.custom.costs),
    },
    {
      name: 'Goku V0.2: Kamehameha right after Instant Transmission is an Instant Kamehameha',
      p1: 'goku', p2: 'vegeta', ticks: 110, distance: 20,
      script: [press(3, { s2: true }), press(22, { s1: true, s1Held: true })].concat(hold(23, 30, { s1Held: true })),
      probe: (p, d, r) => {
        if (p.state === 'beamCharge' && p.sd.instant) r.custom.instant = true;
      },
      check: (r) => r.custom.instant && r.damageTypes.includes('beam'),
    },
    {
      name: 'Goku V0.2: a full Kamehameha charge climbs 3 tiers with callouts',
      p1: 'goku', p2: 'vegeta', ticks: 200, distance: 30,
      script: [press(2, { s1: true, s1Held: true })].concat(hold(3, 130, { s1Held: true })),
      probe: (p, d, r) => {
        if (p.state === 'beamCharge') r.custom.tier = Math.max(r.custom.tier || 0, p.sd.tier);
      },
      check: (r) => r.custom.tier === 3 && r.events.callout >= 4 && r.damageTypes.includes('beam'),
    },
    {
      name: 'Goku V0.2: charging in Kaioken raises it to x3 and x4',
      p1: 'goku', p2: 'vegeta', ticks: 190, distance: 25,
      script: [press(2, { transform: true })].concat(hold(45, 180, { charge: true })),
      probe: (p, d, r) => {
        r.custom.level = Math.max(r.custom.level || 0, p.formLevel);
      },
      check: (r) => r.formsSeen.includes('kaioken') && r.custom.level >= 2 && r.events.formLevel >= 2,
    },
    {
      name: 'Goku V0.2: Super Saiyan plays the full transformation event',
      p1: 'goku', p2: 'vegeta', ticks: 190, distance: 12,
      setupP1: (p) => p.applyForm(1),
      script: [press(2, { transform: true })],
      probe: (p, d, r, b) => {
        if (b.stage.mood && b.stage.mood.target > 0.5) r.custom.mood = true;
        if (p.anim.name === 'g_ssjRage') r.custom.rage = true;
      },
      check: (r) => r.formsSeen.includes('ssj') && r.finalForm === 'ssj' && r.custom.mood && r.custom.rage && r.events.transformBurst >= 1,
    },
    {
      name: 'Goku V0.2: holding the Spirit Bomb grows it bigger before release',
      p1: 'goku', p2: 'vegeta', ticks: 280, distance: 45,
      script: [press(2, { ult: true, ultHeld: true })].concat(hold(3, 262, { ultHeld: true })),
      probe: (p, d, r, b) => {
        for (const bm of b.projectiles.bombs) if (bm.state === 'flying') r.custom.radius = bm.radius;
      },
      check: (r) => r.events.bombLaunch >= 1 && r.custom.radius > 4.5,
    },
    {
      name: 'Goku V0.2: a beam meeting a flying Spirit Bomb starts a clash',
      p1: 'goku', p2: 'vegeta', ticks: 260, distance: 44,
      script: [press(2, { ult: true, ultHeld: true })].concat(hold(3, 84, { ultHeld: true })),
      p2Script: [press(96, { s1: true, s1Held: true })].concat(hold(97, 120, { s1Held: true })),
      check: (r) => r.events.clashStart >= 1,
    },
    {
      name: 'V0.2: a hit from behind plays the back-hit reaction',
      p1: 'goku', p2: 'vegeta', ticks: 40, distance: 2,
      setupP1: (p) => {
        p.yaw += Math.PI;
        p.target = null;
        p._manualNoTarget = true;
      },
      p2Script: [press(3, { light: true })],
      probe: (p, d, r) => {
        if (p.anim.name === 'hitBack') r.custom.back = true;
      },
      check: (r) => r.custom.back,
    },
    /* ---------- V0.2 Chapter 1 cast ---------- */
    {
      name: 'Raditz V0.2: light string into Double Axe smash',
      p1: 'raditz', p2: 'goku', ticks: 170,
      script: [press(1, { light: true }), press(14, { light: true }), press(28, { light: true }), press(43, { light: true }), press(62, { heavy: true })],
      check: (r) => ['backhand', 'straight', 'elbow', 'highKick', 'doubleAxe'].every((m) => r.moves.includes(m)) && r.knocks.includes('smash'),
    },
    {
      name: 'Raditz V0.2: Double Sunday fires and hits',
      p1: 'raditz', p2: 'goku', ticks: 150, distance: 24,
      script: [press(2, { s1: true, s1Held: true })].concat(hold(3, 30, { s1Held: true })),
      check: (r) => r.damageTypes.includes('beam'),
    },
    {
      name: 'Raditz V0.2: Saturday Crush hits',
      p1: 'raditz', p2: 'goku', ticks: 130, distance: 18,
      script: [press(2, { s2: true })],
      check: (r) => r.damageTypes.includes('ki'),
    },
    {
      name: 'V0.2: story-locked techniques cannot be used (Saiyan Saga Goku)',
      p1: 'goku', p2: 'raditz', ticks: 90, distance: 16,
      setupP1: (p) => (p.lockedSlots = { special2: true, ultimate: true, transform: true }),
      script: [press(3, { s2: true }), press(20, { ult: true, ultHeld: true }), press(40, { transform: true })],
      check: (r) => !r.events.teleported && !r.events.bombLaunch && !r.events.transformStart && r.formsSeen.length === 1,
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
        const r = { custom: {}, moves: [], knocks: [], events: {}, p1States: [], p2States: [], damageTypes: [], damageCount: 0, maxHits: 0, formsSeen: [], blastsSpawned: 0 };
        const listen = ['chase', 'throw', 'vanish', 'perfectGuard', 'guardBreak', 'burst', 'teleported', 'bombLaunch', 'transformStart', 'transformBurst', 'callout', 'formLevel', 'clashStart'];
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
          if (sc.probe) sc.probe(p, d, r, b);
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
            resolve({ scenario: sc.name, pass, detail: pass ? '' : JSON.stringify({ custom: r.custom, moves: r.moves, knocks: r.knocks, events: r.events, p1: r.p1States, p2: r.p2States, dmg: r.damageTypes.slice(0, 6), forms: r.formsSeen }) });
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
