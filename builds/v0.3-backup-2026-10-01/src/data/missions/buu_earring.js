/*
 * CHAPTER 13 — BUU SAGA: VEGITO
 * Mission "The Earring" (canon; played as Goku, then as Gohan). Goku comes back to Earth just in
 * time — and then everything that could go wrong with two small earrings does.
 *
 *   ARRIVE   (scene)       Buutenks over a beaten Gohan, a sphere of pink ki overhead; a shimmer:
 *                          Goku, alive, no halo; Super Saiyan; the disc on the flat of his hand
 *                          (a cue: throw it)
 *   DISC     (scene)       the Destructo Disc through the waist — Buutenks in two halves, a piece of
 *                          him spattering off behind the rocks; he pulls himself back together...
 *   DEFUSE   (scene)       ...and it goes wrong inside him: Gotenks' thirty minutes are up. The body
 *                          heaves, steams, flickers between two shapes: the vest is gone, PICCOLO'S
 *                          CAPE AND GI are on him, the antenna shrunk — Buuccolo. Goku laughs at him
 *                          and powers down. "Gohan! Catch! Your left ear!" (a cue: toss it)
 *   FUMBLE   (scene)       it slips through Gohan's fingers into the rubble
 *   SEARCH   (checkpoint)  as Gohan: on your knees in the dirt, find the earring (the disturbed spots
 *                          glint). Meanwhile, if you look, a pink worm is crawling through the rocks
 *                          towards you...
 *   AMBUSH   (scene)       Buuccolo perfectly still in Piccolo's cape, steering it; the sheet rears
 *                          up behind Gohan and wraps him; "DAD!"; it flies back into Buu. The cape
 *                          comes apart, Gohan's orange is on him instead: steam, and BUUHAN
 *
 * The order is the point (the owner's brief): Buutenks → Gotenks defuses inside Buu → Buuccolo in
 * Piccolo's clothes → Gohan absorbed WHILE Buu is still wearing them → Buuhan.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const K = SL.data.buuKit;
  const VK = SL.data.vegitoKit;

  const ER = {
    spots: 5, // disturbed places in the rubble
    foundAt: 3, // the earring is under the third one he digs up
    searchSeconds: 30, // after this the worm is on him whatever
    digRadius: 1.4,
  };
  const HAND_POTARA = { id: 'potaraHand', shape: 'potara', joint: 'handR', pos: [0, -0.1, 0.035], rot: [0, 0, 0], scale: 1.6 };
  // where things are (the fight is round the origin; Gohan was beaten down at SEARCH_AT)
  const GOHAN_AT = new V3(0, 0, 6);
  const BUU_AT = new V3(0, 0, -6);
  const GOKU_AT = new V3(-7, 0, 8);
  const PIECE_AT = new V3(9, 0, 16); // where the disc's spatter lands, behind the rocks

  function setup(battle) {
    const b = battle;
    const at = (v) => K.ground(b, v);
    const goku = b.spawn({ charId: 'goku', player: true, team: 0, pos: at(GOKU_AT), startKi: 100 });
    const gohan = b.spawn({ charId: 'adult_gohan', team: 0, pos: at(GOHAN_AT), startKi: 60, wardrobe: { outfit: 'ag_ultimate', hair: 'hair_gohan_ultimate' } });
    const bt = b.spawn({ charId: 'buutenks', team: 1, pos: at(BUU_AT), startKi: 200, tags: { boss: true } });
    const bc = b.spawn({ charId: 'buuccolo', team: 1, pos: at(BUU_AT), startKi: 200, tags: { boss: true } });
    const bh = b.spawn({ charId: 'buuhan', team: 1, pos: at(BUU_AT), startKi: 240, tags: { boss: true } });
    for (const f of [gohan, bt, bc, bh]) K.watcher(f, 'idle', 'calm');
    for (const f of [bc, bh]) f.setHidden(true);
    for (const f of [bt, bc, bh]) {
      f.mech.maxReforms = Infinity;
      f.cannotDie = true;
    }
    gohan.cannotDie = goku.cannotDie = true;
    K.toForm(gohan, 'ultimate');
    gohan.setDamage && gohan.setDamage(2);
    goku.lockedForms = { ssj2: true, ssj3: true, kaioken: true };
    gohan.lockedForms = { ssj: true, ssj2: true };
    goku.setHidden(true);
    b.story = { goku, gohan, bt, bc, bh, owned: false };
  }

  function own(m) {
    const S = m.battle.story;
    if (S.owned) return;
    S.owned = true;
    const b = m.battle;
    S.disc = VK.disc(m);
    S.earring = VK.potara(m);
    S.earring.group.visible = false;
    // the pink ball over Buutenks' head
    const T = SL.Toon;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xff7ab8, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
    orb.visible = false;
    b.scene.add(orb);
    S.orb = orb;
    m.onDispose(() => {
      b.scene.remove(orb);
      orb.geometry.dispose();
      orb.material.dispose();
      if (S.cut) S.cut.dispose();
    });
    // the piece of Buu the disc knocked off: it crawls from behind the rocks to wherever Gohan is
    S.piece = VK.creeper(m, { path: [K.ground(b, PIECE_AT), K.ground(b, PIECE_AT.clone().add(new V3(-2, 0, -3)))], size: 0.16 });
    S.piece.visible(false);
  }

  /** The worm's route: from the rocks to a point just behind Gohan. */
  function routeTo(m, target) {
    const b = m.battle, S = b.story;
    const from = S.piece.head ? S.piece.head() : K.ground(b, PIECE_AT);
    const behind = target.pos.clone().addScaledVector(target.forward.clone().setY(0).normalize(), -1.2);
    const mid = from.clone().lerp(behind, 0.5).add(new V3(2, 0, 0));
    S.piece.path.length = 0;
    for (const p of [from, mid, behind]) S.piece.path.push(K.ground(b, p));
  }

  const P = {};

  P.arrive = {
    id: 'arrive',
    run: function* (m) {
      own(m);
      m.lock(true);
      m.title(m.def.chapter, m.def.title.toUpperCase(), m.def.subtitle, 3.4);
      yield* SL.Cinema.play(m, 'er_arrive');
      yield* SL.Cinema.play(m, 'er_disc');
      yield* SL.Cinema.play(m, 'er_defuse');
      yield* SL.Cinema.play(m, 'er_fumble');
    },
  };

  /** On his knees in the rubble. The earring is somewhere under the dirt; something else is not. */
  P.search = {
    id: 'search',
    checkpoint: true,
    run: function* (m) {
      own(m);
      const b = m.battle, S = b.story, g = S.gohan;
      m.lock(true);
      m.clearObjectives();
      // restaged: Buuccolo standing where Buutenks was, Goku powered down and watching
      S.bt.setHidden(true);
      S.bh.setHidden(true);
      S.bc.setHidden(false);
      S.goku.setHidden(false);
      if (S.cut) S.cut.visible(false);
      S.orb.visible = false;
      K.toForm(S.goku, 'base');
      K.place(S.goku, K.ground(b, GOKU_AT));
      K.place(S.bc, K.ground(b, BUU_AT));
      K.place(g, K.ground(b, GOHAN_AT));
      // Gohan is the player now: walk (no flight — he is looking at the ground), dig where it glints
      // (switchPlayer hands Goku an ally brain: the watchers come after it)
      b.switchPlayer(g, { force: true });
      K.watcher(S.goku, 'idle', 'calm');
      K.watcher(S.bc, 'bc_control', 'grin');
      K.faceTo(S.bc, g.pos);
      K.faceTo(S.goku, g.pos);
      if (!S.goku.model.props.potaraHand) S.goku.model.addProp(HAND_POTARA);
      g.untargetable = g.intangible = false;
      g.setState('free');
      g.target = null;
      g.lockMode = 'free';
      const spots = [];
      for (let i = 0; i < ER.spots; i++) {
        const a = -0.6 + (i / (ER.spots - 1)) * 2.6;
        const r = 3.2 + (i % 2) * 2.2;
        spots.push({ pos: K.ground(b, GOHAN_AT.clone().add(new V3(Math.cos(a) * r, 0, Math.sin(a) * r * 0.8 + 1))), dug: false });
      }
      S.spots = spots;
      // each disturbed place glints (a sprite that stays until it is dug up) and has a little mound
      for (const sp of spots) {
        const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xfff0a0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
        glint.position.copy(sp.pos).add(new V3(0, 0.25, 0));
        glint.scale.setScalar(0.9);
        b.scene.add(glint);
        sp.glint = glint;
        b.vfx.dust(sp.pos, 0.4, 3, b.stage.dustColor);
      }
      m.onDispose(() => {
        for (const sp of spots) {
          b.scene.remove(sp.glint);
          sp.glint.material.dispose();
        }
      });
      m.limits({ light: false, heavy: false, blast: false, s1: false, s2: false, ult: false, transform: false, up: false, upPressed: false, charge: false, dodge: false });
      m.objective('find', 'Find the earring in the rubble', { icon: 'target', target: 1 });
      m.music('vision', 2);
      m.say('adult_gohan', 'It fell right here... it has to be here somewhere!', 3);
      m.lock(false);
      b.aiLocked = true;
      // the worm: from behind the rocks, all the time he is looking
      routeTo(m, g);
      let crawl = 0, t = 0, dug = 0, found = false, digging = 0, digSpot = null;
      const hook = () => {
        t += 1 / 60;
        // the spots glint so the player can see them
        for (const s of spots) {
          s.glint.visible = !s.dug;
          s.glint.material.opacity = 0.45 + Math.abs(Math.sin(t * 3 + s.pos.x)) * 0.5;
        }
        // Buuccolo steers his piece, slowly, and re-aims it at wherever Gohan is now
        if (b.frame % 90 === 0) routeTo(m, g);
        crawl = Math.min(0.95, crawl + 1 / (60 * ER.searchSeconds) * 1.2);
        S.piece.crawl(Math.min(crawl, found ? 1 : 0.85), t);
        if (digging > 0) {
          digging -= 1 / 60;
          if (b.frame % 6 === 0) b.vfx.dust(g.pos.clone().addScaledVector(g.forward, 0.5), 0.6, 4, b.stage.dustColor);
          if (digging <= 0) {
            digSpot.dug = true;
            dug++;
            if (dug >= ER.foundAt) {
              found = true;
              S.earring.group.visible = true;
              S.earring.group.position.copy(g.chest().add(new V3(0, 0.3, 0)));
            } else {
              m.say('adult_gohan', dug === 1 ? 'Not here...' : 'Where is it?!', 1.6, { style: 'quiet' });
              g.setState('free');
              b.inputLocked = false;
            }
          }
          return;
        }
        // near a spot that has not been dug: kneel and dig (the body does it)
        for (const s of spots) {
          if (s.dug || found) continue;
          if (Math.hypot(s.pos.x - g.pos.x, s.pos.z - g.pos.z) < ER.digRadius) {
            digSpot = s;
            digging = 1.3;
            b.inputLocked = true;
            K.faceTo(g, s.pos);
            g.setState('scripted', { pose: 'digKneel', expression: 'grit' });
            b.sfx('rockBreak', g, { vol: 0.4, pitch: 1.4 });
            break;
          }
        }
      };
      m.tickHooks.push(hook);
      yield () => found || t >= ER.searchSeconds || b.skipRequested;
      K.unhook(m, hook);
      m.complete('find');
      m.flags.earringFound = found;
      m.flags.searchSeconds = Math.round(t);
      m.limits(null);
      m.lock(true);
      if (!found) {
        S.earring.group.visible = true;
        S.earring.group.position.copy(g.chest().add(new V3(0, 0.3, 0)));
      }
      g.setState('scripted', { pose: 'foundIt', expression: 'grin' });
      routeTo(m, g);
      yield* SL.Cinema.play(m, 'er_ambush');
    },
  };

  P.after = {
    id: 'after',
    run: function* (m) {
      m.lock(true);
      m.clearObjectives();
      m.fade('black', 1.2);
      yield* m.cine(1.4);
      m.title(m.def.chapter, 'BUUHAN', m.nextLine(), 4.2);
      yield* m.cine(4.4);
    },
  };

  const def = {
    id: 'buu_earring',
    canon: true,
    chapter: 'CHAPTER 13 · BUU SAGA',
    title: 'The Earring',
    subtitle: 'Earth · Age 774 · one earring each',
    character: 'goku',
    stage: 'majin_wastes',
    parTime: 300,
    rules: { allowTransform: false, allowUltimates: false },
    blurb: 'Goku is back, alive, with a way to beat Buu in each hand. All Gohan has to do is catch.',
    rewards: ['Story: Buuccolo', 'Story: Buuhan'],
    setup,
    phases: [P.arrive, P.search, P.after],
  };

  SL.data.missions[def.id] = def;
  SL.data.earringMission = { ER, GOHAN_AT, BUU_AT, GOKU_AT, PIECE_AT, HAND_POTARA, routeTo };
})();
