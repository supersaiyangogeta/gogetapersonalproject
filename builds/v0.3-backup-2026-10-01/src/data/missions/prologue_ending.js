/*
 * PROLOGUE ENDING — Bardock's last moments (the `ending` phase of "The Final Stand").
 * A cinematic built only from engine systems: story camera shots, character poses and
 * faces, VFX, stage lighting and mood, synthesized sound and the music sequencer.
 *   1 defeat      the Supernova swallows the Final Spirit Cannon; Bardock is thrown back,
 *                 hurt and barely floating (no Defeated screen)
 *   2 attack      Frieza grows the Supernova into a sun that dominates the sky
 *   3 realize     defiance fades into understanding; a held silence
 *   4 vision      short dream flashes of his son fighting Frieza (pale, blurred, muffled),
 *                 then a hard return to the real scene
 *   5 smile       a small, quiet smile (PROTOTYPE FACE: the procedural rig has no smile
 *                 shape, so it is approximated with softened eyes, brows and mouth)
 *   6 the end     the heat reaches him first: his armor fractures and glows; the shoulder
 *                 guards, then the chest plate, break away (armorBreak); a last close look at
 *                 his face and the smile; the sphere hits and hurls him back through its
 *                 light (blownAway) until it swallows him (consumed): whiteout, gone
 *   7 planet      one continuous shot: the sphere sinks into Planet Vegeta, the crust
 *                 cracks and glows, the planet detonates behind Frieza's pod
 *   8 transition  a single pod falls toward a blue planet: Goku's story begins
 * Timing runs on simulation ticks, so it pauses with the game. Every beat is emitted as a
 * `cinematicBeat` event (tests follow them). A skip request jumps to a clean end state.
 */
