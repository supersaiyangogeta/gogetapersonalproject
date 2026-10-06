// Checks a .glb character model against the game's import requirements and,
// optionally, packages it for the game (the base64 .glb.js twin that works from file://).
//
// Usage:
//   node tools/glb_check.js path/to/model.glb [--id name] [--height 1.85] [--facing 0|180]
//                           [--map jointmap.json] [--write-js] [--json]
//
// What it does, in order:
//   1. Parses the file with the game's own reader (src/render/glb.js).
//   2. Lists what the reader does not support (textures other than base color, morphs...).
//   3. Maps the 17 game joints to bones (your --map file, or the name-based guess) and
//      prints a ready-to-paste jointMap.
//   4. Checks scale, feet on the ground, facing direction, skin influences and budgets.
//   5. Checks the joint map makes sense: each game joint's bone sits below its parent's
//      bone in the file's hierarchy, left bones on the character's left, and limb
//      proportions are plausible (a swapped or shifted map shows up here).
//   6. Builds the model exactly like the game does and poses it through every shared
//      pose, checking the retargeting math puts each limb where the rig points it.
//   7. With --write-js, writes assets/models/<id>.glb.js (and copies the .glb there).
// Exit code 1 when the model cannot work in the game (parse error, no skin, no hips).
const fs = require('fs');
const path = require('path');
const H = require('../tests/headless');

const argv = process.argv.slice(2);
const flag = (name) => argv.includes('--' + name);
const opt = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : def;
};
const file = argv.find((a) => !a.startsWith('--') && /\.glb$/i.test(a));
if (!file) {
  console.log('usage: node tools/glb_check.js model.glb [--id name] [--height 1.85] [--facing 0|180] [--map map.json] [--write-js] [--json]');
  process.exit(2);
}
const id = opt('id', path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9_]/g, '_'));
const height = +opt('height', 1.85);
const facing = (+opt('facing', 0) * Math.PI) / 180;
const BUDGET = { triangles: 20000, joints: 60, materials: 4, bytes: 8 * 1024 * 1024 };

const g = H.create({ quiet: true, seed: 1 });
const { SL, THREE } = g;
const out = { file: path.resolve(file), id, errors: [], warnings: [], info: {} };
const err = (m) => out.errors.push(m);
const warn = (m) => out.warnings.push(m);

const bytes = fs.readFileSync(file);
const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
let parsed;
try {
  parsed = SL.GLB.parse(ab);
} catch (e) {
  err(e.message);
}

let model = null;
if (parsed) {
  const r = parsed.report;
  out.info.report = r;
  for (const u of r.unsupported) warn('not supported: ' + u);
  for (const w of r.warnings) if (!/not decoded/.test(w)) warn(w);
  if (!parsed.skins.length) err('no skin: the model has no armature bound to its mesh');
  if (parsed.skins.length > 1) warn(parsed.skins.length + ' skins: only the first one is driven');
  if (r.triangles > BUDGET.triangles) warn(`triangles ${r.triangles} over the ${BUDGET.triangles} budget (afterimages bake every vertex)`);
  if (r.joints > BUDGET.joints) warn(`joints ${r.joints} over the ${BUDGET.joints} budget`);
  if (r.materials > BUDGET.materials) warn(`materials ${r.materials} over the ${BUDGET.materials} budget (each is a draw call, plus its outline)`);
  if (r.bytes > BUDGET.bytes) warn(`file is ${(r.bytes / 1048576).toFixed(1)} MB; as base64 it grows by a third and loads with the page`);

  // skin influences
  for (const m of parsed.meshes) {
    const w = m.geometry.attributes.skinWeight;
    if (!w) continue;
    let bad = 0;
    for (let i = 0; i < w.count; i++) {
      const sum = w.getX(i) + w.getY(i) + w.getZ(i) + w.getW(i);
      if (Math.abs(sum - 1) > 0.02) bad++;
    }
    if (bad) warn(`${bad} vertices in "${m.name}" have weights that do not sum to 1`);
  }

  if (parsed.skins.length) {
    const names = parsed.skins[0].skeleton.bones.map((b) => b.userData.gltfName || b.name);
    let jointMap;
    if (opt('map')) jointMap = JSON.parse(fs.readFileSync(opt('map'), 'utf8'));
    else {
      const guess = SL.GLBModel.guessJointMap(names);
      jointMap = guess.map;
      if (guess.missing.length) warn('joint guess could not find: ' + guess.missing.join(', ') + ' — write a --map file for them');
    }
    out.info.jointMap = jointMap;
    out.info.bones = names;

    // build like the game: register the bytes under the id and make a model
    SL.assets.glb[id] = Buffer.from(bytes).toString('base64');
    const def = { id, name: id, appearance: { height: 1 }, model: { type: 'glb', asset: id, height, facing, jointMap } };
    try {
      model = SL.ModelBuilder.build(def);
    } catch (e) {
      err(e.message);
    }
  }
}

