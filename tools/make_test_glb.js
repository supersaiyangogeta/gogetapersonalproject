// Generates the .glb pipeline test model: an original, generic "test mannequin"
// built from code (no downloaded or third-party asset, no likeness of any character).
//
// It is deliberately NOT shaped like the game's own procedural rig, so the import
// pipeline has real work to do:
//   - different bone names (Pelvis, UpperArm_L, Shin_R...) and extra bones the game
//     does not use (Root, Spine02, Clavicle_*, finger/toe/head tips)
//   - T-pose bind pose (the game's rig rests with arms down)
//   - Blender-style bone orientation (each bone's local +Y points along the bone), so
//     every bone has a non-identity rest rotation
//   - smooth skin weights across elbows, knees and the spine (up to 2 influences)
//   - three materials, one with an embedded PNG base color texture (an original
//     generated panel pattern) and UVs on every surface
//   - an extra non-bone socket node on the right hand
//   - two embedded animation clips ("Idle", "Wave")
//
// Output: assets/models/test_dummy.glb and assets/models/test_dummy.glb.js (the same
// bytes as base64, so the game can load it when opened straight from file://).
// Usage: node tools/make_test_glb.js
const fs = require('fs');
const path = require('path');
const THREE = require('../vendor/three.min.js');
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------------- skeleton (world-space heads and tails, T-pose, meters, faces +Z) ---------------- */
const B = [];
function bone(name, parent, head, tail) {
  const b = { name, parent: parent ? B.find((x) => x.name === parent) : null, head, tail, index: B.length };
  B.push(b);
  return b;
}
bone('Root', null, V(0, 0, 0), V(0, 0.92, 0));
bone('Pelvis', 'Root', V(0, 0.92, 0), V(0, 1.08, 0));
bone('Spine01', 'Pelvis', V(0, 1.08, 0), V(0, 1.22, 0));
bone('Spine02', 'Spine01', V(0, 1.22, 0), V(0, 1.36, 0));
bone('Chest', 'Spine02', V(0, 1.36, 0), V(0, 1.56, 0));
bone('Neck', 'Chest', V(0, 1.56, 0), V(0, 1.64, 0));
bone('Head', 'Neck', V(0, 1.64, 0), V(0, 1.9, 0));
bone('HeadTip', 'Head', V(0, 1.9, 0), V(0, 1.96, 0));
for (const [s, side] of [[1, 'L'], [-1, 'R']]) {
  bone('Clavicle_' + side, 'Chest', V(s * 0.04, 1.5, 0), V(s * 0.18, 1.5, 0));
  bone('UpperArm_' + side, 'Clavicle_' + side, V(s * 0.18, 1.5, 0), V(s * 0.46, 1.5, 0));
  bone('Forearm_' + side, 'UpperArm_' + side, V(s * 0.46, 1.5, 0), V(s * 0.72, 1.5, 0));
  bone('Hand_' + side, 'Forearm_' + side, V(s * 0.72, 1.5, 0), V(s * 0.84, 1.5, 0));
  bone('Fingers_' + side, 'Hand_' + side, V(s * 0.84, 1.5, 0), V(s * 0.9, 1.5, 0));
  bone('Thigh_' + side, 'Pelvis', V(s * 0.1, 0.92, 0), V(s * 0.1, 0.5, 0));
  bone('Shin_' + side, 'Thigh_' + side, V(s * 0.1, 0.5, 0), V(s * 0.1, 0.08, 0));
  bone('Foot_' + side, 'Shin_' + side, V(s * 0.1, 0.08, 0), V(s * 0.1, 0.03, 0.15));
  bone('Toe_' + side, 'Foot_' + side, V(s * 0.1, 0.03, 0.15), V(s * 0.1, 0.03, 0.21));
}
const byName = (n) => B.find((b) => b.name === n);

// rest transforms: local +Y along the bone (Blender convention)
for (const b of B) {
  const dir = b.tail.clone().sub(b.head).normalize();
  b.worldQ = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
  b.worldM = new THREE.Matrix4().compose(b.head, b.worldQ, V(1, 1, 1));
  if (b.parent) {
    const invPQ = b.parent.worldQ.clone().invert();
    b.localQ = invPQ.clone().multiply(b.worldQ);
    b.localT = b.head.clone().sub(b.parent.head).applyQuaternion(invPQ);
  } else {
    b.localQ = b.worldQ.clone();
    b.localT = b.head.clone();
  }
}