(function () {
  'use strict';
  const U = SL.util;
  const V3 = THREE.Vector3;
  const TICK = 1 / 60;
  const RED_MOOD = 0x2a0a04;
  // inside the orbit arena (fighters are kept within 150 m); the real scene is hidden meanwhile
  const VISION_AT = new V3(60, 30, 90);
  // presses left over from mashing the struggle must not skip the ending
  const SKIP_GRACE = 1.5;

  const ease = (k) => k * k * (3 - 2 * k);
  const easeIn = (k) => k * k * k;
  const easeOut = (k) => 1 - Math.pow(1 - k, 3);

  function camAt(out, pos, look, fov, roll) {
    out.pos.copy(pos);
    out.look.copy(look);
    out.fov = fov;
    out.roll = roll || 0;
  }

  function faceToward(f, pos) {
    f.yaw = Math.atan2(pos.x - f.pos.x, pos.z - f.pos.z);
  }

  function flatForward(f) {
    return new V3(Math.sin(f.yaw), 0, Math.cos(f.yaw));
  }

  function rightOf(fwd) {
    return new V3(-fwd.z, 0, fwd.x);
  }

  function headPos(f) {
    const j = f.model && f.model.joints && f.model.joints.head;
    if (j && j.getWorldPosition) return j.getWorldPosition(new V3()).add(new V3(0, 0.07, 0));
    return f.chest().add(new V3(0, 0.35, 0));
  }

  function place(f, pos, lookAt) {
    f.setPosition(pos);
    f.vel.set(0, 0, 0);
    if (lookAt) faceToward(f, lookAt);
  }

  /** A held story shot; the callback gets its own 0..1 progress over `dur`. */
  function shot(m, dur, fn, opts) {
    m.shot((t, out, el) => fn(U.clamp01(el / dur), out, el), 9999, Object.assign({ cut: true, blendIn: 0, hold: true }, opts || {}));
  }

  function beat(m, ctx, id) {
    ctx.beat = id;
    m.flags.endingBeats.push(id);
    m.battle.emit('cinematicBeat', { id, time: ctx.time });
  }

  function addExtra(ctx, x) {
    ctx.extras.push(x);
    return x;
  }

  function dropExtra(ctx, x) {
    const i = ctx.extras.indexOf(x);
    if (i >= 0) ctx.extras.splice(i, 1);
    if (x && x.dispose) x.dispose();
  }

  /* ---------------- set pieces ---------------- */

  /** The Supernova hovers over Frieza, pushed toward Bardock so its bulk never swallows its owner. */
  function hoverPos(ctx, r) {
    const toP = ctx.p.pos.clone().sub(ctx.fz.pos).setY(0);
    if (toP.lengthSq() < 0.01) toP.set(0, 0, 1);
    toP.normalize();
    return ctx.fz.pos.clone().add(new V3(0, 10 + r * 0.5, 0)).addScaledVector(toP, r * 0.9);
  }

  function renderNova(ctx) {
    const n = ctx.nova;
    if (!n || n.done) return;
    n.radius = ctx.novaR;
    n.time += TICK;
    n.mesh.material.uniforms.uTime.value = n.time;
    n.mesh.material.uniforms.uCharge.value = ctx.novaCharge;
    n._render();
    // the sphere lights the whole scene, the planet below included
    n.light.distance = ctx.novaRange;
    n.light.decay = 1;
    if (ctx.novaLight !== undefined) n.light.intensity = ctx.novaLight;
    if (ctx.novaGlow !== undefined) n.glow.material.opacity = ctx.novaGlow;
    n.core.material.opacity = ctx.novaR > 30 ? 0.22 : 0.5;
  }

  /** Additive corona so the Supernova reads as blazing energy rather than a ball. */
  function coronaFx(b, ctx) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0xffb84a) } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `${SL.NOISE_GLSL} uniform float uTime; uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
          float flick = 0.75 + 0.5 * vnoise(vP * 3.0 + vec3(0.0, uTime * 2.0, uTime));
          float a = clamp(pow(f, 1.6) * flick * 1.4, 0.0, 1.0);
          gl_FragColor = vec4(mix(uColor, vec3(1.0, 0.95, 0.8), pow(f, 6.0)) * a, a); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const geo = new THREE.SphereGeometry(1, 40, 28);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 12;
    b.scene.add(mesh);
    let t = 0;
    return {
      mesh,
      update(dt) {
        t += dt;
        const n = ctx.nova;
        mesh.visible = !n.done && n.mesh.visible;
        if (n.done) return;
        mesh.position.copy(n.pos);
        mesh.scale.setScalar(ctx.novaR * 1.14);
        mat.uniforms.uTime.value = t;
      },
      dispose() {
        b.scene.remove(mesh);
        geo.dispose();
        mat.dispose();
      },
    };
  }

  /** A slow cloud of fire where the planet was. */
  function emberCloud(b, center) {
    const mat = new THREE.SpriteMaterial({ map: SL.Toon.tex.smoke, color: 0xff7a30, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(center);
    b.scene.add(sprite);
    let t = 0;
    return {
      update(dt) {
        t += dt;
        const k = Math.min(1, t / 7);
        sprite.scale.setScalar(U.lerp(1100, 2400, easeOut(k)));
        mat.opacity = 0.6 * (1 - k);
        mat.rotation = t * 0.05;
      },
      dispose() {
        b.scene.remove(sprite);
        mat.dispose();
      },
    };
  }

  function woundSmoke(b, f) {
    if (f.hidden || b.frame % 7 !== 0) return;
    const c = f.chest();
    b.vfx.smoke.emit(c.x + U.rand(-0.2, 0.2), c.y + U.rand(-0.2, 0.3), c.z + U.rand(-0.2, 0.2), U.rand(-0.3, 0.3), U.rand(0.6, 1.2), U.rand(-0.3, 0.3), 0.22, 0.2, 0.2, 0.35, 0.35, 1.6, { grow: 1.6, drag: 1 });
    if (Math.random() < 0.12) b.vfx.sparks(c, 0xffa060, 3, 3, 0.05);
  }

  /** Embers and grit dragged toward the sphere past the camera. */
  function pullDebris(b, ctx, strength) {
    const nova = ctx.nova;
    const c = ctx.p.chest();
    if (b.frame % 2 === 0) b.vfx.streamInward(nova.pos, ctx.novaR * 2.1, 0xffa050, 4, 2.2, 1.1);
    if (b.frame % 18 === 0) {
      const d = new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize();
      b.vfx.bolt(nova.pos.clone().addScaledVector(d, ctx.novaR * 0.92), ctx.novaR * 0.35, 0xffe0a0);
    }
    if (!ctx.closeUp && b.frame % 10 === 0) {
      const from = c.clone().add(new V3(U.rand(-28, 28), U.rand(-18, 8), U.rand(6, 36)));
      b.vfx.rock(from, nova.pos.clone().sub(from).normalize().multiplyScalar(U.rand(12, 26) * strength), U.rand(0.3, 1.1), 0x6a4a3a);
    }
    if (b.frame % 3 === 0) {
      const e = c.clone().add(new V3(U.rand(-6, 6), U.rand(-4, 4), U.rand(-6, 6)));
      const v = nova.pos.clone().sub(e).normalize().multiplyScalar(U.rand(8, 18) * strength);
      b.vfx.add.emit(e.x, e.y, e.z, v.x, v.y, v.z, 1, 0.62, 0.3, 0.9, U.rand(0.05, 0.12), 1.2, {});
    }
  }

  function beamFx(b, from, to, color) {
    const dir = to.clone().sub(from);
    const len = dir.length();
    dir.normalize();
    const g = new THREE.Group();
    const geo = new THREE.CylinderGeometry(1, 1, 1, 18, 1, true);
    const outer = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    outer.scale.set(0.55, len, 0.55);
    core.scale.set(0.22, len, 0.22);
    g.add(outer, core);
    g.position.copy(from).addScaledVector(dir, len / 2);
    g.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir);
    b.scene.add(g);
    let t = 0;
    return {
      update(dt) {
        t += dt;
        const w = 1 + Math.sin(t * 40) * 0.08;
        outer.scale.x = outer.scale.z = 0.55 * w;
        core.scale.x = core.scale.z = 0.22 * w;
        if (b.frame % 3 === 0) b.vfx.sparks(to, color, 6, 9, 0.12);
      },
      dispose() {
        b.scene.remove(g);
        geo.dispose();
        outer.material.dispose();
        core.material.dispose();
      },
    };
  }

  /** Glowing fissures that spread over the planet from the impact point. */
  function crackShell(b, planet, dir) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uAmt: { value: 0 }, uTime: { value: 0 }, uDir: { value: dir.clone() } },
      vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `${SL.NOISE_GLSL} uniform float uAmt; uniform float uTime; uniform vec3 uDir; varying vec3 vP;
        void main(){ vec3 q = normalize(vP);
          float w = 0.012 + 0.07 * uAmt;
          float n = vnoise(q * 5.0 + vec3(0.0, uTime * 0.02, 0.0));
          float n2 = vnoise(q * 13.0 + 7.0);
          float line = max(1.0 - smoothstep(0.0, w, abs(n - 0.5)), (1.0 - smoothstep(0.0, w * 0.7, abs(n2 - 0.5))) * 0.8);
          float d = dot(q, uDir);
          float reach = smoothstep(1.0 - uAmt * 2.4, 1.0, d);
          float glow = smoothstep(0.85, 1.0, d) * uAmt;
          float a = clamp(line * reach * uAmt * 1.4 + glow * 0.9, 0.0, 1.0);
          vec3 col = mix(vec3(1.0, 0.32, 0.04), vec3(1.0, 0.92, 0.65), clamp(line * 0.6 + glow, 0.0, 1.0));
          gl_FragColor = vec4(col * a, a); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const geo = new THREE.SphereGeometry(704, 64, 40);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(planet.position);
    mesh.renderOrder = 6;
    b.scene.add(mesh);
    let amt = 0, t = 0;
    return {
      mesh,
      set(k) {
        amt = k;
      },
      update(dt) {
        t += dt;
        mat.uniforms.uAmt.value = amt;
        mat.uniforms.uTime.value = t;
      },
      dispose() {
        b.scene.remove(mesh);
        geo.dispose();
        mat.dispose();
      },
    };
  }

  function planetChunks(b, center, count) {
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const hot = new THREE.MeshBasicMaterial({ color: 0xff8a3a });
    const dark = new THREE.MeshLambertMaterial({ color: 0x5a2a1c, emissive: 0x2a0a04 });
    const list = [];
    for (let i = 0; i < count; i++) {
      const d = new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize();
      const isHot = i % 3 === 0;
      const mesh = new THREE.Mesh(geo, isHot ? hot : dark);
      mesh.position.copy(center).addScaledVector(d, U.rand(260, 640));
      const sz = isHot ? 0.55 : 1;
      mesh.scale.set(U.rand(10, 36) * sz, U.rand(8, 28) * sz, U.rand(10, 32) * sz);
      mesh.rotation.set(U.rand(0, 6), U.rand(0, 6), U.rand(0, 6));
      b.scene.add(mesh);
      list.push({ mesh, vel: d.multiplyScalar(U.rand(60, 220)), spin: new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)), hot: isHot });
    }
    return {
      list,
      update(dt) {
        for (const c of list) {
          c.mesh.position.addScaledVector(c.vel, dt);
          c.mesh.rotation.x += c.spin.x * dt;
          c.mesh.rotation.y += c.spin.y * dt;
          if (c.hot && b.frame % 5 === 0) b.vfx.trail(c.mesh.position, 0xff9a4a, c.mesh.scale.x * 0.7, 0.8);
        }
      },
      dispose() {
        for (const c of list) b.scene.remove(c.mesh);
        geo.dispose();
        hot.dispose();
        dark.dispose();
      },
    };
  }

  function earthFx(b, center, radius) {
    const tex = SL.Toon.canvasTexture(256, 128, (g, w, h) => {
      const nz = U.makeNoise2D(737);
      const img = g.createImageData(w, h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const k = (y * w + x) * 4;
          const lat = Math.abs(y / h - 0.5) * 2;
          const land = nz.fbm(x * 0.03, y * 0.05, 4);
          const cloud = nz.fbm(x * 0.05 + 40, y * 0.09 + 9, 3);
          let r = 30, gg = 92, bb = 190;
          if (land > 0.56) (r = 70 + land * 40), (gg = 130 + land * 30), (bb = 60);
          if (land > 0.66) (r = 150), (gg = 125), (bb = 80);
          if (lat > 0.86) r = gg = bb = 235;
          if (cloud > 0.58) {
            const c = Math.min(1, (cloud - 0.58) * 5);
            r += (245 - r) * c;
            gg += (248 - gg) * c;
            bb += (255 - bb) * c;
          }
          img.data[k] = r;
          img.data[k + 1] = gg;
          img.data[k + 2] = bb;
          img.data[k + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    });
    const geo = new THREE.SphereGeometry(radius, 48, 32);
    const mat = new THREE.MeshLambertMaterial({ map: tex, emissive: 0x0b1a33 });
    mat.fog = false;
    const ball = new THREE.Mesh(geo, mat);
    ball.rotation.set(0.3, 2.2, 0.1);
    const rimGeo = new THREE.SphereGeometry(radius * 1.05, 40, 24);
    const rimMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x6ab8ff) } },
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(uColor*f, f); }`,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    const group = new THREE.Group();
    group.add(ball, rim);
    group.position.copy(center);
    b.scene.add(group);
    return {
      group,
      update(dt) {
        ball.rotation.y += dt * 0.01;
      },
      dispose() {
        b.scene.remove(group);
        geo.dispose();
        mat.dispose();
        tex.dispose();
        rimGeo.dispose();
        rimMat.dispose();
      },
    };
  }

  function podFx(b) {
    const group = new THREE.Group();
    const shellGeo = new THREE.SphereGeometry(0.9, 18, 12);
    const shell = new THREE.Mesh(shellGeo, SL.Toon.mat(0xf0ece4));
    const winGeo = new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const win = new THREE.Mesh(winGeo, new THREE.MeshBasicMaterial({ color: 0xd8344a }));
    win.position.set(0, 0.25, 0.55);
    win.rotation.x = Math.PI * 0.5;
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.flare, color: 0xbfe6ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    flare.scale.setScalar(5);
    group.add(shell, win, flare);
    b.scene.add(group);
    return {
      group,
      flare,
      dispose() {
        b.scene.remove(group);
        shellGeo.dispose();
        winGeo.dispose();
        win.material.dispose();
        flare.material.dispose();
      },
    };
  }

  /* ---------------- the vision ---------------- */
  function enterVision(m, ctx) {
    const b = m.battle, st = b.stage, n = ctx.nova;
    const hide = [st.planet, st.atmo, st.ship, st.stars, ...st.spinners, n.mesh, n.core, n.glow, n.light, ctx.fz.object];
    for (const o of hide) {
      if (o && o.visible) {
        o.visible = false;
        ctx.hidden.push(o);
      }
    }
    ctx.p.setHidden(true);
    // a pale, sunlit dream instead of the burning sky
    const u = st.sky.material.uniforms;
    ctx.skyWas = [u.top.value.getHex(), u.horizon.value.getHex(), u.bottom.value.getHex()];
    u.top.value.setHex(0xd6e8ff);
    u.horizon.value.setHex(0xfff3e2);
    u.bottom.value.setHex(0xe6ddf2);
    st.setMood(0, RED_MOOD, 0.1);
    ctx.visionLight = new THREE.HemisphereLight(0xf6fbff, 0xffe2c0, 1.3);
    b.scene.add(ctx.visionLight);
    const haloMat = new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xfff6dc, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(30);
    halo.position.copy(VISION_AT).add(new V3(0, 2, -16));
    b.scene.add(halo);
    addExtra(ctx, { vision: true, dispose: () => (b.scene.remove(halo), haloMat.dispose()) });
    const tags = { cinematic: true, vision: true };
    const gk = b.spawn({ charId: 'goku', team: 0, pos: VISION_AT.clone().add(new V3(-1.2, 0, 0)), grounded: false, dummy: 'idle', infiniteHp: true, cannotDie: true, form: 2, tags });
    const fv = b.spawn({ charId: 'frieza', team: 1, pos: VISION_AT.clone().add(new V3(1.2, 0, 0)), grounded: false, dummy: 'idle', infiniteHp: true, cannotDie: true, tags });
    for (const f of [gk, fv]) {
      f.invuln = 1e9;
      f.untargetable = true;
    }
    gk.target = fv;
    fv.target = gk;
    ctx.actors.push(gk, fv);
    ctx.gk = gk;
    ctx.fv = fv;
    ctx.inVision = true;
  }

  function exitVision(m, ctx) {
    const b = m.battle;
    for (const f of ctx.actors) if (b.fighters.includes(f)) b.remove(f);
    ctx.actors.length = 0;
    ctx.gk = ctx.fv = null;
    for (const o of ctx.hidden) o.visible = true;
    ctx.hidden.length = 0;
    if (ctx.skyWas) {
      const u = b.stage.sky.material.uniforms;
      u.top.value.setHex(ctx.skyWas[0]);
      u.horizon.value.setHex(ctx.skyWas[1]);
      u.bottom.value.setHex(ctx.skyWas[2]);
      ctx.skyWas = null;
    }
    ctx.p.setHidden(false);
    if (ctx.visionLight) {
      b.scene.remove(ctx.visionLight);
      if (ctx.visionLight.dispose) ctx.visionLight.dispose();
      ctx.visionLight = null;
    }
    for (const x of ctx.extras.filter((e) => e.vision)) dropExtra(ctx, x);
    b.stage.setMood(0.55, RED_MOOD, 0.1);
    SL.ScreenFX.setSpeed(0);
    SL.ScreenFX.vision(0);
    SL.Audio.setDream(0);
    ctx.inVision = false;
  }

  /* ---------------- timeline ---------------- */
  function* timeline(m, ctx) {
    const b = m.battle, p = ctx.p, fz = ctx.fz, nova = ctx.nova, st = ctx.st;

    // ---------- 1. Bardock loses ----------
    beat(m, ctx, 'defeat');
    b.endCinematic();
    if (ctx.beam && !ctx.beamGone) {
      ctx.beamGone = true;
      ctx.beam.dispose();
    }
    SL.Music.stop(0.15);
    SL.ScreenFX.flash(1, '#fff1d6');
    SL.Audio.play('explosionHuge');
    b.vfx.explosion(p.chest(), 14, 0xff9a3a);
    b.vfx.sparks(p.chest(), 0xffd0a0, 40, 26, 0.3);
    b.camera.addTrauma(0.8);
    faceToward(p, nova.pos);
    ctx.novaRange = 900;
    ctx.novaLight = 0.6;
    p.rimLight = { color: 0xff8a4a, strength: 0.45 };
    p.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', aura: 0, speed: 14 });
    // what the struggle cost him: the armor is fractured from here on
    if (p.model.damageArmor) p.model.damageArmor(1);
    const from = p.pos.clone();
    const away = p.chest().sub(nova.pos).setY(0);
    if (away.lengthSq() < 0.01) away.set(0, 0, 1);
    away.normalize();
    ctx.defeatPos = from.clone().addScaledVector(away, 13).add(new V3(0, -2.5, 0));
    const novaFrom = nova.pos.clone(), r0 = ctx.novaR;
    let k1 = 0, k2 = 0;
    ctx.update = () => {
      k1 = Math.min(1, k1 + TICK / 1.3);
      k2 = Math.min(1, k2 + TICK / 4);
      p.pos.lerpVectors(from, ctx.defeatPos, easeOut(k1));
      p.vel.set(0, 0, 0);
      nova.pos.lerpVectors(novaFrom, hoverPos(ctx, r0), ease(k2));
      woundSmoke(b, p);
    };
    shot(m, 1.3, (k, out) => {
      const c = p.chest(), f = flatForward(p);
      camAt(out, c.clone().addScaledVector(rightOf(f), 7).addScaledVector(f, -1.5).add(new V3(0, 1.2, 0)), c, 46);
    });
    yield 0.3;
    SL.Audio.play('tinnitus');
    yield 1.0;
    // barely floating: the body knows before he does
    p.setState('scripted', { pose: 'b_beaten', expression: 'hurt', aura: 0, speed: 3 });
    shot(m, 4.4, (k, out) => {
      const c = p.chest(), f = flatForward(p);
      const pos = c.clone().addScaledVector(f, U.lerp(5.4, 2.7, ease(k))).addScaledVector(rightOf(f), 1.3).add(new V3(0, -1.4, 0));
      camAt(out, pos, c.clone().add(new V3(0, 0.25, 0)), 40);
    });
    yield 4.4;

    // ---------- 2. Frieza prepares the final attack ----------
    beat(m, ctx, 'attack');
    faceToward(fz, p.pos);
    fz.setState('scripted', { pose: 'fz_finger', expression: 'smirk' });
    st.setMood(0.55, RED_MOOD, 3);
    ctx.novaRange = 2600;
    ctx.corona = addExtra(ctx, coronaFx(b, ctx));
    const charge = SL.Audio.loop('beamCharge', { vol: 0.9 });
    ctx.loops.push(charge);
    m.music('finale', 0);
    SL.Audio.play('transformBurst');
    const R0 = ctx.novaR, R1 = 60;
    let kg = 0;
    ctx.update = () => {
      kg = Math.min(1, kg + TICK / 9);
      ctx.novaR = U.lerp(R0, R1, ease(kg));
      ctx.novaCharge = 0.4 + kg * 0.6;
      ctx.novaLight = U.lerp(0.7, 1.5, kg);
      nova.pos.copy(hoverPos(ctx, ctx.novaR));
      p.pos.copy(ctx.defeatPos).add(new V3(0, Math.sin(ctx.time * 1.3) * 0.12, 0));
      p.vel.set(0, 0, 0);
      charge.set(kg);
      pullDebris(b, ctx, 0.6 + kg);
      woundSmoke(b, p);
      // controlled shake: it grows with the sphere but never hides the shot
      b.camera.trauma = Math.max(b.camera.trauma, 0.1 + kg * 0.32);
    };
    shot(m, 3.6, (k, out) => {
      // low behind him, looking up: Bardock in the foreground, the sphere and Frieza far beyond
      const c = p.chest();
      const flat = nova.pos.clone().sub(c).setY(0).normalize();
      const pos = c.clone().addScaledVector(flat, -U.lerp(3.8, 3.3, k)).addScaledVector(rightOf(flat), 1.4).add(new V3(0, -2.6, 0));
      const elev = (42 * Math.PI) / 180;
      camAt(out, pos, pos.clone().addScaledVector(flat, 10).add(new V3(0, 10 * Math.tan(elev), 0)), 62);
    });
    m.music(null, 1);
    yield 3.6;
    shot(m, 2.8, (k, out) => {
      const c = fz.chest();
      const toP = p.pos.clone().sub(fz.pos).setY(0).normalize();
      camAt(out, c.clone().addScaledVector(toP, U.lerp(2.6, 2.1, k)).addScaledVector(rightOf(toP), 0.9).add(new V3(0, 0.55, 0)), c.clone().add(new V3(0, U.lerp(0.3, 1.1, k), 0)), 42);
    });
    m.music(null, 2);
    yield 1.3;
    fz.setState('scripted', { pose: 'fz_laugh', expression: 'smirk' });
    yield 1.5;
    shot(m, 3.2, (k, out) => {
      const c = p.chest();
      const to = nova.pos.clone().sub(c).setY(0).normalize();
      camAt(out, c.clone().addScaledVector(rightOf(to), U.lerp(9, 7, k)).addScaledVector(to, -3).add(new V3(0, -5, 0)), c.clone().lerp(nova.pos, 0.38), 64);
    });
    m.music(null, 3);
    SL.Audio.play('rumble', { dur: 3.2, vol: 0.8 });
    yield 3.2;

    // ---------- 3. Bardock realizes it is the end ----------
    beat(m, ctx, 'realize');
    p.aura.setStyle({ color: 0xff3a1e, core: 0xffd0a0, particles: 0xff6040 });
    p.setState('scripted', { pose: 'b_defiant', expression: 'grit', aura: 0.5, speed: 4 });
    shot(m, 2.6, (k, out) => {
      const c = p.chest(), f = flatForward(p);
      camAt(out, c.clone().addScaledVector(f, U.lerp(4.4, 3.5, ease(k))).addScaledVector(rightOf(f), -1.1).add(new V3(0, -0.7, 0)), c.clone().add(new V3(0, 0.3, 0)), 42);
    });
    yield 1.4;
    // the last of his ki sputters out
    p.setState('scripted', { pose: 'b_defiant', expression: 'grit', aura: 0.04, speed: 4 });
    b.vfx.sparks(p.chest(), 0xff6040, 10, 4, 0.1);
    yield 1.2;
    p.setState('scripted', { pose: 'b_realize', expression: 'shock', aura: 0, speed: 1.6 });
    SL.Music.stop(2.2);
    charge.set(0.3);
    ctx.update = () => {
      p.pos.copy(ctx.defeatPos).add(new V3(0, Math.sin(ctx.time * 1.3) * 0.12, 0));
      p.vel.set(0, 0, 0);
      nova.pos.copy(hoverPos(ctx, ctx.novaR));
      pullDebris(b, ctx, 0.8);
      b.camera.trauma = Math.max(b.camera.trauma, 0.05);
    };
    ctx.closeUp = true;
    shot(m, 3.2, (k, out) => {
      const h = headPos(p), f = flatForward(p);
      camAt(out, h.clone().addScaledVector(f, U.lerp(1.0, 0.78, k)), h.clone().addScaledVector(f, 0.1), 24);
    });
    yield 1.6;
    p.setState('scripted', { pose: 'b_realize', expression: 'calm', aura: 0, speed: 1.6 });
    yield 1.6;
    SL.Audio.play('heartbeat');
    yield 0.7;
    SL.Audio.play('heartbeat');
    yield 0.5;

    // ---------- 4. The vision ----------
    beat(m, ctx, 'visionStart');
    ctx.closeUp = false;
    SL.ScreenFX.flash(0.85, '#eaf6ff');
    SL.Audio.play('visionIn');
    SL.Audio.setDream(1);
    SL.ScreenFX.vision(1);
    m.music('vision', 2);
    shot(m, 0.8, (k, out) => {
      const h = headPos(p), f = flatForward(p);
      camAt(out, h.clone().addScaledVector(f, U.lerp(0.78, 0.5, k)), h.clone().addScaledVector(f, 0.1), U.lerp(24, 12, k));
    });
    yield 0.8;
    enterVision(m, ctx);
    const gk = ctx.gk, fv = ctx.fv, V = VISION_AT;
    // flash 1: his son fighting Frieza
    SL.ScreenFX.flash(0.7, '#f2fbff');
    place(gk, V.clone().add(new V3(-1.15, 0, 0)), V.clone().add(new V3(1, 0, 0)));
    place(fv, V.clone().add(new V3(1.15, 0, 0)), V.clone().add(new V3(-1, 0, 0)));
    gk.setState('scripted', { pose: 'g_cross', expression: 'shout', aura: 0.7, speed: 20 });
    fv.setState('scripted', { pose: 'fz_block', expression: 'grit', speed: 20 });
    SL.ScreenFX.setSpeed(0.55);
    const mid = V.clone().add(new V3(0, 1, 0));
    ctx.update = () => {
      if (b.frame % 8 === 0) b.vfx.sparks(mid, 0xffe27a, 8, 10, 0.12);
      if (b.frame % 12 === 0 && ctx.gk) b.vfx.ghost(ctx.gk.model, 0xffe27a, 0.35, 0.35);
    };
    b.vfx.ring(mid, 5, 0xffe27a, 0.4);
    SL.Audio.play('punchHeavy', { vol: 0.6 });
    shot(m, 1.8, (k, out) => {
      const a = U.lerp(-0.7, -0.25, k);
      camAt(out, mid.clone().add(new V3(Math.sin(a) * 4.2, -1.2, Math.cos(a) * 4.2)), mid, 50, 0.14);
    });
    yield 0.6;
    gk.setState('scripted', { pose: 'g_kick', expression: 'shout', aura: 0.8, speed: 20 });
    fv.setState('scripted', { pose: 'hitBody', expression: 'hurt', speed: 20 });
    b.vfx.ring(mid, 7, 0xffffff, 0.35);
    SL.Audio.play('punchHeavy', { vol: 0.5, pitch: 0.8 });
    yield 1.2;
    // flash 2: an energy wave
    SL.ScreenFX.flash(0.75, '#f2fbff');
    SL.Audio.play('visionIn', { vol: 0.5 });
    place(gk, V.clone().add(new V3(-4, 0.5, 0)), V.clone().add(new V3(4, 0, 0)));
    place(fv, V.clone().add(new V3(4, -0.3, 0.6)), gk.pos);
    gk.setState('scripted', { pose: 'g_kameFire', expression: 'shout', aura: 0.35, speed: 20 });
    fv.setState('scripted', { pose: 'fz_block', expression: 'grit', speed: 20 });
    const wave = addExtra(ctx, beamFx(b, gk.chest().addScaledVector(flatForward(gk), 0.7), fv.chest(), 0x9fdcff));
    wave.vision = true;
    SL.Audio.play('kiBlastBig');
    shot(m, 1.8, (k, out) => {
      // three-quarter view: the wave crosses the frame from Goku's hands to Frieza
      const c = gk.chest(), f = flatForward(gk);
      camAt(out, c.clone().addScaledVector(f, U.lerp(1.2, 2, k)).addScaledVector(rightOf(f), U.lerp(6, 5.4, k)).add(new V3(0, 0.6, 0)), c.clone().lerp(fv.chest(), 0.35), 58, U.lerp(-0.1, -0.04, k));
    });
    yield 1.8;
    dropExtra(ctx, wave);
    // flash 3: face to face
    SL.ScreenFX.flash(0.7, '#f2fbff');
    SL.Audio.play('visionIn', { vol: 0.4 });
    SL.ScreenFX.setSpeed(0);
    place(gk, V.clone().add(new V3(-2.2, 0, 0)), V.clone().add(new V3(2, 0, 0)));
    place(fv, V.clone().add(new V3(2.2, 0.2, 0)), gk.pos);
    gk.setState('scripted', { pose: 'g_ssjReveal', expression: 'angry', aura: 0.55, speed: 6 });
    fv.setState('scripted', { pose: 'fz_point', expression: 'smirk', speed: 6 });
    ctx.update = () => {
      if (b.frame % 2 === 0) {
        const y = V.y + U.rand(-1, 3);
        b.vfx.add.emit(V.x - 8, y, V.z + U.rand(-2, 2), 16, 0, 0, 1, 1, 1, 0.5, U.rand(0.04, 0.1), 1, {});
      }
    };
    shot(m, 2.2, (k, out) => {
      camAt(out, V.clone().add(new V3(U.lerp(-1.5, 1.5, k), -0.6, U.lerp(7.5, 6.2, k))), V.clone().add(new V3(0, 0.3, 0)), 40, 0.05);
    });
    yield 2.2;
    // flash 4: the face of his son
    SL.ScreenFX.flash(0.7, '#ffffff');
    SL.Audio.play('heartbeat');
    gk.applyForm(0);
    fv.setHidden(true);
    gk.setState('scripted', { pose: 'g_resolve', expression: 'calm', aura: 0, speed: 6 });
    ctx.update = null;
    shot(m, 2.6, (k, out) => {
      const h = headPos(gk), f = flatForward(gk);
      camAt(out, h.clone().addScaledVector(f, U.lerp(1.3, 0.85, k)), h, 26, U.lerp(0.06, 0, k));
    });
    yield 1.2;
    gk.setState('scripted', { pose: 'g_resolve', expression: 'angry', aura: 0, speed: 6 });
    yield 1.4;
    beat(m, ctx, 'visionEnd');
    SL.ScreenFX.flash(1, '#ffffff');
    exitVision(m, ctx);
    SL.Music.stop(0.3);
    SL.Audio.play('heartbeat');
    // the real scene comes back hard: a held half-second of it before he reacts
    yield 0.5;

    // ---------- 5. Realization: a small, quiet smile ----------
    beat(m, ctx, 'smile');
    ctx.closeUp = true;
    p.setState('scripted', { pose: 'b_realize', expression: 'shock', aura: 0, speed: 20 });
    ctx.update = () => {
      p.pos.copy(ctx.defeatPos).add(new V3(0, Math.sin(ctx.time * 1.3) * 0.12, 0));
      p.vel.set(0, 0, 0);
      nova.pos.copy(hoverPos(ctx, ctx.novaR));
      pullDebris(b, ctx, 0.5);
    };
    shot(m, 1.6, (k, out) => {
      const h = headPos(p), f = flatForward(p);
      camAt(out, h.clone().addScaledVector(f, 0.75), h.clone().addScaledVector(f, 0.1), 22);
    });
    yield 1.6;
    p.setState('scripted', { pose: 'b_smile', expression: 'soft', aura: 0, speed: 1.2 });
    p.rimLight = { color: 0xffb070, strength: 0.5 };
    m.music('farewell', 0);
    shot(m, 4.2, (k, out) => {
      const h = headPos(p), f = flatForward(p);
      const a = U.lerp(0.25, -0.15, k);
      const dir = f.clone().multiplyScalar(Math.cos(a)).addScaledVector(rightOf(f), Math.sin(a));
      camAt(out, h.clone().addScaledVector(dir, U.lerp(1.0, 1.7, ease(k))).add(new V3(0, U.lerp(-0.08, 0.02, k), 0)), h.clone().add(new V3(0, -0.03, 0)), U.lerp(28, 34, k));
    });
    yield 2.2;
    m.music(null, 1);
    yield 2.0;
    // he turns to meet it, calm, and reaches out
    ctx.closeUp = false;
    p.setState('scripted', { pose: 'b_reach', expression: 'soft', aura: 0, speed: 2.2 });
    m.music(null, 2);
    shot(m, 2.6, (k, out) => {
      const c = p.chest(), f = flatForward(p);
      camAt(out, c.clone().addScaledVector(rightOf(f), 4.5).addScaledVector(f, 0.8).add(new V3(0, -1.2, 0)), c.clone().addScaledVector(f, 2).add(new V3(0, 0.8, 0)), 44);
    });
    m.say('bardock', 'Kakarot...', 2.4);
    yield 2.6;

    // ---------- 6. The sphere reaches Bardock ----------
    // (a) the heat arrives before the sphere does: the fractures in his armor glow, he braces
    fz.setState('scripted', { pose: 'fz_finger', expression: 'smirk' });
    SL.Audio.play('roar', { pitch: 0.45, vol: 1 });
    m.music(null, 3);
    if (p.model.damageArmor) p.model.damageArmor(2);
    p.rimLight = { color: 0xffc080, strength: 0.8 };
    const nStart = nova.pos.clone();
    const hitAt = p.chest();
    let kc = 0, kHold = 0.45, contact = false;
    ctx.novaGlow = 0.35;
    const throwPieces = (pieces) => {
      const away = p.chest().sub(nova.pos).normalize();
      for (const pc of pieces) {
        for (let n = 0; n < 5; n++) {
          const v = away.clone().multiplyScalar(U.rand(6, 13)).add(new V3(U.rand(-3, 3), U.rand(-2, 4), U.rand(-3, 3)));
          b.vfx.rock(pc.pos.clone().add(new V3(U.rand(-0.1, 0.1), U.rand(-0.1, 0.1), U.rand(-0.1, 0.1))), v, pc.size * U.rand(0.35, 0.7), pc.color);
        }
        b.vfx.sparks(pc.pos, 0xffc070, 16, 12, 0.14);
      }
    };
    ctx.update = () => {
      kc = Math.min(kHold, kc + TICK / 4);
      nova.pos.lerpVectors(nStart, hitAt, easeIn(kc));
      p.pos.copy(ctx.defeatPos).add(new V3(U.rand(-0.02, 0.02) * kc * 3, U.rand(-0.02, 0.02) * kc * 3, 0));
      p.vel.set(0, 0, 0);
      charge.set(0.5 + kc * 0.5);
      ctx.novaLight = U.lerp(1.5, 2.6, kc);
      pullDebris(b, ctx, 1.5);
      woundSmoke(b, p);
      if (b.frame % 5 === 0) b.vfx.sparks(p.chest().add(new V3(U.rand(-0.2, 0.2), U.rand(-0.2, 0.3), 0)), 0xffb060, 3, 6, 0.08);
      b.camera.trauma = Math.max(b.camera.trauma, 0.15 + kc * 0.4);
    };
    p.setState('scripted', { pose: 'b_beaten', expression: 'grit', aura: 0, speed: 3 });
    shot(m, 2.4, (k, out) => {
      // from the side: the man small against the light coming at him
      const c = p.chest(), f = flatForward(p);
      camAt(out, c.clone().addScaledVector(rightOf(f), U.lerp(5.2, 4.4, ease(k))).addScaledVector(f, -0.6).add(new V3(0, -0.4, 0)), c.clone().addScaledVector(f, 1.5).add(new V3(0, 0.4, 0)), 48);
    });
    yield 2.4;

    // (b) the armor gives: the shoulder guards tear away, then the chest plate
    beat(m, ctx, 'armorBreak');
    kHold = 0.62;
    p.setState('scripted', { pose: 'hitBody', expression: 'hurt', aura: 0, speed: 16 });
    throwPieces(p.model.damageArmor ? p.model.damageArmor(3) : []);
    SL.Audio.play('guardBreak', { vol: 1, pitch: 0.7 });
    b.camera.addTrauma(0.35);
    shot(m, 1.8, (k, out) => {
      const c = p.chest(), f = flatForward(p);
      camAt(out, c.clone().addScaledVector(f, U.lerp(2.8, 2.4, k)).addScaledVector(rightOf(f), 1.3).add(new V3(0, 0.1, 0)), c.clone().add(new V3(0, 0.1, 0)), 42);
    });
    yield 0.7;
    throwPieces(p.model.damageArmor ? p.model.damageArmor(4) : []);
    SL.Audio.play('rockBreak', { vol: 1, pitch: 0.8 });
    b.vfx.flash(p.chest(), 3, 0xffd8a0, 0.2, SL.Toon.tex.glow);
    b.camera.addTrauma(0.3);
    yield 0.5;
    p.setState('scripted', { pose: 'b_reach', expression: 'soft', aura: 0, speed: 3 });
    yield 0.6;

    // (c) a last look at his face: the faint, defiant smile, lit by it — and the world goes quiet
    SL.Music.stop(0.4);
    p.setState('scripted', { pose: 'b_smile', expression: 'soft', aura: 0, speed: 1.2 });
    p.rimLight = { color: 0xfff0d0, strength: 1.1 };
    shot(m, 2.4, (k, out) => {
      const h = headPos(p), f = flatForward(p);
      camAt(out, h.clone().addScaledVector(f, U.lerp(0.95, 0.8, k)).addScaledVector(rightOf(f), 0.18), h.clone().add(new V3(0, -0.02, 0)), U.lerp(26, 23, k));
    });
    kHold = 0.72;
    yield 2.4;

    // (d) it hits: he is thrown back through the light, a streak of him, until it swallows him
    beat(m, ctx, 'blownAway');
    SL.ScreenFX.flash(0.8, '#fff0d0');
    SL.Audio.play('explosionHuge', { vol: 1.1, pitch: 0.8 });
    p.setState('scripted', { pose: 'hitHeavy', expression: 'hurt', aura: 0, speed: 16 });
    const blownFrom = p.pos.clone();
    const blowDir = p.chest().sub(nova.pos).normalize();
    const blownTo = blownFrom.clone().addScaledVector(blowDir, 26).add(new V3(0, 3, 0));
    let kb = 0;
    ctx.update = () => {
      kb = Math.min(1, kb + TICK / 1.5);
      p.pos.lerpVectors(blownFrom, blownTo, easeOut(kb));
      p.vel.set(0, 0, 0);
      p.yaw += TICK * 3.2 * (1 - kb);
      // the sphere keeps coming, faster than he flies
      const want = p.chest();
      nova.pos.lerp(want, 0.03 + kb * 0.05);
      charge.set(1);
      ctx.novaLight = 2.6;
      if (b.frame % 2 === 0) b.vfx.trail(p.chest(), 0xffd8a0, 0.9, 0.5);
      if (b.frame % 6 === 0) b.vfx.ghost(p.model, 0xffe6b8, 0.4, 0.45);
      if (b.frame % 4 === 0) b.vfx.sparks(p.chest(), 0xffc070, 6, 14, 0.12);
      b.camera.trauma = Math.max(b.camera.trauma, 0.45 * (1 - kb) + 0.15);
      // he is thrown most of the way before it closes over him
      if (!contact && kb >= 0.8 && nova.pos.distanceTo(p.chest()) < ctx.novaR * 0.98) contact = true;
    };
    shot(m, 2.2, (k, out) => {
      // wide and to the side, tracking the streak
      const c = p.chest(), side = new V3().crossVectors(blowDir, new V3(0, 1, 0)).normalize();
      camAt(out, c.clone().addScaledVector(side, 14).addScaledVector(blowDir, -5).add(new V3(0, 2, 0)), c.clone().addScaledVector(blowDir, -3), 54);
    });
    yield () => contact || kb >= 1;
    if (!contact) {
      // hurled clear of it for a heartbeat: it finishes the distance
      const nFrom = nova.pos.clone();
      let kf = 0;
      ctx.update = () => {
        kf = Math.min(1, kf + TICK / 0.6);
        nova.pos.lerpVectors(nFrom, p.chest(), easeIn(kf));
        if (nova.pos.distanceTo(p.chest()) < ctx.novaR * 0.98) contact = true;
      };
      yield () => contact || kf >= 1;
      contact = true;
    }
    beat(m, ctx, 'consumed');
    ctx.consumedAt = p.chest();
    SL.ScreenFX.flash(1, '#fff4dc');
    SL.Audio.play('explosionHuge', { vol: 1.2 });
    SL.Music.stop(0.1);
    b.vfx.ghost(p.model, 0xffe6b8, 0.9, 0.7);
    b.vfx.explosion(ctx.consumedAt, 10, 0xffc070, { smoke: false });
    b.vfx.light(ctx.consumedAt, 0xffe0a0, 10, 400, 1);
    ctx.novaGlow = 0.55;
    const nHold = nova.pos.clone();
    ctx.update = () => {
      nova.pos.copy(nHold);
      b.camera.trauma = Math.max(b.camera.trauma, 0.3);
    };
    shot(m, 1.6, (k, out) => {
      const c = ctx.consumedAt, r = rightOf(flatForward(p));
      camAt(out, c.clone().addScaledVector(r, U.lerp(30, 38, k)).add(new V3(0, 5, 0)), c, 52);
    });
    yield 0.35;
    p.setHidden(true);
    yield 1.25;

    // ---------- 7. Planet Vegeta is destroyed (one continuous shot) ----------
    const planet = st.planet, atmo = st.atmo;
    const PC = planet.position.clone();
    const down = ctx.consumedAt.clone().sub(PC).normalize();
    const I = PC.clone().addScaledVector(down, 700);
    const F = fz.chest();
    const nrm = F.clone().sub(I).normalize();
    const side = new V3().crossVectors(nrm, new V3(0, 1, 0));
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize();
    const cracks = addExtra(ctx, crackShell(b, planet, down));
    const n0 = nova.pos.clone();
    const emissive = planet.material && planet.material.emissive;
    let T = 0;
    ctx.novaGlow = 0.55;
    ctx.novaRange = 3000;
    ctx.novaLight = 2.4;
    fz.setState('scripted', { pose: 'fz_laugh', expression: 'smirk' });
    ctx.update = () => {
      T += TICK;
      if (!nova.done) {
        if (T < 4) {
          const k = easeIn(T / 4);
          nova.pos.lerpVectors(n0, I, k);
          ctx.novaR = U.lerp(60, 105, k);
        } else {
          const k = ease(U.clamp01((T - 4) / 3.2));
          nova.pos.copy(I).addScaledVector(down, -130 * k);
          ctx.novaR = U.lerp(105, 70, k);
        }
      }
      if (T >= 4 && planet.visible) {
        const k = U.clamp01((T - 4) / 3.2);
        cracks.set(ease(k));
        if (emissive) emissive.setRGB(0.55 * k, 0.16 * k, 0.03 * k);
        planet.scale.setScalar(1 + 0.025 * k * k);
        cracks.mesh.scale.setScalar(1 + 0.025 * k * k);
        atmo.scale.setScalar(1 + 0.03 * k);
        if (b.frame % 10 === 0) {
          const d = down.clone().add(new V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).multiplyScalar(0.3 + k * 0.6)).normalize();
          const at = PC.clone().addScaledVector(d, 700);
          b.vfx.ball(at, U.rand(30, 70) * (0.6 + k), 0xff8a3a, 1.2);
          b.vfx.flash(at, 160 * (0.6 + k), 0xffb060, 0.5, SL.Toon.tex.glow);
        }
        b.camera.trauma = Math.max(b.camera.trauma, 0.12 + 0.2 * k);
      }
    };
    shot(m, 13.5, (k, out, el) => {
      const kB = ease(U.clamp01((el - 4) / 3.2));
      const kC = ease(U.clamp01((el - 7.2) / 6.3));
      const dist = U.lerp(U.lerp(17, 11, kB), 90, kC);
      const pos = F.clone().addScaledVector(nrm, dist).addScaledVector(side, U.lerp(-6, -40, kC)).add(new V3(0, U.lerp(2.5, 30, kC), 0));
      const aim = el < 4 && !nova.done ? nova.pos.clone() : I.clone();
      camAt(out, pos, aim.lerp(PC, kC * 0.5), U.lerp(56, 62, kC));
    });
    SL.Audio.play('rumble', { dur: 4, vol: 0.7 });
    yield 4;
    beat(m, ctx, 'planetImpact');
    SL.ScreenFX.flash(0.45, '#ffb070');
    SL.Audio.play('groundImpact', { vol: 1 });
    SL.Audio.play('rumble', { dur: 4, vol: 1 });
    b.vfx.ball(I, 180, 0xffa040, 1.6);
    b.vfx.ring(I, 520, 0xffc080, 1.8, down);
    b.vfx.light(I, 0xff8a3a, 6, 2600, 3.2);
    yield 3.2;
    beat(m, ctx, 'planetDestroyed');
    SL.ScreenFX.flash(1, '#ffe2b0');
    SL.Audio.play('explosionHuge', { vol: 1.3 });
    SL.Audio.play('rumble', { dur: 5, vol: 1 });
    b.vfx.ball(PC, 880, 0xffb060, 4.5);
    b.vfx.ball(PC, 600, 0xffffff, 1.6);
    b.vfx.flash(PC, 3200, 0xffd9a0, 1.4, SL.Toon.tex.glow);
    b.vfx.ring(PC, 1900, 0xffd0a0, 3.4, new V3(0.15, 1, 0.1).normalize());
    b.vfx.ring(PC, 1400, 0xffe8c8, 2.4, new V3(-0.3, 1, 0.2).normalize());
    b.vfx.light(PC, 0xffa060, 9, 4000, 3.5);
    b.camera.addTrauma(0.6);
    planet.visible = false;
    atmo.visible = false;
    nova.dispose();
    for (const h of ctx.loops) h.stop(0.6);
    ctx.loops.length = 0;
    dropExtra(ctx, cracks);
    addExtra(ctx, planetChunks(b, PC, 42));
    addExtra(ctx, emberCloud(b, PC));
    st.setMood(0.2, RED_MOOD, 2);
    yield 1.0;
    b.vfx.ring(PC, 2400, 0xff9a50, 3.2, new V3(0.05, 1, -0.2).normalize());
    SL.Audio.play('rumble', { dur: 4, vol: 0.6 });
    yield 5.3;

    // ---------- 8. Toward Goku's story ----------
    beat(m, ctx, 'transition');
    m.fade('black', 1.3);
    yield 1.5;
    ctx.update = null;
    for (const x of ctx.extras.slice()) dropExtra(ctx, x);
    fz.setHidden(true);
    b.camera.trauma = 0;
    st.clearMood(0.1);
    const Q = new V3(0, 70, 330);
    const dirE = new V3(-0.25, -0.42, 0.87).normalize();
    // Earth sits inside the star shell so no star is drawn over it
    const E = Q.clone().addScaledVector(dirE, 520);
    addExtra(ctx, earthFx(b, E, 250));
    const pod = addExtra(ctx, podFx(b));
    const podFrom = Q.clone().add(new V3(1.4, -0.5, -7));
    const podTo = E.clone().addScaledVector(dirE.clone().negate().add(new V3(0, 0.35, 0)).normalize(), 252);
    let kp = 0;
    ctx.update = () => {
      kp = Math.min(1, kp + TICK / 5.6);
      pod.group.position.lerpVectors(podFrom, podTo, Math.pow(kp, 0.6));
      if (kp < 0.9) pod.flare.scale.setScalar(U.lerp(5, 2.2, kp / 0.9));
      else {
        // atmospheric entry
        pod.flare.material.color.setHex(0xffb060);
        pod.flare.scale.setScalar(U.lerp(2.2, 7, (kp - 0.9) * 10));
      }
      if (b.frame % 2 === 0 && kp < 1) b.vfx.trail(pod.group.position, kp > 0.9 ? 0xffa050 : 0x9fd8ff, U.lerp(1.2, 3, kp), 0.9);
    };
    m.fade('clear', 1.8);
    SL.Music.stinger('dawn');
    shot(m, 11, (k, out, el) => {
      const pos = Q.clone().addScaledVector(dirE, 30 * ease(k));
      const aim = E.clone().add(new V3(0, 150, 0)).lerp(pod.group.position, U.clamp01((el - 0.4) / 2) * 0.3);
      camAt(out, pos, aim, 52);
    });
    yield 1.0;
    SL.Audio.play('dash', { vol: 1.2 });
    yield 2.4;
    m.title('', 'Earth', 'Age 737', 3.6);
    yield 2.4;
    b.vfx.flash(podTo, 30, 0xffc080, 0.8);
    yield 1.6;
    m.fade('black', 1.8);
    yield 2.0;
    beat(m, ctx, 'end');
  }

  function prepare(m) {
    const b = m.battle, p = m.player, st = b.stage;
    const H = m.ending || {};
    let fz = H.fz && b.fighters.includes(H.fz) ? H.fz : null;
    if (!fz) {
      // started straight at this phase (development and tests): stage the end of the struggle
      fz = b.spawn({ charId: 'frieza', team: 1, pos: new V3(0, 44, -80), grounded: false, dummy: 'idle', infiniteHp: true, cannotDie: true, tags: { priority: true, cinematic: true } });
      fz.invuln = 1e9;
      if (m.def.props && m.def.props.hoverPod) fz.object.add(m.def.props.hoverPod(1));
      fz.setState('scripted', { pose: 'fz_laugh', expression: 'smirk' });
      p.setPosition(new V3(0, 12, 32));
      p.vel.set(0, 0, 0);
    }
    let nova = H.nova && !H.nova.done ? H.nova : null;
    if (!nova) {
      nova = new SL.SpiritBomb(b, fz, { radius: 16, color: 0xff7a1a, speed: 0, homing: 0, damage: 0, explode: 30 });
      nova.pos.copy(p.chest()).add(new V3(0, 1, -17));
      nova.radius = 16;
    }
    fz.target = p;
    return {
      b, p, fz, nova, st,
      beam: H.beam || null,
      beamGone: false,
      novaR: nova.radius || 16,
      novaCharge: 0.6,
      novaRange: 80,
      novaLight: undefined,
      novaGlow: undefined,
      time: 0,
      beat: null,
      update: null,
      extras: [],
      loops: [],
      hidden: [],
      actors: [],
      inVision: false,
      visionLight: null,
      finished: false,
    };
  }

  /** Skip: jump to the state the ending leaves behind, without playing the rest. */
  function skipToEnd(m, ctx) {
    const b = m.battle, st = b.stage;
    m.flags.endingSkipped = ctx.beat || 'start';
    b.emit('cinematicSkipped', { at: ctx.beat, time: ctx.time });
    if (ctx.inVision) exitVision(m, ctx);
    b.endCinematic();
    if (ctx.beam && !ctx.beamGone) {
      ctx.beamGone = true;
      ctx.beam.dispose();
    }
    if (ctx.nova && !ctx.nova.done) ctx.nova.dispose();
    ctx.p.setHidden(true);
    if (st.planet) st.planet.visible = false;
    if (st.atmo) st.atmo.visible = false;
    SL.Music.stop(0.4);
    m.fade('black', 0.35);
  }

  function cleanup(m, ctx) {
    if (ctx.finished) return;
    ctx.finished = true;
    const i = m.tickHooks.indexOf(ctx.hook);
    if (i >= 0) m.tickHooks.splice(i, 1);
    if (ctx.inVision) exitVision(m, ctx);
    for (const x of ctx.extras.slice()) dropExtra(ctx, x);
    for (const h of ctx.loops) h.stop(0.4);
    ctx.loops.length = 0;
    ctx.update = null;
    SL.ScreenFX.vision(0);
    SL.ScreenFX.setSpeed(0);
    SL.Audio.setDream(0);
    ctx.p.rimLight = null;
    m.battle.camera.trauma = 0;
  }

  SL.data.cinematics = SL.data.cinematics || {};
  SL.data.cinematics.bardockEnding = function* (m) {
    const b = m.battle;
    m.lock(true);
    m.limits(null);
    m.flags.endingBeats = [];
    const ctx = prepare(m);
    m.endingCtx = ctx;
    m.onDispose(() => cleanup(m, ctx));
    const co = new SL.Coroutine(timeline(m, ctx));
    ctx.hook = () => {
      if (ctx.finished) return;
      ctx.time += TICK;
      renderNova(ctx);
      if (ctx.update) ctx.update(TICK);
      for (const x of ctx.extras) if (x.update) x.update(TICK);
      co.update(TICK);
    };
    m.tickHooks.push(ctx.hook);
    b.skipRequested = false;
    yield () => {
      if (b.skipRequested && ctx.time < SKIP_GRACE) b.skipRequested = false;
      return co.done || b.skipRequested;
    };
    if (!co.done) {
      co.stop();
      skipToEnd(m, ctx);
      yield 0.6;
    }
    cleanup(m, ctx);
    b.camera.endShot();
  };
  SL.data.cinematics.bardockEnding.BEATS = ['defeat', 'attack', 'realize', 'visionStart', 'visionEnd', 'smile', 'armorBreak', 'blownAway', 'consumed', 'planetImpact', 'planetDestroyed', 'transition', 'end'];
})();