if (model) {
  const r = model.report;
  out.info.sourceHeight = r.sourceHeight;
  out.info.scale = r.scale;
  if (r.missingJoints.length) warn('unmapped game joints (they will not move): ' + r.missingJoints.join(', '));
  if (r.sourceHeight < 0.5 || r.sourceHeight > 4) warn(`bind pose is ${r.sourceHeight} units tall — exported in centimeters or with an unapplied scale? (normalized to ${height} m anyway)`);

  const W = (o) => {
    model.root.updateMatrixWorld(true);
    return o.getWorldPosition(new THREE.Vector3());
  };
  const J = model.jointMap;
  // facing: the character's left hand should be on +X when it faces +Z
  if (J.handL && J.handR) {
    const dx = W(J.handL).x - W(J.handR).x;
    if (dx < 0) warn('the left hand is on -X: the model faces -Z (use --facing 180, model.facing: Math.PI) or left and right are swapped in the joint map');
    out.info.facingOk = dx >= 0;
  }
  // structure of the map: hierarchy order, sides, proportions
  const PARENT = { spine: 'hips', chest: 'spine', neck: 'chest', head: 'neck', shoulderL: 'chest', elbowL: 'shoulderL', handL: 'elbowL', shoulderR: 'chest', elbowR: 'shoulderR', handR: 'elbowR', thighL: 'hips', kneeL: 'thighL', footL: 'kneeL', thighR: 'hips', kneeR: 'thighR', footR: 'kneeR' };
  const isBelow = (child, parent) => {
    for (let o = child.parent; o; o = o.parent) if (o === parent) return true;
    return false;
  };
  for (const [j, p] of Object.entries(PARENT)) if (J[j] && J[p] && !isBelow(J[j], J[p])) warn(`jointMap: ${j} ("${J[j].userData.gltfName}") is not below ${p} ("${J[p].userData.gltfName}") in the skeleton`);
  const restX = (b) => W(b).x;
  for (const side of ['L', 'R']) {
    for (const j of ['shoulder', 'elbow', 'hand', 'thigh', 'knee', 'foot']) {
      const b = J[j + side];
      if (!b) continue;
      const x = restX(b);
      if ((side === 'L' && x < -0.01) || (side === 'R' && x > 0.01)) warn(`jointMap: ${j + side} ("${b.userData.gltfName}") is on the character's ${side === 'L' ? 'right' : 'left'} side — left and right swapped?`);
    }
  }
  const len = (a, b) => (J[a] && J[b] ? W(J[a]).distanceTo(W(J[b])) : null);
  for (const side of ['L', 'R']) {
    const up = len('shoulder' + side, 'elbow' + side), fore = len('elbow' + side, 'hand' + side);
    if (up && fore && (fore / up < 0.5 || fore / up > 2)) warn(`arm ${side}: forearm/upper arm length ratio ${(fore / up).toFixed(2)} — a joint may be mapped to the wrong bone`);
    const th = len('thigh' + side, 'knee' + side), sh = len('knee' + side, 'foot' + side);
    if (th && sh && (sh / th < 0.5 || sh / th > 2)) warn(`leg ${side}: shin/thigh length ratio ${(sh / th).toFixed(2)} — a joint may be mapped to the wrong bone`);
  }

  // feet on the ground in the game's rest stance (hips placed by the Animator)
  const rest = new SL.Animator(model, { zero: {} });
  rest.breathe = 0;
  rest.play('zero', 10, { snap: true });
  rest.update(0);
  if (J.footL) {
    const box = new THREE.Box3();
    for (const m of model.gltf.meshes) if (m.isSkinnedMesh) for (let i = 0; i < m.geometry.attributes.position.count; i += 5) box.expandByPoint(W({ getWorldPosition: (v) => (v.fromBufferAttribute(m.geometry.attributes.position, i), m.boneTransform(i, v), v.applyMatrix4(m.matrixWorld)) }));
    out.info.lowestPoint = +box.min.y.toFixed(3);
    if (Math.abs(box.min.y) > 0.08) warn(`lowest point in the rest stance is ${out.info.lowestPoint} m from the ground — feet not at the bottom of the bind pose?`);
  }

  // retarget accuracy over every shared static pose
  const anim = new SL.Animator(model, SL.data.poses);
  anim.breathe = 0;
  const RIG_DIR = { shoulderL: [0, -1, 0], elbowL: [0, -1, 0], shoulderR: [0, -1, 0], elbowR: [0, -1, 0], thighL: [0, -1, 0], kneeL: [0, -1, 0], thighR: [0, -1, 0], kneeR: [0, -1, 0], neck: [0, 1, 0] };
  const CHILD = { shoulderL: 'elbowL', elbowL: 'handL', shoulderR: 'elbowR', elbowR: 'handR', thighL: 'kneeL', kneeL: 'footL', thighR: 'kneeR', kneeR: 'footR', neck: 'head' };
  let worst = { deg: 0 }, sum = 0, n = 0;
  const q = new THREE.Quaternion();
  for (const [name, p] of Object.entries(SL.data.poses)) {
    if (typeof p === 'function') continue;
    anim.play(name, 10, { snap: true });
    anim.update(0);
    for (const [j, c] of Object.entries(CHILD)) {
      if (!J[j] || !J[c]) continue;
      // expected: the driver rig's segment direction, in the model's pivot frame
      const W2 = model.driverWorld[j];
      const expected = new THREE.Vector3().fromArray(RIG_DIR[j]).applyQuaternion(W2).applyQuaternion(model.pivot.getWorldQuaternion(q));
      const actual = W(J[c]).sub(W(J[j])).normalize();
      const deg = (expected.angleTo(actual) * 180) / Math.PI;
      sum += deg;
      n++;
      if (deg > worst.deg) worst = { deg: +deg.toFixed(2), pose: name, joint: j };
    }
  }
  // the retarget check proves the math (bone roll, rest pose, hierarchy); map mistakes are caught by the structure checks above
  out.info.retarget = { poses: n ? Math.round(n / Object.keys(CHILD).length) : 0, meanDeg: n ? +(sum / n).toFixed(2) : null, worst };
  if (worst.deg > 5) warn(`limb retargeting is off by up to ${worst.deg}° (${worst.joint} in pose "${worst.pose}") — check the joint map`);

  // cost of the per-frame work
  const t0 = Date.now();
  for (let i = 0; i < 1000; i++) model.afterPose();
  out.info.retargetMsPerFrame = +((Date.now() - t0) / 1000).toFixed(4);
  const t1 = Date.now();
  model.ghostClone();
  out.info.afterimageBakeMs = Date.now() - t1;
}