/* ---------------- mesh ---------------- */
// the body color comes from the texture (factor white); the other two use flat factors
const MATS = [
  { name: 'Body', color: [1, 1, 1], texture: true },
  { name: 'Accent', color: [1.0, 0.56, 0.12] },
  { name: 'Visor', color: [0.08, 0.12, 0.2] },
];
const prims = MATS.map(() => ({ pos: [], nrm: [], uv: [], jnt: [], wgt: [], idx: [] }));

function addVertex(p, pos, nrm, weights, uv = [0, 0]) {
  p.pos.push(pos.x, pos.y, pos.z);
  p.nrm.push(nrm.x, nrm.y, nrm.z);
  p.uv.push(uv[0], uv[1]);
  const w = weights.slice(0, 4);
  while (w.length < 4) w.push([0, 0]);
  const sum = w.reduce((a, x) => a + x[1], 0) || 1;
  p.jnt.push(...w.map((x) => x[0]));
  p.wgt.push(...w.map((x) => x[1] / sum));
  return p.pos.length / 3 - 1;
}

/**
 * Tapered 8-sided tube from a to b with three rings and end caps.
 * weightsAt(t) gives the bone influences for a ring at parameter t (0 = a, 1 = b).
 */
function tube(mat, a, b, radii, weightsAt, sides = 8) {
  const p = prims[mat];
  const axis = b.clone().sub(a);
  const len = axis.length();
  axis.normalize();
  const ref = Math.abs(axis.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(axis, ref).normalize();
  const v = new THREE.Vector3().crossVectors(axis, u).normalize();
  const ringT = [0, 0.5, 1];
  const rings = ringT.map((t, ri) => {
    const c = a.clone().addScaledVector(axis, len * t);
    const ids = [];
    for (let i = 0; i <= sides; i++) {
      const ang = (i / sides) * Math.PI * 2;
      const n = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(v, Math.sin(ang));
      ids.push(addVertex(p, c.clone().addScaledVector(n, radii[ri]), n, weightsAt(t), [i / sides, t * Math.max(1, Math.round(len / 0.3))]));
    }
    return { c, ids };
  });
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < sides; i++) {
      const a0 = rings[r].ids[i], a1 = rings[r].ids[i + 1];
      const b0 = rings[r + 1].ids[i], b1 = rings[r + 1].ids[i + 1];
      p.idx.push(a0, a1, b0, a1, b1, b0); // counter-clockwise seen from outside
    }
  }
  // caps
  for (const [ring, t, flip] of [[rings[0], 0, true], [rings[rings.length - 1], 1, false]]) {
    const n = axis.clone().multiplyScalar(flip ? -1 : 1);
    const center = addVertex(p, ring.c, n, weightsAt(t), [0.5, 0.5]);
    const capIds = ring.ids.slice(0, sides).map((id, i) => {
      const ang = (i / sides) * Math.PI * 2;
      return addVertex(p, V(p.pos[id * 3], p.pos[id * 3 + 1], p.pos[id * 3 + 2]), n, weightsAt(t), [0.5 + Math.cos(ang) * 0.45, 0.5 + Math.sin(ang) * 0.45]);
    });
    for (let i = 0; i < sides; i++) {
      const x = capIds[i], y = capIds[(i + 1) % sides];
      if (flip) p.idx.push(center, y, x);
      else p.idx.push(center, x, y);
    }
  }
}

