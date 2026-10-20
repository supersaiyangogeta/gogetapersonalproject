/*
 * GLBModel: a character body loaded from a skinned .glb file that plugs into the
 * same interface as the procedural SL.Model, so Fighter, Animator, VFX, HUD
 * portraits and missions work unchanged.
 *
 * How the imported skeleton is driven (retargeting):
 *   - The Animator keeps posing the game's standard 17-joint rig ("driver",
 *     model.poseJoints). No pose data has to be re-authored for a new model.
 *   - Each rig joint is mapped to a bone of the file (def.model.jointMap, or a
 *     name-based guess). At load, the bind pose is compared with the rig's rest
 *     pose segment by segment (rig arms hang down; a file may be in T-pose or
 *     A-pose, with any bone roll) and a per-bone offset is stored.
 *   - Every frame, after the Animator: bone world rotation = driver joint world
 *     rotation x offset. Bones the rig does not know (extra spine, clavicles,
 *     fingers, toes) follow their parents with their bind rotation.
 *   - model.joints exposes sockets attached to the real bones, oriented like the
 *     rig joints, so hand/head positions (beams, props, hit sparks) come from the
 *     imported mesh's actual proportions.
 *   - Clips embedded in the file can play through model.playClip(name); while a
 *     clip plays it owns the bones, then retargeting resumes.
 *
 * def.model: { type: 'glb', asset: 'test_dummy', jointMap?: { hips: 'Pelvis', ... },
 *              height?: 1.85, facing?: 0 (radians, turn the file to face +Z) }
 */
