/*
 * Mission bot (dev tool). Plays story missions end-to-end in the browser with
 * the scripted brains from tools/mission_brains.js (the same brains the
 * headless Node tests use), skipping cutscenes.
 *
 * Usage (browser console, game page):
 *   const s = document.createElement('script'); s.src = 'tools/missionbot.js'; document.body.appendChild(s);
 *   const report = await MissionBot.run('saiyan_kingkai', { timeoutSec: 240 });
 */
(function () {
  'use strict';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function loadBrains() {
    if (window.MissionBrains) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'tools/mission_brains.js?' + Date.now();
      s.onload = res;
      s.onerror = rej;
      document.body.appendChild(s);
    });
  }

  async function run(missionId, opts = {}) {
    await loadBrains();
    const G = SL.App;
    const prev = G.battle;
    G.startMission(missionId, { startPhase: opts.startPhase || 0 });
    let b;
    for (let i = 0; i < 100 && (!(b = G.battle) || b === prev || !b.mission); i++) await sleep(100);
    const m = b.mission, p = m.player;
    const { log } = window.MissionBrains.attach(SL, b, missionId, opts);
    const skipper = setInterval(() => {
      if (opts.skipCines !== false && G.battle === b && b.inputLocked) b.skipRequested = true;
    }, 200);
    const t0 = performance.now();
    while (performance.now() - t0 < (opts.timeoutSec || 240) * 1000) {
      if (G.battle !== b || document.querySelector('.results.show')) break;
      await sleep(250);
    }
    clearInterval(skipper);
    return { mission: missionId, seconds: +((performance.now() - t0) / 1000).toFixed(1), finished: !!document.querySelector('.results.show'), missionTime: +m.time.toFixed(1), log, record: SL.Save.missionResult(missionId), player: { hp: Math.round(p.hp), strain: Math.round(p.strain || 0) } };
  }

  window.MissionBot = { run };
})();