/** Axis-aligned box rigidly weighted to one bone. */
function box(mat, min, max, boneName) {
  const p = prims[mat];
  const j = byName(boneName).index;
  const faces = [
    [V(1, 0, 0), [[max.x, min.y, min.z], [max.x, max.y, min.z], [max.x, max.y, max.z], [max.x, min.y, max.z]]],
    [V(-1, 0, 0), [[min.x, min.y, max.z], [min.x, max.y, max.z], [min.x, max.y, min.z], [min.x, min.y, min.z]]],
    [V(0, 1, 0), [[min.x, max.y, min.z], [min.x, max.y, max.z], [max.x, max.y, max.z], [max.x, max.y, min.z]]],
    [V(0, -1, 0), [[min.x, min.y, max.z], [min.x, min.y, min.z], [max.x, min.y, min.z], [max.x, min.y, max.z]]],
    [V(0, 0, 1), [[max.x, min.y, max.z], [max.x, max.y, max.z], [min.x, max.y, max.z], [min.x, min.y, max.z]]],
    [V(0, 0, -1), [[min.x, min.y, min.z], [min.x, max.y, min.z], [max.x, max.y, min.z], [max.x, min.y, min.z]]],
  ];
  for (const [n, quad] of faces) {
    const QUV = [[0, 1], [0, 0], [1, 0], [1, 1]];
    const ids = quad.map((q, k) => addVertex(p, V(q[0], q[1], q[2]), n, [[j, 1]], QUV[k]));
    p.idx.push(ids[0], ids[1], ids[2], ids[0], ids[2], ids[3]);
  }
}

// weights: blend 40% into the parent bone at the start of a segment and 40% into the child at its end
const seg = (boneName, childName) => (t) => {
  const b = byName(boneName);
  const own = b.index;
  if (t <= 0 && b.parent && b.parent.name !== 'Root') return [[own, 0.6], [b.parent.index, 0.4]];
  if (t >= 1 && childName) return [[own, 0.6], [byName(childName).index, 0.4]];
  return [[own, 1]];
};
const rigid = (boneName) => () => [[byName(boneName).index, 1]];

tube(0, V(0, 0.88, 0), V(0, 1.08, 0), [0.15, 0.17, 0.15], rigid('Pelvis'));
tube(0, V(0, 1.08, 0), V(0, 1.22, 0), [0.14, 0.13, 0.14], seg('Spine01', 'Spine02'));
tube(0, V(0, 1.22, 0), V(0, 1.36, 0), [0.14, 0.15, 0.16], seg('Spine02', 'Chest'));
tube(0, V(0, 1.36, 0), V(0, 1.58, 0), [0.17, 0.2, 0.18], rigid('Chest'));
tube(0, V(0, 1.56, 0), V(0, 1.66, 0), [0.05, 0.045, 0.05], rigid('Neck'));
tube(0, V(0, 1.64, 0), V(0, 1.9, 0), [0.1, 0.12, 0.09], rigid('Head'));
box(2, V(-0.08, 1.74, 0.09), V(0.08, 1.8, 0.125), 'Head'); // visor: shows which way it faces
box(1, V(-0.12, 1.38, 0.16), V(0.12, 1.52, 0.205), 'Chest'); // chest plate
for (const [s, side] of [[1, 'L'], [-1, 'R']]) {
  tube(0, V(s * 0.16, 1.5, 0), V(s * 0.46, 1.5, 0), [0.065, 0.058, 0.05], seg('UpperArm_' + side, 'Forearm_' + side));
  tube(0, V(s * 0.46, 1.5, 0), V(s * 0.72, 1.5, 0), [0.05, 0.046, 0.04], seg('Forearm_' + side, 'Hand_' + side));
  tube(1, V(s * 0.44, 1.5, 0), V(s * 0.48, 1.5, 0), [0.064, 0.066, 0.064], rigid('Forearm_' + side)); // elbow marker
  box(1, V(Math.min(s * 0.72, s * 0.86), 1.46, -0.045), V(Math.max(s * 0.72, s * 0.86), 1.54, 0.045), 'Hand_' + side);
  tube(0, V(s * 0.1, 0.94, 0), V(s * 0.1, 0.5, 0), [0.085, 0.078, 0.065], seg('Thigh_' + side, 'Shin_' + side));
  tube(0, V(s * 0.1, 0.5, 0), V(s * 0.1, 0.08, 0), [0.065, 0.058, 0.05], seg('Shin_' + side, 'Foot_' + side));
  tube(1, V(s * 0.1, 0.52, 0), V(s * 0.1, 0.48, 0), [0.08, 0.082, 0.08], rigid('Shin_' + side)); // knee marker
  box(1, V(s * 0.1 - 0.055, 0, -0.06), V(s * 0.1 + 0.055, 0.09, 0.2), 'Foot_' + side);
}

