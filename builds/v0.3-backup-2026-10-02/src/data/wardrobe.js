/*
 * WARDROBE — what the characters wear, as data (the logic is SL.Wardrobe in src/game/wardrobe.js).
 *
 * A character's look is a SELECTION: one piece per slot.
 *   outfit   the clothes (required): the model `outfit` fields of src/game/model.js
 *   armor    a chest/shoulder/hip armor set worn over an outfit that allows it (armorOk)
 *   emblem   the marks on a gi (Goku's kanji), on an outfit that allows them (emblemOk)
 *   scouter  an accessory on the head
 *   tail     a Saiyan tail worn round the waist
 *   hair     a hairstyle from src/data/hair.js (slot ready; no alternates defined yet)
 * plus a colour `palette` the outfit offers ('default' = as authored).
 * 'none' is a valid piece in every optional slot.
 *
 * PIECE fields
 *   slot, name (short label), chars (character ids, or '*'), era (an SL.data.eras id: where it
 *   comes from), kind ('canon' | 'casual' | 'training' | 'movie' | 'gt' | 'event' | 'whatif'),
 *   canon (true when the source wears it that way), accuracy ('reference' | 'approximate'),
 *   status 'prototype' (built from the procedural parts, selectable) | 'planned' (data only: not
 *   drawable in this build, never selectable), needs (what a planned piece is waiting for),
 *   unlock (a Save condition; absent = available from the start), modes (optional restriction),
 *   look (model fields), base (inherit another outfit: its look AND its compatibility — armorOk,
 *   armors, emblemOk, defaults, palettes, face, body — unless it says otherwise), defaults (the
 *   armor / emblem / scouter / tail that come with an outfit), armorOk (takes the armor slot) or
 *   armors (the list of armors it may take; the first fitting fallback is its default), emblemOk,
 *   palettes, face (changes to the face that go with it), body ('adult' default, or 'young': the
 *   clothes of a younger body, which only a young body profile can wear), glb (production model
 *   data: { model, materials, attach } — see SL.Wardrobe.modelDef).
 *   An outfit whose look has its own `armor` (Yardrat's vest) keeps it: the armor slot only owns
 *   the armor of outfits that take armor.
 *
 * PROFILE fields (per character)
 *   default     the look outside the story (Free Battle, Training, menus) until the player picks
 *   canonByEra  the look the canon story uses in each era; an era not listed inherits the one
 *               before it. The story never reads the player's choice.
 *
 * Every visual here is a Level 1 FUNCTIONAL PROTOTYPE made of procedural parts. Nothing is a
 * production asset. Colours marked accuracy 'approximate' are the builder's best reading and
 * are waiting for the owner's reference check.
 */