if (flag('write-js') && !out.errors.length) {
  const dir = path.join(__dirname, '..', 'assets', 'models');
  fs.mkdirSync(dir, { recursive: true });
  const glbDest = path.join(dir, id + '.glb');
  if (path.resolve(file) !== path.resolve(glbDest)) fs.copyFileSync(file, glbDest);
  fs.writeFileSync(
    path.join(dir, id + '.glb.js'),
    '// Generated by tools/glb_check.js from ' + path.basename(file) + ' — base64 of ' + id + '.glb so the game can load it from file://.\n' +
      "window.SL = window.SL || {};\nSL.assets = SL.assets || {};\nSL.assets.glb = SL.assets.glb || {};\nSL.assets.glb['" + id + "'] = '" + bytes.toString('base64') + "';\n"
  );
  out.info.wrote = ['assets/models/' + id + '.glb', 'assets/models/' + id + '.glb.js'];
}

if (flag('json')) console.log(JSON.stringify(out, null, 1));
else {
  const r = out.info.report || {};
  console.log(`${path.basename(file)} -> id "${id}"`);
  if (out.info.report) console.log(`  ${r.vertices} vertices, ${r.triangles} triangles, ${r.joints} joints, ${r.materials} materials, ${r.textures} textures, clips: ${r.clips.join(', ') || 'none'}, ${(r.bytes / 1024).toFixed(0)} KB, parse ${r.parseMs} ms`);
  if (out.info.sourceHeight) console.log(`  bind pose height ${out.info.sourceHeight} (scale x${out.info.scale} to ${height} m), lowest point in rest stance ${out.info.lowestPoint} m`);
  if (out.info.retarget) console.log(`  retargeting math over ${out.info.retarget.poses} poses: mean ${out.info.retarget.meanDeg}°, worst ${out.info.retarget.worst.deg}°${out.info.retarget.worst.pose ? ' (' + out.info.retarget.worst.joint + ', ' + out.info.retarget.worst.pose + ')' : ''}; ${out.info.retargetMsPerFrame} ms/frame; afterimage bake ${out.info.afterimageBakeMs} ms`);
  if (out.info.jointMap) console.log('  jointMap: ' + JSON.stringify(out.info.jointMap));
  for (const w of out.warnings) console.log('  WARNING ' + w);
  for (const e of out.errors) console.log('  ERROR   ' + e);
  if (out.info.wrote) console.log('  wrote ' + out.info.wrote.join(', '));
  console.log(out.errors.length ? '  RESULT: cannot be used yet' : out.warnings.length ? '  RESULT: usable, see warnings' : '  RESULT: ready');
}
process.exit(out.errors.length ? 1 : 0);