/* ---------------- animations (local rotations = rest * delta about the bone's local axis) ---------------- */
function rotTrack(boneName, times, axis, angles) {
  const b = byName(boneName);
  const vals = [];
  for (const a of angles) {
    const q = b.localQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(axis, a));
    vals.push(q.x, q.y, q.z, q.w);
  }
  return { node: b, times, vals };
}
const clips = [
  {
    name: 'Idle',
    tracks: [
      rotTrack('Chest', [0, 1, 2], V(1, 0, 0), [0, 0.06, 0]),
      rotTrack('Head', [0, 1, 2], V(0, 1, 0), [0.15, -0.15, 0.15]),
    ],
  },
  {
    name: 'Wave',
    tracks: [
      rotTrack('UpperArm_R', [0, 0.3, 1.5], V(1, 0, 0), [0, -1.2, -1.2]),
      rotTrack('Forearm_R', [0, 0.3, 0.6, 0.9, 1.2, 1.5], V(1, 0, 0), [0, -0.3, -0.9, -0.3, -0.9, -0.3]),
    ],
  },
];

/* ---------------- texture: generated panel pattern (PNG) ---------------- */
function makePanelPNG(size = 64) {
  const zlib = require('zlib');
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let c = [158, 163, 173];
      const seam = x % 32 === 0 || y % 16 === 0;
      if (seam) c = [104, 108, 118];
      else if ((x % 32) < 3 && (y % 16) > 11) c = [236, 142, 30]; // small marker square in each panel
      else if (((x >> 2) + (y >> 2)) % 2 === 0) c = [150, 155, 165]; // faint checker so stretching is visible
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = c[0];
      raw[o + 1] = c[1];
      raw[o + 2] = c[2];
    }
  }
  const crcTable = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
  });
  const crc32 = (buf) => {
    let c = -1;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const panelPNG = makePanelPNG();

/* ---------------- glTF assembly ---------------- */
const bin = [];
let binLen = 0;
const bufferViews = [], accessors = [];
function pushView(typed, target) {
  const pad = (4 - (binLen % 4)) % 4;
  if (pad) {
    bin.push(Buffer.alloc(pad));
    binLen += pad;
  }
  const buf = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);
  bufferViews.push(Object.assign({ buffer: 0, byteOffset: binLen, byteLength: buf.length }, target ? { target } : {}));
  bin.push(buf);
  binLen += buf.length;
  return bufferViews.length - 1;
}
function accessor(typed, componentType, type, count, target, extra = {}) {
  accessors.push(Object.assign({ bufferView: pushView(typed, target), componentType, count, type }, extra));
  return accessors.length - 1;
}

const nodes = [];
nodes.push({ name: 'Armature', children: [] }); // 0
for (const b of B) {
  b.node = nodes.length;
  nodes.push({ name: b.name, translation: b.localT.toArray(), rotation: b.localQ.toArray(), children: [] });
}
nodes[0].children.push(byName('Root').node);
for (const b of B) if (b.parent) nodes[b.parent.node].children.push(b.node);
// a plain socket node on the right hand (not a joint) for attaching effects or props
const socket = nodes.length;
nodes.push({ name: 'Socket_HandR', translation: [0, 0.06, 0.05] });
nodes[byName('Hand_R').node].children.push(socket);
for (const n of nodes) if (n.children && !n.children.length) delete n.children;

const ibm = new Float32Array(B.length * 16);
B.forEach((b, i) => ibm.set(b.worldM.clone().invert().elements, i * 16));
const skin = { name: 'MannequinSkin', joints: B.map((b) => b.node), skeleton: byName('Root').node, inverseBindMatrices: accessor(ibm, 5126, 'MAT4', B.length) };

