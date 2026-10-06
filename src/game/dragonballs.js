/*
 * DRAGON BALLS — the collection (state in the save), the ball you can see and pick up, the radar it
 * shows on, and the wishes.
 *
 *   SL.DragonBalls.state()            { found: [stars], wishes: [ids], summons }
 *   has(star) / count() / collect(star) / scatter()
 *   model(star)                       an orange glass ball with its stars inside and a warm glow
 *   spawn(m, star, pos, opts)         the ball in the world: it bobs, glints when you are near, beeps on
 *                                     the radar, and is collected on touch. opts.hidden: not visible
 *                                     or collectable until item.reveal(). Returns the item.
 *   radar(b, item)                    point the HUD's Dragon Radar at it (null hides the radar)
 *   wishOptions() / grant(id)         what Shenron offers this time, and what a wish does
 *
 * Presentation never calls Math.random (it would shift seeded fights).
 */
(function () {
  'use strict';
  const V3 = THREE.Vector3;

  // where the stars sit on the ball's front (ball radius 1), for one to seven stars
  const STAR_LAYOUT = {
    1: [[0, 0]],
    2: [[-0.28, 0.1], [0.28, -0.1]],
    3: [[0, 0.3], [-0.28, -0.18], [0.28, -0.18]],
    4: [[-0.26, 0.26], [0.26, 0.26], [-0.26, -0.26], [0.26, -0.26]],
    5: [[0, 0.34], [-0.33, 0.1], [0.33, 0.1], [-0.2, -0.3], [0.2, -0.3]],
    6: [[-0.22, 0.34], [0.22, 0.34], [-0.36, 0], [0.36, 0], [-0.22, -0.34], [0.22, -0.34]],
    7: [[0, 0], [0, 0.4], [0, -0.4], [-0.35, 0.2], [0.35, 0.2], [-0.35, -0.2], [0.35, -0.2]],
  };

  const DB = (SL.DragonBalls = {
    state() {
      const d = SL.Save.data;
      if (!d.dragonBalls) d.dragonBalls = { found: [], wishes: [], summons: 0 };
      return d.dragonBalls;
    },
    has(star) {
      return DB.state().found.includes(star);
    },
    count() {
      return DB.state().found.length;
    },
    collect(star) {
      const s = DB.state();
      if (!s.found.includes(star)) s.found.push(star);
      if (SL.Save.write) SL.Save.write();
    },
    scatter() {
      const s = DB.state();
      s.found = [];
      s.summons = (s.summons || 0) + 1;
      if (SL.Save.write) SL.Save.write();
    },

    model(star, r = 0.22) {
      const g = new THREE.Group();
      const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), SL.Toon.mat(0xffa21e));
      SL.Toon.addOutline(ball, 1.1);
      g.add(ball);
      // the shine on the glass
      const shine = new THREE.Mesh(new THREE.SphereGeometry(r * 0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff4d0 }));
      shine.position.set(-r * 0.42, r * 0.5, r * 0.7);
      shine.scale.set(1, 0.6, 0.4);
      g.add(shine);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xd8201a });
      for (const [x, y] of STAR_LAYOUT[star] || STAR_LAYOUT[1]) {
        const st = new THREE.Mesh(new THREE.SphereGeometry(r * 0.13, 6, 5), starMat);
        const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
        st.position.set(x * r * 0.92, y * r * 0.92, z * r * 0.92);
        st.scale.set(1, 1, 0.45);
        st.lookAt(st.position.clone().multiplyScalar(3));
        g.add(st);
      }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SL.Toon.tex.glow, color: 0xffb040, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
      glow.scale.setScalar(r * 6);
      g.add(glow);
      g.userData.glow = glow;
      g.userData.dispose = () => g.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material.dispose) o.material.dispose();
      });
      return g;
    },

    spawn(m, star, pos, opts = {}) {
      const b = m.battle;
      const g = DB.model(star);
      const base = pos.clone();
      g.position.copy(base);
      g.visible = !opts.hidden;
      b.scene.add(g);
      const item = { pos: base.clone(), alive: true, hidden: !!opts.hidden, group: g, kind: 'dragonball', star };
      m.items.push(item);
      item.reveal = () => {
        if (!item.hidden) return;
        item.hidden = false;
        g.visible = true;
        b.vfx.flash(item.pos.clone().add(new V3(0, 0.3, 0)), 2.4, 0xffb040, 0.4, SL.Toon.tex.glow);
        b.vfx.ring(item.pos.clone(), 2.4, 0xffd080, 0.5);
        b.sfx('pickup', null, { at: item.pos, pitch: 0.8 });
        b.emit('dragonBallRevealed', { item });
      };
      let beep = 0;
      const hook = () => {
        if (!item.alive) return;
        const t = b.frame * 0.04;
        const at = item.pos;
        g.position.set(at.x, at.y + 0.25 + Math.sin(t) * 0.1, at.z);
        g.rotation.y = t * 0.8;
        const p = m.player;
        if (!p || !p.alive) return;
        const d = p.chest().distanceTo(g.position);
        // the radar's beep: faster as you close in
        if (--beep <= 0 && !b.inputLocked) {
          beep = Math.max(10, Math.min(90, Math.round(d * 0.9)));
          SL.Audio.play('radarPing', { vol: d < 30 ? 0.45 : 0.25, pitch: d < 12 ? 1.25 : 1 });
        }
        if (item.hidden) return;
        // the glint: a flare you catch from across the field
        if (b.frame % 45 === 0) b.vfx.flash(g.position.clone(), d < 40 ? 1.1 : 2, 0xffd890, 0.2, SL.Toon.tex.glow);
        g.userData.glow.material.opacity = 0.45 + Math.sin(t * 3) * 0.15;
        if (d < (opts.reach || 1.8)) {
          item.alive = false;
          b.scene.remove(g);
          g.userData.dispose();
          b.vfx.sparks(item.pos.clone().add(new V3(0, 0.3, 0)), 0xffd080, 22, 6, 0.12);
          b.sfx('pickup', p, { pitch: 1.2 });
          if (opts.onCollect) opts.onCollect(item);
          b.emit('pickup', { item });
        }
      };
      m.itemHooks.push(hook);
      m.onDispose(() => {
        if (g.parent) {
          b.scene.remove(g);
          g.userData.dispose();
        }
      });
      item.hook = hook;
      return item;
    },

    radar(b, item) {
      b.emit('radar', { target: item || null });
    },

    /** What Shenron can grant this time: each wish says why it is (or is not) on offer. */
    wishOptions() {
      const Sv = SL.Save, flags = Sv.data.flags || {};
      const out = [];
      for (const w of SL.data.dragonBalls.wishes) {
        let ok = true;
        if (w.id === 'warrior') ok = !!DB._nextWarrior();
        if (w.id === 'wardrobe') ok = DB._lockedOutfits().length > 0;
        if (w.id === 'music') ok = !flags.wish_music;
        if (w.id === 'fusion') ok = !flags.wish_fusion && !(Sv.missionResult('buu_spiritbomb') && Sv.missionResult('buu_spiritbomb').completed);
        if (ok) out.push(w);
      }
      return out;
    },

    _nextWarrior() {
      // the next playable fighter the story would hand over, in unlock-rule order
      for (const u of SL.data.unlocks) {
        if (u.type !== 'characters') continue;
        const c = SL.data.characters[u.target];
        if (c && c.playable && !SL.Save.isUnlocked('characters', u.target)) return u.target;
      }
      return null;
    },

    _lockedOutfits() {
      const W = SL.data.wardrobe;
      if (!W) return [];
      return Object.values(W.pieces).filter((p) => p.slot === 'outfit' && p.status === 'prototype' && p.unlock && !SL.Save.isUnlocked('outfits', p.id) && p.chars.every((c) => c === '*' || SL.Save.isUnlocked('characters', c) || SL.data.characters[c] && !SL.data.unlocks.some((u) => u.type === 'characters' && u.target === c)));
    },

    /** Grants a wish; returns the line that says what changed. */
    grant(id) {
      const Sv = SL.Save;
      const flags = (Sv.data.flags = Sv.data.flags || {});
      const s = DB.state();
      s.wishes = (s.wishes || []).concat([id]);
      let text = '';
      if (id === 'warrior') {
        const c = DB._nextWarrior();
        if (c) {
          Sv.unlock('characters', c);
          text = SL.data.characters[c].name + ' joins Free Battle.';
        }
      } else if (id === 'wardrobe') {
        const list = DB._lockedOutfits().slice(0, 2);
        for (const p of list) Sv.unlock('outfits', p.id);
        text = list.map((p) => p.chars.map((c) => (SL.data.characters[c] ? SL.data.characters[c].name : c)).join('/') + ': ' + p.name).join(' · ') || 'Nothing new to wear.';
      } else if (id === 'music') {
        flags.wish_music = true;
        text = 'Records → Sound Test: every song in the game.';
      } else if (id === 'fusion') {
        flags.wish_fusion = true;
        text = 'What If → "The Ultimate Fusion" is open.';
      } else text = 'A peaceful day.';
      if (Sv.write) Sv.write();
      return text;
    },
  });
})();