(function () {
  'use strict';

  // Goku's gi: the cut shared by every orange gi, and the era shades a gi can be worn in
  const GI = {
    topStyle: 'gi', top: 0xf57b22, under: 0x1f3d9e, sleeves: 'short', sleeveColor: 0x1f3d9e,
    wrist: 0x1f3d9e, belt: 0x1f3d9e, pants: 0xf57b22, pantsStyle: 'gi',
    boots: 0x1d2f7a, bootTrim: 0xf1c64a, bootStyle: 'gi',
  };
  // intentional colour variants, taken from the eras themselves (never random recolours)
  const GI_PALETTES = {
    namek: { name: 'Namek Shade', look: { top: 0xfb8c34, pants: 0xfb8c34, under: 0x2a4aa8, sleeveColor: 0x2a4aa8, wrist: 0x2a4aa8, belt: 0x2a4aa8 } },
    buu: { name: 'Buu Shade', look: { top: 0xf2741c, pants: 0xf2741c, under: 0x16225a, sleeveColor: 0x16225a, wrist: 0x16225a, belt: 0x1a2a6a } },
    super: { name: 'Super Shade', look: { top: 0xf88a2a, pants: 0xf88a2a, under: 0x1c3a9a, sleeveColor: 0x1c3a9a, wrist: 0x1c3a9a, belt: 0x1c3a9a } },
  };
  // Vegeta's bodysuits, and the suit colours of his eras
  const SUIT = {
    topStyle: 'armor', top: 0x1f3380, arms: 0xf3c7a0, pants: 0x1f3380, pantsStyle: 'tight',
    gloves: 0xf7f6f0, boots: 0xf7f6f0, bootTip: 0xd2a84a, bootStyle: 'saiyan',
  };
  const SUIT_PALETTES = {
    saiyan: { name: 'Saiyan Blue', look: { top: 0x1f3380, pants: 0x1f3380 } },
    buu: { name: 'Buu Indigo', look: { top: 0x2b2d74, pants: 0x2b2d74 } },
    super: { name: 'Super Charcoal', look: { top: 0x3a3d48, pants: 0x3a3d48 } },
  };
  const WHITE = 0xf5f2e6, GOLD = 0xe2b84a;

  /*
   * CLOTHING DAMAGE, per outfit (Model.setDamage; levels 0 intact · 1 damaged · 2 heavily damaged ·
   * 3 torn). Each costume tears its own way; nothing here is shared between two outfits.
   * at/y/t/ang/w/h place a rip on the body (ang: radians round it, + = his left), fill is what
   * shows through, level/until when it is there. tearAt: when the gi itself comes off.
   */
  // Goku, Buu Saga gi: the orange tears first and shows the navy undershirt; the pants go at the
  // thighs and shins; at the end the gi top is gone and the undershirt itself is torn to the skin
  const DAMAGE_GOKU_BUU = {
    tearAt: 3,
    rips: [
      { at: 'chest', y: 0.2, ang: 0.5, w: 0.45, h: 0.07, fill: 'under', level: 1, until: 2 },
      { at: 'thighR', t: 0.5, ang: 0.2, w: 0.8, h: 0.09, fill: 'skin', level: 1 },
      { at: 'spine', y: 0.12, ang: -0.6, w: 0.55, h: 0.08, fill: 'under', level: 2, until: 2 },
      { at: 'chest', y: 0.1, ang: -0.4, w: 0.5, h: 0.08, fill: 'under', level: 2, until: 2 },
      { at: 'kneeL', t: 0.35, ang: 0.3, w: 1.0, h: 0.09, fill: 'skin', level: 2 },
      { at: 'thighL', t: 0.3, ang: -0.8, w: 0.7, h: 0.08, fill: 'skin', level: 2 },
      { at: 'chest', y: 0.18, ang: -0.3, w: 0.6, h: 0.09, fill: 'skin', cloth: 0x16225a, level: 3 },
      { at: 'spine', y: 0.08, ang: 0.45, w: 0.55, h: 0.08, fill: 'skin', cloth: 0x16225a, level: 3 },
      { at: 'kneeR', t: 0.5, ang: -0.4, w: 1.1, h: 0.1, fill: 'skin', level: 3 },
    ],
  };
  // Vegeta, Buu Saga suit: there is no gi to lose — the fabric itself splits to the skin, a glove
  // goes, and by the end the suit is more tear than suit
  const DAMAGE_VEGETA_BUU = {
    tearAt: 3,
    rips: [
      { at: 'chest', y: 0.22, ang: 0.6, w: 0.4, h: 0.06, fill: 'skin', level: 1 },
      { at: 'thighL', t: 0.45, ang: 0.4, w: 0.7, h: 0.08, fill: 'skin', level: 1 },
      { at: 'spine', y: 0.1, ang: -0.4, w: 0.5, h: 0.08, fill: 'skin', level: 2 },
      { at: 'kneeR', t: 0.4, ang: 0, w: 0.9, h: 0.08, fill: 'skin', level: 2 },
      { at: 'elbowL', t: 0.55, ang: 0.8, w: 1.4, h: 0.07, fill: 'skin', cloth: 0xf7f6f0, level: 2 },
      { at: 'chest', y: 0.14, ang: -0.2, w: 0.9, h: 0.12, fill: 'skin', level: 3 },
      { at: 'spine', y: 0.14, ang: 0.3, w: 0.8, h: 0.1, fill: 'skin', level: 3 },
      { at: 'thighR', t: 0.3, ang: -0.3, w: 1.2, h: 0.12, fill: 'skin', level: 3 },
      { at: 'kneeL', t: 0.55, ang: 0.4, w: 1.2, h: 0.1, fill: 'skin', level: 3 },
      // (2026-09-25) the last stage reads from across the ruin: the right glove shredded to the wrist,
      // the suit split over the left shoulder
      { at: 'elbowR', t: 0.62, ang: 0, w: 2.4, h: 0.1, fill: 'skin', cloth: 0xf7f6f0, level: 3 },
      { at: 'chest', y: 0.27, ang: 1.0, w: 0.55, h: 0.08, fill: 'skin', level: 3 },
      // and the back goes too (he is seen from behind in the ruin)
      { at: 'chest', y: 0.16, ang: 2.9, w: 0.55, h: 0.07, fill: 'skin', level: 2 },
      { at: 'spine', y: 0.12, ang: 3.0, w: 0.9, h: 0.11, fill: 'skin', level: 3 },
      { at: 'chest', y: 0.22, ang: -2.5, w: 0.6, h: 0.09, fill: 'skin', level: 3 },
      { at: 'thighL', t: 0.4, ang: 3.0, w: 1.0, h: 0.1, fill: 'skin', level: 3 },
    ],
  };

  // Gohan's Ultimate gi (the orange one): the orange tears to the navy undershirt, then the undershirt
  // itself; his own places, not his father's
  const DAMAGE_GOHAN_ULTIMATE = {
    tearAt: 3,
    rips: [
      { at: 'chest', y: 0.16, ang: -0.55, w: 0.42, h: 0.07, fill: 'under', level: 1, until: 2 },
      { at: 'thighL', t: 0.45, ang: 0.3, w: 0.8, h: 0.09, fill: 'skin', level: 1 },
      { at: 'chest', y: 0.24, ang: 0.4, w: 0.5, h: 0.07, fill: 'under', level: 2, until: 2 },
      { at: 'spine', y: 0.1, ang: 0.5, w: 0.55, h: 0.08, fill: 'under', level: 2, until: 2 },
      { at: 'kneeR', t: 0.35, ang: -0.3, w: 1.0, h: 0.09, fill: 'skin', level: 2 },
      { at: 'chest', y: 0.14, ang: 0.35, w: 0.7, h: 0.1, fill: 'skin', cloth: 0x16225a, level: 3 },
      { at: 'spine', y: 0.1, ang: -0.6, w: 0.55, h: 0.08, fill: 'skin', cloth: 0x16225a, level: 3 },
      { at: 'thighR', t: 0.35, ang: -0.6, w: 1.1, h: 0.11, fill: 'skin', level: 3 },
    ],
  };
  // Gohan's school clothes: the trousers and a sleeve go (the vest covers the shirt)
  const DAMAGE_GOHAN_SCHOOL = {
    tearAt: 9,
    rips: [
      { at: 'kneeL', t: 0.4, ang: 0.2, w: 0.9, h: 0.08, fill: 'skin', level: 1 },
      { at: 'elbowR', t: 0.4, ang: 0.5, w: 1.1, h: 0.07, fill: 'skin', level: 2 },
      { at: 'thighR', t: 0.45, ang: -0.4, w: 0.9, h: 0.09, fill: 'skin', level: 3 },
    ],
  };
  // Videl's T-shirt and shorts: scuffs and tears at the back and the shoulder, the shorts at the
  // thigh — the shirt never comes off (no tear level)
  const DAMAGE_VIDEL = {
    tearAt: 9,
    rips: [
      { at: 'thighR', t: 0.35, ang: 0.3, w: 0.7, h: 0.06, fill: 'skin', level: 1 },
      { at: 'spine', y: 0.06, ang: 2.8, w: 0.5, h: 0.06, fill: 'skin', level: 1 },
      { at: 'thighL', t: 0.45, ang: -0.5, w: 0.8, h: 0.07, fill: 'skin', level: 2 },
      { at: 'chest', y: 0.28, ang: 1.25, w: 0.35, h: 0.05, fill: 'skin', level: 2 },
      { at: 'spine', y: 0.12, ang: -2.6, w: 0.6, h: 0.07, fill: 'skin', level: 3 },
      { at: 'thighR', t: 0.62, ang: -0.8, w: 0.9, h: 0.08, fill: 'skin', level: 3 },
    ],
  };
  // her Super-era clothes: the top at the shoulder and the back, the leggings at the knee
  const DAMAGE_VIDEL_SUPER = {
    tearAt: 9,
    rips: [
      { at: 'kneeL', t: 0.3, ang: 0.2, w: 0.9, h: 0.07, fill: 'skin', level: 1 },
      { at: 'spine', y: 0.1, ang: 2.7, w: 0.5, h: 0.06, fill: 'skin', level: 2 },
      { at: 'thighR', t: 0.5, ang: -0.3, w: 0.8, h: 0.08, fill: 'skin', level: 3 },
    ],
  };

  const pieces = {
    /* ================= GOKU: outfits ================= */
    goku_early: {
      slot: 'outfit', name: 'Early Adventure', chars: ['goku'], era: 'early', kind: 'canon', canon: true,
      status: 'planned', needs: 'a young Goku body (Original Dragon Ball chronology pass)', body: 'young',
      look: { topStyle: 'gi', top: 0x2a4aa8, sleeves: 'none', pants: 0x2a4aa8, pantsStyle: 'gi', belt: 0xf2f0e8, wrist: 0xf2f0e8, boots: 0x5a3a28, bootStyle: 'shoe' },
    },
    goku_turtle_young: {
      slot: 'outfit', name: 'Turtle School (Young)', chars: ['goku'], era: 'turtle', kind: 'canon', canon: true,
      status: 'planned', needs: 'a young Goku body (Original Dragon Ball chronology pass)', body: 'young',
      base: 'goku_saiyan', look: { under: null, sleeves: 'none', wrist: 0x1f3d9e }, defaults: { emblem: 'emblem_kame' },
    },
    goku_tenkaichi23: {
      slot: 'outfit', name: 'Tournament Gi', chars: ['goku'], era: 'tenkaichi23', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: Object.assign({}, GI, { under: 0x1a2f7e, sleeveColor: 0x1a2f7e, wrist: 0x1a2660, belt: 0x1a2660, boots: 0x1d2a6e, bootTrim: 0xc0282a }),
      defaults: { emblem: 'emblem_kame' }, emblemOk: true, palettes: GI_PALETTES,
    },
    goku_saiyan: {
      slot: 'outfit', name: 'Turtle School Gi', chars: ['goku'], era: 'saiyan', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: Object.assign({}, GI),
      defaults: { emblem: 'emblem_kame' }, emblemOk: true, palettes: GI_PALETTES,
    },
    goku_namek: {
      slot: 'outfit', name: 'Namek Battle Gi', chars: ['goku'], era: 'namek', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'namek_aftermath' },
      // lighter orange, and when the fight takes the gi the blue undershirt is what is left
      look: Object.assign({}, GI, GI_PALETTES.namek.look, { torn: { chest: 'skin', trap: 0x2a4aa8, abs: 0x2a4aa8, keepSleeve: 'L' } }),
      defaults: { emblem: 'emblem_go' }, emblemOk: true, palettes: GI_PALETTES,
    },
    goku_yardrat: {
      slot: 'outfit', name: 'Yardrat Clothes', chars: ['goku'], era: 'android_arrival', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'android_warning' },
      look: {
        topStyle: 'vest', top: 0xf3f1f6, arms: 0xf3f1f6, sleeves: 'long', sleeveColor: 0xf3f1f6, sleeveBulk: 1.32, wrist: 0xb08a3a,
        armor: { plate: 0x1d2a5e, belly: 0x1d2a5e, pads: 0x1d2a5e, padStyle: 'flap', trim: 0xe6c84a },
        collar: 0xcab8e4, collarStyle: 'ruff',
        belt: 0xf3f1f6, beltStyle: 'sash',
        pants: 0xa81e2a, pantsStyle: 'gi', boots: 0x1d2a5e, bootStyle: 'gi',
      },
    },
    goku_cell: {
      slot: 'outfit', name: 'Symbol-less Gi', chars: ['goku'], era: 'android', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'android_nineteen' },
      // no kanji, and a deeper, wider undershirt neck
      base: 'goku_saiyan', look: { neck: 1.35 },
      defaults: {}, emblemOk: true, palettes: GI_PALETTES,
    },
    goku_htc: {
      slot: 'outfit', name: 'Saiyan Armor (Time Chamber)', chars: ['goku'], era: 'android', kind: 'training', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'cell_perfect' },
      look: Object.assign({}, SUIT, { top: 0x243c96, pants: 0x243c96, arms: 0xf6c49a }),
      defaults: { armor: 'armor_goku_htc' }, armorOk: true, palettes: SUIT_PALETTES,
    },
    goku_cell_casual: {
      slot: 'outfit', name: '"59" Jacket', chars: ['goku'], era: 'android', kind: 'casual', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'cell_games' },
      look: {
        topStyle: 'jacket', top: 0xf2f0ea, jacket: { color: 0xf07a1e, collar: 0x1c1c22 },
        sleeves: 'long', sleeveColor: 0x1c1c22, sleeveBulk: 1.14,
        pants: 0xa8d27a, pantsStyle: 'slacks', belt: 0x6a4a26, beltStyle: 'belt', buckle: 0xe0b84a,
        boots: 0x3a2a24, bootStyle: 'shoe',
        emblem: { front: null, back: null, sleeve: '59', fg: '#b01e24', bg: '#f4f2ec' },
      },
    },
    goku_buu: {
      slot: 'outfit', name: 'Buu Saga Gi', chars: ['goku'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'buu_years' },
      // deeper V-neck, dark navy undershirt, dark blue sash, blue boots
      // damaged: its own rips; torn: the gi top goes and the navy undershirt is what is left
      base: 'goku_saiyan', look: Object.assign({}, GI_PALETTES.buu.look, { neck: 1.55, boots: 0x2a44a8, damage: DAMAGE_GOKU_BUU, torn: { chest: 0x16225a, trap: 0x16225a, abs: 0x16225a, keepSleeve: 'both' } }),
      defaults: {}, emblemOk: true, palettes: GI_PALETTES,
    },
    goku_whis: {
      slot: 'outfit', name: 'Whis Gi', chars: ['goku'], era: 'super', kind: 'canon', canon: true, accuracy: 'reference',
      // provisional: no Super chapter exists yet, so it opens at the end of this build's story
      status: 'prototype', unlock: { missionComplete: 'buu_majin' },
      base: 'goku_saiyan', look: Object.assign({}, GI_PALETTES.super.look, { boots: 0x1c3a9a }),
      defaults: { emblem: 'emblem_whis' }, emblemOk: true, palettes: GI_PALETTES,
    },
    goku_end_z: {
      slot: 'outfit', name: 'End of Z', chars: ['goku'], era: 'end_z', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'buu_majin' },
      look: { topStyle: 'gi', top: 0x2fb3b0, under: 0x2fb3b0, sleeves: 'none', wrist: 0x1c3a9a, belt: 0xf0c43a, pants: 0x2f4a2a, pantsStyle: 'gi', boots: 0x6a4a2a, bootStyle: 'shoe' },
    },
    goku_broly_winter: {
      slot: 'outfit', name: 'Winter Clothes (Movie)', chars: ['goku'], era: 'super', kind: 'movie', canon: true,
      status: 'planned', needs: 'the movie chapter and a coat silhouette (movies are separate content)',
    },

    /* ================= VEGETA: outfits ================= */
    vegeta_saiyan: {
      slot: 'outfit', name: 'Saiyan Armor', chars: ['vegeta'], era: 'saiyan', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: Object.assign({}, SUIT),
      defaults: { armor: 'armor_v_saiyan', scouter: 'scouter_red', tail: 'tail_saiyan' }, armorOk: true, palettes: SUIT_PALETTES,
    },
    vegeta_namek_early: {
      slot: 'outfit', name: 'Namek Armor', chars: ['vegeta'], era: 'namek', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'namek_vegeta' },
      look: Object.assign({}, SUIT),
      defaults: { armor: 'armor_v_namek', scouter: 'scouter_red' }, armorOk: true, palettes: SUIT_PALETTES,
    },
    vegeta_namek_late: {
      slot: 'outfit', name: 'Frieza Force Armor', chars: ['vegeta'], era: 'namek_late', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'namek_rematch' },
      look: Object.assign({}, SUIT),
      defaults: { armor: 'armor_v_frieza' }, armorOk: true, palettes: SUIT_PALETTES,
    },
    vegeta_badman: {
      slot: 'outfit', name: '"Badman" Shirt', chars: ['vegeta'], era: 'android_arrival', kind: 'casual', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'android_trunks' },
      look: {
        topStyle: 'shirt', top: 0xf2a0c4, sleeves: 'short', sleeveColor: 0xf2a0c4, arms: 0xf3c7a0, collar: 0xf2a0c4, collarStyle: 'shirt',
        pants: 0xe8cf6a, pantsStyle: 'slacks', belt: 0x4a3020, beltStyle: 'belt', boots: 0x5a3a28, bootStyle: 'shoe',
        emblem: { front: null, back: 'BADMAN', fg: '#c0204a', bg: 'rgba(0,0,0,0)' },
      },
    },
    vegeta_capsule: {
      slot: 'outfit', name: 'Capsule Corp Armor', chars: ['vegeta'], era: 'android', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'android_nineteen' },
      look: Object.assign({}, SUIT, { top: 0x243c96, pants: 0x243c96, bootTip: null }),
      defaults: { armor: 'armor_v_capsule' }, armorOk: true, palettes: SUIT_PALETTES,
    },
    vegeta_buu: {
      slot: 'outfit', name: 'Buu Saga Suit', chars: ['vegeta'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'buu_years' },
      // no chest armor at all: the suit is the outfit
      look: Object.assign({}, SUIT, SUIT_PALETTES.buu.look, { damage: DAMAGE_VEGETA_BUU }),
      armorOk: true, palettes: SUIT_PALETTES,
    },
    vegeta_whis: {
      slot: 'outfit', name: 'Whis Armor', chars: ['vegeta'], era: 'super', kind: 'canon', canon: true, accuracy: 'reference',
      // provisional: no Super chapter exists yet, so it opens at the end of this build's story
      status: 'prototype', unlock: { missionComplete: 'buu_majin' },
      look: Object.assign({}, SUIT, SUIT_PALETTES.super.look),
      defaults: { armor: 'armor_v_whis', emblem: 'emblem_whis' }, armorOk: true, emblemOk: true, palettes: SUIT_PALETTES,
    },
    vegeta_broly: {
      slot: 'outfit', name: 'Movie Armor (Broly)', chars: ['vegeta'], era: 'super', kind: 'movie', canon: true,
      status: 'planned', needs: 'the movie chapter (movies are separate content)',
    },
    vegeta_gt: {
      slot: 'outfit', name: 'GT Clothes', chars: ['vegeta'], era: 'end_z', kind: 'gt', canon: false,
      status: 'planned', needs: 'a decision on GT content',
    },

    /* ================= BARDOCK: outfits ================= */
    // classic / Z (the TV special): dark suit under dark armor with green belly segments and green
    // shoulder straps, long red wrist guards, the red headband and band on the leg, the scar, the
    // tail wrapped round the waist
    bardock_classic: {
      slot: 'outfit', name: 'Battle Armor', chars: ['bardock'], era: 'prologue', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: {
        topStyle: 'armor', top: 0x1d2027, arms: 0xdca57c, pants: 0x1d2027, pantsStyle: 'tight',
        wrist: 0xa01c1c, wristLen: 0.13, legBands: 0xa01c1c, boots: 0xeeebe0, bootTip: 0x3f6b35, bootStyle: 'saiyan', headband: 0xc01818,
      },
      defaults: { armor: 'armor_bardock', scouter: 'scouter_green', tail: 'tail_saiyan' },
      armors: ['armor_bardock', 'armor_bardock_movie'],
    },
    // the classic armor as the last stand leaves it (the damaged look belongs to the classic family,
    // so it takes the classic armor only); the story still breaks it for real in the ending
    bardock_damaged: {
      slot: 'outfit', name: 'Battle-Damaged', chars: ['bardock'], era: 'prologue', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'prologue_final_stand' },
      base: 'bardock_classic', look: { armorDamage: 1, worn: true },
      armors: ['armor_bardock'],
    },
    // the Super / movie armor worn over his classic self (headband, scar, red guards): an alternate
    bardock_movie: {
      slot: 'outfit', name: 'Classic, Movie Armor', chars: ['bardock'], era: 'super', kind: 'movie', canon: false, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'prologue_final_stand' },
      base: 'bardock_classic',
      defaults: { armor: 'armor_bardock_movie', scouter: 'scouter_green', tail: 'tail_saiyan' },
    },
    // Super (the Broly movie design): big shoulder flaps and long hip guards in olive, a grey chest,
    // blue suit legs and blue wrist guards, white boots, no headband, no scar, the tail wrapped round
    // the waist, no scouter
    bardock_super: {
      slot: 'outfit', name: 'Super / Broly Movie', chars: ['bardock'], era: 'super', kind: 'movie', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'prologue_final_stand' },
      look: {
        topStyle: 'armor', top: 0x2c469c, arms: 0xdca57c, pants: 0x2c469c, pantsStyle: 'tight',
        wrist: 0x2f4ca8, wristLen: 0.14, boots: 0xf2f0ea, bootStyle: 'saiyan',
      },
      face: { scar: false },
      defaults: { armor: 'armor_bardock_movie', scouter: 'none', tail: 'tail_saiyan' },
      armors: ['armor_bardock_movie', 'armor_bardock'],
    },

    /* ================= FUTURE TRUNKS: outfits (owner's reference sheet, 2026-09-24) ================= */
    // the arrival look: cropped Capsule Corp jacket over a black tank, charcoal trousers, yellow
    // boots, the teal sword strap and the scabbard on his back (the character file holds the data)
    ft_capsule: {
      slot: 'outfit', name: 'Capsule Corp Jacket', chars: ['future_trunks'], era: 'android_arrival', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: Object.assign({}, SL.data.characters.future_trunks.appearance.outfit),
    },
    // the same clothes after a hard fight: rips in the trousers, the sleeves and the tank top
    ft_capsule_worn: {
      slot: 'outfit', name: 'Battle-Worn', chars: ['future_trunks'], era: 'android', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'android_trunks' },
      base: 'ft_capsule', look: { startDamage: 2 },
    },
    // torn: the jacket is gone, the tank top and the trousers ripped
    ft_capsule_torn: {
      slot: 'outfit', name: 'Torn (No Jacket)', chars: ['future_trunks'], era: 'android', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'android_trunks' },
      base: 'ft_capsule', look: { startDamage: 3 },
    },
    // the jacket without the sword on his back (the sword/no-sword rule: noSword drops both props)
    ft_capsule_unarmed: {
      slot: 'outfit', name: 'Jacket, No Sword', chars: ['future_trunks'], era: 'android_arrival', kind: 'casual', canon: false, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'android_warning' },
      base: 'ft_capsule', look: { noSword: true },
    },
    ft_armor: {
      slot: 'outfit', name: 'Saiyan Armor (Cell Saga)', chars: ['future_trunks'], era: 'android', kind: 'canon', canon: true,
      status: 'planned', needs: 'the Cell Saga look: his hair grown out after the Time Chamber, and Capsule Corp armor fitted to him',
    },
    ft_bojack: {
      slot: 'outfit', name: 'Sleeveless Jacket (Movie)', chars: ['future_trunks'], era: 'android', kind: 'movie', canon: true,
      status: 'planned', needs: 'the movie chapter (movies are separate content)',
    },
    ft_super: {
      slot: 'outfit', name: 'Long Coat (Super)', chars: ['future_trunks'], era: 'super', kind: 'canon', canon: true,
      status: 'planned', needs: 'the Future Trunks arc of Super: the long coat and the older hair',
    },

    /* ================= ADULT GOHAN (Buu Saga): outfits (owner's reference sheet, 2026-09-25) ================= */
    // the tournament gi, Piccolo's cut: indigo with a V-neck, short sleeves, red sash and wristbands,
    // brown boots (the character file holds the data)
    ag_tournament: {
      slot: 'outfit', name: 'Tournament Gi', chars: ['adult_gohan'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: Object.assign({}, SL.data.characters.adult_gohan.appearance.outfit),
    },
    // his first day at Orange Star High: white shirt, black vest and trousers, shoes
    ag_school: {
      slot: 'outfit', name: 'Orange Star High', chars: ['adult_gohan'], era: 'buu', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'buu_years' },
      look: {
        topStyle: 'shirt', top: 0xf6f6f2, sleeves: 'long', sleeveColor: 0xf6f6f2, collar: 0xf6f6f2,
        jacket: { color: 0x1c1c24, open: 1.25 }, pants: 0x1c1c24, pantsStyle: 'tight', boots: 0x2a2220, bootStyle: 'shoe',
        damage: DAMAGE_GOHAN_SCHOOL,
      },
    },
    // Ultimate Gohan (after the Old Kai): the orange gi over the navy undershirt, the hair held down.
    // (2026-09-26, owner's reference sheet) a DARKER orange than his father's, so the two are not
    // one silhouette in two sizes when they stand side by side in "The Earring"
    ag_ultimate: {
      slot: 'outfit', name: 'Ultimate Gi', chars: ['adult_gohan'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'buu_ssj3' },
      look: Object.assign({}, GI, GI_PALETTES.buu.look, { top: 0xd2581a, pants: 0xd2581a, under: 0x141c4a, sleeveColor: 0x141c4a, wrist: 0x141c4a, belt: 0x141c4a, damage: DAMAGE_GOHAN_ULTIMATE, torn: { chest: 0x141c4a, trap: 0x141c4a, abs: 0x141c4a } }),
      defaults: { hair: 'hair_gohan_ultimate' },
    },
    ag_super_hero: {
      slot: 'outfit', name: 'Super Hero Gi', chars: ['adult_gohan'], era: 'super', kind: 'movie', canon: true,
      status: 'planned', needs: 'the Super Hero chapter: Gohan at thirty, the heavier cut of the gi, the glasses',
    },

    /* ================= VIDEL: outfits (owner's reference sheet, 2026-09-25) ================= */
    // Satan City: the oversized white T-shirt out over black bike shorts, dark fingerless gloves,
    // green boots with purple socks (the character file holds the data)
    videl_tee: {
      slot: 'outfit', name: 'Satan City', chars: ['videl'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: Object.assign({}, SL.data.characters.videl.appearance.outfit, { damage: DAMAGE_VIDEL }),
    },
    // after the haircut: the same clothes, the sleeves purple, yellow boots (the tournament)
    videl_tournament: {
      slot: 'outfit', name: 'Tournament', chars: ['videl'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'buu_flight' }, base: 'videl_tee',
      look: { sleeveColor: 0x7a4aa6, boots: 0xe8c43a, bootTrim: null },
      defaults: { hair: 'hair_videl_short' },
    },
    // years later (Dragon Ball Super): the red sleeveless turtleneck, a belt with a gold ring, black
    // leggings, white boots, blue wristbands, a red headband. Provisional unlock (no Super chapter yet)
    videl_super: {
      slot: 'outfit', name: 'Super', chars: ['videl'], era: 'super', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'buu_ssj3' },
      look: {
        topStyle: 'shirt', top: 0xd02a30, sleeves: 'none', collar: 0xd02a30, collarStyle: 'turtle',
        belt: 0x1a1a1e, beltStyle: 'belt', buckle: 0xe0b83a, pants: 0x18181e, pantsStyle: 'tight', legs: 0x18181e,
        wrist: 0x3a8ad8, headband: 0xd02a30, boots: 0xf4f4f0, bootStyle: 'saiyan',
        damage: DAMAGE_VIDEL_SUPER,
      },
      defaults: { hair: 'hair_videl_bob' },
    },
    videl_super_hero: {
      slot: 'outfit', name: 'Super Hero Dress', chars: ['videl'], era: 'super', kind: 'movie', canon: true,
      status: 'planned', needs: 'the Super Hero chapter, and a long flared skirt the procedural builder cannot make yet',
    },

    /* ================= hair ================= */
    hair_gohan_ultimate: {
      slot: 'hair', name: 'Ultimate', chars: ['adult_gohan'], era: 'buu', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'buu_ssj3' }, look: { style: 'gohan_ultimate', color: 0x141418 },
    },
    hair_videl_tails: {
      slot: 'hair', name: 'Pigtails', chars: ['videl'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', look: { style: 'videl', color: 0x14141c },
    },
    hair_videl_short: {
      slot: 'hair', name: 'Short Cut', chars: ['videl'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'buu_flight' }, look: { style: 'videl_short', color: 0x14141c },
    },
    hair_videl_bob: {
      slot: 'hair', name: 'Bob', chars: ['videl'], era: 'super', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'buu_ssj3' }, look: { style: 'videl_bob', color: 0x14141c },
    },

    /* ================= armor ================= */
    armor_v_saiyan: {
      slot: 'armor', name: 'Saiyan Saga', chars: ['vegeta', 'goku'], era: 'saiyan', kind: 'canon', canon: true, status: 'prototype',
      // white chest, yellow stomach segments, brown shoulder flaps, long hip guards
      look: { plate: WHITE, belly: GOLD, pads: 0x8a5a2a, padStyle: 'up', hipGuards: 0x8a5a2a, hipStyle: 'long', trim: GOLD },
    },
    armor_v_namek: {
      slot: 'armor', name: 'Stripped (Namek)', chars: ['vegeta', 'goku'], era: 'namek', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'namek_vegeta' },
      look: { plate: WHITE, belly: GOLD, pads: 0xd2a84a, padStyle: 'up', trim: GOLD },
    },
    armor_v_frieza: {
      slot: 'armor', name: 'Frieza Force', chars: ['vegeta', 'goku'], era: 'namek_late', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'namek_rematch' },
      look: { plate: WHITE, belly: WHITE, pads: GOLD, padStyle: 'strap', trim: GOLD },
    },
    armor_v_capsule: {
      slot: 'armor', name: 'Capsule Corp', chars: ['vegeta', 'goku'], era: 'android', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'android_nineteen' },
      look: { plate: WHITE, belly: WHITE, pads: GOLD, padStyle: 'strap' },
    },
    armor_goku_htc: {
      slot: 'armor', name: 'Time Chamber', chars: ['goku', 'vegeta'], era: 'android', kind: 'training', canon: true, accuracy: 'approximate', status: 'prototype',
      unlock: { missionComplete: 'cell_perfect' },
      look: { plate: WHITE, belly: WHITE, pads: GOLD, padStyle: 'up', trim: GOLD },
    },
    armor_v_whis: {
      slot: 'armor', name: 'Whis', chars: ['vegeta', 'goku'], era: 'super', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'buu_majin' },
      look: { plate: WHITE, belly: WHITE, pads: 0xd8b24a, padStyle: 'strap', trim: 0xd8b24a },
    },
    armor_bardock: {
      slot: 'armor', name: 'Classic', chars: ['bardock'], era: 'prologue', kind: 'canon', canon: true, accuracy: 'reference', status: 'prototype',
      // straps over the shoulders, not flaps (the flaps are the later armor's)
      look: { plate: 0x1f2530, belly: 0x3f6b35, pads: 0x3f6b35, padStyle: 'strap', padScale: 1.7, hipGuards: 0x3f6b35, trim: 0x3f6b35 },
    },
    armor_bardock_movie: {
      slot: 'armor', name: 'Super / Movie', chars: ['bardock'], era: 'super', kind: 'movie', canon: true, accuracy: 'reference', status: 'prototype',
      unlock: { missionComplete: 'prologue_final_stand' },
      look: { plate: 0x3c3f47, belly: 0xb3ae5c, pads: 0xa4a153, padStyle: 'flap', hipGuards: 0xa4a153, hipStyle: 'long', trim: 0xa4a153 },
    },

    /* ================= emblems (a gi's marks: front / back) ================= */
    emblem_kame: {
      slot: 'emblem', name: '亀', chars: ['goku'], era: 'turtle', kind: 'canon', canon: true, status: 'prototype',
      look: { front: '亀', back: '亀' },
    },
    emblem_kaio: {
      slot: 'emblem', name: '界王', chars: ['goku'], era: 'saiyan_return', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'saiyan_kingkai' },
      look: { front: '亀', back: '界\n王' },
    },
    emblem_go: {
      slot: 'emblem', name: '悟', chars: ['goku'], era: 'namek', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'namek_goku' },
      look: { front: '悟', back: '界\n王' },
    },
    emblem_whis: {
      slot: 'emblem', name: 'Whis', chars: ['goku', 'vegeta'], era: 'super', kind: 'canon', canon: true, accuracy: 'approximate', status: 'prototype',
      unlock: { missionComplete: 'buu_majin' },
      look: { front: '@whis', back: '@whis', fg: '#1a2450' },
    },

    /* ================= accessories ================= */
    scouter_red: {
      slot: 'scouter', name: 'Red Scouter', chars: ['vegeta', 'goku', 'bardock'], era: 'saiyan', kind: 'canon', canon: true, status: 'prototype',
      look: { lens: 0xff3a3a, body: 0xe2e2e2 },
    },
    scouter_green: {
      slot: 'scouter', name: 'Green Scouter', chars: ['vegeta', 'goku', 'bardock'], era: 'prologue', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'saiyan_brothers' },
      look: { lens: 0x3cff78, body: 0xd8d8d8 },
    },
    scouter_blue: {
      slot: 'scouter', name: 'Blue Scouter', chars: ['vegeta', 'goku', 'bardock'], era: 'namek', kind: 'canon', canon: true, status: 'prototype',
      unlock: { missionComplete: 'namek_vegeta' },
      look: { lens: 0x3a8aff, body: 0xe2e2e2 },
    },
    // 'auto': the character's own tail colour (appearance.outfit.tail), else brown.
    // style 'wrapped' leaves the lower back and wraps round the waist; 'free' hangs and curls.
    tail_saiyan: {
      slot: 'tail', name: 'Saiyan Tail', chars: ['vegeta', 'goku', 'bardock'], era: 'prologue', kind: 'canon', canon: true, status: 'prototype',
      look: { color: 'auto', style: 'wrapped' },
    },
    tail_saiyan_free: {
      slot: 'tail', name: 'Saiyan Tail (Loose)', chars: ['vegeta', 'goku', 'bardock'], era: 'prologue', kind: 'canon', canon: true, status: 'prototype',
      look: { color: 'auto', style: 'free' },
    },

    /* ================= test mannequin (developer only): the .glb route ================= */
    dummy_default: { slot: 'outfit', name: 'Mannequin', chars: ['test_dummy'], era: 'super', kind: 'event', status: 'prototype', look: {} },
    dummy_orange: {
      slot: 'outfit', name: 'Mannequin (Orange Body)', chars: ['test_dummy'], era: 'super', kind: 'event', status: 'prototype', look: {},
      // an outfit for an imported body: a material override by name, and a mesh on a joint socket
      glb: { materials: { Body: { color: 0xf57b22 } }, attach: [{ asset: 'test_dummy', joint: 'head', pos: [0, 0.3, 0], scale: 0.2 }] },
    },
  };

  const profiles = {
    goku: {
      default: { outfit: 'goku_saiyan', emblem: 'emblem_kame' },
      canonByEra: {
        saiyan: { outfit: 'goku_saiyan', emblem: 'emblem_kame' },
        saiyan_return: { outfit: 'goku_saiyan', emblem: 'emblem_kaio' },
        namek: { outfit: 'goku_namek', emblem: 'emblem_go' },
        android_arrival: { outfit: 'goku_yardrat' },
        android: { outfit: 'goku_cell', emblem: 'none' },
        buu: { outfit: 'goku_buu', emblem: 'none' },
      },
    },
    vegeta: {
      default: { outfit: 'vegeta_saiyan' },
      canonByEra: {
        saiyan: { outfit: 'vegeta_saiyan', armor: 'armor_v_saiyan', scouter: 'scouter_red', tail: 'tail_saiyan' },
        namek: { outfit: 'vegeta_namek_early', armor: 'armor_v_namek', scouter: 'scouter_red', tail: 'none' },
        namek_late: { outfit: 'vegeta_namek_late', armor: 'armor_v_frieza', scouter: 'none', tail: 'none' },
        android_arrival: { outfit: 'vegeta_badman', armor: 'none', scouter: 'none', tail: 'none' },
        android: { outfit: 'vegeta_capsule', armor: 'armor_v_capsule', scouter: 'none', tail: 'none' },
        buu: { outfit: 'vegeta_buu', armor: 'none', scouter: 'none', tail: 'none' },
      },
    },
    bardock: {
      default: { outfit: 'bardock_classic' },
      canonByEra: {
        prologue: { outfit: 'bardock_classic', armor: 'armor_bardock', scouter: 'scouter_green', tail: 'tail_saiyan' },
      },
    },
    future_trunks: {
      default: { outfit: 'ft_capsule' },
      // the story dresses him in the arrival look everywhere it has him so far (the Cell Saga armor
      // is planned: ft_armor)
      canonByEra: {
        android_arrival: { outfit: 'ft_capsule' },
      },
    },
    // (2026-09-25) Gohan at seventeen: the tournament gi is the Buu Saga's look; the first day at
    // school is a mission override (buu_years)
    adult_gohan: {
      default: { outfit: 'ag_tournament' },
      canonByEra: { buu: { outfit: 'ag_tournament' } },
    },
    // Videl: the T-shirt and the tails; after the haircut (buu_flight, the tournament) the missions
    // override it with the tournament look
    videl: {
      default: { outfit: 'videl_tee' },
      canonByEra: { buu: { outfit: 'videl_tee' } },
    },
    test_dummy: { default: { outfit: 'dummy_default' }, canonByEra: {}, devOnly: true },
  };

  SL.data.wardrobe = {
    slots: [
      { id: 'outfit', name: 'Outfit', icon: 'outfit', required: true },
      { id: 'armor', name: 'Armor', icon: 'guard' },
      { id: 'emblem', name: 'Emblem', icon: 'emblem' },
      { id: 'scouter', name: 'Scouter', icon: 'scouter', accessory: true },
      { id: 'tail', name: 'Tail', icon: 'tail', accessory: true },
      { id: 'hair', name: 'Hair', icon: 'hair' },
    ],
    pieces,
    profiles,
  };
  for (const [id, p] of Object.entries(pieces)) p.id = id;

  // outfits unlock through the existing unlock rules (SL.Save.evaluateUnlocks), so a clear hands
  // them over, the results screen announces them, and an old save catches up on load
  for (const p of Object.values(pieces)) {
    if (!p.unlock || p.status === 'planned') continue;
    const who = p.chars.filter((c) => c !== '*').map((c) => (SL.data.characters[c] ? SL.data.characters[c].name : c)).join(' / ');
    SL.data.unlocks.push({
      id: 'wardrobe_' + p.id,
      type: p.slot === 'outfit' ? 'outfits' : 'accessories',
      target: p.id,
      condition: p.unlock,
      title: (p.slot === 'outfit' ? 'OUTFIT · ' : p.slot.toUpperCase() + ' · ') + (p.slot === 'outfit' ? who + ': ' : '') + p.name.toUpperCase(),
      hint: null,
    });
  }
})();