const primitives = prims.map((p, mi) => {
  const pos = new Float32Array(p.pos);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], pos[i + k]);
    max[k] = Math.max(max[k], pos[i + k]);
  }
  return {
    attributes: {
      POSITION: accessor(pos, 5126, 'VEC3', pos.length / 3, 34962, { min, max }),
      NORMAL: accessor(new Float32Array(p.nrm), 5126, 'VEC3', p.nrm.length / 3, 34962),
      TEXCOORD_0: accessor(new Float32Array(p.uv), 5126, 'VEC2', p.uv.length / 2, 34962),
      JOINTS_0: accessor(new Uint8Array(p.jnt), 5121, 'VEC4', p.jnt.length / 4, 34962),
      WEIGHTS_0: accessor(new Float32Array(p.wgt), 5126, 'VEC4', p.wgt.length / 4, 34962),
    },
    indices: accessor(new Uint16Array(p.idx), 5123, 'SCALAR', p.idx.length, 34963),
    material: mi,
    mode: 4,
  };
});
const meshNode = nodes.length;
nodes.push({ name: 'MannequinBody', mesh: 0, skin: 0 });

const animations = clips.map((c) => {
  const samplers = [], channels = [];
  for (const t of c.tracks) {
    const times = new Float32Array(t.times);
    const input = accessor(times, 5126, 'SCALAR', times.length, undefined, { min: [times[0]], max: [times[times.length - 1]] });
    const output = accessor(new Float32Array(t.vals), 5126, 'VEC4', t.vals.length / 4);
    samplers.push({ input, output, interpolation: 'LINEAR' });
    channels.push({ sampler: samplers.length - 1, target: { node: t.node.node, path: 'rotation' } });
  }
  return { name: c.name, samplers, channels };
});

const gltf = {
  asset: { version: '2.0', generator: 'Saiyan Legacy tools/make_test_glb.js', copyright: 'Original test asset generated by the project; free to use in this project.' },
  scene: 0,
  scenes: [{ name: 'TestMannequin', nodes: [0, meshNode] }],
  nodes,
  meshes: [{ name: 'MannequinBody', primitives }],
  materials: MATS.map((m) => ({ name: m.name, pbrMetallicRoughness: Object.assign({ baseColorFactor: [...m.color, 1], metallicFactor: 0, roughnessFactor: 0.85 }, m.texture ? { baseColorTexture: { index: 0 } } : {}) })),
  textures: [{ source: 0, sampler: 0 }],
  images: [{ name: 'panel', mimeType: 'image/png', bufferView: pushView(new Uint8Array(panelPNG.buffer, panelPNG.byteOffset, panelPNG.byteLength)) }],
  samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
  skins: [skin],
  animations,
  accessors,
  bufferViews,
  buffers: [{ byteLength: 0 }],
};
const tailPad = (4 - (binLen % 4)) % 4;
if (tailPad) bin.push(Buffer.alloc(tailPad));
const binBuf = Buffer.concat(bin);
gltf.buffers[0].byteLength = binBuf.length;
let jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + binBuf.length, 8);
const chunk = (type, data) => {
  const h = Buffer.alloc(8);
  h.writeUInt32LE(data.length, 0);
  h.writeUInt32LE(type, 4);
  return Buffer.concat([h, data]);
};
const glb = Buffer.concat([header, chunk(0x4e4f534a, jsonBuf), chunk(0x004e4942, binBuf)]);

const outDir = path.join(__dirname, '..', 'assets', 'models');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'test_dummy.glb'), glb);
fs.writeFileSync(
  path.join(outDir, 'test_dummy.glb.js'),
  '// Generated by tools/make_test_glb.js — the same bytes as test_dummy.glb, base64-encoded so the game\n' +
    '// can load the model when opened from file:// (browsers block fetch() there). Original test asset.\n' +
    "window.SL = window.SL || {};\nSL.assets = SL.assets || {};\nSL.assets.glb = SL.assets.glb || {};\nSL.assets.glb.test_dummy = '" +
    glb.toString('base64') +
    "';\n"
);
const verts = prims.reduce((a, p) => a + p.pos.length / 3, 0), tris = prims.reduce((a, p) => a + p.idx.length / 3, 0);
console.log(`test_dummy.glb: ${glb.length} bytes, ${B.length} joints, ${verts} vertices, ${tris} triangles, ${MATS.length} materials, 1 texture (${panelPNG.length} byte PNG), ${clips.length} clips`);
