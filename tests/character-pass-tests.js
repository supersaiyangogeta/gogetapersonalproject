// The character-quality pass (2026-09-25): the owner's Trunks fixes (the air cut through Frieza, the
// aerial finish from the free hand, a transformation without hand signs, no bald crown on Trunks or
// Bulma) and the redesigns of Videl, adult Gohan and Majin Vegeta. Behaviour on the real engine and
// the built bodies, headless: every check reads the model or the running mission, not the ids.
const H = require('./headless');

module.exports = function characterPassTests({ test, eq, ok }) {
  console.log('\nCharacter pass: Trunks fixes, Videl, adult Gohan, Majin Vegeta (headless)');

  const pi = (SL, id, ph) => SL.data.missions[id].phases.findIndex((p) => p.id === ph);
  const fighter = (b, id) => b.fighters.find((f) => f.def.id === id);

  /** How much a pose moves its arms and hands over two seconds (a flurry moves a lot). */
  function armMotion(pose) {
    const joints = ['shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR'];
    const lo = {}, hi = {};
    const shapes = new Set();
    for (let t = 0; t <= 2; t += 1 / 30) {
      const p = typeof pose === 'function' ? pose(t, {}) : pose;
      for (const j of joints) {
        const v = p[j] || [0, 0, 0];
        for (let k = 0; k < 3; k++) {
          const key = j + k;
          lo[key] = Math.min(lo[key] === undefined ? Infinity : lo[key], v[k]);
          hi[key] = Math.max(hi[key] === undefined ? -Infinity : hi[key], v[k]);
        }
      }
      if (p.hands) shapes.add(p.hands.join('/'));
    }
    let range = 0;
    for (const key of Object.keys(lo)) range = Math.max(range, hi[key] - lo[key]);
    return { range, shapes: shapes.size };
  }

  test("Trunks' Super Saiyan has no hand signs: the arms stay down and still while it builds; the Burning Attack keeps its hand-sign flurry", () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;
    const t = SL.data.characters.future_trunks;
    const ssj = t.forms.find((f) => f.id === 'ssj');
    const burn = t.specials.special1;
    eq(burn.id, 'burningAttack', 'the Burning Attack');
    const burnPoses = new Set([burn.pose.wind, burn.pose.release, 'ft_burnDiamond']);
    const signs = armMotion(t.poses[burn.pose.wind]);
    ok(signs.range > 40 && signs.shapes > 1, 'its wind-up is the hand-sign flurry: the arms travel ' + signs.range.toFixed(0) + '° and the hands change shape');
    for (const seq of [ssj.sequence, ssj.storySequence]) {
      const names = [...new Set(seq.steps.map((s) => s.pose).filter(Boolean))];
      ok(names.length >= 4, 'the transformation is staged in poses: ' + names.join(', '));
      for (const n of names) {
        ok(!burnPoses.has(n), n + ' is not a Burning Attack pose');
        ok(t.poses[n], n + ' exists');
        const m = armMotion(t.poses[n]);
        ok(m.range < 8 && m.shapes === 1, n + ': no hand signs (arms move ' + m.range.toFixed(1) + '°, ' + m.shapes + ' hand shape)');
      }
    }
    // and the story transformation actually plays those poses, not the flurry
    const b = g.mission('android_trunks', { startPhase: pi(SL, 'android_trunks', 'reveal') });
    const seen = new Set();
    g.until(b, () => b.mission.flags.trunksTransformed, 60 * 60, () => {
      if (b.inputLocked && b.story.trunks.state !== 'transform' && !b.mission.flags.trunksTransformed) { /* let the scene run */ }
      if (b.story.trunks.state === 'transform') seen.add(b.story.trunks.anim.name);
    });
    ok(seen.size >= 3 && ![...seen].some((n) => burnPoses.has(n)), 'played while he transforms: ' + [...seen].join(', '));
    b.dispose();
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  /** The Frieza checkpoint played watched by the bot; measures the cut and the finish frame by frame. */
  let finishRun = null;
  function finish() {
    if (finishRun) return finishRun;
    const g = H.create({ quiet: true, seed: 5 });
    const { SL } = g;
    const brains = require('../tools/mission_brains');
    const out = { g, SL, mids: [], tipAbove: false, tipBelow: false, minAir: Infinity, grounded: 0, cues: [], blast: null, piecesAfter: null, beforeCut: null, landingPose: false };
    let inFinish = false, cutFrames = -1;
    const b = g.mission('android_trunks', {
      startPhase: pi(SL, 'android_trunks', 'frieza'),
      onCreate: (bb) => {
        bb.on('sceneStart', (e) => e.id === 'frieza_finish' && (inFinish = true));
        bb.on('sceneEnd', (e) => e.id === 'frieza_finish' && (inFinish = false));
        bb.on('cue', (e) => {
          if (!inFinish) return;
          out.cues.push(e.key + ':' + e.label);
          if (e.key === 'heavy') {
            const t = bb.story.trunks, fz = bb.story.frieza;
            out.beforeCut = { above: t.pos.y - (fz.pos.y + fz.height), off: Math.hypot(t.pos.x - fz.pos.x, t.pos.z - fz.pos.z) };
          }
        });
        bb.on('cueDone', (e) => inFinish && e.key === 'heavy' && (cutFrames = 0));
        bb.on('trunksFinalBlast', (e) => {
          const t = bb.story.trunks;
          t.object.updateMatrixWorld(true);
          const palm = t.model.joints.handL.getWorldPosition(new g.V3());
          const sword = t.model.props.sword;
          out.blast = {
            fromPalm: e.from.distanceTo(palm),
            swordInRight: !!(sword && sword.visible && sword.parent === t.model.joints.handR),
            grounded: t.grounded,
            height: t.pos.y - bb.stage.heightAt(t.pos.x, t.pos.z),
            piecesHeight: e.to.y - bb.stage.heightAt(e.to.x, e.to.z),
            frame: bb.frame,
          };
        });
      },
    });
    brains.attach(SL, b, 'android_trunks', {});
    let n = 0;
    while (n < 60 * 400 && b.mission.state === 'running' && !(out.blast && b.frame > out.blast.frame + 45)) {
      g.frame(b);
      n++;
      const t = b.story.trunks, fz = b.story.frieza;
      if (cutFrames >= 0 && cutFrames < 40) {
        cutFrames++;
        const seg = SL.data.trunksKit.bladeSegment(t);
        if (seg) {
          const mid = seg[0].clone().lerp(seg[1], 0.5);
          out.mids.push(Math.hypot(mid.x - fz.pos.x, mid.z - fz.pos.z));
          if (seg[1].y > fz.pos.y + fz.height) out.tipAbove = true;
          if (seg[1].y < fz.pos.y && out.tipAbove) out.tipBelow = true;
        }
      }
      if (cutFrames >= 0 && inFinish && !(out.blast && b.frame > out.blast.frame + 20)) {
        out.minAir = Math.min(out.minAir, t.pos.y - b.stage.heightAt(t.pos.x, t.pos.z));
        if (t.grounded) out.grounded++;
        if (t.anim.name === 'ft_landing') out.landingPose = true;
      }
      if (out.blast && b.frame === out.blast.frame + 40) {
        const pieces = b.scene.getObjectByName('frieza:pieces');
        out.piecesAfter = pieces ? pieces.children.filter((c) => c.visible).length : 0;
        out.piecesTotal = pieces ? pieces.children.length : -1;
      }
    }
    out.b = b;
    return (finishRun = out);
  }

  test('the air cut: Trunks is put above and in line with Frieza before the Cut cue, and the blade itself passes through Frieza from above the head to below the feet', () => {
    const r = finish();
    ok(r.beforeCut && r.beforeCut.above > -0.3 && r.beforeCut.off < 1.2, 'at the cue he is above Frieza, in line: ' + JSON.stringify(r.beforeCut));
    // the middle of the actual blade sits on Frieza's vertical axis while it goes through him
    const onAxis = r.mids.filter((d) => d < 0.25).length;
    ok(onAxis >= 8, 'the blade is on his axis for ' + onAxis + ' frames (closest ' + Math.min(...r.mids).toFixed(3) + ' m)');
    ok(r.tipAbove && r.tipBelow, 'the edge goes in above his head and comes out below his feet');
    eq(r.g.errors.length, 0, 'engine errors: ' + r.g.errors.slice(0, 2).join(' | '));
  });

  test('the aerial finish: Frieza is diced in the air, Trunks never lands, the blast comes from his empty left hand (the sword still in his right) in the air, and the pieces are gone', () => {
    const r = finish();
    ok(r.minAir > 1.5 && r.grounded === 0, 'airborne from the cut to after the blast: never lower than ' + r.minAir.toFixed(2) + ' m');
    ok(!r.landingPose, 'no landing pose');
    ok(!r.cues.some((c) => c.indexOf('blast:') === 0), 'no separate "press to end it" after the dicing: ' + r.cues.join(', '));
    ok(r.blast, 'the final blast fires');
    ok(r.blast.fromPalm < 0.05, 'from his left palm: ' + r.blast.fromPalm.toFixed(3) + ' m away');
    ok(r.blast.swordInRight, 'with the sword still in his right hand');
    ok(!r.blast.grounded && r.blast.height > 1.5, 'in the air: ' + r.blast.height.toFixed(2) + ' m up');
    ok(r.blast.piecesHeight > 2, 'at pieces hanging in the air: ' + r.blast.piecesHeight.toFixed(2) + ' m up');
    ok(r.piecesTotal > 20, 'Frieza was cut into ' + r.piecesTotal + ' pieces');
    eq(r.piecesAfter, 0, 'and none of them is left after the blast');
    eq(r.b.mission.flags.friezaDestroyed, true, '');
  });

  /** Casts rays at a head from outside; the first thing hit must not be the skull (horns, fins and spikes may sit on the hair). */
  function crownGaps(g, def, formIdx) {
    const { SL, THREE } = { SL: g.SL, THREE: g.THREE };
    const m = SL.ModelBuilder.build(def);
    if (formIdx) m.setForm(def.forms[formIdx]);
    m.root.updateMatrixWorld(true);
    const head = m.headCenter.getWorldPosition(new THREE.Vector3());
    const R = m.b.headR * m.baseScale;
    const ray = new THREE.Raycaster();
    const shown = (o) => {
      for (let x = o; x; x = x.parent) if (!x.visible) return false;
      return true;
    };
    // meshes only: a sprite (the glow of Whis' and Vados' staffs) cannot be ray-cast without a camera, and is never hair
    const meshes = [];
    m.root.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const gaps = [];
    for (const th of [0, 15, 30, 45]) {
      for (let az = 0; az < 360; az += 30) {
        // the forehead is meant to show below the fringe: only the crown and the back count there
        if (th >= 30 && (az <= 50 || az >= 310)) continue;
        const a = (th * Math.PI) / 180, z = (az * Math.PI) / 180;
        const dir = new THREE.Vector3(Math.sin(a) * Math.sin(z), Math.cos(a), Math.sin(a) * Math.cos(z));
        ray.set(head.clone().addScaledVector(dir, R * 4), dir.clone().negate());
        const hit = ray.intersectObjects(meshes, false).find((h) => shown(h.object) && !h.object.userData.isOutline);
        if (hit && hit.object === m.skull) gaps.push(th + '°/' + az + '°');
      }
    }
    return gaps;
  }

  test('no bald crown: the head is covered from above and behind on Future Trunks (base and Super Saiyan) and Bulma — and on every other character whose hair is meant to cover the head', () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;
    const C = SL.data.characters;
    eq(crownGaps(g, C.future_trunks).join(' '), '', 'Future Trunks');
    eq(crownGaps(g, C.future_trunks, 1).join(' '), '', 'Future Trunks, Super Saiyan');
    eq(crownGaps(g, C.bulma).join(' '), '', 'Bulma');
    const bad = [];
    for (const [id, c] of Object.entries(C)) {
      const hs = c.appearance && c.appearance.hair && SL.data.hair[c.appearance.hair.style];
      if (!hs || hs.cap === false || (hs.cap && hs.cap.partial) || c.appearance.outfit && (c.appearance.outfit.helmet !== undefined || c.appearance.outfit.cap !== undefined || c.appearance.outfit.turban !== undefined)) continue;
      if (c.model && c.model.type === 'glb') continue;
      const gaps = crownGaps(g, c);
      if (gaps.length) bad.push(id + ' (' + gaps.slice(0, 3).join(' ') + ')');
    }
    eq(bad.join(', '), '', 'no other character shows skull through the hair');
    // and the fix did not blow the hair up: the cap is at most a few percent bigger than the skull
    const m = SL.ModelBuilder.build(C.future_trunks);
    const cap = m.currentHairGroup().children.find((c) => c.geometry && c.geometry.parameters && c.geometry.parameters.thetaLength < 2);
    ok(cap.scale.y / m.b.headR < 1.12, 'the cap stays close to the head: ×' + (cap.scale.y / m.b.headR).toFixed(2));
  });

  /** A story mission's fighter as the game dresses it. */
  function inMission(gg, id, charId, phase) {
    const b = gg.mission(id, { startPhase: phase || 0 });
    gg.step(b, 2);
    return { b, f: fighter(b, charId) };
  }

  test('adult Gohan is a grown man of his own: adult proportions and face, his own hair and Super Saiyan hair, the tournament gi in the Buu Saga, school clothes on the first day, the Ultimate look built', () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;
    const C = SL.data.characters, A = C.adult_gohan;
    const headRatio = (c) => (c.appearance.build.headR || 0.118) / ((c.appearance.build.hipY || 0.98) + 0.6);
    ok(headRatio(A) < headRatio(C.teen_gohan) * 0.85 && headRatio(A) < headRatio(C.kid_gohan) * 0.75, 'a small head for his size: not the boy scaled up');
    ok(A.appearance.build.chestW / A.appearance.build.waistW > 1.5, 'broad shoulders over a narrow waist');
    ok(A.appearance.height >= C.goku.appearance.height, 'as tall as his father');
    ok((A.appearance.face.jaw || 1) > 1.05, 'a longer, adult jaw');
    eq(A.appearance.hair.style, 'gohan_adult', 'his own hair');
    const ssj = A.forms.find((f) => f.id === 'ssj'), ssj2 = A.forms.find((f) => f.id === 'ssj2');
    eq(ssj.look.hair.style + ',' + ssj2.look.hair.style, 'gohan_adult_ssj,gohan_adult_ssj2', 'and his own Super Saiyan hair (not his father\'s)');
    ok(ssj2.aura.lightning && ssj2.poses.idle !== ssj.poses.idle, 'Super Saiyan 2 has its lightning and its own stance');
    eq(A.forms.map((f) => f.id).join(','), 'base,ssj,ssj2,ultimate,beast', 'the Super Saiyan forms unchanged; the Ultimate (Chapter 12) after them; Beast (the Super Hero film) last');
    for (const p of ['idle', 'run', 'flyIdle', 'flyForward', 'guard', 'charge']) ok(A.poses[p] && A.poses[p] !== SL.data.poses[p], 'his own ' + p);
    // the story dresses him by the era and the day
    let x = inMission(g, 'buu_kibito', 'adult_gohan');
    eq(x.f.wardrobe.outfit, 'ag_tournament', 'the tournament: the Piccolo-style gi');
    eq(x.f.appearance.outfit.top, 0x2c2a66, 'indigo');
    eq(x.f.appearance.outfit.belt, 0xc8261e, 'red sash');
    eq(x.f.appearance.outfit.wrist, 0xc8261e, 'red wristbands');
    ok(x.f.model.gi.torso.length > 0, 'a gi that can tear');
    x.b.dispose();
    x = inMission(g, 'buu_years', 'adult_gohan');
    eq(x.f.wardrobe.outfit, 'ag_school', 'the first day of school: his school clothes');
    ok(x.f.model.jacket && x.f.model.jacket.length && x.f.model.collarParts, 'a vest over a collared shirt');
    x.b.dispose();
    // the Ultimate look: the orange gi and the held-down hair, locked until the end of the Buu chapters
    ok(!SL.Wardrobe.select('adult_gohan', { outfit: 'ag_ultimate' }).ok, 'locked at first');
    SL.Save.completeMission('buu_ssj3', { score: 1, rank: 'C' });
    ok(SL.Wardrobe.select('adult_gohan', { outfit: 'ag_ultimate' }).ok, 'then wearable');
    const sel = SL.Wardrobe.current('adult_gohan');
    eq(sel.hair, 'hair_gohan_ultimate', 'with its own hair');
    const m = SL.ModelBuilder.build(SL.Wardrobe.modelDef(A, sel));
    eq(m.currentHair, 'gohan_ultimate|' + 0x141418, 'the Ultimate hair is on the body');
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test("Videl is built as herself: a woman's build and face, her tails with gold ties, the long T-shirt whose hem moves with her legs, fingerless gloves, her own stances; the story cuts her hair for the tournament", () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;
    const C = SL.data.characters, V = C.videl, bv = V.appearance.build;
    ok(bv.bust > 0 && bv.pelvisW > bv.waistW * 1.2 && bv.chestW < C.adult_gohan.appearance.build.chestW * 0.8, 'a small woman\'s build: narrow shoulders and waist, wider hips, a bust');
    ok(V.appearance.face.lashWing && V.appearance.face.eyeH > 1.1 && V.appearance.face.cheeks === 0, 'her own face: large eyes with a lash flick, no cheekbones');
    for (const p of ['idle', 'run', 'flyIdle', 'flyForward', 'guard', 'charge']) ok(V.poses[p] && V.poses[p] !== SL.data.poses[p], 'her own ' + p);
    ok(V.specials.ultimate.hits.some((h) => h.pose === 'vd_eagle'), 'the Eagle Kick ends on a flying kick');
    const x = inMission(g, 'buu_saiyaman', 'videl');
    const f = x.f, M = f.model;
    eq(f.wardrobe.outfit, 'videl_tee', 'Satan City: the T-shirt');
    ok(M.bust && M.bust.length === 2, 'the bust is built');
    ok(M.hem && M.hem.length === 2, 'the shirt hem, front and back');
    // the hair: two tails, tied gold
    const hair = M.currentHairGroup();
    ok(hair.children.some((c) => c.material && c.material.color && c.material.color.getHex() === 0xe0b83a), 'gold ties on the tails');
    // fingerless gloves: the glove is dark, the knuckles are skin
    const fist = M.hands.R.fist;
    const cols = fist.children.filter((c) => c.isMesh && !c.userData.isOutline).map((c) => c.material.color.getHex());
    ok(cols.includes(0x2c2420) && cols.includes(V.appearance.skin), 'a dark glove with bare fingers');
    // the hem lifts with the leg that goes forward
    M.joints.thighL.rotation.x = -1.2;
    M.tick(1 / 60);
    const front = M.hem.find((h) => h.front);
    ok(front.node.rotation.x < -0.8, 'the front of the shirt lifts with a kick: ' + front.node.rotation.x.toFixed(2));
    x.b.dispose();
    // the story cuts her hair for the flying lessons and the tournament
    for (const id of ['buu_flight', 'buu_spopovich']) {
      const y = inMission(g, id, 'videl');
      eq(y.f.wardrobe.outfit + '/' + y.f.appearance.hair.style, 'videl_tournament/videl_short', id + ': the short cut, purple sleeves');
      y.b.dispose();
    }
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('Majin Vegeta is a state with its own body: the M, the Majin face and sneer, heavier arms and legs than Super Saiyan 2, his own stance and movement, the Buu suit with white gloves and gold-tipped boots', () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;
    const x = inMission(g, 'buu_majin', 'vegeta', 1);
    const v = x.f, M = v.model;
    const V = v.def;
    const ssj2 = V.forms.findIndex((f) => f.id === 'ssj2'), majin = V.forms.findIndex((f) => f.id === 'majin');
    v.applyForm(ssj2);
    const arm = M.girth.find((gm) => gm.mesh.parent === M.joints.shoulderL && gm.mesh.geometry.type === 'CapsuleGeometry');
    const w2 = arm.mesh.scale.x;
    const chest2 = M.chestMesh.scale.x;
    v.applyForm(majin);
    const extras = M._headExtras || [];
    eq(extras.filter((e) => e.shape === 'bar').length, 4, 'the M: four strokes');
    ok(extras.filter((e) => e.shape === 'line').length >= 2, 'and the Majin creases on the face');
    ok(arm.mesh.scale.x > w2 * 1.08 && M.chestMesh.scale.x > chest2 * 1.05, 'heavier than Super Saiyan 2: arms ×' + (arm.mesh.scale.x / w2).toFixed(2));
    eq(M.currentHair, 'vegeta_majin|' + 0xffd33a, 'his own hair: the peak kept up so the M shows');
    {
      // the M is on the skin and in sight: looked at from the front, each stroke's middle is the first
      // thing hit — not the skull it lies on, not the hair (both once hid the diagonals)
      const T = g.THREE;
      const mm = SL.ModelBuilder.build(V);
      mm.setForm(V.forms[majin]);
      mm.root.updateMatrixWorld(true);
      const kids = mm.headExtraGroup.children;
      const bars = kids.filter((_, i) => mm._headExtras[i].shape === 'bar');
      const ray = new T.Raycaster();
      const hidden = [];
      bars.forEach((bar, i) => {
        const p = bar.getWorldPosition(new T.Vector3());
        ray.set(p.clone().add(new T.Vector3(0, 0, 1)), new T.Vector3(0, 0, -1));
        const shown = (o) => {
          for (let q = o; q; q = q.parent) if (!q.visible) return false;
          return true;
        };
        const hit = ray.intersectObject(mm.root, true).find((h) => shown(h.object) && !h.object.userData.isOutline);
        if (!hit || !bars.includes(hit.object)) hidden.push(i + ':' + (hit ? hit.object.name || hit.object.geometry.type : 'nothing'));
        // on the skin: its middle and both ends sit on the skull (an ellipsoid R × 1.06R × 1.02R in the
        // head's own frame), neither sunk into it nor standing off it
        const R = mm.b.headR, axis = new T.Vector3(0, 1, 0).applyQuaternion(bar.quaternion);
        for (const k of [-0.5, 0, 0.5]) {
          const q = bar.position.clone().addScaledVector(axis, k * bar.scale.y);
          const e = Math.hypot(q.x / R, q.y / (1.06 * R), q.z / (1.02 * R));
          ok(e > 0.995 && e < 1.03, 'stroke ' + i + ' lies on the skin at ' + k + ': ' + e.toFixed(3) + ' of the skull');
        }
      });
      eq(hidden.join(' '), '', 'every stroke of the M shows from the front');
    }
    eq(v.form.restFace, 'majin', 'the sneer at rest');
    {
      // in a plain fight, standing still, that is the face he wears
      const fb = g.battle({ p1: 'vegeta', p2: 'goku', distance: 8 });
      const pv = fb.player;
      pv.lockedForms = {};
      pv.applyForm(majin);
      g.step(fb, 20);
      eq(pv.model._expr, 'majin', 'and it is what his face does when nothing else is happening');
      fb.dispose();
    }
    for (const p of ['idle', 'run', 'flyIdle', 'flyForward', 'guard', 'charge']) ok(V.forms[majin].poses[p] && V.forms[majin].poses[p] !== V.poses[p], 'his own ' + p + ' under the mark');
    eq(v.wardrobe.outfit, 'vegeta_buu', 'the Buu suit');
    const o = v.appearance.outfit;
    ok(!o.armor && o.gloves === 0xf7f6f0 && o.boots === 0xf7f6f0 && o.bootTip === 0xd2a84a, 'no armor; white gloves and boots, gold at the toe');
    // the state comes off with the mark, the face and the build
    v.applyForm(0);
    eq((M._headExtras || []).length, 0, 'base form: no mark');
    eq(arm.mesh.scale.x, arm.x, 'and the arms are his own again');
    x.b.dispose();
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('clothing damage: Gohan\'s gi and Majin Vegeta\'s suit go intact → damaged → heavily damaged → torn on the outfit itself; Videl\'s shirt is scuffed and torn but never comes off', () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL } = g;
    const rips = (f) => (f.model._rips || []).filter((r) => r.mesh.visible).length;
    // Gohan, tournament gi
    let x = inMission(g, 'buu_kibito', 'adult_gohan');
    let f = x.f;
    const seen = [];
    for (let L = 0; L <= 3; L++) {
      f.setDamage(L);
      seen.push(rips(f));
    }
    ok(seen[0] === 0 && seen[1] > 0 && seen[2] > seen[1], 'Gohan: rips grow with each level: ' + seen.join(' → '));
    ok(f.model._torn, 'at the last level the gi top is torn off');
    eq(f.model.chestMesh.material.color.getHex(), f.appearance.skin, 'the chest is bare');
    ok(f.model.gi.sleeves.some((s) => s.visible), 'one sleeve is left');
    x.b.dispose();
    // Majin Vegeta: the suit splits front and back, a glove goes
    x = inMission(g, 'buu_majin', 'vegeta', 1);
    f = x.f;
    f.setDamage(3);
    const vis = f.model._rips.filter((r) => r.mesh.visible).map((r) => r.spec);
    ok(vis.some((s) => Math.abs(s.ang) > 2.2), 'the back of the suit is torn too');
    ok(vis.some((s) => s.at === 'elbowR' && s.cloth === 0xf7f6f0), 'a glove is shredded');
    ok(vis.length >= 10, 'torn: ' + vis.length + ' tears');
    x.b.dispose();
    // Videl: scuffs and tears, the shirt stays on
    x = inMission(g, 'buu_saiyaman', 'videl');
    f = x.f;
    f.setDamage(3);
    ok(rips(f) >= 4, 'Videl: ' + rips(f) + ' tears');
    ok(!f.model._torn, 'her shirt never comes off');
    eq(f.model.chestMesh.material.color.getHex(), 0xf6f4ef, 'still the white T-shirt');
    x.b.dispose();
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('customization and saves: the new looks unlock with the story, Free Battle wears the saved look, the story still dresses by the era, and the choice survives a save and reload', () => {
    const g = H.create({ quiet: true, seed: 3 });
    const { SL, V3 } = g;
    eq(SL.Wardrobe.validate().join(' | '), '', 'the wardrobe data is valid');
    ok(SL.Wardrobe.characters().includes('videl') && SL.Wardrobe.characters().includes('adult_gohan'), 'both are on the Customization screen');
    ok(!SL.Wardrobe.select('videl', { outfit: 'videl_super' }).ok, 'a locked look is refused');
    ok(!SL.Wardrobe.select('videl', { outfit: 'videl_super_hero' }).ok, 'a planned one always is');
    for (const id of ['buu_flight', 'buu_ssj3']) SL.Save.completeMission(id, { score: 1, rank: 'C' });
    ok(SL.Wardrobe.select('videl', { outfit: 'videl_super' }).ok, 'unlocked by the story');
    ok(SL.Wardrobe.select('adult_gohan', { outfit: 'ag_ultimate' }).ok, '');
    const free = (p1) => {
      const b = new SL.Battle({
        mode: 'free', stageId: 'wasteland', skipIntro: true, rules: { timeLimit: 0, allowTransform: true, allowUltimates: true, startKi: 100 },
        fighters: [{ charId: p1, player: true, team: 0, pos: new V3(-4, 0, 0) }, { charId: 'goku', team: 1, pos: new V3(4, 0, 0), dummy: 'idle' }],
        onEnd: () => {},
      });
      b.start();
      return b;
    };
    let b = free('videl');
    eq(b.player.wardrobe.outfit + '/' + b.player.appearance.hair.style, 'videl_super/videl_bob', 'Free Battle wears the saved look with its hair');
    ok(b.player.model.collarParts && b.player.model.collarParts.length === 1, 'the turtleneck');
    b.dispose();
    b = free('adult_gohan');
    eq(b.player.wardrobe.outfit, 'ag_ultimate', '');
    b.dispose();
    // the story never reads it
    const x = inMission(g, 'buu_spopovich', 'videl');
    eq(x.f.wardrobe.outfit, 'videl_tournament', 'the tournament still dresses her for the tournament');
    x.b.dispose();
    const y = inMission(g, 'buu_kibito', 'adult_gohan');
    eq(y.f.wardrobe.outfit, 'ag_tournament', 'and Gohan in his gi');
    y.b.dispose();
    // saved and loaded
    SL.Save.write();
    SL.Save.data = null;
    SL.Save.load();
    eq(SL.Wardrobe.saved('videl').outfit, 'videl_super', 'the choice survives a reload');
    ok(SL.Save.isUnlocked('outfits', 'videl_super') && SL.Save.isUnlocked('outfits', 'ag_ultimate'), 'and so do the unlocks');
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });

  test('every playable fighter has a Free Battle voice and entrance of their own: an intro line, a victory line, and an intro that is not the plain combat stance — and a real Free Battle intro says both lines', () => {
    const g = H.create({ quiet: true, seed: 1 });
    const { SL, V3 } = g;
    const D = SL.data.dialogue;
    const play = Object.values(SL.data.characters).filter((c) => c.playable);
    eq(play.filter((c) => !D.introFor(c.id, '-')).map((c) => c.id).join(), '', 'fighters without an intro line');
    eq(play.filter((c) => !(D.lines[c.id + '_victory'] || []).length).map((c) => c.id).join(), '', 'fighters without a victory line');
    eq(play.filter((c) => !(c.sequences && c.sequences.intro) && (!c.intro || c.intro.pose === 'idle')).map((c) => c.id).join(), '', 'fighters whose intro is the plain combat stance');
    // Krillin against Android 16, intro not skipped: each says his line in his own intro pose
    const b = new SL.Battle({
      mode: 'free', stageId: 'wasteland', rules: { timeLimit: 0 },
      fighters: [{ charId: 'krillin', player: true, team: 0, pos: new V3(-6, 0, 0) }, { charId: 'android_16', team: 1, pos: new V3(6, 0, 0), dummy: 'idle' }],
      onEnd: () => {},
    });
    const said = [], poses = new Set();
    b.on('say', (e) => said.push(e.fighter.def.id + ': ' + e.line));
    b.start();
    g.until(b, () => b.phase === 'fight', 600, () => b.fighters.forEach((f) => poses.add(f.def.id + ':' + f.anim.name)));
    eq(b.phase, 'fight', 'the intro ends in the fight');
    ok(said.some((x) => x.startsWith('krillin: ')) && said.some((x) => x.startsWith('android_16: ')), 'both spoke: ' + said.join(' / '));
    ok(poses.has('krillin:k_discCharge') && poses.has('android_16:stand'), 'in their own intro poses');
    b.dispose();
    eq(g.errors.length, 0, 'engine errors: ' + g.errors.slice(0, 2).join(' | '));
  });
};
