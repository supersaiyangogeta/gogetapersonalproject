/*
 * Minimal binary glTF 2.0 (.glb) reader, written for this project so no loader
 * has to be downloaded. It turns a .glb into three.js objects:
 *
 *   SL.GLB.parse(arrayBuffer) -> { scene, nodes, skins, meshes, clips, materials, report }
 *
 * Supported: the GLB container, embedded binary buffer (and base64 data: URIs),
 * node hierarchy (TRS or matrix), triangle primitives with POSITION / NORMAL /
 * TEXCOORD_0 / JOINTS_0 / WEIGHTS_0 / indices (any standard component type,
 * normalized integers, interleaved bufferViews), base color factor materials,
 * skins (joints + inverse bind matrices -> SkinnedMesh), animations on
 * translation / rotation / scale with LINEAR or STEP interpolation, and base
 * color textures embedded in the file (PNG / JPEG, sampler wrap and filters).
 *
 * Textures decode asynchronously (the browser's createImageBitmap, or
 * opts.decodeImage). The model is usable at once with its color factors;
 * result.ready resolves when every texture is on its material.
 *
 * Not supported yet (reported, never silently wrong): normal / emissive /
 * metal-roughness / occlusion textures, KHR_texture_transform, sparse
 * accessors, morph targets, cameras, lights, external .bin or image files,
 * CUBICSPLINE interpolation (keyframe values only), required extensions.
 */