(function () {
  'use strict';
  const RIG = ['hips', 'spine', 'chest', 'neck', 'head', 'shoulderL', 'elbowL', 'handL', 'shoulderR', 'elbowR', 'handR', 'thighL', 'kneeL', 'footL', 'thighR', 'kneeR', 'footR'];
  const PARENT = { hips: null, spine: 'hips', chest: 'spine', neck: 'chest', head: 'neck', shoulderL: 'chest', elbowL: 'shoulderL', handL: 'elbowL', shoulderR: 'chest', elbowR: 'shoulderR', handR: 'elbowR', thighL: 'hips', kneeL: 'thighL', footL: 'kneeL', thighR: 'hips', kneeR: 'thighR', footR: 'kneeR' };
  const CHILD = { hips: 'spine', spine: 'chest', chest: 'neck', neck: 'head', shoulderL: 'elbowL', elbowL: 'handL', shoulderR: 'elbowR', elbowR: 'handR', thighL: 'kneeL', kneeL: 'footL', thighR: 'kneeR', kneeR: 'footR' };
  // direction of each rig segment in the rig's rest pose (character faces +Z, its left is +X)
  const DIR = { hips: [0, 1, 0], spine: [0, 1, 0], chest: [0, 1, 0], neck: [0, 1, 0], head: [0, 1, 0], shoulderL: [0, -1, 0], elbowL: [0, -1, 0], handL: [0, -1, 0], shoulderR: [0, -1, 0], elbowR: [0, -1, 0], handR: [0, -1, 0], thighL: [0, -1, 0], kneeL: [0, -1, 0], footL: [0, 0, 1], thighR: [0, -1, 0], kneeR: [0, -1, 0], footR: [0, 0, 1] };

  // name guesses for common exporters (Blender, Mixamo-style, generic)
  const ALIASES = {
    hips: ['hips', 'pelvis', 'hip', 'root_pelvis'],
    spine: ['spine', 'spine01', 'spine_01', 'spine1', 'abdomen', 'waist'],
    chest: ['chest', 'spine02', 'spine_02', 'spine2', 'upperchest', 'spine03', 'torso'],
    neck: ['neck', 'neck01', 'neck1'],
    head: ['head'],
    shoulder: ['upperarm', 'arm', 'upper_arm', 'shoulder'],
    elbow: ['forearm', 'lowerarm', 'lower_arm', 'elbow'],
    hand: ['hand', 'wrist'],
    thigh: ['thigh', 'upleg', 'upperleg', 'upper_leg', 'leg'],
    // 'leg' last: Mixamo-style rigs call the thigh UpLeg and the shin Leg
    knee: ['shin', 'calf', 'lowerleg', 'lower_leg', 'knee', 'leg'],
    foot: ['foot', 'ankle'],
  };

  const tq = new THREE.Quaternion();
  const tv = new THREE.Vector3();
  const tm = new THREE.Matrix4();

  function sideOf(raw) {
    const n = raw.toLowerCase();
    if (/(^|[^a-z])(l|left)([^a-z]|$)/.test(n.replace(/([a-z])(left|right)/, '$1_$2')) || /left/.test(n) || /[._-]l$/.test(n) || /^l[._-]/.test(n)) return 'L';
    if (/(^|[^a-z])(r|right)([^a-z]|$)/.test(n.replace(/([a-z])(left|right)/, '$1_$2')) || /right/.test(n) || /[._-]r$/.test(n) || /^r[._-]/.test(n)) return 'R';
    return null;
  }
  function stem(raw) {
    return raw
      .toLowerCase()
      .replace(/^.*[:|]/, '')
      .replace(/(left|right)/g, '')
      .replace(/([._-])(l|r)$/, '')
      .replace(/^(l|r)[._-]/, '')
      .replace(/^(def|org|mch)[._-]/, '')
      .replace(/[^a-z0-9]/g, '');
  }

  /** Guess rig joint -> bone name from bone names alone. Returns { map, missing }. */
  function guessJointMap(boneNames) {
    const map = {};
    const taken = new Set();
    const find = (aliases, side) => {
      for (const al of aliases) {
        const key = al.replace(/[^a-z0-9]/g, '');
        const hit = boneNames.find((n) => !taken.has(n) && stem(n) === key && sideOf(n) === side);
        if (hit) return hit;
      }
      return null;
    };
    for (const j of ['hips', 'spine', 'chest', 'neck', 'head']) {
      const b = find(ALIASES[j], null);
      if (b) {
        map[j] = b;
        taken.add(b);
      }
    }
    for (const side of ['L', 'R']) {
      for (const [j, al] of [['shoulder', ALIASES.shoulder], ['elbow', ALIASES.elbow], ['hand', ALIASES.hand], ['thigh', ALIASES.thigh], ['knee', ALIASES.knee], ['foot', ALIASES.foot]]) {
        const b = find(al, side);
        if (b) {
          map[j + side] = b;
          taken.add(b);
        }
      }
    }
    return { map, missing: RIG.filter((j) => !map[j]) };
  }

  /** Skinned ink outline: the game's outline shader with skinning. */
  let outlineMat = null;
  function skinnedOutlineMat() {
    if (outlineMat) return outlineMat;
    outlineMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x0b0b12) }, uWidth: { value: 1 } },
      vertexShader: `
        #include <common>
        #include <skinning_pars_vertex>
        uniform float uWidth;
        void main() {
          #include <beginnormal_vertex>
          #include <skinbase_vertex>
          #include <skinnormal_vertex>
          #include <begin_vertex>
          #include <skinning_vertex>
          vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
          vec3 n = normalize(normalMatrix * objectNormal);
          float w = (0.0045 + 0.0016 * -mv.z) * uWidth;
          mv.xyz += n * w;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor;
        void main() { gl_FragColor = vec4(uColor, 1.0); }`,
      side: THREE.BackSide,
    });
    return outlineMat;
  }

  class GLBModel {
    constructor(def) {
      const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.def = def;
      this.app = def.appearance || {};
      const cfg = (this.cfg = def.model);
      this.mats = new Map();
      this.outlines = [];
      this.hairGroups = {};
      this.face = {};
      this.flashAmount = 0;
      this.tintColor = new THREE.Color(0, 0, 0);
      this.tintAmount = 0;
      this.formScale = 1;
      this.rimColor = new THREE.Color(0xfff4e6);
      this.rimStrength = 0.28;
      this.expr = SL.EXPRESSIONS ? SL.EXPRESSIONS.neutral : {};

      this.gltf = SL.GLB.fromRegistry(cfg.asset, {
        makeMaterial: (m) => {
          // an outfit's material override, by the file's material name (see SL.Wardrobe.modelDef)
          const ov = cfg.materials && cfg.materials[m.name];
          const color = ov && ov.color !== undefined ? new THREE.Color(ov.color) : m.color;
          const mat = SL.Toon && SL.Toon.gradient3 !== undefined ? SL.Toon.makeMat(color.getHex(), { rim: { color: this.rimColor.getHex(), strength: this.rimStrength }, transparent: m.transparent, opacity: m.opacity }) : new THREE.MeshToonMaterial({ color });
          mat.userData.gltfName = m.name;
          mat.userData.baseEmissive = new THREE.Color(0, 0, 0);
          this.mats.set('glb' + this.mats.size, mat);
          return mat;
        },
      });
      this.report = Object.assign({}, this.gltf.report);
      // resolves when embedded textures are decoded and on their materials (the body is usable before that)
      this.ready = this.gltf.ready;

      // hierarchy: root -> pivot (animator: hip height, lean, squash) -> body (hip offset, unit scale) -> facing -> file scene
      this.root = new THREE.Group();
      this.root.name = 'model:' + def.id;
      this.pivot = new THREE.Group();
      this.root.add(this.pivot);
      this.body = new THREE.Group();
      this.pivot.add(this.body);
      this.facing = new THREE.Group();
      this.facing.rotation.y = cfg.facing || 0;
      this.body.add(this.facing);
      this.facing.add(this.gltf.scene);
      this.root.updateMatrixWorld(true);

      // bones of the (first) skin, parents before children
      const skin = this.gltf.skins[0];
      if (!skin) throw new Error('GLBModel: "' + cfg.asset + '" has no skin');
      this.skeleton = skin.skeleton;
      const boneSet = new Set(skin.skeleton.bones);
      this.bones = [];
      this.gltf.scene.traverse((o) => boneSet.has(o) && this.bones.push(o));
      const byName = {};
      for (const b of this.bones) byName[b.userData.gltfName || b.name] = b;

      // joint map
      let map = cfg.jointMap;
      if (!map) {
        const g = guessJointMap(Object.keys(byName));
        map = g.map;
        this.report.jointMapGuessed = true;
      }
      this.jointMap = {};
      const missing = [];
      for (const j of RIG) {
        const b = map[j] && byName[map[j]];
        if (b) this.jointMap[j] = b;
        else missing.push(j);
      }
      this.report.mappedJoints = RIG.length - missing.length;
      this.report.missingJoints = missing;
      if (!this.jointMap.hips) throw new Error('GLBModel: no hips bone mapped in "' + cfg.asset + '"');

      // rest pose relative to the body frame
      const invBody = new THREE.Matrix4().copy(this.body.matrixWorld).invert();
      const restPos = new Map(), restQ = new Map();
      const rel = (o) => {
        tm.multiplyMatrices(invBody, o.matrixWorld);
        const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
        tm.decompose(p, q, s);
        return { p, q, s };
      };
      for (const b of this.bones) {
        const r = rel(b);
        restPos.set(b, r.p);
        restQ.set(b, r.q);
        b.userData.restLocal = b.quaternion.clone();
        if (b.parent && !boneSet.has(b.parent)) b.userData.parentRestQ = rel(b.parent).q;
      }

      // size: normalize the bind-pose height, feet on the ground, hips at the pivot
      const box = new THREE.Box3();
      for (const m of this.gltf.meshes) {
        m.geometry.computeBoundingBox();
        tm.multiplyMatrices(invBody, m.matrixWorld);
        box.union(m.geometry.boundingBox.clone().applyMatrix4(tm));
      }
      const height = Math.max(0.01, box.max.y - box.min.y);
      const scale = (cfg.height || 1.85) / height;
      const hipsY = restPos.get(this.jointMap.hips).y;
      this.normScale = scale;
      this.b = { hipY: (hipsY - box.min.y) * scale };
      this.body.scale.setScalar(scale);
      this.body.position.set(0, -hipsY * scale, 0);
      this.report.sourceHeight = +height.toFixed(3);
      this.report.scale = +scale.toFixed(4);

      // retarget offsets: align each rig segment's rest direction with the file's
      this.align = {};
      this.offset = new Map();
      for (const j of RIG) {
        const b = this.jointMap[j];
        if (!b) continue;
        let aim = CHILD[j] && this.jointMap[CHILD[j]];
        if (!aim) aim = b.children.find((c) => boneSet.has(c));
        let q;
        if (aim) {
          const d = restPos.get(aim).clone().sub(restPos.get(b));
          if (d.lengthSq() > 1e-10) q = new THREE.Quaternion().setFromUnitVectors(tv.fromArray(DIR[j]).clone(), d.normalize());
        }
        if (!q) q = PARENT[j] && this.align[PARENT[j]] ? this.align[PARENT[j]].clone() : new THREE.Quaternion();
        this.align[j] = q;
        this.offset.set(b, q.clone().invert().multiply(restQ.get(b)));
      }

      // driver rig the Animator poses (rotations only)
      this.poseJoints = {};
      for (const j of RIG) {
        const g = new THREE.Group();
        g.name = 'drive:' + j;
        this.poseJoints[j] = g;
      }
      this.driverWorld = {};
      for (const j of RIG) this.driverWorld[j] = new THREE.Quaternion();
      this.boneWorld = new Map();
      for (const b of this.bones) this.boneWorld.set(b, new THREE.Quaternion());

      // sockets on the real bones, oriented like the rig joints and in unscaled units
      this.joints = {};
      for (const j of RIG) {
        const b = this.jointMap[j] || this.jointMap[PARENT[j]] || this.jointMap.hips;
        const s = new THREE.Group();
        s.name = 'socket:' + j;
        s.quaternion.copy(this.offset.get(b)).invert();
        b.add(s);
        this.joints[j] = s;
      }
      this.root.updateMatrixWorld(true);
      for (const s of Object.values(this.joints)) {
        s.matrixWorld.decompose(tv, tq, new THREE.Vector3());
        const ws = new THREE.Vector3().setFromMatrixScale(s.matrixWorld).x / (new THREE.Vector3().setFromMatrixScale(this.root.matrixWorld).x || 1);
        s.scale.setScalar(1 / ws);
      }
      // head center for portraits
      const head = this.jointMap.head;
      const tip = head && head.children.find((c) => boneSet.has(c));
      const headLen = tip ? restPos.get(tip).distanceTo(restPos.get(head)) * scale : 0.22;
      this.headCenter = new THREE.Group();
      this.headCenter.position.set(0, headLen * 0.45, 0);
      this.joints.head.add(this.headCenter);

      // an outfit's accessory meshes (another .glb in the registry) on joint sockets
      this.attachments = [];
      for (const a of cfg.attach || []) {
        const socket = this.joints[a.joint];
        if (!socket) continue;
        let g;
        try {
          g = SL.GLB.fromRegistry(a.asset, {}).scene;
        } catch (e) {
          // a missing accessory file costs the accessory, never the fighter
          SL.warn('outfit attachment skipped:', a.asset, e.message);
          continue;
        }
        g.name = 'attach:' + a.asset;
        if (a.pos) g.position.fromArray(a.pos);
        if (a.rot) g.rotation.set(a.rot[0], a.rot[1], a.rot[2]);
        if (a.scale) g.scale.setScalar(a.scale);
        socket.add(g);
        this.attachments.push(g);
      }

      // extra named nodes (e.g. Socket_HandR) are reachable for effects and props
      this.nodes = {};
      this.gltf.scene.traverse((o) => o.userData.gltfName && (this.nodes[o.userData.gltfName] = o));

      // meshes: shadows and skinned outlines
      for (const m of this.gltf.meshes) {
        m.castShadow = true;
        if (m.isSkinnedMesh) {
          const o = new THREE.SkinnedMesh(m.geometry, skinnedOutlineMat());
          o.name = 'outline';
          o.userData.isOutline = true;
          o.frustumCulled = false;
          m.add(o);
          o.bind(m.skeleton, m.bindMatrix);
          this.outlines.push(o);
        }
      }

      // embedded clips
      this.mixer = new THREE.AnimationMixer(this.gltf.scene);
      this.clips = {};
      for (const c of this.gltf.clips) this.clips[c.name] = c;
      this.clipAction = null;

      this.baseScale = this.app.height || 1;
      this.root.scale.setScalar(this.baseScale);
      this.setOutlines(SL.Settings && SL.Settings.data ? SL.Settings.data.graphics.outlines : true);
      this.afterPose();
      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.report.buildMs = +(t1 - t0).toFixed(2);
    }

    /** Called by the Animator after it posed the driver rig. */
    afterPose() {
      if (this.clipAction) return;
      const P = this.poseJoints, W = this.driverWorld;
      for (const j of RIG) {
        const p = PARENT[j];
        if (p) W[j].multiplyQuaternions(W[p], P[j].quaternion);
        else W[j].copy(P[j].quaternion);
      }
      for (const b of this.bones) {
        const bw = this.boneWorld.get(b);
        const pw = b.parent && this.boneWorld.has(b.parent) ? this.boneWorld.get(b.parent) : b.userData.parentRestQ || tq.identity();
        const off = this.offset.get(b);
        if (off) {
          const j = this._jointOf(b);
          bw.multiplyQuaternions(W[j], off);
          b.quaternion.copy(pw).invert().multiply(bw);
        } else {
          b.quaternion.copy(b.userData.restLocal);
          bw.multiplyQuaternions(pw, b.quaternion);
        }
      }
    }

    _jointOf(bone) {
      if (!this._boneJoint) {
        this._boneJoint = new Map();
        for (const [j, b] of Object.entries(this.jointMap)) this._boneJoint.set(b, j);
      }
      return this._boneJoint.get(bone);
    }

    /** Play a clip embedded in the file. It owns the skeleton until it ends (or stopClip). */
    playClip(name, opts = {}) {
      const clip = this.clips[name];
      if (!clip) return false;
      this.mixer.stopAllAction();
      const a = this.mixer.clipAction(clip);
      a.reset();
      a.setLoop(opts.loop ? THREE.LoopRepeat : THREE.LoopOnce, opts.loop ? Infinity : 1);
      a.clampWhenFinished = true;
      a.play();
      this.clipAction = a;
      this.clipLoop = !!opts.loop;
      return true;
    }

    stopClip() {
      this.mixer.stopAllAction();
      this.clipAction = null;
    }

    /** Frozen copy of the current skinned pose for afterimages (a live skinned clone would follow the original). */
    ghostClone() {
      this.root.updateMatrixWorld(true);
      const g = new THREE.Group();
      const invRoot = new THREE.Matrix4().copy(this.root.matrixWorld).invert();
      const v = new THREE.Vector3();
      for (const m of this.gltf.meshes) {
        if (!m.visible) continue;
        m.skeleton.update();
        const src = m.geometry.attributes.position;
        const out = new Float32Array(src.count * 3);
        const toRoot = new THREE.Matrix4().multiplyMatrices(invRoot, m.matrixWorld);
        for (let i = 0; i < src.count; i++) {
          v.fromBufferAttribute(src, i);
          if (m.isSkinnedMesh) m.boneTransform(i, v);
          v.applyMatrix4(toRoot);
          out[i * 3] = v.x;
          out[i * 3 + 1] = v.y;
          out[i * 3 + 2] = v.z;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(out, 3));
        if (m.geometry.index) geo.setIndex(m.geometry.index);
        const mesh = new THREE.Mesh(geo, m.material);
        mesh.userData.disposeGeometry = true;
        g.add(mesh);
      }
      return g;
    }

    setHands() {}
    setHair() {}
    currentHairGroup() {
      return null;
    }

    setForm(form) {
      const look = (form && form.look) || {};
      this.formScale = look.bulk || 1;
      if (look.tint !== undefined) {
        this.tintColor.set(look.tint);
        this.tintAmount = look.tintAmount !== undefined ? look.tintAmount : 0.3; // (0 means no tint: Perfect Cell clears Imperfect's)
      } else this.tintAmount = 0;
      this._updateEmissive();
    }

    setExpression(name) {
      this._expr = name;
    }

    tick(dt) {
      if (this.clipAction) {
        this.mixer.update(dt);
        if (!this.clipLoop && !this.clipAction.isRunning()) this.clipAction = null;
      }
    }

    setRim(color, strength) {
      if (color !== undefined && color !== null) this.rimColor.set(color);
      this.rimStrength = strength;
      for (const m of this.mats.values()) {
        const r = m.userData.rim;
        if (!r) continue;
        r.color.copy(this.rimColor);
        r.strength.value = strength;
      }
    }

    setFlash(v) {
      if (Math.abs(v - this.flashAmount) < 0.01) return;
      this.flashAmount = v;
      this._updateEmissive();
    }

    _updateEmissive() {
      const fl = this.flashAmount;
      for (const m of this.mats.values()) {
        if (!m.emissive) continue;
        m.emissive.setRGB(fl, fl, fl);
        if (this.tintAmount > 0) m.emissive.lerp(this.tintColor, this.tintAmount * 0.6);
      }
    }

    setOutlines(on) {
      this._outlinesOn = on;
      for (const o of this.outlines) o.visible = on;
    }

    setVisible(v) {
      this.root.visible = v;
    }

    dispose() {
      if (this.root.parent) this.root.parent.remove(this.root);
      this.mixer.stopAllAction();
      for (const m of this.mats.values()) m.dispose();
      for (const m of this.gltf.meshes) m.geometry.dispose();
      this.mats.clear();
    }
  }

  GLBModel.guessJointMap = guessJointMap;
  GLBModel.RIG = RIG;
  SL.GLBModel = GLBModel;
})();
