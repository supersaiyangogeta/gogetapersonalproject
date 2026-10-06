/*
 * Fighter: the shared combat framework every character runs on.
 * Characters differ through data (moves, specials, forms, poses, stats,
 * sequences, vfx/audio profiles) and mechanics (src/game/mechanics.js).
 * Player and CPU fighters use the exact same rules — both are driven by an
 * "intent" produced by a controller.
 *
 * V0.2 data features (any character can use them):
 *   moves: multi-hit windows, teleport strikes, follow-through poses, airHeavy,
 *          custom chase moves
 *   specials: beam tiers + callouts + form variants + instant variant,
 *             teleport modes + fatigue, hold-to-charge Spirit Bomb
 *   forms: leveled forms (Kaioken), data-driven transformation sequences
 *   presentation: afterimage ghosts, rim light from aura, secondary motion,
 *                 flight banking, directional hit reactions, contact shadow
 */
(function () {
  'use strict';
  const U = SL.util;
  const R = SL.Rules;
  const V3 = THREE.Vector3;
  const TICK = SL.TICK;
  const UP = new V3(0, 1, 0);
  let NEXT_ID = 1;

  const CHASE_SMASH = { id: 'chaseSmash', startup: 5, active: 6, recovery: 22, damage: 640, reach: 1.1, radius: 1.05, lunge: 16, hitstun: 36, knock: 'smash', knockSpeed: 36, impact: 3, pose: { wind: 'hammerWind', strike: 'hammer' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' };
  const CHASE_STRIKE = { id: 'chaseStrike', startup: 5, active: 6, recovery: 22, damage: 600, reach: 1.2, radius: 1.05, lunge: 16, hitstun: 34, knock: 'heavy', knockSpeed: 28, impact: 3, pose: { wind: 'punchWindR', strike: 'punchR' }, sfx: 'punchHeavy', hitPose: 'hitHeavy' };
  const BLAST_DEFAULT = { color: 0xffd84a, core: 0xffffff, damage: 150, speed: 72, radius: 0.3 };

  let shadowGeo = null, shadowTex = null;

  /** A character who cannot fly until a mission teaches her (`def.flightUnlock`) flies once it is cleared. */
  function flightLearned(def) {
    if (!def.flightUnlock) return false;
    try {
      const r = SL.Save && SL.Save.missionResult && SL.Save.missionResult(def.flightUnlock);
      return !!(r && r.completed);
    } catch (e) {
      return false;
    }
  }

  /**
   * FORM PROGRESSION OUTSIDE THE STORY. A form with `freeUnlock: '<mission>'` exists in Free
   * Battle, Training and the menus only once that canon mission is cleared (no Super Saiyan 2
   * before the story has shown it). The story itself is SL.data.formGivenBy's job; What-If
   * missions lock by their branch point (Mission._lockUnearnedForms).
   */
  function formFreeUnlocked(fm) {
    if (!fm.freeUnlock) return true;
    if (SL.Dev && SL.Dev.unlockAll && SL.Dev.unlockAll()) return true;
    try {
      const r = SL.Save && SL.Save.missionResult && SL.Save.missionResult(fm.freeUnlock);
      return !!(r && r.completed);
    } catch (e) {
      return false;
    }
  }
  SL.formFreeUnlocked = formFreeUnlocked;

  function emptyIntent() {
    return {
      mx: 0, my: 0, up: false, upPressed: false, down: false, boost: false, boostPressed: false,
      light: false, heavy: false, blast: false, blastHeld: false, guard: false, dodge: false, charge: false,
      s1: false, s1Held: false, s2: false, s2Held: false, ult: false, ultHeld: false,
      // an extra technique (def.extras) chosen on the skill wheel: its id, and whether it is held
      extra: null, extraHeld: false,
      transform: false, revert: false, target: false, targetNext: false, targetPrev: false, targetFlick: 0,
    };
  }
  const PRESS_KEYS = ['light', 'heavy', 'blast', 's1', 's2', 'ult', 'dodge'];
  /** Extra techniques live in def.extras and use slot names "x:<id>". */
  const EXTRA = 'x:';
  /** Is the button for this slot being held? */
  function slotHeld(slot, it) {
    if (slot === 'special1') return it.s1Held;
    if (slot === 'special2') return it.s2Held;
    if (slot && slot.startsWith(EXTRA)) return it.extraHeld;
    return it.ultHeld;
  }
  SL.slotHeld = slotHeld;
  // states from which a story power gap lets a fighter slip an ordinary attack (see takeHit).
  // Not 'recover': the recovery after a committed technique is the counter window, and no
  // power gap erases a correct punish (owner's Frieza fairness pass).
  const STORY_EVADE_STATES = { free: 1, guard: 1, dash: 1, charge: 1, land: 1 };
  // states an ultimate lives in while it is being committed to (see committedUltimate)
  const ULT_COMMIT_STATES = { beamCharge: 1, beamFire: 1, rush: 1, scatter: 1, spiritBomb: 1 };
  const GRAVITY_EXEMPT = new Set(['knockback', 'knockdown', 'ko', 'held', 'teleport', 'vanish', 'clash', 'transform', 'spiritBomb', 'scripted']);

  class Fighter {
    constructor(battle, def, opts = {}) {
      this.battle = battle;
      this.def = def;
      this.id = NEXT_ID++;
      this.team = opts.team || 0;
      this.isPlayer = !!opts.isPlayer;
      this.name = opts.name || def.name;
      this.controller = opts.controller || null;
      this.tags = opts.tags || {};

      // what the body wears: the era's canon look in the story, the player's look in Free Battle,
      // Training and menus, or an explicit selection (opts.wardrobe: previews, tests) — SL.Wardrobe
      let modelDef = def;
      const dressed = SL.Wardrobe ? SL.Wardrobe.dress(battle, def, opts) : null;
      if (dressed) {
        modelDef = dressed.def;
        this.wardrobe = dressed.selection;
        this.wardrobeKind = dressed.kind;
      }
      if (opts.skin !== undefined) {
        modelDef = { ...modelDef, appearance: { ...modelDef.appearance, skin: opts.skin } };
      }
      this.appearance = modelDef.appearance;
      this.model = SL.ModelBuilder.build(modelDef);
      this.object = new THREE.Group();
      this.object.add(this.model.root);
      battle.scene.add(this.object);
      this.model.root.traverse((o) => {
        if (o.isMesh && !o.userData.isOutline) o.castShadow = battle.shadowsOn;
      });

      this.poses = Object.assign({}, SL.data.poses, def.poses || {});
      this.anim = new SL.Animator(this.model, this.poses);
      this.anim.ctx = this;
      this.scale = def.appearance.height || 1;
      this.height = 1.85 * this.scale;
      this.radius = 0.42 * this.scale;
      this.cameraScale = Math.max(1, this.scale);

      this.pos = new V3();
      this.prevPos = new V3();
      this.vel = new V3();
      this.prevVel = new V3();
      this.yaw = 0;
      this.prevYaw = 0;
      this.speed = 0;
      this.grounded = false;

      const s = def.stats;
      this.hpMax = Math.round(s.hp * (opts.hpMul || 1));
      this.hp = this.hpMax;
      this.kiMax = s.ki;
      this.ki = opts.startKi !== undefined ? opts.startKi : 30;
      this.staminaMax = s.stamina;
      this.stamina = this.staminaMax;
      this.staminaDelay = 0;
      this.infiniteHp = !!opts.infiniteHp;
      this.infiniteKi = !!opts.infiniteKi;
      this.infiniteStamina = !!opts.infiniteStamina;
      this.balance = opts.balance || 'balanced';
      this.cannotDie = !!opts.cannotDie;
      this.damageTakenMul = opts.damageTakenMul || 1;
      this.damageDealtMul = opts.damageDealtMul || 1;

      // players: 'locked' (a target is tracked) or 'free' (free camera and aim); see SL.Targeting
      this.lockMode = 'locked';
      this.lockProp = null;
      this.formIndex = 0;
      this.form = def.forms[0];
      // a form the story hands over (Piccolo taking Nail) starts locked, so it never
      // appears on the skill wheel until a mission unlocks it with teach(f, 'form:<id>')
      for (const fm of def.forms) {
        if (!fm.storyLocked && (battle.mode === 'story' || formFreeUnlocked(fm))) continue;
        this.lockedForms = this.lockedForms || {};
        this.lockedForms[fm.id] = true;
      }
      this.formLevel = 0;
      this.formMult = null;
      this.formDrain = null;
      this.alive = true;
      this.state = 'free';
      this.stateFrame = 0;
      this.sd = {};
      this.target = null;
      this.freeze = 0;
      this.invuln = 0;
      this.chain = 0;
      this.chainTimer = 0;
      this.combo = { hits: 0, damage: 0, timer: 0 };
      this.chaseCount = 0;
      this.cooldowns = {};
      this.followFrames = 0;
      this.followBonus = 1;
      this.followMode = null;
      this.counterFrames = 0;
      this.frame = 0;
      this.buffer = null;
      this.flash = 0;
      this.blastHand = 0;
      this.hidden = false;
      // story restriction: characters who cannot fly yet jump and fall instead
      this.noFlight = opts.noFlight !== undefined ? !!opts.noFlight : def.flight === false && !flightLearned(def);
      this.fallVel = 0;
      // strain forms (Kaioken): strain builds while the form is active and lingers afterwards
      this.strain = 0;
      this.overloadCooldown = 0;
      // bosses: poise armors them against flinching until enough punishment breaks it
      const pz = def.poise && typeof def.poise === 'object' ? def.poise : null;
      this.poise = pz ? { max: pz.max, value: pz.max, delay: 0, broken: 0, breaks: 0 } : null;
      this.skillUses = {};
      this.stats = { damage: 0, maxCombo: 0, ultimates: 0, transforms: 0, clashesWon: 0, hitsTaken: 0 };
      this.intent = emptyIntent();
      this.loops = {};
      this.mech = {};
      SL.mech(this, 'init');

      this.aura = battle.vfx.createAura(this);
      this.aura.setStyle(this.form.aura || { color: 0xffffff });
      this.rimLevel = 0.2;
      this.anim.play('idle', 10, { snap: true });
      this._buildShadow();
    }

    _buildShadow() {
      if (!this.battle.stage.hasGround) return;
      if (!shadowGeo) {
        shadowGeo = new THREE.CircleGeometry(1, 20);
        shadowGeo.rotateX(-Math.PI / 2);
        shadowTex = SL.Toon.tex.soft;
      }
      // soft contact shadow: grounds the fighter even with shadow maps off, and reads height while flying
      const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false, map: shadowTex, polygonOffset: true, polygonOffsetFactor: -2 });
      this.shadow = new THREE.Mesh(shadowGeo, mat);
      this.shadow.renderOrder = 2;
      this.battle.scene.add(this.shadow);
    }

    /**
     * Forms the fighter may not use. Missions assign this object freely (`f.lockedForms = {...}`);
     * the forms the STORY has not handed over yet (`storyLocks`, set by Mission._lockUnearnedForms
     * from SL.data.formGivenBy) are merged into every assignment, so a mission rewriting its locks
     * can never hand over a form early (a Chapter 9 duel once lost the lock on the Ultimate this way).
     */
    get lockedForms() {
      return this._lockedForms;
    }
    set lockedForms(v) {
      this._lockedForms = this.storyLocks ? Object.assign({}, v || {}, this.storyLocks) : v;
    }

    /* ---------------- geometry helpers ---------------- */
    get forward() {
      return new V3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    }
    chest(out = new V3()) {
      return out.set(this.pos.x, this.pos.y + this.height * 0.55, this.pos.z);
    }
    dirTo(other, out = new V3()) {
      const a = this.chest(), b = other.chest();
      out.subVectors(b, a);
      const l = out.length();
      if (l < 0.0001) return out.copy(this.forward);
      return out.divideScalar(l);
    }
    distTo(other) {
      return this.chest().distanceTo(other.chest());
    }
    /** Distance from a point to this fighter's body capsule. */
    /**
     * Giants (def.hitZones) are hit on body parts instead of one capsule: each
     * zone is a sphere on a joint with its own damage multiplier, and a zone
     * with hp can be broken (a Great Ape's tail). Zone centres are cached once
     * per simulation tick.
     */
    _zoneCenters() {
      if (this._zoneFrame === this.frame && this._zones) return this._zones;
      this.object.updateMatrixWorld(true);
      const shift = this.pos.clone().sub(this.object.position);
      this._zones = this.def.hitZones.map((z) => {
        const j = this.model.joints[z.joint];
        const c = new V3();
        if (j) j.localToWorld(c.set(z.offset ? z.offset[0] : 0, z.offset ? z.offset[1] : 0, z.offset ? z.offset[2] : 0));
        else c.copy(this.chest());
        c.add(shift);
        return { zone: z, c, r: z.r * this.scale };
      });
      this._zoneFrame = this.frame;
      return this._zones;
    }

    /**
     * Where attacks aimed at this fighter should go. Normal fighters: the chest.
     * Giants: the body part closest to the attacker, so positioning chooses the
     * target (get behind a Great Ape to reach its tail, fly up to its head).
     */
    aimPoint(from, out = new V3()) {
      if (!this.def.hitZones || !from) return this.chest(out);
      const z = this.zoneAt(from);
      return z ? out.copy(z.c) : this.chest(out);
    }

    /** The zone nearest to a world point (giants only). */
    zoneAt(p) {
      if (!this.def.hitZones) return null;
      let best = null, bd = 1e9;
      for (const z of this._zoneCenters()) {
        if (this.brokenZones && this.brokenZones[z.zone.id] && z.zone.hidesWhenBroken) continue;
        const d = z.c.distanceTo(p) - z.r;
        if (d < bd) {
          bd = d;
          best = z;
        }
      }
      return best;
    }

    capsuleDistance(p) {
      if (this.def.hitZones) {
        const z = this.zoneAt(p);
        // the same "surface within reach + radius" test the capsule answers
        return z ? Math.max(0, z.c.distanceTo(p) - z.r) + this.radius : 1e9;
      }
      const y0 = this.pos.y + this.height * 0.2, y1 = this.pos.y + this.height * 0.92;
      const cy = U.clamp(p.y, y0, y1);
      const dx = p.x - this.pos.x, dz = p.z - this.pos.z, dy = p.y - cy;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    setPosition(v) {
      this.pos.copy(v);
      this.prevPos.copy(v);
      this.object.position.copy(v);
    }
    /** What attacks track: the target fighter, or a locked object (players only). */
    aimTarget() {
      if (this.target && this.target.alive) return this.target;
      return this.lockProp && this.lockProp.alive && SL.Targeting ? SL.Targeting.proxyFor(this.lockProp) : null;
    }

    /** Direction for a free-aiming player's shot from origin (centre of the screen), or null. */
    freeAimDir(origin) {
      if (!this.isPlayer || this.aimTarget() || !SL.Targeting || this.lockMode !== 'free') return null;
      const d = SL.Targeting.freeAimPoint(this.battle, this, origin).sub(origin);
      return d.lengthSq() > 0.0001 ? d.normalize() : null;
    }

    faceTarget(rate = 12) {
      const t = this.aimTarget();
      if (!t) return;
      const dx = t.pos.x - this.pos.x, dz = t.pos.z - this.pos.z;
      if (dx * dx + dz * dz < 0.0004) return;
      // a heavy body turns slowly (the played Great Ape, def.turnSpeed in radians per second):
      // something fast can get behind it; instant snaps (rate 100) stay instant
      if (this.def.turnSpeed && rate < 100) {
        const d = U.wrapAngle(Math.atan2(dx, dz) - this.yaw);
        const step = this.def.turnSpeed * TICK;
        this.yaw = U.wrapAngle(this.yaw + U.clamp(d, -step, step));
        return;
      }
      this.yaw = rate >= 100 ? Math.atan2(dx, dz) : U.dampAngle(this.yaw, Math.atan2(dx, dz), rate, TICK);
    }
    /** Where the head is in the world (the model's head joint, following the pose). */
    headPos(out = new V3()) {
      const h = this.model && this.model.joints && this.model.joints.head;
      if (!h || !this.object) return this.chest(out).add(new V3(0, this.height * 0.3, 0));
      this.model.root.updateMatrixWorld(true);
      return h.getWorldPosition(out).sub(this.object.position).add(this.pos);
    }

    handPos(side = 'R', out = new V3()) {
      this.model.root.updateMatrixWorld(true);
      const j = this.model.joints['hand' + side];
      j.getWorldPosition(out);
      // hands are part of the render object, which is interpolated: re-base on sim position
      out.sub(this.object.position).add(this.pos);
      return out;
    }
    mult() {
      return R.multipliers(this);
    }
    get hpFrac() {
      return this.hp / this.hpMax;
    }
    enemies() {
      return this.battle.enemiesOf(this);
    }
    ghostColor() {
      return (this.form && this.form.ghost) || (this.def.vfx && this.def.vfx.ghost) || 0xcfe8ff;
    }
    ghost(life = 0.3, opacity = 0.45) {
      this.battle.vfx.ghost(this.model, this.ghostColor(), life, opacity);
    }

    /**
     * Can this fighter fly right now? `noFlight` means never; a fighter who is
     * still learning (`flightCtl`, see _locomotion) can also stall and drop.
     */
    canFly() {
      return !this.noFlight && !(this.flightCtl && this.flightCtl.stalled);
    }

    setState(name, data) {
      const prev = this.state;
      if (prev !== name || data) this._exitState(prev, name);
      this.state = name;
      this.stateFrame = 0;
      this.sd = data || {};
    }

    _exitState(prev, next) {
      const sd = this.sd;
      if (sd.orb) {
        sd.orb.visible = false;
        sd.orb = null;
      }
      // a technique that draws a prop while it runs (Vegito's Spirit Sword): gone with the state
      if (sd.spec && sd.spec.prop && this.model.setPropFill) this.model.setPropFill(sd.spec.prop, 0);
      // a charge-class loop belongs to the state that started it (ki charge, beam charge,
      // transformation): leaving that state — released, cancelled, hit, knocked down, handed
      // to a scene — ends the sound. Before, the ki-charge roar was only ever stopped by a
      // knockout or a transformation, so one charge hummed at full for the rest of the fight.
      if (this.loops.beamCharge) {
        this.loops.beamCharge.stop(0.1);
        this.loops.beamCharge = null;
      }
      if (this.loops.aura) {
        this.loops.aura.stop(prev === 'charge' ? 0.3 : 0.5);
        this.loops.aura = null;
      }
      if (prev === 'beamCharge' && this.isPlayer) this.battle.chargeFocus = 0;
      if (prev === 'beamFire' && next !== 'clash' && sd.beam && !sd.beam.done) sd.beam.stop();
      if (prev === 'clash' && sd.beam && !sd.beam.done && next !== 'beamFire') sd.beam.stop();
      if (prev === 'spiritBomb' && sd.bomb && !sd.released) {
        sd.bomb.cancel();
        this.battle.stage.clearMood(0.6);
      }
      if (prev === 'held' && sd.stone) {
        if (this.model.setStone) this.model.setStone(false);
        this.battle.vfx.debrisBurst(this.chest(), 8, sd.stone.kind === 'candy' ? 0xff8ac4 : 0x9a9690, 10, 0.25);
        this.battle.emit('unpetrified', { fighter: this, kind: sd.stone.kind || 'stone' });
      }
      if (prev === 'throw' && sd.victim && sd.victim.state === 'held') sd.victim.setState('free');
      if (prev === 'rush' && sd.victim && sd.victim.state === 'held') sd.victim.setState('free');
      if (this._stretched) this.setLimbStretch(this._stretched, 1);
      const techExit = SL.TechniqueExits && SL.TechniqueExits[prev];
      if (techExit) techExit(this, sd, next);
      if (prev === 'transform') {
        if (sd.cinematic) this.battle.endCinematic(this);
        if (sd.moodSet) this.battle.stage.clearMood(0.8);
        if (sd.hairFlicker) this.model.setForm(this.form);
      }
      if (prev === 'vanish' || prev === 'teleport') this.setHidden(false);
    }

    /** Lengthen a forearm or shin (1 = normal). Hands and feet keep their size. */
    setLimbStretch(side, k) {
      const J = this.model.joints;
      const pair = { R: ['elbowR', 'handR'], L: ['elbowL', 'handL'], legR: ['kneeR', 'footR'], legL: ['kneeL', 'footL'] }[side];
      if (!pair || !J[pair[0]]) return;
      J[pair[0]].scale.y = k;
      if (J[pair[1]]) J[pair[1]].scale.y = 1 / k;
      this._stretched = k !== 1 ? side : null;
    }

    /** Presentation sequences can trigger small events (e.g. Piccolo drops his cape). */
    onSequenceEvent(ev) {
      if (ev === 'dropCape' && this.model.capeNode && this.model.capeNode.visible) {
        this.model.capeNode.visible = false;
        this.battle.vfx.dust(this.pos, 1.2, 10);
        this.battle.sfx('groundImpact', this, { vol: 0.5, pitch: 1.4 });
        this.battle.emit('capeDropped', { fighter: this });
      }
    }

    setHidden(h) {
      this.hidden = h;
      this.model.root.visible = !h;
    }

    /* ---------------- main update (one simulation tick) ---------------- */
    update() {
      this.frame++;
      this.prevPos.copy(this.pos);
      this.prevVel.copy(this.vel);
      this.prevYaw = this.yaw;
      if (!this.alive) {
        SL.mech(this, 'dead');
        if (this.defeatPose && this.state === 'scripted') STATES.scripted.call(this, emptyIntent());
        else STATES.ko.call(this, emptyIntent());
        this._physics();
        this._post(false);
        return;
      }
      // read input every tick — presses made during hit-stop are buffered, never lost
      const it = (this.intent = this.controller ? this.controller.update(this) : emptyIntent());
      for (const k of PRESS_KEYS) {
        if (it[k]) this.buffer = { action: k, frame: this.frame };
      }
      if (it.guard && it.heavy) this.buffer = { action: 'throw', frame: this.frame };
      // lock-on (players): Lock On / Unlock, next / previous target, right-stick flick (handled before hit-stop so a press is never lost)
      if (this.isPlayer && SL.Targeting) {
        const T = SL.Targeting;
        if (it.target) T.toggle(this.battle, this);
        if (it.targetNext) T.next(this.battle, this, 1);
        if (it.targetPrev) T.next(this.battle, this, -1);
        if (it.targetFlick) T.flick(this.battle, this, it.targetFlick);
        T.update(this.battle, this);
      } else if (it.target) this.battle.cycleTarget(this);
      if (this.freeze > 0) {
        this.freeze--;
        if (this.buffer) this.buffer.frame = this.frame;
        this._post(true);
        return;
      }

      this.stateFrame++;
      if (this.invuln > 0) this.invuln--;
      for (const k in this.cooldowns) if (this.cooldowns[k] > 0) this.cooldowns[k]--;
      if (this.followFrames > 0) {
        this.followFrames--;
        if (this.followFrames === 0) this.followMode = null;
      }
      if (this.counterFrames > 0) this.counterFrames--;
      if (this.chainTimer > 0) {
        this.chainTimer--;
        if (this.chainTimer === 0 && this.state !== 'attack') this.chain = 0;
      }
      if (this.combo.timer > 0) {
        this.combo.timer--;
        if (this.combo.timer === 0) this._endCombo();
      }
      this._regen();
      if (this.poise) this._updatePoise();
      SL.mech(this, 'update', TICK);

      const handler = STATES[this.state] || STATES.free;
      handler.call(this, it);
      if (!this.canFly()) this._gravity();
      this._physics();
      this._post(false);
    }

    _regen() {
      const m = this.mult();
      if (this.infiniteKi) this.ki = this.kiMax;
      else if (!['charge', 'beamCharge', 'beamFire', 'clash', 'spiritBomb', 'transform', 'ko'].includes(this.state)) {
        this.ki = Math.min(this.kiMax, this.ki + m.kiRegen * (SL.mech(this, 'kiRegenMul') || 1) * TICK * 0.5);
      }
      if (this.infiniteStamina) this.stamina = this.staminaMax;
      else if (this.staminaDelay > 0) this.staminaDelay--;
      else if (this.state !== 'guard') this.stamina = Math.min(this.staminaMax, this.stamina + 24 * m.staminaRegen * TICK);
      const drain = this.formDrain || this.form.drain;
      if (drain && drain.hpPerSec && this.hp > this.hpMax * drain.minHpFrac) this.hp = Math.max(this.hpMax * drain.minHpFrac, this.hp - drain.hpPerSec * TICK);
      // a form that burns ki (Super Saiyan 3): it drains while held, and an empty tank ends it
      if (drain && drain.kiPerSec && !this.infiniteKi && this.formIndex > 0 && this.state !== 'transform') {
        this.ki = Math.max(0, this.ki - drain.kiPerSec * TICK);
        if (this.ki <= 0 && drain.dropAtZero !== false && this.state === 'free') {
          this._powerDown(true);
          this.battle.emit('formExhausted', { fighter: this });
        }
      }
      this._updateStrain();
      if (this.infiniteHp && this.combo.timer === 0 && this.state === 'free' && this.hp < this.hpMax) this.hp = Math.min(this.hpMax, this.hp + this.hpMax * TICK * 0.5);
    }

    /** The strain model behind Kaioken: power now, pay for it later. */
    _strainDef() {
      if (this.form.strain) return this.form.strain;
      for (const f of this.def.forms) if (f.strain) return f.strain;
      return null;
    }

    _updateStrain() {
      const sd = this._strainDef();
      if (!sd) return;
      if (this.overloadCooldown > 0) this.overloadCooldown--;
      const lv = this.form.levels && this.form.levels[this.formLevel];
      if (this.form.strain) {
        const rate = (sd.buildPerSec[this.formLevel] || sd.buildPerSec[sd.buildPerSec.length - 1]) * (this.state === 'charge' ? 0.6 : 1) * (this.strainScale || 1);
        this.strain = Math.min(sd.max, this.strain + rate * TICK);
        if (lv && lv.kiPerSec && !this.infiniteKi) this.ki = Math.max(0, this.ki - lv.kiPerSec * TICK);
        if (this.strain >= sd.max && this.alive) this._overload(sd);
        else if (lv && lv.kiPerSec && this.ki <= 0.5 && this.alive) this._powerDown(true);
      } else if (this.strain > 0) {
        this.strain = Math.max(0, this.strain - sd.recoverPerSec * TICK);
      }
      this.strainPenalty = !this.form.strain && this.strain > sd.soreAt ? sd.penalty : null;
      // a body under strain steams, so no meter is needed to read it
      if (this.strain > 25 && this.frame % Math.max(3, Math.round(14 - this.strain / 10)) === 0 && !this.hidden) {
        const c = this.chest();
        const col = new THREE.Color(this.form.strain ? 0xff7a6a : 0xb8a8a0);
        this.battle.vfx.smoke.emit(c.x + U.rand(-0.25, 0.25), c.y + U.rand(-0.3, 0.4), c.z + U.rand(-0.25, 0.25), U.rand(-0.4, 0.4), U.rand(1.2, 2.4), U.rand(-0.4, 0.4), col.r, col.g, col.b, 0.3, 0.22, U.rand(0.5, 0.9), { grow: 1.5, drag: 1 });
      }
    }

    /** Strain maxed out: the form collapses and the body gives out. */
    _overload(sd) {
      const b = this.battle;
      this.applyForm(0);
      this.strain = sd.max * 0.85;
      this.overloadCooldown = 60 * (sd.overloadLockSeconds || 6);
      this._applyDamage(Math.round(this.hpMax * (sd.overloadDamage || 0.06)), null, { type: 'explosion', impact: 2 }, this.chest());
      if (!this.alive) return;
      this.setState('stagger', { frames: 70 });
      const c = this.chest();
      b.vfx.explosion(c, 2.2, 0xff5a3a, { smoke: true });
      b.vfx.sparks(c, 0xff8a6a, 30, 12);
      b.sfx('guardBreak', this, { pitch: 0.7 });
      b.cameraTraumaAt(c, 0.4);
      this.model.setExpression('hurt');
      b.bark(this, 'hurt', true);
      b.emit('overload', { fighter: this });
    }

    _consumeBuffer(it, windowFrames = 8) {
      const b = this.buffer;
      if (!b) return it;
      this.buffer = null;
      if (this.frame - b.frame > windowFrames) return it;
      if (b.action === 'throw') return { ...it, guard: true, heavy: true };
      return { ...it, [b.action]: true };
    }

    /* ---------------- movement ---------------- */
    _moveBasis() {
      const t = this.target;
      const fwd = new V3();
      if (t && t.alive) {
        fwd.set(t.pos.x - this.pos.x, 0, t.pos.z - this.pos.z);
        if (fwd.lengthSq() < 0.01) fwd.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      } else {
        const cy = this.intent.camYaw !== undefined ? this.intent.camYaw : this.yaw;
        fwd.set(Math.sin(cy), 0, Math.cos(cy));
      }
      fwd.normalize();
      const right = new V3(-fwd.z, 0, fwd.x);
      return { fwd, right };
    }

    _wish(it) {
      const { fwd, right } = this._moveBasis();
      const w = new V3().addScaledVector(fwd, it.my).addScaledVector(right, it.mx);
      const len = Math.min(1, w.length());
      if (len > 0.001) w.normalize();
      return { dir: w, len, fwd, right };
    }

    _locomotion(it, speedMul = 1) {
      const m = this.mult();
      const stage = this.battle.stage;
      const { dir, len } = this._wish(it);
      // story effects such as heavy gravity scale movement without touching stats
      speedMul *= this.moveScale || 1;
      if (this.grounded) {
        // a stalled learner gets her breath back on the ground before she can lift again
        const fc = this.flightCtl;
        if (fc && fc.stalled && this.stamina >= this.staminaMax * (fc.recoverAt || 0.35)) {
          fc.stalled = false;
          this.battle.emit('flightRecover', { fighter: this });
        }
        if (it.upPressed || (it.up && this.stateFrame > 2 && this.canFly())) {
          this.grounded = false;
          this.vel.y = !this.canFly() ? 10.5 * Math.sqrt(this.battle.stage.def.gravity || 1) : 9;
          this.fallVel = this.vel.y;
          this.anim.squash = -0.12;
          this.battle.sfx('jump', this);
          this.battle.vfx.dust(this.pos, 0.6, 6);
        }
        let sprint = it.boost;
        if (sprint && !this.canFly() && len > 0.2 && !this.infiniteStamina) {
          // on foot, sprinting tires the body; once winded it takes a breather before the next burst
          if (this.winded) sprint = false;
          else {
            this.stamina = Math.max(0, this.stamina - 16 * TICK);
            this.staminaDelay = Math.max(this.staminaDelay, 20);
            if (this.stamina <= 0) {
              this.winded = true;
              this.battle.emit('winded', { fighter: this });
            }
          }
        }
        if (this.winded && this.stamina > this.staminaMax * 0.4) this.winded = false;
        const spd = (sprint ? 16 : R.SPEED.run) * m.speed * len * speedMul;
        this.vel.x = U.damp(this.vel.x, dir.x * spd, 14 * m.accel, TICK);
        this.vel.z = U.damp(this.vel.z, dir.z * spd, 14 * m.accel, TICK);
        if (this.grounded) this.vel.y = 0;
      } else if (!this.canFly()) {
        // airborne without flight: limited air control, gravity is applied after the state
        const spd = (it.boost ? 14 : R.SPEED.run) * m.speed * len * speedMul;
        this.vel.x = U.damp(this.vel.x, dir.x * spd, 4, TICK);
        this.vel.z = U.damp(this.vel.z, dir.z * spd, 4, TICK);
      } else {
        // flightCtl: somebody still learning to fly (Videl). Every field is optional:
        //   speed / lift   multiply horizontal / vertical speed
        //   noBoost        no boost and no homing dash
        //   wobble         how much the body wanders on its own
        //   ceiling        the highest she can hold above the ground
        //   drain          stamina per second in the air; at zero she stalls and drops
        const fc = this.flightCtl;
        const boosting = it.boost && !(fc && fc.noBoost);
        const spd = (boosting ? R.SPEED.boost : R.SPEED.fly) * m.speed * speedMul * (fc && fc.speed !== undefined ? fc.speed : 1);
        const desired = dir.clone().multiplyScalar(spd * len);
        let vy = 0;
        const lift = fc && fc.lift !== undefined ? fc.lift : 1;
        if (it.up) vy += R.SPEED.vertical * (boosting ? 2 : 1) * m.speed * lift;
        if (it.down) vy -= R.SPEED.vertical * (boosting ? 2 : 1) * m.speed * Math.max(lift, 0.5);
        this.sd.homing = false;
        const t = this.target;
        if (fc) {
          if (fc.wobble) {
            const w = fc.wobble;
            desired.x += Math.sin(this.frame * 0.13) * w * 3;
            desired.z += Math.cos(this.frame * 0.11) * w * 3;
            vy += Math.sin(this.frame * 0.17) * w * 2.5;
          }
          if (fc.ceiling !== undefined && stage.hasGround && this.pos.y - stage.heightAt(this.pos.x, this.pos.z) > fc.ceiling) vy = Math.min(vy, -2.5);
          if (fc.drain && !this.infiniteStamina) {
            this.stamina = Math.max(0, this.stamina - fc.drain * TICK);
            this.staminaDelay = Math.max(this.staminaDelay, 20);
            if (this.stamina <= 0 && !fc.stalled) {
              fc.stalled = true;
              this.battle.emit('flightStall', { fighter: this });
            }
          }
        }
        if (boosting && len < 0.2 && !it.up && !it.down && t && t.alive) {
          const d = t.chest().sub(this.chest());
          const dist = d.length();
          if (dist > 3.4) {
            desired.copy(d.divideScalar(dist)).multiplyScalar(R.SPEED.homing * m.speed * speedMul);
            vy = desired.y;
            this.sd.homing = true;
          }
        }
        desired.y = vy;
        const rate = (it.boost ? 5 : 9) * m.accel;
        this.vel.x = U.damp(this.vel.x, desired.x, rate, TICK);
        this.vel.y = U.damp(this.vel.y, desired.y, rate + 2, TICK);
        this.vel.z = U.damp(this.vel.z, desired.z, rate, TICK);
        if (it.down && stage.hasGround) {
          const gh = stage.heightAt(this.pos.x, this.pos.z);
          if (this.pos.y - gh < 0.9) {
            this.grounded = true;
            this.pos.y = gh;
            this.vel.y = 0;
            this.anim.squash = 0.14;
            this.battle.vfx.dust(this.pos, 0.8, 8);
          }
        }
        // fast flight in a powered form leaves afterimages
        if (this.speed > 26 && this.formIndex > 0 && this.frame % 5 === 0) this.ghost(0.22, 0.3);
      }
      this.speed = this.vel.length();
    }

    _locomotionPose() {
      const v = this.vel;
      if (this.grounded) {
        const hs = Math.hypot(v.x, v.z);
        if (hs < 0.8) this.anim.play(this.stamina < 12 && !this.infiniteStamina ? 'exhausted' : 'idle', 9);
        else {
          this.runRate = U.clamp(hs / 9, 0.6, 1.6);
          this.anim.play('run', 10);
        }
        return;
      }
      if (!this.canFly()) {
        this.anim.play(v.y > 0 ? 'jump' : 'fall', 10);
        return;
      }
      const fwd = this.forward;
      const right = new V3(-fwd.z, 0, fwd.x);
      const f = v.x * fwd.x + v.z * fwd.z;
      const s = v.x * right.x + v.z * right.z;
      let pose = 'flyIdle';
      if (this.sd.homing || this.speed > 27) pose = 'dash';
      else if (this.speed < 2.5) pose = 'flyIdle';
      else if (f > 4 && f >= Math.abs(s)) pose = 'flyForward';
      else if (f < -4 && -f >= Math.abs(s)) pose = 'flyBack';
      else if (Math.abs(s) > 4) pose = s > 0 ? 'strafeR' : 'strafeL';
      else if (v.y > 3) pose = 'flyUp';
      else if (v.y < -3) pose = 'flyDown';
      this.anim.play(pose, pose === 'dash' ? 10 : 7);
    }

    /* ---------------- action starters ---------------- */
    _tryActions(it) {
      if (it.transform && this._tryTransform()) return true;
      if (it.revert && this.formIndex > 0) {
        this._powerDown();
        return true;
      }
      if (it.s1 && this._trySpecial('special1')) return true;
      if (it.s2 && this._trySpecial('special2')) return true;
      if (it.ult && this._trySpecial('ultimate')) return true;
      if (it.extra && this._trySpecial(EXTRA + it.extra)) return true;
      if (it.dodge && this._startDodge(it)) return true;
      if (it.guard && it.heavy) {
        this._startThrow();
        return true;
      }
      if (it.heavy) {
        if (this._tryChase()) return true;
        this._startHeavy();
        return true;
      }
      if (it.light) {
        const dashMove = this.moveSet.dash;
        if ((this.speed > 20 || this.state === 'dash') && dashMove) this._startAttack(dashMove, 'dash', 0);
        else this._startLight();
        return true;
      }
      if (it.blast && this._startBlast()) return true;
      if (it.guard) {
        this.setState('guard', {});
        return true;
      }
      if (it.charge) {
        this.setState('charge', {});
        return true;
      }
      return false;
    }

    _denied() {
      if (this.isPlayer) {
        SL.Audio.play('uiError');
        this.battle.emit('denied', { fighter: this });
      }
    }

    /** Characters with counter moves (Vegeta) answer a Perfect Guard with a special strike. */
    _startCounter(kind) {
      const c = this.moveSet.counter;
      if (!c || !c[kind] || this.counterFrames <= 0 || this.state !== 'free' && this.state !== 'guard') return false;
      if (!this._startAttack(c[kind], kind, 0)) return false;
      this.counterFrames = 0;
      this.sd.counter = true;
      this.battle.emit('counterStrike', { fighter: this, move: c[kind] });
      return true;
    }

    _startLight() {
      if (this._startCounter('light')) return true;
      const lights = this.moveSet.light;
      if (!lights || !lights.length) return false;
      let idx = this.chainTimer > 0 || this.state === 'attack' ? this.chain : 0;
      if (idx >= lights.length) idx = 0;
      this._startAttack(lights[idx], 'light', idx);
      return true;
    }

    _airborneDuel() {
      const t = this.target;
      return !this.grounded && t && t.alive && !t.grounded;
    }

    _startHeavy() {
      if (this._startCounter('heavy')) return true;
      const idx = this.chainTimer > 0 || this.state === 'attack' ? this.chain : 0;
      const moves = this.moveSet;
      // above-target Instant Transmission follow-up turns the next heavy into a smash
      if (this.followMode === 'above' && this.followFrames > 0 && moves.chase && moves.chase.smash) {
        this.followMode = null;
        this._startAttack(moves.chase.smash, 'heavy', 0);
        return true;
      }
      const map = this._airborneDuel() && moves.airHeavy ? moves.airHeavy : moves.heavy || {};
      const mv = R.heavyFor(map, idx);
      if (!mv) return this._startLight();
      this._startAttack(mv, 'heavy', idx);
      return true;
    }

    /** Every strike starts here. Returns false when it is refused (a squad's quota on the player). */
    _startAttack(move, kind, chainIdx) {
      if (this.battle.squadMeleeFull(this, this.target)) return false;
      const m = this.mult();
      let startupMul = 1 / Math.sqrt(m.speed);
      let bonus = 1;
      if (this.followFrames > 0) {
        startupMul *= 0.5;
        bonus = this.followBonus;
        this.followFrames = 0;
        this.followMode = null;
      }
      let startup = Math.max(2, Math.round(move.startup * startupMul));
      // THE OPENER (def.openerStartup, owner's Frieza fairness pass): the first strike of a
      // string, thrown from outside a combo, winds up a little longer — the strings after it
      // stay fast. A boss this quick still has to show the blow that starts it.
      if (this.def.openerStartup && chainIdx === 0 && this.state !== 'attack') startup += this.def.openerStartup;
      // victim: who the swing began on (a squad swing turned onto the player later is checked again)
      this.setState('attack', { move, kind, hit: false, hitSet: new Set(), startup, bonus, whiffPenalty: 0, window: -1, victim: this.target });
      if (this.isPlayer && !this.target && this.intent) {
        const at = this.aimTarget();
        if (at) this.faceTarget(100);
        else if (this.lockMode === 'free' && this.intent.camYaw !== undefined && Math.hypot(this.intent.mx || 0, this.intent.my || 0) < 0.2) this.yaw = this.intent.camYaw;
      }
      if (kind === 'light') this.chain = chainIdx + 1;
      else this.chain = 0;
      this.chainTimer = 0;
      this.anim.play(move.pose.wind, 20);
      this.grounded = this.grounded && kind !== 'dash';
      return true;
    }

    _startDodge(it) {
      const cost = R.COST.dodge * (SL.mech(this, 'costMul', 'dodge') || 1);
      if (!R.spendStamina(this, cost)) {
        this._denied();
        return false;
      }
      const w = this._wish(it);
      let dir = w.len > 0.2 ? w.dir.clone() : w.fwd.clone().negate();
      if (it.up) dir.y += 0.8;
      if (it.down) dir.y -= 0.8;
      dir.normalize();
      this.setState('dodge', { dir });
      this.invuln = 10;
      this.vel.copy(dir).multiplyScalar(24);
      if (dir.y > 0.2) this.grounded = false;
      this.ghost(0.25, 0.4);
      this.battle.vfx.afterimage(this.pos, this.height, this.ghostColor());
      this.battle.sfx('dodge', this);
      return true;
    }

    _startThrow() {
      const th = this.moveSet.throw;
      if (!th) return this._startHeavy();
      // character throws with their own state machine (Raditz's Tail Grapple)
      if (th.technique && SL.Techniques && SL.Techniques[th.technique]) return SL.Techniques[th.technique].start(this, th);
      this.setState('throw', { th });
      this.anim.play('grab', 22);
      return true;
    }

    _tryChase() {
      const t = this.target;
      if (!t || !t.alive || t.state !== 'knockback' || t.stateFrame > 45) return false;
      if (this.chaseCount >= 2) return false;
      if (this.battle.squadMeleeFull(this, t)) return false;
      if (this.pos.distanceTo(t.pos) > 45) return false;
      if (!R.canAfford(this, R.COST.chaseKi) || (this.stamina < R.COST.chaseStamina && !this.infiniteStamina)) return false;
      R.spendKi(this, R.COST.chaseKi);
      R.spendStamina(this, R.COST.chaseStamina);
      this.chaseCount++;
      const launched = t.sd.knock === 'launch';
      const lead = t.vel.clone().multiplyScalar(0.09);
      const dest = t.pos.clone().add(lead);
      if (launched) dest.y += 2.4 * t.scale;
      else {
        const dv = t.vel.clone().setY(0);
        if (dv.lengthSq() < 1) dv.copy(t.pos).sub(this.pos).setY(0);
        dest.addScaledVector(dv.normalize(), 2.3);
      }
      this.battle.stage.clampPosition(dest);
      this.ghost(0.3, 0.5);
      this.battle.vfx.afterimage(this.pos, this.height, this.ghostColor());
      this.battle.sfx('vanish', this);
      this.pos.copy(dest);
      this.prevPos.copy(dest);
      this.grounded = false;
      this.vel.set(0, 0, 0);
      this.faceTarget(100);
      this.battle.vfx.afterimage(this.pos, this.height, this.ghostColor());
      const custom = this.moveSet.chase;
      const mv = launched ? (custom && custom.smash) || CHASE_SMASH : (custom && custom.strike) || CHASE_STRIKE;
      this._startAttack(mv, 'heavy', 0);
      this.battle.emit('chase', { fighter: this });
      return true;
    }

    _startBlast() {
      if (!R.canAfford(this, R.COST.blastKi)) {
        this._denied();
        return false;
      }
      this.setState('blast', { count: 0, fired: false, charged: false });
      this.anim.play('blastWind', 30);
      return true;
    }

    _fireBlast() {
      if (!R.spendKi(this, R.COST.blastKi)) return false;
      const side = this.blastHand++ % 2 === 0 ? 'R' : 'L';
      const bd = this.def.blast || BLAST_DEFAULT;
      // spat projectiles (Saibaman acid) leave from the head, not the hands
      const origin = bd.fromMouth ? this.chest().add(new V3(0, this.height * 0.3, 0)).addScaledVector(this.forward, 0.3) : this.handPos(side);
      const t = this.aimTarget();
      const free = t ? null : this.freeAimDir(origin);
      const dir = t && t.alive ? t.aimPoint(origin).sub(origin).normalize() : free || this.forward;
      if (free) this.yaw = Math.atan2(free.x, free.z);
      if (t && t.alive) {
        dir.x += U.rand(-0.03, 0.03);
        dir.y += U.rand(-0.03, 0.03);
        dir.normalize();
      }
      this.battle.projectiles.spawnBlast(this, origin, dir, {
        kind: 'blast', speed: bd.speed, radius: bd.radius, damage: bd.damage, color: bd.color, core: bd.core,
        homing: 0.6, knock: 'flinch', impact: 1, hitstun: 12, explode: 0.9, life: 2.2,
      });
      this.anim.play(bd.pose || (side === 'R' ? 'blastR' : 'blastL'), 45, { restart: true });
      this.battle.sfx(bd.sfx || 'kiBlast', this, { pitch: bd.sfxPitch || 1 });
      return true;
    }

    /** Applies the current form's variant (color, size, damage, name) to a special. */
    resolveSpec(sp, extra) {
      let out = sp;
      const v = sp.formVariants && sp.formVariants[this.form.id];
      if (v) {
        out = Object.assign({}, sp, v);
        if (v.radiusMul && sp.radius) out.radius = sp.radius.map((r) => r * v.radiusMul);
        if (v.damageMul && sp.damage) out.damage = sp.damage.map((d) => d * v.damageMul);
        if (v.ringColor && sp.style) out.style = Object.assign({}, sp.style, { ringColor: v.ringColor });
      }
      if (extra) {
        out = Object.assign({}, out, extra);
        if (extra.damageMul && out.damage) out.damage = out.damage.map((d) => d * extra.damageMul);
      }
      return out;
    }

    /** Ki cost including fatigue from repeated use. */
    /**
     * Moves of the active form. A form may replace whole move groups (Zarbon's
     * monstrous form swaps its light chain, heavies, dash and throw), so every
     * move lookup goes through here instead of reading def.moves directly.
     */
    get moveSet() {
      const fm = this.form && this.form.moves;
      // a story rule can replace moves for a while (Vegito with his arms crossed: kicks only)
      const ov = this.movesOverride;
      return fm || ov ? Object.assign({}, this.def.moves, fm, ov) : this.def.moves;
    }

    /** Specials of the active form (a form may replace a slot with a different technique). */
    specials() {
      const fs2 = this.form && this.form.specials;
      return fs2 ? Object.assign({}, this.def.specials, fs2) : this.def.specials || {};
    }

    /** The spec for a slot: special1 / special2 / ultimate, or "x:<id>" for an extra technique. */
    /** Battle-damaged clothing (story states). Survives transformations. */
    setTorn(on) {
      this.torn = !!on;
      if (this.model && this.model.setTorn) this.model.setTorn(this.torn);
      if (this.battle) this.battle.emit('tornState', { fighter: this, torn: this.torn });
    }

    /**
     * CLOTHING DAMAGE, as a state: 0 intact · 1 damaged · 2 heavily damaged · 3 torn. What each
     * level looks like is the outfit's own (`outfit.damage` — rips in the gi showing the
     * undershirt, a suit torn to the skin, where the tear happens), so no two characters share a
     * damage texture. It survives transformations, and the story is what drives it: a scene
     * (Cinema `damage`), a mission beat, or — only where a mission arms it with `damagePlan` —
     * a heavy blow landing past a health threshold. Never just a health percentage.
     * opts.burst: shreds and a tearing sound (a blow did it, not a cut in the film)
     */
    setDamage(level, opts = {}) {
      const L = Math.max(0, Math.min(3, Math.round(level || 0)));
      const from = this.damageLevel || 0;
      this.damageLevel = L;
      if (SL.Wardrobe && SL.Wardrobe.applyDamage) SL.Wardrobe.applyDamage(this, L);
      else if (this.model.setDamage) this.model.setDamage(L);
      if (opts.burst && L > from && this.battle) {
        const o = (this.appearance && this.appearance.outfit) || {};
        const cloth = o.top !== undefined ? o.top : 0xdddddd;
        this.battle.vfx.debrisBurst(this.chest(), 10 + L * 4, cloth, 7, 0.12);
        this.battle.vfx.sparks(this.chest(), 0xffffff, 8, 8, 0.08);
        this.battle.sfx('clothTear', this, { pitch: 1 - L * 0.08 });
      }
      if (this.battle) this.battle.emit('damageState', { fighter: this, level: L, from });
      return L;
    }

    /** damagePlan: [{ level, below }] — a heavy blow past `below` (health fraction) tears to `level`. */
    _battleWear(hit) {
      const heavy = hit && (hit.type === 'beam' || hit.type === 'explosion' || hit.type === 'throw' || (hit.impact || 1) >= 3 || hit.knock === 'smash' || hit.knock === 'heavy' || hit.knock === 'launch');
      if (!heavy) return;
      for (const step of this.damagePlan) {
        if ((this.damageLevel || 0) < step.level && this.hpFrac <= step.below) {
          this.setDamage(step.level, { burst: true });
          return;
        }
      }
    }

    /**
     * Story rage: the red band across the face and the tears. A state like
     * `torn` — it composes with forms and survives a transformation, and the
     * story is the only thing that sets or clears it.
     */
    setRage(on, amount = 1) {
      this.raged = !!on;
      this.rageAmount = this.raged ? amount : 0;
      if (this.model && this.model.setRage) this.model.setRage(this.raged, amount);
      if (this.battle) this.battle.emit('rageState', { fighter: this, raged: this.raged, amount: this.rageAmount });
    }

    specFor(slot) {
      if (slot && slot.startsWith(EXTRA)) return (this.def.extras || []).find((e) => EXTRA + e.id === slot) || null;
      // a mission can retune one move for one scene (the Spirit Bomb charge is a
      // set piece and takes far longer there than it does in a normal fight)
      const over = this.specOverrides && this.specOverrides[slot];
      const base = this.specials()[slot] || null;
      if (over) return base ? Object.assign({}, base, over) : over;
      return base;
    }

    skillCost(slot) {
      const sp = this.specFor(slot);
      if (!sp) return 0;
      let cost = sp.kiCost;
      if (sp.fatigue) cost += sp.fatigue.kiStep * this._fatigueCount(sp, slot);
      if (slot === 'special1' && sp.instant && this.followFrames > 0) cost = sp.instant.kiCost || cost;
      return cost;
    }

    _fatigueCount(sp, slot) {
      const uses = (this.skillUses[slot] || []).filter((fr) => this.frame - fr < sp.fatigue.window);
      this.skillUses[slot] = uses;
      return Math.min(sp.fatigue.max, uses.length);
    }

    _trySpecial(slot, opts = {}) {
      const base = this.specFor(slot);
      if (!base) return false;
      // story missions can lock techniques a character has not learned yet at that point in the timeline
      if (this.lockedSlots && this.lockedSlots[slot]) return false;
      // some techniques only exist in a mechanic state (e.g. Gohan's rage)
      if (base.requiresMech && !(this.mech && this.mech[base.requiresMech])) {
        this._denied();
        return false;
      }
      if (this.cooldowns[slot] > 0) return false;
      if (!this.battle.rules.allowUltimates && slot === 'ultimate') return false;
      if (base.type === 'teleport') return this._startTeleport(base, slot, opts);
      const instant = base.instant && this.followFrames > 0 && base.type === 'beam';
      const sp = this.resolveSpec(base, instant ? base.instant : null);
      const cost = instant ? base.instant.kiCost || base.kiCost : base.kiCost;
      if (!R.canAfford(this, cost)) {
        this._denied();
        return false;
      }
      if (!this.target && sp.type !== 'beam') return false;
      switch (sp.type) {
        case 'beam':
          this.setState('beamCharge', { spec: sp, slot, tier: 0, cost, instant, callIdx: 0 });
          this.anim.play(sp.poses.charge, instant ? 30 : 14);
          this.loops.beamCharge = this.battle.chargeLoop('beamCharge', this, { timbre: sp.sound }, sp.ultimate ? 'ultimate' : 'beam');
          if (instant) {
            this.followFrames = 0;
            this.followMode = null;
          }
          break;
        case 'projectile':
          this.setState('specialThrow', { spec: sp, slot });
          this.anim.play(sp.pose.wind, 18);
          break;
        case 'rush':
          R.spendKi(this, sp.kiCost);
          this.setState('rush', { spec: sp, slot, phase: 'wind' });
          this.anim.play(sp.poses.wind, 20);
          break;
        case 'spiritBomb':
          R.spendKi(this, sp.kiCost);
          this.setState('spiritBomb', { spec: sp, slot });
          this.anim.play(sp.poses.charge, 8);
          break;
        default: {
          // character techniques registered in src/game/techniques.js (burrow, latch, stretch...)
          const tech = SL.Techniques && SL.Techniques[sp.type];
          if (!tech || !tech.start(this, sp, slot, cost)) return false;
        }
      }
      if (slot === 'ultimate') this.stats.ultimates++;
      this.battle.emit('special', { fighter: this, spec: sp, slot });
      return true;
    }

    _startTeleport(sp, slot, opts) {
      const t = this.target;
      if (!t || !t.alive) return false;
      const escape = ['hitstun', 'knockback'].includes(this.state) || !!opts.escape;
      const fatigue = sp.fatigue ? this._fatigueCount(sp, slot) : 0;
      const cost = (escape ? sp.escapeKiCost : sp.kiCost) + (sp.fatigue ? sp.fatigue.kiStep * fatigue : 0);
      if (!R.canAfford(this, cost)) {
        this._denied();
        return false;
      }
      R.spendKi(this, cost);
      this.cooldowns[slot] = sp.cooldown + (sp.fatigue ? sp.fatigue.cooldownStep * fatigue : 0);
      if (sp.fatigue) (this.skillUses[slot] = this.skillUses[slot] || []).push(this.frame);
      // direction held at the moment of pressing decides where Goku reappears
      const it = this.intent;
      const modes = sp.modes || { behind: true };
      let mode = 'behind';
      if (escape) mode = modes.away ? 'away' : 'behind';
      else if (it.up && modes.above) mode = 'above';
      else if (it.my > 0.5 && modes.front) mode = 'front';
      else if (it.my < -0.5 && modes.away) mode = 'away';
      this.setState('teleport', { spec: sp, escape, mode, slot });
      this.anim.play(sp.pose, escape ? 60 : 30);
      if (escape) this.invuln = 20;
      this.battle.sfx('teleport', this);
      this.battle.emit('special', { fighter: this, spec: sp, slot, mode });
      return true;
    }

    _teleportDest(mode) {
      const t = this.target;
      const dest = new V3();
      if (mode === 'away') {
        const away = t ? t.dirTo(this).setY(0) : this.forward.negate();
        if (away.lengthSq() < 0.01) away.set(1, 0, 0);
        away.normalize();
        const side = new V3(-away.z, 0, away.x).multiplyScalar(U.rand(-8, 8));
        dest.copy(this.pos).addScaledVector(away, 24).add(side);
        dest.y = this.pos.y + 4;
      } else if (mode === 'front') {
        dest.copy(t.pos).addScaledVector(t.dirTo(this).setY(0).normalize(), 1.9 * t.scale);
        dest.y = t.pos.y;
      } else if (mode === 'above') {
        dest.copy(t.pos).add(new V3(0, 3.2 * t.scale, 0));
      } else {
        dest.copy(t.pos).addScaledVector(t.forward, -1.9 * t.scale);
        dest.y = t.pos.y;
      }
      this.battle.stage.clampPosition(dest);
      return dest;
    }

    _tryTransform() {
      if (!this.battle.rules.allowTransform || (this.lockedSlots && this.lockedSlots.transform)) return false;
      const next = this.def.forms[this.formIndex + 1];
      if (!next) return false;
      if (this.battle.rules.maxForm !== undefined && this.formIndex + 1 > this.battle.rules.maxForm) return false;
      if (this.lockedForms && this.lockedForms[next.id]) return false;
      if (next.strain && (this.strain > next.strain.reentryAt || this.overloadCooldown > 0)) {
        this._denied();
        return false;
      }
      if (!R.canAfford(this, next.kiCost)) {
        this._denied();
        return false;
      }
      R.spendKi(this, next.kiCost);
      this.setState('transform', { form: next, index: this.formIndex + 1 });
      this.stats.transforms++;
      this.battle.emit('transformStart', { fighter: this, form: next });
      return true;
    }

    applyForm(index) {
      this.formIndex = index;
      this.form = this.def.forms[index];
      this.formLevel = 0;
      this._applyFormLevel();
      // a form can carry its own pose library (a stance, strikes that only exist in it);
      // leaving the form puts the character's own library back
      if (this.anim) this.anim.poses = this.form.poses ? Object.assign({}, this.poses, this.form.poses) : this.poses;
      this.model.setForm(this.form);
      this.aura.setStyle(this.form.aura || { color: 0xffffff });
      this.battle.emit('formChanged', { fighter: this, form: this.form });
    }

    _applyFormLevel() {
      const lv = this.form.levels && this.form.levels[this.formLevel];
      if (lv) {
        this.formMult = Object.assign({}, this.form.mult, lv.mult);
        this.formDrain = lv.hpPerSec !== undefined ? { hpPerSec: lv.hpPerSec, minHpFrac: (this.form.drain && this.form.drain.minHpFrac) || 0.1 } : null;
      } else {
        this.formMult = null;
        this.formDrain = null;
      }
    }

    get formLabel() {
      const lv = this.form.levels && this.form.levels[this.formLevel];
      return lv ? this.form.name + ' ' + lv.name : this.form.name;
    }

    /**
     * Highest level index a leveled form may reach: the story cap for this fighter
     * (formCaps) and the battle rule (rules.maxFormLevel, e.g. Free Battle's limit).
     */
    formLevelCap(fm = this.form) {
      if (!fm || !fm.levels) return 0;
      // a form may keep its highest levels for the story (Kaioken x10 and x20 are Namek's, not
      // Free Battle's); a mission's own cap replaces that default, upwards or downwards
      let cap = fm.defaultLevelCap === undefined ? fm.levels.length - 1 : fm.defaultLevelCap;
      if (this.formCaps && this.formCaps[fm.id] !== undefined) cap = this.formCaps[fm.id];
      cap = Math.min(cap, fm.levels.length - 1);
      const rule = this.battle.rules.maxFormLevel;
      if (rule !== undefined && rule !== null) cap = Math.min(cap, rule);
      return Math.max(0, cap);
    }

    _raiseFormLevel() {
      const f = this.form;
      if (!f.levels || this.formLevel >= f.levels.length - 1) return false;
      // story progression and battle rules decide how far a technique may go
      if (this.formLevel >= this.formLevelCap(f)) return false;
      if (!R.spendKi(this, f.levelCost || 15)) return false;
      this.formLevel++;
      this._applyFormLevel();
      const lv = f.levels[this.formLevel];
      const c = this.chest();
      const col = (f.aura && f.aura.color) || 0xffffff;
      this.battle.vfx.ring(c, 5 + this.formLevel * 1.5, col, 0.45);
      this.battle.vfx.flash(c, 5, col, 0.25, SL.Toon.tex.glow);
      this.battle.vfx.sparks(c, col, 22, 12);
      this.anim.squash = 0.18;
      this.battle.sfx('kaiokenBoom', this, { pitch: 1 + this.formLevel * 0.12 });
      this.battle.cameraTraumaAt(c, 0.25);
      if (lv.line) this.battle.say(this, lv.line, 1.8);
      this.battle.emit('formLevel', { fighter: this, level: this.formLevel, label: this.formLabel });
      return true;
    }

    _powerDown(exhausted) {
      const wasStrain = !!this.form.strain;
      this.applyForm(0);
      this.battle.vfx.flash(this.chest(), 3, 0xffffff, 0.2, SL.Toon.tex.glow);
      this.battle.sfx('kiUp', this, { pitch: 0.6 });
      if (wasStrain && this.alive && (exhausted || this.strain > 50) && this.state === 'free') {
        // powering down after heavy strain costs a breath
        this.setState('stagger', { frames: exhausted ? 45 : 22 });
      }
      this.battle.emit('powerDown', { fighter: this, strain: this.strain });
    }

    _updatePoise() {
      const pz = this.poise, d = this.def.poise;
      if (pz.broken > 0) {
        pz.broken--;
        if (pz.broken === 0) {
          pz.value = pz.max;
          this.battle.emit('poiseRestored', { fighter: this });
        }
      } else if (pz.delay > 0) pz.delay--;
      else pz.value = Math.min(pz.max, pz.value + d.regen * TICK);
    }

    /** Poise shattered: a long, readable stagger during which the boss takes extra damage. */
    _poiseBreak(att) {
      const pz = this.poise, d = this.def.poise;
      pz.value = 0;
      pz.broken = d.breakFrames;
      pz.breaks++;
      this.setState('stagger', { frames: d.breakFrames, poiseBreak: true });
      this.vel.multiplyScalar(0.2);
      const c = this.chest();
      this.battle.vfx.ring(c, 5, 0xffe080, 0.45);
      this.battle.vfx.sparks(c, 0xffffff, 30, 14, 0.14);
      this.battle.sfx('guardBreak', this, { pitch: 0.6, vol: 1.3 });
      this.battle.cameraTraumaAt(c, 0.5);
      this.anim.play('stagger', 30, { restart: true });
      this.battle.emit('poiseBreak', { fighter: this, attacker: att });
    }

    _stagger(frames) {
      if (!this.alive) return;
      this.setState('stagger', { frames });
      this.vel.multiplyScalar(0.2);
    }

    _endCombo() {
      if (this.combo.hits > this.stats.maxCombo) this.stats.maxCombo = this.combo.hits;
      if (this.combo.hits > 0) this.battle.emit('comboEnd', { fighter: this, hits: this.combo.hits, damage: this.combo.damage });
      if (this.combo.hits >= 8) this.battle.bark(this, 'combo');
      this.combo.hits = 0;
      this.combo.damage = 0;
      this.chaseCount = 0;
    }

    /* ---------------- melee hit detection ---------------- */
    _meleeCheck(mv, finishing) {
      const sd = this.sd;
      const t = this.aimTarget();
      const c = this.chest();
      let dir;
      if (t && t.alive && t.def && t.def.hitZones) {
        const aim = t.aimPoint(c);
        if (aim.distanceTo(c) < mv.reach * this.scale + 3) dir = aim.sub(c).normalize();
        else dir = this.forward;
      } else if (t && t.alive && this.distTo(t) < mv.reach * this.scale + 3) dir = this.dirTo(t);
      else dir = this.forward;
      const center = c.addScaledVector(dir, mv.reach * this.scale);
      const r = mv.radius * this.scale;
      const fin = finishing && mv.finish ? mv.finish : null;
      for (const e of this.enemies()) {
        if (sd.hitSet.has(e)) continue;
        // a well-timed dodge reads the incoming strike slightly early, so vanishing is practical
        const vanishReach = e.state === 'dodge' && e.stateFrame <= R.VANISH_WINDOW ? 1.8 : 0;
        if (e.capsuleDistance(center) < r + e.radius + vanishReach) {
          sd.hitSet.add(e);
          const res = e.takeHit(this, {
            type: 'melee', damage: (fin ? fin.damage : mv.damage) * sd.bonus, knock: fin ? fin.knock : mv.knock, knockSpeed: fin ? fin.knockSpeed : mv.knockSpeed,
            hitstun: mv.hitstun, impact: fin ? fin.impact : mv.impact, guardCrush: mv.guardCrush, guardDamage: mv.guardDamage, pose: mv.hitPose, sfx: mv.sfx,
            heavy: sd.kind !== 'light', dir: this.dirTo(e), point: center, pitch: this.def.audio ? (sd.kind === 'light' ? this.def.audio.strikePitch : this.def.audio.heavyPitch) : 1,
          });
          if (res === 'hit' || res === 'blocked' || res === 'armored' || res === 'guardBreak') sd.hit = true;
          if (res === 'vanished') sd.whiffPenalty = 14;
          if (res === 'perfect') return;
        }
      }
      this.battle.stage.meleeProps(this, center, r, mv.damage * sd.bonus, mv.impact);
      // non-fighter targets (creatures, mission objects) listen for active strikes
      if (this.battle.creatures && this.battle.creatures.length) this.battle.emit('meleeSwing', { fighter: this, center, r, move: mv, sd });
    }

    /* ---------------- receiving hits ---------------- */
    /**
     * COMMITTED ULTIMATE (owner, human playtest round 3: "the AI interrupts my Ultimate almost
     * every time"). An ultimate has a startup you can be knocked out of — that is the risk —
     * but once it passes its commitment point the fighter is braced: ordinary strikes and ki
     * blasts land and hurt, and the technique carries on. What still stops it: a heavy blow
     * (impact 4+), a throw, a beam, and a poise break. `commitAfter` (frames, default 20) is
     * per technique; a Spirit Bomb only commits if its data asks for it, because holding one
     * up while somebody else keeps the enemy off you is the point of that fight.
     */
    committedUltimate() {
      return this.ultimateArmor() > 0;
    }

    /** 0 = not committed, 3 = braced against ordinary blows (a Spirit Bomb, which still needs cover), 4 = against everything but a beam, a throw or another ultimate. */
    ultimateArmor() {
      const sd = this.sd, sp = sd && sd.spec;
      if (!sp || !(sp.ultimate || sd.slot === 'ultimate') || !ULT_COMMIT_STATES[this.state]) return 0;
      if (this.noUltimateArmor) return 0;
      // a Spirit Bomb is held up, not thrown: it braces against ordinary blows only, so a fight
      // built around somebody keeping the enemy off you still works the way it is written
      const bomb = sp.type === 'spiritBomb';
      const after = sp.commitAfter === undefined ? (bomb ? 45 : 20) : sp.commitAfter;
      return this.stateFrame >= after ? (bomb ? 3 : 4) : 0;
    }

    /**
     * hit: { type, damage, knock, knockSpeed, hitstun, impact, guardCrush, guardDamage, pose, dir, point, color, sfx }
     * returns 'miss' | 'vanished' | 'perfect' | 'blocked' | 'guardBreak' | 'armored' | 'hit'
     */
    takeHit(att, hit) {
      // a spirit (Goku behind his son in the last stand) is seen, not touched
      if (!this.alive || this.intangible) return 'miss';
      const dir = hit.dir ? hit.dir.clone() : att ? att.dirTo(this) : this.forward.negate();
      if (this.state === 'dodge' && this.stateFrame <= R.VANISH_WINDOW && att && (hit.type === 'melee' || hit.type === 'ki') && this._vanishCounter(att)) return 'vanished';
      // a STORY POWER GAP (Goku back from a hundred times gravity against the Ginyu Force): an
      // ordinary strike or shot from someone this far below him is simply not there when it
      // arrives — he is behind them. Only while he is not committed to something himself, and
      // never against an ultimate. Set per mission: { chance, gap, from: [fighters] }.
      // mode 'guard' (Super Saiyan 2 Gohan against the Juniors): he does not vanish, he turns and
      // takes it on one arm — a Perfect Guard, so the counter window opens. behind: only blows he
      // cannot see coming (from behind his back).
      // a STORY BLOCK (Goku letting Future Trunks test him): whatever this attacker swings stops
      // on him — from any side, on the tip of one finger (sb.pose / sb.pose + '2' alternate).
      // Set per mission: { from: [fighters], pose }; sb.count counts the blows stopped.
      const sb = this.storyBlock;
      if (sb && att && (!sb.from || sb.from.includes(att)) && (hit.type === 'melee' || hit.type === 'throw')) {
        sb.count = (sb.count || 0) + 1;
        this.yaw = this.prevYaw = Math.atan2(att.pos.x - this.pos.x, att.pos.z - this.pos.z);
        if (sb.pose) this.setState('scripted', { pose: sb.pose + (sb.count % 2 ? '' : '2'), expression: 'calm', speed: 40 });
        const j = this.model.joints && this.model.joints.handR;
        const tip = j && this.object ? (this.model.root.updateMatrixWorld(true), j.getWorldPosition(new V3()).sub(this.object.position).add(this.pos)) : this.chest();
        this.battle.blockEffects(att, this, hit, tip);
        this.battle.vfx.sparks(tip, 0xfff3c0, 18, 9, 0.08);
        this.battle.sfx('swordClang', this, { vol: 1.1 });
        att.freeze = Math.max(att.freeze, 7);
        this.freeze = Math.max(this.freeze, 7);
        if (att.vel) att.vel.addScaledVector(att.dirTo(this).setY(0), -5);
        this.battle.emit('storyBlock', { fighter: this, attacker: att, count: sb.count, point: tip.clone() });
        return 'blocked';
      }
      const se = this.storyEvade;
      if (se && att && (hit.type === 'melee' || hit.type === 'ki') && !hit.ultimate && (!se.from || se.from.includes(att)) && STORY_EVADE_STATES[this.state] && this.battle.frame - (se.last || -9999) > (se.gap || 24) && (!se.behind || this.forward.dot(dir.clone().setY(0).normalize().negate()) < -0.2) && Math.random() < (se.chance || 0.6)) {
        se.last = this.battle.frame;
        if (se.mode === 'guard') {
          se.count = (se.count || 0) + 1;
          this.yaw = this.prevYaw = Math.atan2(att.pos.x - this.pos.x, att.pos.z - this.pos.z);
          this.setState('guard', {});
          const r = this._perfectGuard(att, hit, dir, true);
          if (se.pose) this.anim.play(se.pose, 40, { restart: true });
          this.battle.emit('storyEvade', { fighter: this, attacker: att, count: se.count, mode: 'guard' });
          return r;
        }
        if (this._vanishCounter(att, true)) {
          se.count = (se.count || 0) + 1;
          this.battle.emit('storyEvade', { fighter: this, attacker: att, count: se.count });
          return 'vanished';
        }
      }
      if (this.invuln > 0 || this.state === 'vanish') return 'miss';
      if (this.state === 'transform') return 'miss';

      // guard-piercing techniques (Destructo Disc, point-blank self-destruct) ignore a guard
      if (this.state === 'guard' && hit.type !== 'throw' && hit.guardPierce !== true) {
        const facing = this.forward.dot(dir.clone().setY(0).normalize().negate());
        if (facing > -0.35) {
          const pgWindow = R.PERFECT_GUARD_WINDOW + (SL.mech(this, 'perfectWindowBonus') || 0);
          if (this.stateFrame <= pgWindow && (hit.type === 'melee' || hit.type === 'ki')) return this._perfectGuard(att, hit, dir);
          return this._block(att, hit, dir);
        }
      }

      let armorLevel = 0;
      if (this.state === 'attack' && this.sd.move && this.sd.move.armor) armorLevel = 2;
      if (this.state === 'rush' && this.sd.phase === 'dash') armorLevel = 2;
      const techArmor = SL.TechniqueArmor && SL.TechniqueArmor[this.state];
      if (techArmor) armorLevel = Math.max(armorLevel, techArmor(this) || 0);
      armorLevel = Math.max(armorLevel, this.ultimateArmor());
      // a story power gap in the other direction: blows up to this impact land but do not move him
      if (this.storyArmor) armorLevel = Math.max(armorLevel, this.storyArmor);
      const mechArmor = !!SL.mech(this, 'armor', hit);
      if (mechArmor) armorLevel = Math.max(armorLevel, 1);
      let poiseBroke = false;
      if (this.poise && this.poise.broken <= 0 && hit.knock !== 'held') {
        const pz = this.def.poise;
        const cost = (pz.cost[Math.min(4, hit.impact || 1)] || 10) * (hit.type === 'beam' ? pz.beamMul || 1.5 : 1) * (hit.type === 'throw' ? 2 : 1);
        this.poise.value -= cost;
        this.poise.delay = pz.regenDelay;
        if (this.poise.value <= 0) poiseBroke = true;
        else armorLevel = Math.max(armorLevel, pz.armor);
      }
      const armored = !poiseBroke && hit.type !== 'throw' && hit.knock !== 'held' && (hit.impact || 1) <= armorLevel && (hit.type !== 'beam' || (this.poise && this.def.poise.beamArmor));

      let dmg = this._damageFrom(att, hit, false);
      const point = hit.point ? hit.point.clone() : this.chest().addScaledVector(dir, -this.radius);
      if (this.def.hitZones) {
        const zc = this.zoneAt(point);
        if (zc) {
          const zone = zc.zone;
          dmg = Math.max(1, Math.round(dmg * (zone.damageMul || 1)));
          this.battle.emit('zoneHit', { fighter: this, zone, attacker: att, amount: dmg });
          if (zone.hp && !(this.brokenZones && this.brokenZones[zone.id])) {
            this.zoneHp = this.zoneHp || {};
            this.zoneHp[zone.id] = (this.zoneHp[zone.id] === undefined ? zone.hp : this.zoneHp[zone.id]) - dmg;
            if (this.zoneHp[zone.id] <= 0) {
              (this.brokenZones = this.brokenZones || {})[zone.id] = true;
              this.battle.vfx.explosion(zc.c, zc.r * 1.2, 0xffffff, { smoke: true });
              this.battle.emit('zoneBroken', { fighter: this, zone, attacker: att });
            }
          }
        }
      }
      this._applyDamage(dmg, att, hit, point);
      const impact = hit.impact || 1;
      this.flash = 1;
      this.anim.shake = 0.12 + impact * 0.03;
      this.anim.squash = 0.06 + impact * 0.035;
      this.battle.hitEffects(att, this, hit, point, armored ? 1 : impact);
      if (!this.alive) return 'hit';
      if (poiseBroke) {
        this._poiseBreak(att);
        return 'hit';
      }
      if (armored) {
        this.battle.emit('armored', { fighter: this, attacker: att, hit, source: mechArmor && armorLevel <= 1 ? 'mechanic' : this.poise ? 'poise' : 'move' });
        SL.mech(this, 'on', 'armoredHit', { hit, attacker: att });
        return 'armored';
      }
      if (impact >= 4 || hit.type === 'beam') this.battle.bark(this, 'hurt');
      this._react(att, hit, dir);
      return 'hit';
    }

    _damageFrom(att, hit, guarded) {
      const attackerMul = att ? att.mult().damage * (SL.mech(att, 'damageOut', hit, this) || 1) * att.damageDealtMul * (att.storyAllyMul && !att.isPlayer ? att.storyAllyMul : 1) * (att.counterFrames > 0 ? 1.15 : 1) : 1;
      // a mechanic may refuse a hit outright (Android energy absorption returns 0)
      const mechIn = SL.mech(this, 'damageIn', hit, att);
      if (mechIn === 0) return 0;
      // committing to an ultimate is a trade: the technique goes off, and everything that lands
      // on you while you stand there hurts more than it would otherwise (owner, round 3)
      const inMul = (mechIn || 1) * this.damageTakenMul * (this.committedUltimate() ? 1.35 : 1) * (this.poise && this.poise.broken > 0 ? this.def.poise.vulnerable || 1 : 1);
      const defenderMul = this.mult().defense / inMul;
      return R.computeDamage({
        base: hit.damage,
        type: hit.type === 'throw' ? 'melee' : hit.type,
        hitIndex: att ? att.combo.hits + 1 : 1,
        attackerMul,
        defenderMul,
        guarded,
        rulesMul: this.battle.rulesDamageMul(att, this),
      });
    }

    _applyDamage(dmg, att, hit, point) {
      const before = this.hpFrac;
      this.hp -= dmg;
      if (this.infiniteHp && this.hp < 1) this.hp = 1;
      if (this.cannotDie && this.hp < 1) this.hp = 1;
      this.stats.hitsTaken++;
      // cumulative damage actually absorbed: survives infiniteHp/cannotDie, which floor hp at 1
      this.stats.damageTaken = (this.stats.damageTaken || 0) + dmg;
      this.ki = Math.min(this.kiMax, this.ki + 0.8);
      if (att) {
        att.combo.hits++;
        att.combo.damage += dmg;
        att.combo.timer = 80;
        att.stats.damage += dmg;
        if (att.combo.hits > att.stats.maxCombo) att.stats.maxCombo = att.combo.hits;
        att.ki = Math.min(att.kiMax, att.ki + (hit.type === 'melee' ? 2.2 : 0.8));
        if (att.counterFrames > 0) {
          SL.mech(att, 'on', 'counterHit', hit);
          att.counterFrames = 0;
        }
        SL.mech(att, 'on', 'hitDealt', hit);
      }
      SL.mech(this, 'on', 'hitTaken', hit);
      this.battle.emit('damage', { target: this, attacker: att, amount: dmg, point, type: hit.type, source: hit.name || null });
      if (this.damagePlan && this.alive) this._battleWear(hit);
      if (before >= 0.25 && this.hpFrac < 0.25 && this.hp > 0) this.battle.bark(this, 'lowHp');
      // a fighter already down is not knocked out a second time by a hit that lands on the body
      if (this.hp <= 0 && this.alive) {
        this.hp = 0;
        this._ko(att, hit);
      }
    }

    /** Picks a reaction pose based on where the hit came from. */
    _directionalPose(hit, dir) {
      const pose = hit.pose || 'hitLight';
      if (pose !== 'hitLight' && pose !== 'hitBody') return pose;
      const from = dir.clone().setY(0).normalize().negate();
      const fwd = this.forward;
      const facing = fwd.dot(from);
      if (facing < -0.35) return 'hitBack';
      if (facing < 0.55) {
        const right = new V3(-fwd.z, 0, fwd.x);
        return right.dot(from) > 0 ? 'hitSideR' : 'hitSideL';
      }
      return pose;
    }

    /**
     * Group stun protection (players only, and only when several enemies are
     * around): a second attacker's hit stuns for less, and piling on past
     * R.GROUP_STUN_CAP frames of stun triggers a breakaway instead of more stun.
     * Returns the hit to react to, or null when the breakaway happened.
     */
    _groupStun(att, hit) {
      if (!this.isPlayer || !att || att.team === this.team || this.battle.enemiesOf(this).length < 2) return hit;
      const now = this.battle.frame;
      const g = (this._gs = this._gs || { log: [] });
      g.log = g.log.filter((e) => now - e.t < 150);
      const last = g.log[g.log.length - 1];
      const knock = hit.knock || 'flinch';
      if (last && last.att !== att && (knock === 'flinch' || knock === 'push')) hit = Object.assign({}, hit, { hitstun: Math.round((hit.hitstun || 18) * 0.6) });
      g.log.push({ t: now, att, stun: hit.hitstun || 18 });
      const attackers = new Set(g.log.map((e) => e.att)).size;
      const total = g.log.reduce((a, e) => a + e.stun, 0);
      if (attackers > 1 && total > R.GROUP_STUN_CAP && knock !== 'held') {
        g.log = [];
        this._breakaway();
        return null;
      }
      return hit;
    }

    /** A Saiyan's refusal to go down: a ki shockwave that shoves nearby enemies back and a moment of invulnerability. */
    _breakaway() {
      const b = this.battle;
      const c = this.chest();
      this.invuln = Math.max(this.invuln, 40);
      this.vel.set(0, 0, 0);
      this.setState('recover', { frames: 8 });
      this.anim.play('powerUp', 30, { restart: true });
      b.vfx.ring(c, 7, 0xffffff, 0.4);
      b.vfx.flash(c, 3, (this.form.aura && this.form.aura.color) || 0xffffff, 0.2, SL.Toon.tex.glow);
      b.vfx.sparks(c, 0xffffff, 26, 12, 0.12);
      b.sfx('kaiokenBoom', this, { pitch: 1.4, vol: 0.7 });
      b.cameraTraumaAt(c, 0.25);
      for (const e of b.enemiesOf(this)) {
        if (!e.alive || e.hidden) continue;
        const d = e.pos.distanceTo(this.pos);
        if (d > 6) continue;
        const away = e.chest().sub(c).normalize();
        e.vel.addScaledVector(away, 16 * (1 - d / 7));
        if (['free', 'attack', 'dash', 'blast'].includes(e.state)) e.setState('hitstun', { frames: 16 });
      }
      b.emit('breakaway', { fighter: this });
    }

    _react(att, hit, dir) {
      if (att && this.isPlayer) {
        hit = this._groupStun(att, hit);
        if (!hit) return;
      }
      // a petrifying hit (Dabura's spit): no knockback, the body simply stops
      if (hit.stone && this.alive && !this.cannotBeHeld) {
        this.setState('held', { frames: hit.stone.frames || 150, stone: hit.stone, by: att || null });
        if (this.model.setStone) this.model.setStone(true, hit.stone.kind);
        this.battle.sfx(hit.stone.kind === 'candy' ? 'candyPop' : 'guardBreak', this, { pitch: 0.6 });
        this.battle.emit('petrified', { fighter: this, by: att || null, kind: hit.stone.kind || 'stone' });
        return;
      }
      const knock = hit.knock || 'flinch';
      const wMul = 1 / Math.max(0.5, this.def.stats.weight || 1);
      const ks = (hit.knockSpeed || 10) * wMul;
      if (knock === 'held') {
        this.anim.play(hit.pose || 'hitLight', 40, { restart: true });
        return;
      }
      this.chain = 0;
      switch (knock) {
        case 'flinch':
          this.setState('hitstun', { frames: hit.hitstun || 18 });
          this.vel.copy(dir).multiplyScalar(3.5);
          this.anim.play(this._directionalPose(hit, dir), 32, { restart: true });
          break;
        case 'push':
          this.setState('hitstun', { frames: hit.hitstun || 22 });
          this.vel.copy(dir).multiplyScalar(ks);
          this.anim.play(this._directionalPose(hit, dir), 32, { restart: true });
          break;
        case 'crumple':
          this.setState('hitstun', { frames: hit.hitstun || 40, crumple: true });
          this.vel.copy(dir).multiplyScalar(2);
          this.anim.play('hitBody', 20, { restart: true });
          break;
        case 'launch':
          this.setState('knockback', { frames: hit.hitstun || 34, knock, startFrames: hit.hitstun || 34, attacker: att });
          this.grounded = false;
          this.vel.copy(dir).setY(0).multiplyScalar(3).addScaledVector(UP, ks);
          this.anim.squash = -0.22;
          this.anim.play('launched', 26, { restart: true });
          break;
        case 'smash':
          this.setState('knockback', { frames: hit.hitstun || 34, knock, startFrames: hit.hitstun || 34, attacker: att });
          this.grounded = false;
          this.vel.copy(dir).setY(0).multiplyScalar(4);
          this.vel.y = -ks;
          this.anim.play('smashed', 26, { restart: true });
          break;
        default: {
          // heavy
          this.setState('knockback', { frames: hit.hitstun || 30, knock: 'heavy', startFrames: hit.hitstun || 30, attacker: att, spinPose: hit.pose === 'hitAirSpin' });
          const upBias = this.grounded ? 3 : 1;
          this.grounded = false;
          this.vel.copy(dir).multiplyScalar(ks).addScaledVector(UP, upBias);
          this.anim.play(hit.pose === 'hitAirSpin' ? 'hitAirSpin' : 'hitHeavy', 30, { restart: true });
        }
      }
    }

    _block(att, hit, dir) {
      const chip = this._damageFrom(att, hit, true);
      this.hp = Math.max(1, this.hp - chip);
      if (att) {
        att.combo.timer = Math.max(att.combo.timer, 40);
        att.stats.damage += chip;
      }
      const baseCost = (hit.guardDamage || (hit.heavy ? R.GUARD_STAMINA.heavy : R.GUARD_STAMINA[hit.type] || 10)) * (this.mult().guardStamina || 1);
      if (!this.infiniteStamina) this.stamina -= baseCost;
      this.staminaDelay = 45;
      this.vel.copy(dir).setY(0).multiplyScalar(hit.type === 'beam' ? 7 : hit.heavy ? 6 : 3.5);
      this.sd.hitFrames = 8;
      this.anim.play('guardHit', 30, { restart: true });
      this.anim.squash = 0.05;
      const point = hit.point ? hit.point.clone() : this.chest().addScaledVector(dir, -this.radius * 1.4);
      this.battle.blockEffects(att, this, hit, point);
      this.battle.emit('damage', { target: this, attacker: att, amount: chip, point, type: hit.type, blocked: true, source: hit.name || null });
      SL.mech(this, 'on', 'blocked', hit);
      if (this.stamina <= 0 || (hit.guardCrush && this.stamina < 30)) {
        this.stamina = 0;
        this.setState('guardBreak', { frames: 56 });
        this.battle.sfx('guardBreak', this);
        this.battle.vfx.impact(point, 3, 0xffa040);
        this.battle.emit('guardBreak', { fighter: this, attacker: att });
        return 'guardBreak';
      }
      return 'blocked';
    }

    _perfectGuard(att, hit, dir, quiet) {
      this.ki = Math.min(this.kiMax, this.ki + 8);
      this.stamina = Math.min(this.staminaMax, this.stamina + 10);
      SL.mech(this, 'on', 'perfectGuard', hit);
      this.counterFrames = 45;
      const point = hit.point ? hit.point.clone() : this.chest().addScaledVector(dir, -this.radius * 1.4);
      this.battle.perfectEffects(att, this, point, quiet);
      if (att && hit.type === 'melee') {
        att._stagger(30);
        att.freeze = 6;
      }
      this.freeze = 6;
      this.anim.play('guardHit', 40, { restart: true });
      return 'perfect';
    }

    _vanishCounter(att, free) {
      const cost = R.COST.vanishExtra * (SL.mech(this, 'costMul', 'vanish') || 1);
      if (!free && !R.spendStamina(this, cost)) return false;
      const dest = att.pos.clone().addScaledVector(att.forward, -1.8 * att.scale);
      if (!att.grounded) dest.y = att.pos.y;
      this.battle.stage.clampPosition(dest);
      this.ghost(0.35, 0.55);
      this.battle.vfx.afterimage(this.pos, this.height, this.ghostColor());
      this.setState('vanish', { dest, attacker: att });
      this.invuln = 18;
      this.setHidden(true);
      this.battle.sfx('vanish', this);
      SL.mech(this, 'on', 'vanish');
      if (att.state === 'attack') att.sd.whiffPenalty = 14;
      this.battle.emit('vanish', { fighter: this, attacker: att });
      return true;
    }

    _ko(att, hit) {
      this.alive = false;
      const dir = hit && hit.dir ? hit.dir : att ? att.dirTo(this) : this.forward.negate();
      this.setState('ko', {});
      this.invuln = 99999;
      this.grounded = false;
      this.vel.copy(dir).multiplyScalar(14).addScaledVector(UP, 5);
      this.model.setExpression('ko');
      this.aura.target = 0;
      for (const k of Object.keys(this.loops)) if (this.loops[k]) this.loops[k].stop(0.2);
      this.loops = {};
      this.battle.onKO(this, att, hit);
    }

    /* ---------------- physics ---------------- */
    /** Gravity for fighters who cannot fly. States that own vertical motion are left alone. */
    _gravity() {
      if (this.grounded) {
        this.fallVel = 0;
        return;
      }
      if (GRAVITY_EXEMPT.has(this.state) || !this.alive) {
        this.fallVel = this.vel.y;
        return;
      }
      this.fallVel = Math.max(-40, this.fallVel - 28 * (this.battle.stage.def.gravity || 1) * TICK);
      this.vel.y = this.fallVel;
    }

    _physics() {
      const stage = this.battle.stage;
      this.pos.addScaledVector(this.vel, TICK);
      if (stage.hasGround) {
        const gh = stage.supportHeight(this.pos.x, this.pos.z, this.pos.y);
        if (this.grounded) {
          // walked off a ledge
          if (this.vel.y > 0.01 || gh < this.pos.y - 0.7) {
            this.grounded = false;
            if (this.vel.y <= 0.01) this.fallVel = 0;
          } else {
            this.pos.y = gh;
            this.vel.y = 0;
          }
        } else if (this.pos.y < gh) {
          const impactSpeed = -this.vel.y;
          this.pos.y = gh;
          this._onGroundContact(impactSpeed);
        }
      }
      const hitPillar = stage.resolveFighter(this);
      if (hitPillar && (this.state === 'knockback' || (!this.alive && this.speed > 10))) {
        const sp = hitPillar.speed;
        if (sp > 12) this._wallImpact(hitPillar, sp);
      }
      stage.clampPosition(this.pos, this.vel);
    }

    _onGroundContact(speed) {
      const stage = this.battle.stage;
      if (!this.alive && speed < 10) {
        // settle the body instead of bouncing forever
        this.vel.set(this.vel.x * 0.5, 0, this.vel.z * 0.5);
        this.grounded = true;
        return;
      }
      if (this.state === 'knockback' || !this.alive) {
        if (this.sd.knock === 'smash' || speed > 14 || !this.alive) {
          const big = U.clamp(speed / 36, 0.3, 1.2);
          stage.crater(this.pos, 1.4 + big * 2.4, 0.25 + big * 0.7, this);
          this.battle.groundImpactEffects(this, speed);
          if (this.alive && this.sd.knock === 'smash') {
            const bonus = Math.round(140 + speed * 6);
            this._applyDamage(bonus, this.sd.attacker || null, { type: 'explosion', impact: 2 }, this.pos.clone());
          }
          this.vel.set(this.vel.x * 0.3, Math.min(7, speed * 0.22), this.vel.z * 0.3);
          this.anim.squash = 0.25;
          if (this.alive) {
            this.setState('knockdown', { frames: 52, bounce: true });
            this.grounded = false;
          }
          return;
        }
        this.vel.y = 0;
        this.grounded = true;
        if (this.alive) this.setState('knockdown', { frames: 40 });
        return;
      }
      if (this.state === 'knockdown') {
        this.vel.set(this.vel.x * 0.4, 0, this.vel.z * 0.4);
        this.grounded = true;
        return;
      }
      this.grounded = true;
      this.vel.y = 0;
      this.fallVel = 0;
      if (!this.canFly() && speed > 23 && this.alive) {
        // a long fall without flight hurts and knocks the fighter down
        this._applyDamage(Math.round((speed - 20) * 70), null, { type: 'explosion', impact: 2 }, this.pos.clone());
        this.battle.groundImpactEffects(this, speed * 0.6);
        if (this.alive) this.setState('knockdown', { frames: 34 });
        return;
      }
      if (speed > 8) {
        this.anim.squash = U.clamp(speed * 0.012, 0.08, 0.22);
        this.battle.vfx.dust(this.pos, 1, 10);
        this.battle.sfx('jump', this, { vol: 0.8 });
      }
    }

    _wallImpact(info, speed) {
      const stage = this.battle.stage;
      stage.damagePillar(info.pillar, speed * 60, this.chest());
      this.battle.wallImpactEffects(this, info, speed);
      if (this.alive) {
        this._applyDamage(Math.round(120 + speed * 5), null, { type: 'explosion', impact: 2 }, this.chest());
        if (this.alive) {
          this.vel.multiplyScalar(-0.25);
          this.setState('hitstun', { frames: 22 });
          this.anim.play('hitHeavy', 40, { restart: true });
        }
      }
    }

    /* ---------------- presentation ---------------- */
    /**
     * A SWORD'S ARC (def.vfx.blade: its colour): while a swing is live, a thin ribbon of light
     * follows the blade tip from one tick to the next. Presentation only (no randomness).
     */
    _bladeTrail() {
      const sw = this.model.props && this.model.props.sword;
      const sd = this.sd;
      const live = this.state === 'rush' || (this.state === 'attack' && sd.move && this.stateFrame >= (sd.startup || 0) - 2 && this.stateFrame <= (sd.startup || 0) + (sd.move.active || 3) + 3);
      if (!sw || !sw.visible || !live || this.hidden || !this.battle.vfx.slash) {
        this._bladeTip = null;
        return;
      }
      this.model.root.updateMatrixWorld(true);
      const tip = sw.localToWorld(new V3(0, sw.userData.tip || 0.9, 0)).sub(this.object.position).add(this.pos);
      if (this._bladeTip) this.battle.vfx.slash(this._bladeTip, tip, this.def.vfx.blade, 0.14, 0.1);
      this._bladeTip = tip;
    }

    _post(frozen) {
      if (this.def.vfx && this.def.vfx.blade && !frozen) this._bladeTrail();
      const st = this.state;
      let aura = this.form.aura && this.form.aura.idle ? this.form.aura.idle : 0;
      if (st === 'charge' || st === 'transform') aura = 1;
      else if (st === 'beamCharge' || st === 'spiritBomb') aura = 0.22 + 0.3 * U.clamp01(this.sd.frac || 0);
      else if (st === 'beamFire' || st === 'clash') aura = 0.8;
      else if (this.speed > 24 && st === 'free') aura = Math.max(aura, 0.35);
      if (this.formLevel > 0) aura = Math.max(aura, 0.55 + this.formLevel * 0.15);
      if (this.mech.rage) {
        aura = Math.max(aura, 0.4);
        if (this.formIndex === 0) this.aura.setStyle({ color: 0xff3a1e, core: 0xffc0a0, particles: 0xff6040 });
      }
      if (this.sd.aura !== undefined) aura = this.sd.aura;
      // a story can put somebody's aura out for good (Frieza after his own saucer goes through
      // him): it survives every setState a scene makes afterwards
      if (this.auraOff) aura = 0;
      if (!this.alive || this.hidden) aura = 0;
      this.aura.target = aura;

      // rim light follows aura color and intensity
      // (a story can set rimLight: { color, strength } for scene lighting, e.g. moonlight)
      const rl = this.rimLight;
      const rimTarget = Math.max(rl ? rl.strength : 0, 0.2 + this.aura.intensity * 0.38);
      const rimKey = this.aura.color.getHex() + (rl ? '|' + rl.color : '');
      if (Math.abs(rimTarget - this.rimLevel) > 0.02 || this._rimColorDirty !== rimKey) {
        this.rimLevel = U.damp(this.rimLevel, rimTarget, 10, TICK);
        const warm = new THREE.Color(rl ? rl.color : 0xfff2e0).lerp(this.aura.color, U.clamp01(this.aura.intensity * 1.4));
        this.model.setRim(warm, this.rimLevel);
        this._rimColorDirty = rimKey;
      }

      if (this.flash > 0) {
        this.flash = Math.max(0, this.flash - TICK * 7);
        this.model.setFlash(this.flash * 0.9);
      }

      // a form can carry its own resting face (Majin Vegeta's sneer); fights and hurts still show through
      let expr = (this.form && this.form.restFace) || 'neutral';
      if (!this.alive) expr = 'ko';
      else if (this.sd.expression && (st === 'scripted' || st === 'transform')) expr = this.sd.expression;
      else if (['charge', 'transform', 'beamCharge', 'beamFire', 'clash', 'spiritBomb'].includes(st)) expr = 'shout';
      else if (['hitstun', 'knockback', 'knockdown', 'guardBreak', 'stagger', 'held'].includes(st)) expr = 'hurt';
      else if (st === 'attack') expr = this.sd.kind === 'heavy' ? 'grit' : 'angry';
      else if (['guard', 'rush', 'throw', 'specialThrow', 'blast'].includes(st)) expr = 'angry';
      else if (this.hpFrac < 0.3) expr = 'grit';
      else if (this.sd.expression) expr = this.sd.expression;
      if (!this.anim.inSequence) this.model.setExpression(expr);

      const t = this.target;
      if (t && (st === 'free' || st === 'guard' || st === 'charge')) {
        const want = Math.atan2(t.pos.x - this.pos.x, t.pos.z - this.pos.z);
        this.anim.lookYaw = U.damp(this.anim.lookYaw, U.clamp(U.wrapAngle(want - this.yaw), -0.9, 0.9) * 0.7, 8, TICK);
      } else this.anim.lookYaw = U.damp(this.anim.lookYaw, 0, 8, TICK);
      this.anim.breathe = st === 'free' && this.speed < 2 ? 1 : 0.2;

      // body banking and lean from acceleration while flying
      const fwd = this.forward;
      const right = new V3(-fwd.z, 0, fwd.x);
      const vf = this.vel.x * fwd.x + this.vel.z * fwd.z;
      const vs = this.vel.x * right.x + this.vel.z * right.z;
      if (!frozen) {
        const ax = (this.vel.x - this.prevVel.x) / TICK, az = (this.vel.z - this.prevVel.z) / TICK;
        const af = ax * fwd.x + az * fwd.z, as = ax * right.x + az * right.z;
        const bank = st === 'free' && !this.grounded ? U.clamp(-as * 0.004 - vs * 0.006, -0.35, 0.35) : 0;
        const lean = st === 'free' && !this.grounded ? U.clamp(af * 0.003, -0.25, 0.25) : 0;
        this.anim.leanZ = U.damp(this.anim.leanZ, bank, 8, TICK);
        this.anim.leanX = U.damp(this.anim.leanX, lean, 8, TICK);
        this.anim.update(TICK);
        const turn = U.wrapAngle(this.yaw - this.prevYaw) / TICK;
        this.model.tick(TICK, { fwd: vf, side: vs, up: this.vel.y, turn });
      }
      this.object.rotation.y = this.yaw;

      if (this.shadow) {
        const stage = this.battle.stage;
        const gh = stage.heightAt(this.pos.x, this.pos.z);
        const h = this.pos.y - gh;
        // no shadow on ground above the fighter (falling off Snake Way)
        const vis = this.model.root.visible && h > -1 && h < 30;
        this.shadow.visible = vis;
        if (vis) {
          this.shadow.position.set(this.pos.x, gh + 0.04, this.pos.z);
          const s = this.radius * 1.45 * (1 + h * 0.03);
          this.shadow.scale.setScalar(s);
          this.shadow.material.opacity = (this.battle.shadowsOn ? 0.3 : 0.5) * U.clamp01(1 - h / 30);
        }
      }

      if (this.isPlayer) {
        const fast = this.speed > 24 && (st === 'free' || st === 'dash');
        SL.ScreenFX.setSpeed(fast ? U.clamp01((this.speed - 20) / 25) : st === 'dash' ? 0.5 : 0);
        this.battle.camera.fovKick = Math.max(this.battle.camera.fovKick, fast ? (this.speed - 20) * 0.25 : 0);
      }
    }

    dispose() {
      for (const k of Object.keys(this.loops)) if (this.loops[k]) this.loops[k].stop(0.1);
      this.aura.dispose();
      this.model.dispose();
      if (this.shadow) {
        this.battle.scene.remove(this.shadow);
        this.shadow.material.dispose();
      }
      if (this.object.parent) this.object.parent.remove(this.object);
    }
  }

  /* =================== state handlers =================== */
  const STATES = {
    free(it) {
      it = this._consumeBuffer(it);
      if (this._tryActions(it)) return;
      const flying = !this.grounded && this.canFly();
      const vertical = flying ? (it.up ? 1 : 0) - (it.down ? 1 : 0) : 0;
      if (it.boostPressed && (Math.abs(it.mx) + Math.abs(it.my) > 0.2 || vertical !== 0) && this.stamina >= R.COST.dash) {
        R.spendStamina(this, R.COST.dash);
        const w = this._wish(it);
        // in flight a dash follows held Fly Up / Fly Down too (a straight vertical burst with no direction held)
        const dir = w.dir.clone().multiplyScalar(w.len > 0.2 ? 1 : 0);
        if (vertical) dir.y += vertical * (w.len > 0.2 ? 0.75 : 1);
        dir.normalize();
        this.setState('dash', { dir });
        this.battle.sfx('dash', this);
        this.ghost(0.22, 0.35);
        return;
      }
      this._locomotion(it);
      if (this.aimTarget()) this.faceTarget(12);
      else if (Math.hypot(this.vel.x, this.vel.z) > 1.5) this.yaw = U.dampAngle(this.yaw, Math.atan2(this.vel.x, this.vel.z), 10, TICK);
      this._locomotionPose();
    },

    dash(it) {
      const sd = this.sd;
      const m = this.mult();
      const dashMove = (this.form.moves && this.form.moves.dash) || this.def.moves.dash;
      if (it.light && dashMove) {
        this._startAttack(dashMove, 'dash', 0);
        return;
      }
      if (it.dodge && this._startDodge(it)) return;
      const dir = sd.dir;
      const k = 1 - this.stateFrame / 14;
      this.vel.copy(dir).multiplyScalar(R.SPEED.dash * m.speed * (0.55 + 0.45 * k));
      if (this.grounded) this.vel.y = 0;
      if (this.target && this.target.alive) this.faceTarget(14);
      else this.yaw = U.dampAngle(this.yaw, Math.atan2(dir.x, dir.z), 16, TICK);
      const fwd = this.forward;
      const f = dir.x * fwd.x + dir.z * fwd.z;
      const right = new V3(-fwd.z, 0, fwd.x);
      const s = dir.x * right.x + dir.z * right.z;
      this.anim.play(Math.abs(dir.y) > 0.7 ? (dir.y > 0 ? 'flyUp' : 'flyDown') : f > 0.5 ? 'dash' : f < -0.5 ? 'flyBack' : s > 0 ? 'strafeR' : 'strafeL', 16);
      if (this.stateFrame % 2 === 0) this.battle.vfx.trail(this.chest(), (this.form.aura && this.form.aura.color) || 0xffffff, 0.4, 0.25);
      // powered forms and characters with a signature dash (Vegeta) leave afterimages
      if ((this.formIndex > 0 || (this.def.vfx && this.def.vfx.dashGhost)) && this.stateFrame % 4 === 0) this.ghost(0.2, 0.3);
      if (this.stateFrame >= 14) this.setState('free');
    },

    attack(it) {
      const sd = this.sd, mv = sd.move, f = this.stateFrame;
      const startup = sd.startup;
      const activeEnd = startup + mv.active;
      // stretching limbs (Piccolo): the arm or leg grows toward the strike and snaps back
      if (mv.limb) {
        const grow = U.clamp01(f / Math.max(1, startup));
        const back = f > activeEnd ? 1 - U.clamp01((f - activeEnd) / 8) : 1;
        this.setLimbStretch(mv.limb.side, 1 + (mv.limb.length - 1) * grow * back);
      }
      const total = activeEnd + mv.recovery + sd.whiffPenalty;
      const t = this.target;
      const m = this.mult();

      // teleport strikes (e.g. Meteor Crash): vanish and reappear before the blow
      if (mv.teleport && f === (mv.teleport.at || 2) && t && t.alive) {
        if (!mv.teleport.kiCost || R.spendKi(this, mv.teleport.kiCost)) {
          this.ghost(0.3, 0.5);
          this.battle.vfx.afterimage(this.pos, this.height, this.ghostColor());
          const dest = this._teleportDest(mv.teleport.to || 'above');
          this.pos.copy(dest);
          this.prevPos.copy(dest);
          this.grounded = false;
          this.vel.set(0, 0, 0);
          this.faceTarget(100);
          this.battle.vfx.afterimage(this.pos, this.height, this.ghostColor());
          this.battle.sfx('vanish', this);
        }
      }

      const lt = t && t.alive ? t : this.aimTarget();
      if (f < activeEnd && mv.lunge && lt && lt.alive) {
        const t = lt;
        const d = t.chest().sub(this.chest());
        const dist = d.length();
        const stop = mv.reach * this.scale * 0.72 + t.radius;
        if (dist < 9 + mv.lunge * 0.4 && dist > stop) {
          const spd = Math.min(mv.lunge * m.speed, (dist - stop) / TICK);
          this.vel.copy(d.divideScalar(dist)).multiplyScalar(spd);
          if (this.grounded && this.vel.y > 2) this.grounded = false;
        } else this.vel.multiplyScalar(0.6);
        this.faceTarget(22);
      } else {
        this.vel.x = U.damp(this.vel.x, 0, 10, TICK);
        this.vel.z = U.damp(this.vel.z, 0, 10, TICK);
        this.vel.y = this.grounded ? 0 : U.damp(this.vel.y, 0, 10, TICK);
      }
      if (this.grounded) this.vel.y = Math.max(0, this.vel.y);
      if (f === startup) {
        this.anim.play(mv.pose.strike, 44, { restart: !!mv.multi });
        if (mv.stretch) this.anim.squash = -0.14;
        this.battle.sfx('swing', this, { pitch: sd.kind === 'light' ? 1.2 : 0.8 });
        if (mv.impact >= 3 && this.formIndex > 0) this.ghost(0.18, 0.35);
      }
      if (f >= startup && f < activeEnd) {
        if (mv.multi) {
          // multi-hit: each window can hit the same target again
          let w = -1;
          for (let i = 0; i < mv.multi.length; i++) if (f - startup >= mv.multi[i]) w = i;
          if (w !== sd.window) {
            sd.window = w;
            sd.hitSet.clear();
            if (w > 0) this.battle.sfx('swing', this, { pitch: 1.3, vol: 0.6 });
          }
          if (f - startup - mv.multi[w] < 3) this._meleeCheck(mv, w === mv.multi.length - 1);
        } else this._meleeCheck(mv);
      }
      if (f === activeEnd && mv.pose.follow) this.anim.play(mv.pose.follow, 18);
      if (f === activeEnd + Math.floor(mv.recovery * 0.4)) this.anim.play(this.grounded ? 'idle' : 'flyIdle', 9);
      // A STRIKE THAT FOUND NOTHING (def.whiffRecovery, owner's Frieza fairness pass): he is
      // left finishing the swing, and a string cannot be chained off thin air — the miss is
      // the player's opening, not a free restart.
      const whiffed = this.def.whiffRecovery && !sd.hit;
      if (whiffed && f === activeEnd) sd.whiffPenalty = Math.max(sd.whiffPenalty, this.def.whiffRecovery);

      const b = this.buffer;
      const cancelAt = (mv.cancel || activeEnd + 2) + (sd.hit ? 0 : 4);
      if (b && this.frame - b.frame <= 10 && f >= cancelAt && !whiffed) {
        const lights = this.moveSet.light || [];
        if (b.action === 'light' && sd.kind === 'light' && this.chain < lights.length) {
          this.buffer = null;
          this._startLight();
          return;
        }
        if (b.action === 'heavy' && sd.kind === 'light') {
          this.buffer = null;
          this._startHeavy();
          return;
        }
        if (b.action === 'heavy' && sd.kind === 'heavy' && sd.hit) {
          if (this._tryChase()) {
            this.buffer = null;
            return;
          }
        }
        if (sd.hit && (b.action === 's1' || b.action === 's2' || b.action === 'ult')) {
          const slot = b.action === 's1' ? 'special1' : b.action === 's2' ? 'special2' : 'ultimate';
          this.buffer = null;
          if (this._trySpecial(slot)) {
            if (this.state === 'beamCharge') this.sd.quick = true;
            return;
          }
        }
        if (sd.hit && b.action === 'dodge') {
          this.buffer = null;
          if (this._startDodge(it)) return;
        }
      }
      if (f >= total) {
        // a whiff (with def.whiffRecovery) ends the string: the next strike is an opener again
        this.chainTimer = sd.kind === 'light' && !whiffed ? 28 : 0;
        if (sd.kind !== 'light' || whiffed) this.chain = 0;
        this.setState('free');
      }
    },

    guard(it) {
      if (!it.guard) {
        this.setState('free');
        return;
      }
      if (it.heavy) {
        this._startThrow();
        return;
      }
      if (it.dodge && this._startDodge(it)) return;
      this.staminaDelay = Math.max(this.staminaDelay, 12);
      const w = this._wish(it);
      const spd = 3;
      this.vel.x = U.damp(this.vel.x, w.dir.x * spd * w.len, 10, TICK);
      this.vel.z = U.damp(this.vel.z, w.dir.z * spd * w.len, 10, TICK);
      this.vel.y = this.grounded ? 0 : U.damp(this.vel.y, (it.up ? 3 : 0) - (it.down ? 3 : 0), 10, TICK);
      this.faceTarget(14);
      if (this.sd.hitFrames > 0) this.sd.hitFrames--;
      else this.anim.play('guard', 16);
    },

    charge(it) {
      if (!it.charge) {
        this.setState('free');
        return;
      }
      const other = { ...it, charge: false };
      if ((it.light || it.heavy || it.blast || it.s1 || it.s2 || it.ult || it.dodge || it.transform || it.guard) && this._tryActions(other)) return;
      const m = this.mult();
      const before = this.ki;
      this.ki = Math.min(this.kiMax, this.ki + m.chargeRate * TICK);
      if (before < this.kiMax && this.ki >= this.kiMax) {
        this.battle.sfx('kiUp', this);
        this.battle.vfx.flash(this.chest(), 3.5, (this.form.aura && this.form.aura.color) || 0xffffff, 0.25, SL.Toon.tex.glow);
      }
      // leveled forms (Kaioken): keep charging to push the multiplier higher
      const fm = this.form;
      if (fm.levels) {
        this.sd.levelFrames = (this.sd.levelFrames || 0) + 1;
        if (this.sd.levelFrames >= (fm.levelChargeFrames || 45) && this.formLevel < this.formLevelCap(fm) && this.ki >= (fm.levelCost || 15) + 5) {
          this.sd.levelFrames = 0;
          this._raiseFormLevel();
        }
      }
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      this.faceTarget(6);
      this.anim.play('charge', 12);
      if (!this.loops.aura) this.loops.aura = this.battle.chargeLoop('aura', this, null, 'charge');
      this.loops.aura.set(1);
      if (this.stateFrame % 6 === 0 && this.grounded) this.battle.vfx.dust(this.pos, 1.4, 4);
      if (this.stateFrame % 20 === 0 && this.grounded && SL.Render.effectsLevel() !== 'low') {
        const p = this.pos.clone().add(new V3(U.rand(-2.5, 2.5), 0.2, U.rand(-2.5, 2.5)));
        this.battle.vfx.rock(p, new V3(0, U.rand(2, 4), 0), U.rand(0.08, 0.2), this.battle.stage.rockColor);
      }
      if (this.isPlayer) this.battle.camera.addTrauma(0.012);
    },

    blast(it) {
      const sd = this.sd, f = this.stateFrame;
      this.faceTarget(18);
      this.vel.multiplyScalar(0.82);
      if (this.grounded) this.vel.y = 0;
      if (sd.charged) {
        this.anim.play('blastCharged', 16);
        if (!sd.orb) sd.orb = this.battle.projectiles.chargeOrb((this.def.blast || BLAST_DEFAULT).color);
        const hp = this.handPos('R').add(this.handPos('L')).multiplyScalar(0.5);
        sd.orb.position.copy(hp);
        sd.orb.scale.setScalar(0.6 + Math.min(1, f / 40) * 1.4 + Math.random() * 0.2);
        if (!it.blastHeld || f >= 46) {
          if (R.spendKi(this, R.COST.chargedBlastKi)) {
            const bd = this.def.blast || BLAST_DEFAULT;
            const t = this.target;
            const dir = t && t.alive ? t.chest().sub(hp).normalize() : this.forward;
            this.battle.projectiles.spawnBlast(this, hp, dir, {
              kind: 'ball', speed: 52, radius: 0.75, damage: 900, color: bd.color, core: bd.core, homing: 1.2,
              knock: 'heavy', knockSpeed: 16, hitstun: 26, impact: 2, explode: 3.5, life: 3,
            });
            this.battle.sfx('kiBlastBig', this);
            this.anim.play('blastCharged', 40, { restart: true });
          }
          this.setState('recoverSpecial', { frames: 16 });
        }
        return;
      }
      if (!sd.fired && f >= 2) {
        sd.fired = true;
        sd.count++;
        if (!this._fireBlast()) {
          this.setState('free');
          return;
        }
      }
      if (sd.count === 1 && f >= 15 && it.blastHeld && R.canAfford(this, R.COST.chargedBlastKi)) {
        sd.charged = true;
        this.stateFrame = 0;
        return;
      }
      const b = this.buffer;
      if (f >= 7 && b && b.action === 'blast' && this.frame - b.frame <= 8 && sd.count < 8) {
        this.buffer = null;
        if (R.canAfford(this, R.COST.blastKi)) {
          sd.fired = false;
          this.stateFrame = 0;
          return;
        }
      }
      if (f >= 7 && b && b.action !== 'blast' && this.frame - b.frame <= 8) {
        this.setState('free');
        return;
      }
      if (f >= (sd.count >= 8 ? 26 : 16) && !it.blastHeld) this.setState('free');
      if (f >= 40) this.setState('free');
    },

    recoverSpecial(it) {
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      if (this.stateFrame >= (this.sd.frames || 20)) this.setState('free');
    },

    beamCharge(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      const battle = this.battle;
      this.faceTarget(16);
      this.vel.multiplyScalar(0.8);
      if (this.grounded) this.vel.y = 0;
      const frac = (sd.frac = U.clamp01(f / sp.chargeMax));
      if (this.loops.beamCharge) this.loops.beamCharge.set(frac);
      if (!sd.orb) sd.orb = battle.projectiles.chargeOrb(sp.color);
      const hands = sp.oneHand ? this.handPos('R') : this.handPos('R').add(this.handPos('L')).multiplyScalar(0.5);
      sd.orb.position.copy(hands);
      sd.orb.scale.setScalar((0.5 + frac * (sp.ultimate ? 1.8 : 1.0) + sd.tier * 0.18) * (0.9 + Math.random() * 0.2));

      // charge tiers: each tier is a visible, audible step up in power
      if (sp.tiers) {
        let tier = 0;
        for (let i = 0; i < sp.tiers.length; i++) if (f >= sp.tiers[i]) tier = i + 1;
        if (tier > sd.tier) {
          sd.tier = tier;
          battle.vfx.flash(hands, 1.1 + tier * 0.5, sp.core || 0xffffff, 0.18);
          battle.vfx.sparks(hands, sp.color, 10 + tier * 6, 7 + tier * 3);
          battle.vfx.ring(hands, 1.5 + tier * 0.8, sp.color, 0.3);
          battle.sfx('tierUp', this, { pitch: 1 + tier * 0.18 });
          if (this.isPlayer) battle.camera.addTrauma(0.06 + tier * 0.03);
        }
      }
      // callout syllables across the charge (KA... ME... HA... ME...)
      if (sp.callout && !sd.instant && !sd.quick) {
        const perStep = Math.max(8, sp.chargeMax / sp.callout.length);
        const idx = Math.min(sp.callout.length - 2, Math.floor(f / perStep));
        if (f % Math.round(perStep) === 1 && sd.callIdx <= idx) {
          battle.emit('callout', { fighter: this, text: sp.callout[sd.callIdx], index: sd.callIdx, final: false });
          sd.callIdx++;
        }
      }
      // gathering energy
      if (f % 2 === 0) battle.vfx.streamInward(hands, 1.4 + frac * 1.8, sp.color, 1 + Math.round(frac * 3), 0.08 + frac * 0.08, 0.35);
      if (f % 7 === 0 && sp.chargeLight) battle.vfx.light(hands, sp.chargeLight, 0.5 + frac * 0.9, 4 + frac * 5, 0.14);
      if (sd.tier >= 3 && f % 4 === 0) battle.vfx.bolt(hands.clone().add(new V3(U.rand(-0.5, 0.5), U.rand(-0.5, 0.5), U.rand(-0.5, 0.5))), U.rand(0.4, 0.9), 0xdff6ff);
      if (this.grounded && f % 12 === 0) battle.vfx.dust(this.pos, 1 + frac * 1.5, 4);
      if (this.grounded && sd.tier >= 2 && f % 10 === 0) battle.vfx.rock(this.pos.clone().add(new V3(U.rand(-3, 3), 0.2, U.rand(-3, 3))), new V3(0, U.rand(2, 5), 0), U.rand(0.08, 0.22), battle.stage.rockColor);
      if (this.isPlayer) battle.chargeFocus = frac;

      if (f === 1 && (sp.cinematic || sp.ultimate)) battle.ultimateChargeShot(this, sp.chargeMax / 60);
      const held = slotHeld(sd.slot, it);
      const minDone = f >= (sd.quick ? Math.min(sp.chargeMin, R.QUICK_BEAM_MIN) : sp.chargeMin);
      // a story beat can force the beam out now (an attack arriving point-blank, an opponent answering at once)
      const forced = this.forceBeamRelease && f >= 1;
      if (forced) this.forceBeamRelease = false;
      if ((minDone && !held) || f >= sp.chargeMax || forced) {
        if (!R.spendKi(this, sd.cost || sp.kiCost)) {
          this._denied();
          this.setState('free');
          return;
        }
        const beam = battle.projectiles.spawnBeam(this, sp, frac);
        // life-force techniques (Tien's Tri-Beam) cost health as well as ki
        if (sp.hpCost && !this.infiniteHp) {
          this.hp = Math.max(1, this.hp - this.hpMax * sp.hpCost);
          battle.emit('lifeCost', { fighter: this, amount: this.hpMax * sp.hpCost });
        }
        if (sp.callout && !sd.instant) battle.emit('callout', { fighter: this, text: sp.callout[sp.callout.length - 1], index: sp.callout.length - 1, final: true, tier: sd.tier });
        this.setState('beamFire', { spec: sp, slot: sd.slot, beam, frac, aimYaw: 0, aimPitch: 0, tier: sd.tier });
        this.anim.play(sp.poses.fire, 40);
        this.anim.squash = 0.12;
        battle.vfx.ring(hands, 2 + frac * 3, sp.color, 0.35, beam.dir);
        battle.sfx('beamFire', this, { vol: 1.1, pitch: 0.9 + frac * 0.2 });
        if (this.isPlayer) battle.camera.fovKick = 6 + frac * 6;
      }
    },

    beamFire(it) {
      const sd = this.sd;
      const beam = sd.beam;
      this.vel.copy(beam.dir).multiplyScalar(-0.8 - (sd.frac || 0) * 1.2);
      if (this.grounded) this.vel.y = 0;
      sd.aimYaw = U.clamp(sd.aimYaw - it.mx * 0.9 * TICK, -0.45, 0.45);
      sd.aimPitch = U.clamp(sd.aimPitch + it.my * 0.9 * TICK, -0.45, 0.45);
      beam.aimYaw = sd.aimYaw;
      beam.aimPitch = sd.aimPitch;
      if (this.isPlayer && this.stateFrame < 40) this.battle.camera.addTrauma(0.02 + (sd.frac || 0) * 0.02);
      if (beam.done || this.stateFrame > 400) this.setState('recoverSpecial', { frames: sd.spec.recovery || 20 });
    },

    clash(it) {
      this.vel.set(0, 0, 0);
      this.anim.play('beamPush', 20);
    },

    specialThrow(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      this.faceTarget(20);
      this.vel.multiplyScalar(0.82);
      if (this.grounded) this.vel.y = 0;
      if (f < sp.startup) {
        if (!sd.orb) sd.orb = this.battle.projectiles.chargeOrb(sp.projectile.color);
        sd.orb.position.copy(this.handPos('R'));
        sd.orb.scale.setScalar(0.5 + (f / sp.startup) * 1.8);
      }
      // AIM COMMIT (sp.aimLock, owner's Frieza fairness pass): the shot is aimed that many
      // frames before it leaves the hand, marked by a glint and a sound. Whoever moves after
      // the glint is not where it goes — the tell is the raised finger, the dodge is moving.
      if (sp.aimLock) {
        if (f === 1) this.battle.sfx('beamCharge', this, { vol: 0.55, pitch: 1.9 });
        if (f === Math.max(1, sp.startup - sp.aimLock)) {
          const t = this.aimTarget();
          if (t && t.alive) sd.aim = t.aimPoint(this.handPos('R'));
          if (sp.pose.aim) this.anim.play(sp.pose.aim, 8);
          this.battle.vfx.flash(this.handPos('R'), 1.5, sp.projectile.color, 0.16, SL.Toon.tex.glow);
          this.battle.sfx('kiUp', this, { vol: 0.8, pitch: 1.7 });
        }
      }
      if (f === sp.startup) {
        if (sd.orb) {
          sd.orb.visible = false;
          sd.orb = null;
        }
        if (!R.spendKi(this, sp.kiCost)) {
          this._denied();
          this.setState('free');
          return;
        }
        const origin = sp.fromHead ? this.headPos().addScaledVector(this.forward, 0.25) : this.handPos('R');
        const t = this.aimTarget();
        const dir = sd.aim ? sd.aim.clone().sub(origin).normalize() : t && t.alive ? t.aimPoint(origin).sub(origin).normalize() : this.freeAimDir(origin) || this.forward;
        // projectile.count / spread: several at once, fanned out across the aim (Gotenks' ghosts)
        const count = sp.projectile.count || 1;
        let ball = null;
        for (let k = 0; k < count; k++) {
          const a = count > 1 ? (k / (count - 1) - 0.5) * (sp.projectile.spread || 0.5) : 0;
          ball = this.battle.projectiles.spawnBlast(this, origin, a ? dir.clone().applyAxisAngle(UP, a) : dir, { ...sp.projectile, special: true, name: sp.name, wobble: k });
        }
        this.anim.play(sp.pose.release, 44);
        this.battle.sfx('kiBlastBig', this);
        // Spirit Ball Control (Yamcha): a player keeps the button held to steer it; a CPU steers it at its target for a moment
        if (sp.projectile.steer) {
          if (!this.isPlayer) ball.autoSteer = sp.projectile.steer.cpuFrames || 0;
          else if (slotHeld(sd.slot, it)) {
            this.setState('spiritSteer', { ball, spec: sp, slot: sd.slot });
            this.battle.emit('spiritBallControl', { fighter: this, ball });
            return;
          }
        }
      }
      if (f >= sp.startup + sp.recovery) this.setState('free');
    },

    teleport(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      const startup = sd.escape ? 2 : sp.startup;
      this.vel.multiplyScalar(0.7);
      const t = this.target;
      // readable tell: a shimmer appears where Goku will reappear
      if (sp.shimmer && f === Math.max(1, startup - 3) && t && t.alive) {
        sd.dest = this._teleportDest(sd.mode);
        const p = sd.dest.clone().add(new V3(0, this.height * 0.55, 0));
        this.battle.vfx.flash(p, 1.6, 0xe0f4ff, 0.22, SL.Toon.tex.glow);
        this.battle.vfx.ring(p, 1.3, 0xe0f4ff, 0.3);
      }
      if (f === startup) {
        this.ghost(0.32, 0.55);
        this.battle.vfx.afterimage(this.pos, this.height, 0xe0f4ff);
        this.setHidden(true);
        this.invuln = Math.max(this.invuln, 14);
      }
      if (f === startup + 5) {
        if (t && t.alive) {
          const dest = sd.mode === 'away' && sd.dest ? sd.dest : this._teleportDest(sd.mode);
          this.pos.copy(dest);
          this.prevPos.copy(dest);
          this.grounded = sd.mode !== 'above' && sd.mode !== 'away' && t.grounded;
          this.vel.set(0, 0, 0);
          this.faceTarget(100);
        }
        this.setHidden(false);
        this.battle.vfx.afterimage(this.pos, this.height, 0xe0f4ff);
        this.battle.vfx.ring(this.chest(), 1.6, 0xe0f4ff, 0.25);
        this.battle.sfx('itPop', this);
        this.followFrames = sp.followWindow;
        this.followBonus = sp.followBonus;
        this.followMode = sd.mode;
        this.anim.play(this.grounded ? 'idle' : 'flyIdle', 20, { snap: true });
        this.battle.emit('teleported', { fighter: this, mode: sd.mode });
        // appearing in front comes with an instant strike
        if (sd.mode === 'front' && this.moveSet.light && this.moveSet.light.length > 1) {
          this._startAttack(this.moveSet.light[1], 'light', 1);
          return;
        }
      }
      if (f >= startup + 5 + sp.recovery) this.setState('free');
    },

    rush(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      const t = this.target;
      if (sp.prop && this.model.setPropFill) this.model.setPropFill(sp.prop, sd.phase === 'recover' ? Math.max(0, 1 - (f - sd.recStart) / 8) : Math.min(1, f / 6));
      if (sd.phase === 'wind') {
        this.vel.multiplyScalar(0.7);
        this.faceTarget(20);
        if (f >= sp.startup) {
          sd.phase = 'dash';
          sd.dashStart = f;
          this.anim.play(sp.poses.dash || 'dash', 20); // most kits only author the wind-up; the common dash pose carries the lunge
          this.battle.sfx('dash', this, { vol: 1.3 });
        }
        return;
      }
      if (sd.phase === 'dash') {
        if (!t || !t.alive) {
          sd.phase = 'recover';
          sd.recStart = f;
          return;
        }
        const d = t.chest().sub(this.chest());
        const dist = d.length();
        this.vel.copy(d.divideScalar(Math.max(0.01, dist))).multiplyScalar(sp.speed * this.mult().speed);
        this.grounded = false;
        this.faceTarget(30);
        if (f % 2 === 0) this.battle.vfx.trail(this.chest(), 0xffffff, 0.5, 0.3);
        if (f % 5 === 0) this.ghost(0.2, 0.3);
        if (dist < 1.8 * this.scale + t.radius) {
          const res = t.takeHit(this, { type: 'melee', damage: 120, knock: 'held', impact: 1, dir: this.dirTo(t), pose: 'hitBody', sfx: 'punchHeavy' });
          if (res === 'hit' && t.alive) {
            t.setState('held', { by: this, frames: 160 });
            sd.victim = t;
            sd.phase = 'combo';
            sd.hitIndex = 0;
            sd.nextHit = f + 3;
            this.vel.set(0, 0, 0);
          } else {
            sd.phase = 'recover';
            sd.recStart = f;
          }
          return;
        }
        if (f - sd.dashStart > sp.dashFrames) {
          sd.phase = 'recover';
          sd.recStart = f;
        }
        return;
      }
      if (sd.phase === 'combo') {
        const v = sd.victim;
        this.vel.set(0, 0, 0);
        if (!v || !v.alive || v.state !== 'held') {
          sd.phase = 'recover';
          sd.recStart = f;
          return;
        }
        v.pos.copy(this.pos).addScaledVector(this.forward, 1.25 * this.scale);
        v.vel.set(0, 0, 0);
        v.yaw = this.yaw + Math.PI;
        if (f >= sd.nextHit) {
          const h = sp.hits[sd.hitIndex];
          this.anim.play(h.pose, 44, { restart: true });
          const last = sd.hitIndex === sp.hits.length - 1;
          const dir = this.forward;
          if (h.knock === 'smash') dir.y = -0.7;
          v.takeHit(this, {
            type: 'melee', damage: h.damage, knock: last ? h.knock || 'heavy' : 'held', knockSpeed: h.knockSpeed || 24,
            hitstun: 36, impact: last ? h.impact || 3 : 2, dir: dir.normalize(), pose: 'hitBody', sfx: h.sfx,
          });
          sd.hitIndex++;
          sd.nextHit = f + h.frames;
          if (sd.hitIndex >= sp.hits.length) {
            sd.victim = null;
            sd.phase = 'recover';
            sd.recStart = f;
          }
        }
        return;
      }
      this.vel.multiplyScalar(0.85);
      if (f - sd.recStart >= sp.recovery) this.setState('free');
    },

    spiritBomb(it) {
      const sd = this.sd, sp = sd.spec, f = this.stateFrame;
      const battle = this.battle;
      this.vel.multiplyScalar(0.8);
      if (this.grounded) this.vel.y = 0;
      this.faceTarget(10);
      const maxF = sp.chargeFrames;
      if (f === 1) {
        sd.bomb = battle.projectiles.spawnSpiritBomb(this, sp);
        battle.bark(this, 'ultimate', true);
        battle.ultimateChargeShot(this, Math.min(3, maxF / 60), true);
        if (sp.mood) battle.stage.setMood(sp.mood.amount, sp.mood.color, 1.2);
      }
      if (sd.bomb && !sd.released) {
        sd.frac = U.clamp01(f / maxF);
        sd.bomb.chargeFrac = sd.frac;
        // energy gathering from the whole battlefield
        if (f % 3 === 0 && battle.stage.hasGround) {
          const a = Math.random() * Math.PI * 2, d = U.rand(12, 50);
          const p = new V3(this.pos.x + Math.cos(a) * d, 0, this.pos.z + Math.sin(a) * d);
          p.y = battle.stage.heightAt(p.x, p.z) + 0.5;
          const v = sd.bomb.pos.clone().sub(p).multiplyScalar(1 / 1.4);
          const c = new THREE.Color(sp.color);
          battle.vfx.add.emit(p.x, p.y, p.z, v.x, v.y, v.z, c.r, c.g, c.b, 0.95, U.rand(0.25, 0.5), 1.4, {});
        }
      }
      const held = sd.slot === 'ultimate' ? it.ultHeld : it.s1Held;
      const releaseNow = sp.holdToCharge ? (f >= (sp.chargeMin || 60) && !held) || f >= maxF : f >= maxF;
      if (releaseNow && sd.bomb && !sd.released) {
        sd.released = true;
        sd.releaseFrame = f;
        sd.bomb.launch(this.target);
        this.anim.play(sp.poses.release, 30);
        battle.sfx('kiBlastBig', this, { vol: 1.3, pitch: 0.6 });
        battle.bombFollowShot(sd.bomb, this);
      }
      if (sd.released && f >= sd.releaseFrame + sp.recovery) this.setState('free');
    },

    transform(it) {
      const sd = this.sd, f = this.stateFrame;
      const style = sd.form.style || 'burst';
      const short = SL.Settings.data.gameplay.shortTransforms || SL.Settings.data.camera.cinematic === 'off';
      const seq = sd.form.sequence;
      if (style === 'full' && seq && !short) return STATES.transformSequence.call(this, it);
      const full = style === 'full' && !short;
      const applyAt = full ? 58 : style === 'full' ? 22 : 16;
      const end = full ? 118 : style === 'full' ? 50 : 36;
      this.vel.multiplyScalar(0.8);
      if (this.grounded) this.vel.y = 0;
      if (f === 1) {
        this.anim.play(sd.form.activation && !full ? sd.form.activation.pose : full ? 'powerCrouch' : 'powerUp', sd.form.activation ? 14 : 10);
        this.aura.setStyle(sd.form.aura);
        if (full) {
          sd.cinematic = true;
          this.battle.beginCinematic(this);
          this.battle.transformShot(this, end / 60);
        }
        if (sd.form.line) this.battle.say(this, sd.form.line);
        if (sd.form.music !== undefined) this.battle.musicBoost(sd.form.music);
        this.loops.aura = this.loops.aura || this.battle.chargeLoop('aura', this, null, 'transform');
        if (style === 'burst') this.battle.emit('callout', { fighter: this, text: (sd.form.short || sd.form.name) + '!', index: 0, final: true, burst: true });
      }
      if (this.loops.aura) this.loops.aura.set(f < applyAt ? 0.4 + 0.6 * (f / applyAt) : 1);
      if (f < applyAt) {
        if (full && f % 4 === 0) {
          const p = this.pos.clone().add(new V3(U.rand(-3, 3), 0.1, U.rand(-3, 3)));
          if (this.battle.stage.hasGround) this.battle.vfx.rock(p, new V3(0, U.rand(3, 7), 0), U.rand(0.1, 0.3), this.battle.stage.rockColor);
          this.battle.vfx.bolt(this.chest().add(new V3(U.rand(-0.6, 0.6), U.rand(-0.8, 0.8), U.rand(-0.6, 0.6))), U.rand(0.6, 1.2));
        }
        if (full) this.battle.camera.addTrauma(0.02 + 0.02 * (f / applyAt));
        if (style === 'burst' && f % 3 === 0) this.battle.vfx.streamInward(this.chest(), 2.5, sd.form.aura.color, 3, 0.2, 0.3);
      }
      if (f === applyAt) this._transformBurst(sd, full);
      if (f >= end) this._endTransform(sd);
    },

    /** Data-driven transformation event (form.sequence). */
    transformSequence(it) {
      const sd = this.sd, f = this.stateFrame;
      const seq = sd.form.sequence;
      const battle = this.battle;
      this.vel.multiplyScalar(0.8);
      if (this.grounded) this.vel.y = 0;
      if (f === 1) {
        sd.cinematic = true;
        battle.beginCinematic(this);
        this.loops.aura = this.loops.aura || battle.chargeLoop('aura', this, null, 'transform');
        if (sd.form.line) battle.say(this, sd.form.line, 3);
        for (const e of this.enemies()) if (e.target === this || e.isPlayer) sd.watcher = sd.watcher || e;
      }
      for (const step of seq.steps) {
        if (step.at !== f - 1) continue;
        if (step.pose) this.anim.play(step.pose, step.speed || 8, { restart: true });
        if (step.expression) sd.expression = step.expression;
        if (step.aura !== undefined) sd.auraLevel = step.aura;
        if (step.auraColor !== undefined) this.aura.setStyle({ color: step.auraColor, core: 0xffffff, particles: step.auraColor, speed: 1.4 });
        if (step.mood) {
          battle.stage.setMood(step.mood[0], step.mood[1], step.mood[2]);
          sd.moodSet = true;
        }
        // noShots: a story shooting the transformation itself (SL.data.trunksKit.transform) owns the camera
        if (step.shot === 'orbit' && !sd.noShots) battle.transformShot(this, seq.length / 60);
        if (step.shot === 'face' && !sd.noShots) battle.faceShot(this, (seq.length - step.at) / 60);
        if (step.crack && battle.stage.hasGround && this.grounded) battle.stage.crater(this.pos, 2.6, 0.18, null);
        if (step.music !== undefined) SL.Music.setIntensity(step.music);
        if (step.sfx) battle.sfx(step.sfx, this);
        if (step.quake) battle.camera.addTrauma(step.quake);
        if (step.skyBolt) battle.vfx.skyBolt(this.pos.clone().add(new V3(U.rand(-6, 6), 0, U.rand(-6, 6))), 40);
        if (step.hairFlicker !== undefined) sd.hairFlicker = step.hairFlicker;
        if (step.lightning !== undefined) sd.lightning = step.lightning;
        if (step.rocks !== undefined) sd.rocks = step.rocks;
        if (step.burst) this._transformBurst(sd, true, step);
      }
      if (sd.auraLevel !== undefined) sd.aura = sd.auraLevel;
      if (this.loops.aura) this.loops.aura.set(f < seq.applyAt ? 0.3 + 0.7 * (f / seq.applyAt) : 1);
      // continuous effects while flags are on
      if (sd.hairFlicker && f % 4 === 0) {
        const alt = Math.floor(f / 4) % 2 === 0;
        this.model.setForm(alt ? sd.form : this.form);
      }
      if (sd.lightning && f % 5 === 0) battle.vfx.bolt(this.chest().add(new V3(U.rand(-0.7, 0.7), U.rand(-0.9, 0.9), U.rand(-0.7, 0.7))), U.rand(0.7, 1.4));
      if (sd.rocks && battle.stage.hasGround && f % 5 === 0) {
        const p = this.pos.clone().add(new V3(U.rand(-4, 4), 0.1, U.rand(-4, 4)));
        battle.vfx.rock(p, new V3(0, U.rand(2, 6), 0), U.rand(0.1, 0.35), battle.stage.rockColor);
      }
      if (f < seq.applyAt) {
        battle.camera.addTrauma(0.012 + 0.018 * (f / seq.applyAt));
        if (f % 3 === 0) battle.vfx.streamInward(this.chest(), 3.2, sd.form.aura.color, 2, 0.16, 0.4);
      }
      if (f >= seq.length) this._endTransform(sd);
    },

    throw(it) {
      const sd = this.sd, th = sd.th, f = this.stateFrame;
      const t = this.target;
      if (f <= 6 && t && t.alive) {
        this.faceTarget(20);
        const d = t.chest().sub(this.chest());
        const dist = d.length();
        if (dist > 1.4 && dist < 5) this.vel.copy(d.normalize()).multiplyScalar(10);
        else this.vel.multiplyScalar(0.5);
      } else this.vel.multiplyScalar(0.7);
      if (this.grounded) this.vel.y = 0;
      if (f === 6) {
        const ok = t && t.alive && this.distTo(t) < 1.9 * this.scale + t.radius && t.invuln <= 0 && !['knockdown', 'vanish', 'dodge', 'transform', 'knockback', 'held'].includes(t.state);
        if (ok) {
          sd.victim = t;
          sd.success = true;
          t.setState('held', { by: this, frames: 60 });
          t.vel.set(0, 0, 0);
          this.battle.sfx('punchLight', this);
          this.battle.emit('throw', { fighter: this, victim: t });
        }
      }
      if (sd.success) {
        const v = sd.victim;
        if (v && v.alive && v.state === 'held') {
          v.pos.copy(this.pos).addScaledVector(this.forward, 1.05 * this.scale);
          if (!this.grounded) v.pos.y = this.pos.y;
          v.yaw = this.yaw + Math.PI;
          v.vel.set(0, 0, 0);
        }
        if (f === 12) this.anim.play(th.poses[1], 22);
        if (f === 22) this.anim.play(th.poses[2], 44);
        if (f === 24 && v && v.state === 'held') {
          v.takeHit(this, { type: 'throw', damage: th.damage, knock: 'heavy', knockSpeed: th.knockSpeed, hitstun: 36, impact: 3, dir: this.forward, pose: 'hitHeavy', sfx: 'punchHeavy' });
          sd.victim = null;
        }
        if (f >= 44) this.setState('free');
      } else if (f >= 32) this.setState('free');
    },

    held(it) {
      this.vel.set(0, 0, 0);
      const sd = this.sd;
      // turned to stone (Dabura): struggling — any strike or a dodge — cracks it open sooner
      if (sd.stone && (it.light || it.heavy || it.dodge)) {
        sd.frames = (sd.frames || 60) - (sd.stone.mash || 8);
        if (this.frame % 2 === 0) this.battle.vfx.debrisBurst(this.chest(), 2, sd.stone.kind === 'candy' ? 0xff8ac4 : 0x9a9690, 5, 0.12);
      }
      if (this.stateFrame > (sd.frames || 60)) this.setState('free');
    },

    hitstun(it) {
      const sd = this.sd;
      sd.frames--;
      this.vel.x = U.damp(this.vel.x, 0, 7, TICK);
      this.vel.z = U.damp(this.vel.z, 0, 7, TICK);
      this.vel.y = this.grounded ? 0 : U.damp(this.vel.y, 0, 7, TICK);
      const b = this.buffer;
      const wantsBurst = it.dodge || (b && b.action === 'dodge' && this.frame - b.frame <= 8);
      if (this.stateFrame > 3 && wantsBurst && this._burstEscape()) {
        this.buffer = null;
        return;
      }
      if (it.s2 && this.def.specials && this.def.specials.special2 && this.def.specials.special2.type === 'teleport' && this._trySpecial('special2', { escape: true })) return;
      if (sd.frames <= 0) this.setState('free');
    },

    knockback(it) {
      const sd = this.sd;
      sd.frames--;
      const k = sd.knock;
      const space = !this.battle.stage.hasGround;
      if (k === 'launch') {
        // launch arc with a short hang at the apex, so the attacker can pursue
        if (this.vel.y > 2) this.vel.y -= 30 * TICK;
        else if (this.vel.y > -1) this.vel.y -= 6 * TICK;
        else this.vel.y = U.damp(this.vel.y, -2, 4, TICK);
        this.vel.x = U.damp(this.vel.x, 0, 2, TICK);
        this.vel.z = U.damp(this.vel.z, 0, 2, TICK);
        this.anim.play('launched', 12);
      } else if (k === 'smash') {
        if (!space) this.vel.y -= 20 * TICK;
        else this.vel.multiplyScalar(Math.exp(-1.2 * TICK));
        this.anim.play('smashed', 12);
      } else {
        this.vel.multiplyScalar(Math.exp(-2.1 * TICK));
        this.anim.play(sd.spinPose ? 'hitAirSpin' : this.speed > 12 ? 'tumble' : 'hitHeavy', 10);
      }
      this.speed = this.vel.length();
      if (this.stateFrame % 3 === 0 && this.speed > 15) this.battle.vfx.trail(this.chest(), 0xffffff, 0.3, 0.3);
      const early = sd.frames < sd.startFrames * 0.45 && k !== 'smash';
      const buffered = this.buffer && this.frame - this.buffer.frame <= 8;
      // quick recovery: any attack, guard, dodge or flight input (Fly Up AND Fly Down — before 0.3 only Fly Up worked)
      if (early && (it.light || it.heavy || it.dodge || it.guard || it.up || it.down || buffered) && (this.stamina >= R.COST.quickRecover || this.infiniteStamina)) {
        this.buffer = null;
        R.spendStamina(this, R.COST.quickRecover);
        this.setState('recover', { frames: 12 });
        this.invuln = 12;
        return;
      }
      if (sd.frames <= 0) {
        this.setState('recover', { frames: 14 });
        this.invuln = 12;
      }
    },

    recover(it) {
      this.vel.multiplyScalar(0.8);
      // in the air, Fly Up / Fly Down already steer while regaining balance
      if (!this.grounded && this.canFly() && (it.up || it.down)) this.vel.y = U.damp(this.vel.y, (it.up ? 7 : 0) - (it.down ? 7 : 0), 8, TICK);
      this.anim.play('recover', 20);
      if (this.stateFrame >= this.sd.frames) this.setState('free');
    },

    knockdown(it) {
      const sd = this.sd;
      this.invuln = Math.max(this.invuln, 2);
      this.anim.play('knockdown', 14);
      if (this.grounded) {
        this.vel.x = U.damp(this.vel.x, 0, 6, TICK);
        this.vel.z = U.damp(this.vel.z, 0, 6, TICK);
      } else if (this.battle.stage.hasGround) this.vel.y -= 25 * TICK;
      else {
        this.vel.multiplyScalar(0.9);
        if (this.stateFrame > 20) {
          this.setState('recover', { frames: 14 });
          this.invuln = 14;
          return;
        }
      }
      const wantUp = this.stateFrame > 16 && (it.light || it.heavy || it.dodge || it.guard || it.up || it.down || Math.abs(it.mx) + Math.abs(it.my) > 0.5);
      if ((wantUp || this.stateFrame >= sd.frames) && (this.grounded || this.stateFrame > 90)) {
        this.setState('getup', {});
        this.invuln = 20;
      }
    },

    getup(it) {
      this.vel.multiplyScalar(0.7);
      this.anim.play('getup', 14);
      if (this.stateFrame >= 16) {
        this.anim.play('idle', 10);
        this.setState('free');
      }
    },

    stagger(it) {
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      this.anim.play('stagger', 14);
      if (this.stateFrame >= this.sd.frames) this.setState('free');
    },

    guardBreak(it) {
      STATES.stagger.call(this, it);
    },

    dodge(it) {
      const sd = this.sd;
      this.vel.multiplyScalar(0.86);
      if (this.grounded) this.vel.y = 0;
      const fwd = this.forward;
      const f = sd.dir.x * fwd.x + sd.dir.z * fwd.z;
      const right = new V3(-fwd.z, 0, fwd.x);
      const s = sd.dir.x * right.x + sd.dir.z * right.z;
      this.anim.play(f < -0.5 ? 'flyBack' : f > 0.5 ? 'dash' : s > 0 ? 'strafeR' : 'strafeL', 18);
      this.faceTarget(10);
      if (this.stateFrame >= 15) this.setState('free');
    },

    vanish(it) {
      const sd = this.sd;
      this.vel.set(0, 0, 0);
      if (this.stateFrame === 5) {
        this.pos.copy(sd.dest);
        this.prevPos.copy(sd.dest);
        this.grounded = false;
        this.setHidden(false);
        if (sd.attacker) {
          this.target = this.target || sd.attacker;
          this.faceTarget(100);
        }
        this.battle.vfx.afterimage(this.pos, this.height, this.ghostColor());
        this.anim.play('flyIdle', 20, { snap: true });
        this.counterFrames = 45;
      }
      if (this.stateFrame >= 11) this.setState('free');
    },

    ko(it) {
      const stage = this.battle.stage;
      if (stage.hasGround && !this.grounded) this.vel.y -= 24 * TICK;
      this.vel.x = U.damp(this.vel.x, 0, this.grounded ? 6 : 1.2, TICK);
      this.vel.z = U.damp(this.vel.z, 0, this.grounded ? 6 : 1.2, TICK);
      if (!stage.hasGround) this.vel.y = U.damp(this.vel.y, 0, 1, TICK);
      this.anim.play(this.grounded || this.stateFrame > 40 ? 'knockdown' : 'tumble', 8);
    },

    scripted(it) {
      const sd = this.sd;
      this.vel.multiplyScalar(0.85);
      if (this.grounded) this.vel.y = 0;
      if (sd.sequence) {
        if (!sd.seqStarted) {
          sd.seqStarted = true;
          this.anim.playSequence(sd.sequence, { onEnd: sd.onEnd });
        }
      } else if (sd.pose) this.anim.play(sd.pose, sd.speed || 8);
      if (sd.face && this.target) this.faceTarget(8);
    },
  };

  Fighter.prototype._transformBurst = function (sd, full, step) {
    const battle = this.battle;
    this.applyForm(sd.index);
    sd.hairFlicker = false;
    const c = this.chest();
    const col = (sd.form.aura && sd.form.aura.color) || 0xffffff;
    battle.vfx.explosion(c, full ? 6 : 3, col, { smoke: false });
    battle.vfx.ring(this.pos.clone().add(new V3(0, 0.2, 0)), full ? 14 : 7, col, 0.8, new V3(0, 1, 0));
    battle.vfx.ring(c, full ? 8 : 5, 0xffffff, 0.45);
    battle.vfx.sparks(c, col, full ? 50 : 24, full ? 22 : 14, 0.18);
    SL.ScreenFX.flash(step && step.flash !== undefined ? step.flash : full ? 0.75 : 0.35, '#ffffff');
    battle.sfx('transformBurst', this);
    battle.camera.addTrauma(full ? 0.75 : 0.35);
    this.anim.squash = full ? 0.22 : 0.14;
    if (!step || !step.pose) this.anim.play('powerUp', 22);
    if (battle.stage.hasGround && this.grounded) battle.stage.crater(this.pos, step && step.crater ? step.crater : full ? 4.5 : 2.5, full ? 0.55 : 0.25, null);
    for (const e of this.enemies()) {
      const d = e.pos.distanceTo(this.pos);
      if (d < 8 && e.state !== 'knockdown') {
        const dir = this.dirTo(e);
        e.vel.addScaledVector(dir, 20 * (1 - d / 8));
      }
    }
    if (sd.form.reactLine) {
      for (const e of this.enemies()) {
        if (e.target === this) {
          battle.bark(e, 'reactTransform', true);
          break;
        }
      }
    }
    if (sd.form.music !== undefined) battle.musicBoost(sd.form.music);
    battle.emit('transformBurst', { fighter: this, form: sd.form });
  };

  Fighter.prototype._endTransform = function (sd) {
    if (sd.cinematic) {
      this.battle.endCinematic(this);
      sd.cinematic = false;
    }
    if (sd.moodSet) {
      this.battle.stage.clearMood(1);
      sd.moodSet = false;
    }
    if (this.loops.aura) {
      this.loops.aura.stop(0.5);
      this.loops.aura = null;
    }
    if (this.formIndex !== sd.index) this.applyForm(sd.index);
    this.setState('free');
  };

  Fighter.prototype._burstEscape = function () {
    if (!(this.stamina >= R.COST.burstEscape || this.infiniteStamina)) return false;
    R.spendStamina(this, R.COST.burstEscape);
    const away = this.target ? this.target.dirTo(this).setY(0.15).normalize() : this.forward.negate();
    const dest = this.pos.clone().addScaledVector(away, 7);
    this.battle.stage.clampPosition(dest);
    this.ghost(0.3, 0.5);
    this.battle.vfx.afterimage(this.pos, this.height, 0xffffff);
    this.battle.vfx.ring(this.chest(), 4, 0xffffff, 0.35);
    this.pos.copy(dest);
    this.prevPos.copy(dest);
    this.grounded = false;
    this.vel.set(0, 0, 0);
    this.invuln = 16;
    this.setState('recover', { frames: 10 });
    this.battle.sfx('vanish', this);
    this.battle.emit('burst', { fighter: this });
    return true;
  };

  SL.Fighter = Fighter;
  SL.FighterStates = STATES;
  SL.FighterGravityExempt = GRAVITY_EXEMPT;
  SL.emptyIntent = emptyIntent;
})();