(function () {
  'use strict';
  const MAGIC = 0x46546c67, CHUNK_JSON = 0x4e4f534a, CHUNK_BIN = 0x004e4942;
  const COMPONENT = {
    5120: [Int8Array, 1, 127],
    5121: [Uint8Array, 1, 255],
    5122: [Int16Array, 2, 32767],
    5123: [Uint16Array, 2, 65535],
    5125: [Uint32Array, 4, 4294967295],
    5126: [Float32Array, 4, 1],
  };
  const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
  const PATHS = { translation: 'position', rotation: 'quaternion', scale: 'scale' };

  function decodeBase64(str) {
    if (typeof atob === 'function') {
      const s = atob(str);
      const out = new Uint8Array(s.length);
      for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
      return out.buffer;
    }
    const b = Buffer.from(str, 'base64');
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  }

  function parse(arrayBuffer, opts = {}) {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const report = { unsupported: [], warnings: [] };
    const dv = new DataView(arrayBuffer);
    if (arrayBuffer.byteLength < 20 || dv.getUint32(0, true) !== MAGIC) throw new Error('GLB: not a binary glTF file (bad magic)');
    const version = dv.getUint32(4, true);
    if (version !== 2) throw new Error('GLB: unsupported glTF version ' + version + ' (need 2)');
    const total = dv.getUint32(8, true);
    if (total > arrayBuffer.byteLength) throw new Error('GLB: file is truncated (' + arrayBuffer.byteLength + ' of ' + total + ' bytes)');
    let json = null, bin = null;
    for (let off = 12; off + 8 <= total; ) {
      const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
      const start = off + 8;
      if (type === CHUNK_JSON) json = JSON.parse(new TextDecoder().decode(new Uint8Array(arrayBuffer, start, len)));
      else if (type === CHUNK_BIN) bin = new Uint8Array(arrayBuffer, start, len);
      off = start + len;
    }
    if (!json) throw new Error('GLB: missing JSON chunk');
    if (!json.asset || String(json.asset.version).split('.')[0] !== '2') throw new Error('GLB: asset.version must be 2.x');
    if (json.extensionsRequired && json.extensionsRequired.length) throw new Error('GLB: required extensions not supported: ' + json.extensionsRequired.join(', '));
    if (json.extensionsUsed && json.extensionsUsed.length) report.warnings.push('extensions ignored: ' + json.extensionsUsed.join(', '));

    const buffers = (json.buffers || []).map((b, i) => {
      if (b.uri === undefined) {
        if (!bin) throw new Error('GLB: buffer ' + i + ' has no data');
        return bin;
      }
      const m = /^data:.*?;base64,(.*)$/.exec(b.uri);
      if (m) return new Uint8Array(decodeBase64(m[1]));
      throw new Error('GLB: external buffer "' + b.uri + '" is not supported — export a single .glb');
    });

    const accCache = new Map();
    function readAccessor(i) {
      if (accCache.has(i)) return accCache.get(i);
      const a = json.accessors[i];
      if (a.sparse) throw new Error('GLB: sparse accessors are not supported (accessor ' + i + ')');
      const [Typed, bytes, maxInt] = COMPONENT[a.componentType] || [];
      if (!Typed) throw new Error('GLB: unknown component type ' + a.componentType);
      const n = SIZE[a.type];
      const out = new Typed(a.count * n);
      if (a.bufferView !== undefined) {
        const bv = json.bufferViews[a.bufferView];
        const buf = buffers[bv.buffer];
        const stride = bv.byteStride || n * bytes;
        const base = buf.byteOffset + (bv.byteOffset || 0) + (a.byteOffset || 0);
        const view = new DataView(buf.buffer, base, Math.min(bv.byteLength - (a.byteOffset || 0), a.count * stride));
        const get = { 5120: 'getInt8', 5121: 'getUint8', 5122: 'getInt16', 5123: 'getUint16', 5125: 'getUint32', 5126: 'getFloat32' }[a.componentType];
        for (let e = 0; e < a.count; e++) for (let k = 0; k < n; k++) out[e * n + k] = view[get](e * stride + k * bytes, true);
      }
      const res = { array: out, itemSize: n, normalized: !!a.normalized && a.componentType !== 5126, maxInt, componentType: a.componentType, count: a.count };
      accCache.set(i, res);
      return res;
    }
    const floatOf = (acc) => {
      if (acc.array instanceof Float32Array) return acc.array;
      const f = new Float32Array(acc.array.length);
      for (let i = 0; i < f.length; i++) f[i] = acc.normalized ? Math.max(acc.array[i] / acc.maxInt, -1) : acc.array[i];
      return f;
    };

    // textures: embedded images become THREE.Textures that fill in when decoded
    const pending = [];
    const WRAP = { 33071: THREE.ClampToEdgeWrapping, 33648: THREE.MirroredRepeatWrapping, 10497: THREE.RepeatWrapping };
    const FILTER = { 9728: THREE.NearestFilter, 9729: THREE.LinearFilter, 9984: THREE.NearestMipmapNearestFilter, 9985: THREE.LinearMipmapNearestFilter, 9986: THREE.NearestMipmapLinearFilter, 9987: THREE.LinearMipmapLinearFilter };
    const decode = opts.decodeImage || (typeof createImageBitmap === 'function' && typeof Blob === 'function' ? (bytes, mime) => createImageBitmap(new Blob([bytes], { type: mime }), { imageOrientation: 'none', premultiplyAlpha: 'none' }) : null);
    const texCache = new Map();
    function imageBytes(img) {
      if (img.bufferView !== undefined) {
        const bv = json.bufferViews[img.bufferView];
        const buf = buffers[bv.buffer];
        return { bytes: new Uint8Array(buf.buffer, buf.byteOffset + (bv.byteOffset || 0), bv.byteLength).slice(), mime: img.mimeType || 'image/png' };
      }
      const m = img.uri && /^data:(.*?);base64,(.*)$/.exec(img.uri);
      if (m) return { bytes: new Uint8Array(decodeBase64(m[2])), mime: m[1] || 'image/png' };
      throw new Error('GLB: external image "' + img.uri + '" is not supported — embed images in the .glb');
    }
    function texture(ref, what) {
      if (!ref) return null;
      if (ref.texCoord) report.unsupported.push(what + ' uses texCoord ' + ref.texCoord + ' (only the first UV set)');
      if (ref.extensions && ref.extensions.KHR_texture_transform) report.unsupported.push(what + ' uses KHR_texture_transform (ignored)');
      if (texCache.has(ref.index)) return texCache.get(ref.index);
      const td = json.textures[ref.index];
      if (td.source === undefined) {
        report.unsupported.push(what + ': texture without an image source');
        return null;
      }
      const img = json.images[td.source];
      const { bytes, mime } = imageBytes(img);
      if (!/^image\/(png|jpeg)$/.test(mime)) report.unsupported.push(what + ': image type ' + mime + ' may not decode everywhere');
      const tex = new THREE.Texture();
      tex.name = img.name || 'image' + td.source;
      tex.flipY = false; // glTF UVs start at the top-left
      const smp = td.sampler !== undefined ? json.samplers[td.sampler] : {};
      tex.wrapS = WRAP[smp.wrapS] || THREE.RepeatWrapping;
      tex.wrapT = WRAP[smp.wrapT] || THREE.RepeatWrapping;
      tex.magFilter = FILTER[smp.magFilter] || THREE.LinearFilter;
      tex.minFilter = FILTER[smp.minFilter] || THREE.LinearMipmapLinearFilter;
      tex.userData.bytes = bytes;
      tex.userData.mimeType = mime;
      if (decode) {
        pending.push(
          Promise.resolve()
            .then(() => decode(bytes, mime))
            .then(
              (image) => {
                tex.image = image;
                tex.needsUpdate = true;
                tex.userData.decoded = true;
                return tex;
              },
              (e) => {
                report.warnings.push('texture "' + tex.name + '" failed to decode: ' + (e && e.message));
                return tex;
              }
            )
        );
      } else report.warnings.push('texture "' + tex.name + '" not decoded (no image decoder here)');
      texCache.set(ref.index, tex);
      return tex;
    }

    // materials
    const makeMat = opts.makeMaterial || ((m) => new THREE.MeshStandardMaterial({ color: m.color, map: m.map, opacity: m.opacity, transparent: m.transparent, side: m.doubleSided ? THREE.DoubleSide : THREE.FrontSide }));
    const materials = (json.materials || []).map((m, i) => {
      const pbr = m.pbrMetallicRoughness || {};
      const c = pbr.baseColorFactor || [1, 1, 1, 1];
      const label = 'material "' + (m.name || i) + '"';
      for (const k of ['normalTexture', 'emissiveTexture', 'occlusionTexture']) if (m[k]) report.unsupported.push(k + ' on ' + label);
      if (pbr.metallicRoughnessTexture) report.unsupported.push('metallicRoughnessTexture on ' + label);
      const map = texture(pbr.baseColorTexture, 'base color of ' + label);
      const mat = makeMat({ color: new THREE.Color(c[0], c[1], c[2]), map, opacity: c[3], transparent: m.alphaMode === 'BLEND' || c[3] < 1, doubleSided: !!m.doubleSided, name: m.name || 'material' + i });
      mat.name = m.name || 'material' + i;
      if (map && !mat.map) mat.map = map;
      if (m.alphaMode === 'MASK') mat.alphaTest = m.alphaCutoff !== undefined ? m.alphaCutoff : 0.5;
      return mat;
    });
    const defaultMat = () => makeMat({ color: new THREE.Color(0.8, 0.8, 0.8), map: null, opacity: 1, transparent: false, doubleSided: false, name: 'default' });
    if (json.cameras && json.cameras.length) report.unsupported.push('cameras');

    // which nodes are joints
    const jointSet = new Set();
    for (const s of json.skins || []) for (const j of s.joints) jointSet.add(j);

    // nodes
    const usedNames = new Set();
    const nodes = (json.nodes || []).map((n, i) => {
      const o = jointSet.has(i) ? new THREE.Bone() : new THREE.Group();
      let name = THREE.PropertyBinding.sanitizeNodeName(n.name || 'node' + i);
      while (usedNames.has(name)) name += '_' + i;
      usedNames.add(name);
      o.name = name;
      o.userData.gltfName = n.name;
      o.userData.gltfIndex = i;
      if (n.matrix) new THREE.Matrix4().fromArray(n.matrix).decompose(o.position, o.quaternion, o.scale);
      else {
        if (n.translation) o.position.fromArray(n.translation);
        if (n.rotation) o.quaternion.fromArray(n.rotation);
        if (n.scale) o.scale.fromArray(n.scale);
      }
      if (n.camera !== undefined) report.unsupported.push('camera on node "' + n.name + '"');
      return o;
    });
    (json.nodes || []).forEach((n, i) => (n.children || []).forEach((c) => nodes[i].add(nodes[c])));

    // meshes
    let vertexCount = 0, triangleCount = 0;
    const meshes = [];
    (json.nodes || []).forEach((n, i) => {
      if (n.mesh === undefined) return;
      const mdef = json.meshes[n.mesh];
      for (const [pi, p] of mdef.primitives.entries()) {
        if (p.mode !== undefined && p.mode !== 4) {
          report.unsupported.push('primitive mode ' + p.mode + ' in mesh "' + mdef.name + '" (only triangles)');
          continue;
        }
        if (p.targets) report.unsupported.push('morph targets in mesh "' + mdef.name + '"');
        const g = new THREE.BufferGeometry();
        const at = p.attributes;
        if (at.POSITION === undefined) continue;
        const pos = readAccessor(at.POSITION);
        g.setAttribute('position', new THREE.BufferAttribute(floatOf(pos), 3));
        if (at.NORMAL !== undefined) g.setAttribute('normal', new THREE.BufferAttribute(floatOf(readAccessor(at.NORMAL)), 3));
        if (at.TEXCOORD_0 !== undefined) g.setAttribute('uv', new THREE.BufferAttribute(floatOf(readAccessor(at.TEXCOORD_0)), 2));
        const skinned = n.skin !== undefined && at.JOINTS_0 !== undefined && at.WEIGHTS_0 !== undefined;
        if (skinned) {
          const j = readAccessor(at.JOINTS_0);
          g.setAttribute('skinIndex', new THREE.BufferAttribute(new Uint16Array(j.array), 4));
          g.setAttribute('skinWeight', new THREE.BufferAttribute(floatOf(readAccessor(at.WEIGHTS_0)), 4));
          if (at.JOINTS_1 !== undefined) report.unsupported.push('more than 4 bone influences per vertex (JOINTS_1 ignored)');
        }
        if (p.indices !== undefined) {
          const idx = readAccessor(p.indices);
          g.setIndex(new THREE.BufferAttribute(idx.array instanceof Uint32Array ? idx.array : new Uint32Array(idx.array), 1));
          triangleCount += idx.count / 3;
        } else triangleCount += pos.count / 3;
        if (at.NORMAL === undefined) g.computeVertexNormals();
        g.computeBoundingBox();
        g.computeBoundingSphere();
        vertexCount += pos.count;
        const mat = p.material !== undefined ? materials[p.material] : defaultMat();
        const mesh = skinned ? new THREE.SkinnedMesh(g, mat) : new THREE.Mesh(g, mat);
        mesh.name = THREE.PropertyBinding.sanitizeNodeName((mdef.name || 'mesh') + '_' + pi);
        mesh.userData.skin = skinned ? n.skin : undefined;
        mesh.userData.node = i;
        if (skinned) mesh.frustumCulled = false; // skinned bounds move with the pose
        nodes[i].add(mesh);
        meshes.push(mesh);
      }
    });

    // scene
    const scene = new THREE.Group();
    scene.name = 'glb';
    const sceneDef = (json.scenes || [])[json.scene || 0];
    const roots = sceneDef ? sceneDef.nodes : (json.nodes || []).map((_, i) => i).filter((i) => !nodes[i].parent);
    for (const r of roots) scene.add(nodes[r]);
    scene.updateMatrixWorld(true);

    // skins
    const skins = (json.skins || []).map((s, si) => {
      const bones = s.joints.map((j) => nodes[j]);
      let inverses;
      if (s.inverseBindMatrices !== undefined) {
        const acc = readAccessor(s.inverseBindMatrices);
        inverses = bones.map((_, k) => new THREE.Matrix4().fromArray(acc.array, k * 16));
      }
      const skeleton = new THREE.Skeleton(bones, inverses);
      return { skeleton, joints: s.joints, name: s.name || 'skin' + si };
    });
    for (const m of meshes) {
      if (!m.isSkinnedMesh) continue;
      // glTF: the skinned mesh node's own transform is ignored; joints define placement
      m.bind(skins[m.userData.skin].skeleton, m.matrixWorld);
    }

    // animations
    const clips = (json.animations || []).map((an, ai) => {
      const tracks = [];
      for (const ch of an.channels) {
        const smp = an.samplers[ch.sampler];
        const tgt = ch.target;
        if (tgt.node === undefined) continue;
        const prop = PATHS[tgt.path];
        if (!prop) {
          report.unsupported.push('animation path "' + tgt.path + '" in "' + (an.name || ai) + '"');
          continue;
        }
        const times = floatOf(readAccessor(smp.input));
        let values = floatOf(readAccessor(smp.output));
        const n = prop === 'quaternion' ? 4 : 3;
        let interp = THREE.InterpolateLinear;
        if (smp.interpolation === 'STEP') interp = THREE.InterpolateDiscrete;
        if (smp.interpolation === 'CUBICSPLINE') {
          // keep only the keyframe values (in-tangent, value, out-tangent triplets)
          const v = new Float32Array(times.length * n);
          for (let k = 0; k < times.length; k++) for (let c = 0; c < n; c++) v[k * n + c] = values[k * 3 * n + n + c];
          values = v;
          report.warnings.push('CUBICSPLINE in "' + (an.name || ai) + '" played as linear');
        }
        const node = nodes[tgt.node];
        const Track = prop === 'quaternion' ? THREE.QuaternionKeyframeTrack : THREE.VectorKeyframeTrack;
        tracks.push(new Track(node.name + '.' + prop, Array.from(times), Array.from(values), interp));
      }
      return new THREE.AnimationClip(an.name || 'clip' + ai, undefined, tracks);
    });

    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    Object.assign(report, {
      generator: json.asset.generator || '',
      nodes: nodes.length,
      joints: jointSet.size,
      meshes: meshes.length,
      skinnedMeshes: meshes.filter((m) => m.isSkinnedMesh).length,
      vertices: vertexCount,
      triangles: Math.round(triangleCount),
      materials: materials.length,
      textures: texCache.size,
      clips: clips.map((c) => c.name + ' (' + c.duration.toFixed(2) + ' s)'),
      bytes: arrayBuffer.byteLength,
      parseMs: +(t1 - t0).toFixed(2),
    });
    const ready = Promise.all(pending).then(() => report);
    return { json, scene, nodes, skins, meshes, clips, materials, textures: [...texCache.values()], ready, report };
  }

  SL.GLB = {
    parse,
    decodeBase64,
    /** Parse a model registered by an assets/models/*.glb.js file. */
    fromRegistry(id, opts) {
      const b64 = SL.assets && SL.assets.glb && SL.assets.glb[id];
      if (!b64) throw new Error('GLB: model "' + id + '" is not loaded (include assets/models/' + id + '.glb.js)');
      return parse(decodeBase64(b64), opts);
    },
  };
})();
