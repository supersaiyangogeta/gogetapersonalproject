/*
 * WARDROBE — what the characters wear, as data (the logic is SL.Wardrobe in src/game/wardrobe.js).
 *
 * A character's look is a SELECTION: one piece per slot.
 *   outfit   the clothes (required): the model `outfit` fields of src/game/model.js
 *   armor    a chest/shoulder/hip armor set worn over an outfit that allows it (armorOk)
 *   emblem   the marks on a gi (Goku's kanji), on an outfit that allows them (emblemOk)
 *   scouter  an accessory on the head
 *   tail     a Saiyan tail worn round the waist
 *   hair     a hairstyle from src/data/hair.js (Gohan's Ultimate hair, Videl's three cuts; an outfit may also bring its own `hair`)
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
 *   palettes, face (changes to the face that go with it), hair (the hairstyle that goes with it), props (model props worn
 *   with it, added to the character's own: 18's pearls and earrings), body ('adult' default, or 'young': the
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
  // Android 18's pearl necklace (her Buu Saga look): beads round the base of the neck, dropping in a U onto the upper chest.
  // Her right half in chest-joint space, laid on her built body's surface (measured in the viewer, 2026-10-16); her left
  // half mirrors it
  const A18_PEARL_HALF = [
    [-0.008, 0.338, -0.062], [-0.025, 0.338, -0.058], [-0.039, 0.338, -0.048], [-0.051, 0.338, -0.037], [-0.058, 0.338, -0.022],
    [-0.066, 0.338, -0.006], [-0.066, 0.338, 0.011], [-0.063, 0.338, 0.026], [-0.075, 0.336, 0.038], [-0.08, 0.33, 0.053],
    [-0.082, 0.323, 0.068], [-0.082, 0.315, 0.083], [-0.082, 0.308, 0.098], [-0.081, 0.3, 0.113], [-0.077, 0.291, 0.126],
    [-0.069, 0.282, 0.138], [-0.06, 0.272, 0.148], [-0.052, 0.267, 0.142], [-0.041, 0.256, 0.15], [-0.03, 0.245, 0.155],
    [-0.018, 0.233, 0.158], [-0.006, 0.221, 0.16],
  ];
  const A18_PEARLS = A18_PEARL_HALF.flatMap((p, i) => [p, [-p[0], p[1], p[2]]].map((pos, k) => ({
    id: 'pearl' + (k ? 'L' : 'R') + i, shape: 'ball', joint: 'chest', pos, size: [0.0085, 0.0085, 0.0085], color: 0xf4ecdc, outline: 0.3,
  })));

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
  // Goku, Namek gi (the Frieza fight, Namek saga cinematic brief): dust first, then the orange splits over the
  // navy undershirt at the chest and the back and the trousers go at the thigh and knee; the torso rips go with
  // the gi when the 100% fight tears it off (setTorn), and the trousers keep theirs
  const DAMAGE_GOKU_NAMEK = {
    tearAt: 3,
    rips: [
      { at: 'chest', y: 0.21, ang: 0.55, w: 0.36, h: 0.06, fill: 'under', level: 1, until: 2 },
      { at: 'spine', y: 0.12, ang: -2.8, w: 0.45, h: 0.07, fill: 'under', level: 1, until: 2 },
      { at: 'thighR', t: 0.55, ang: 0.25, w: 0.7, h: 0.08, fill: 'skin', level: 1 },
      { at: 'chest', y: 0.12, ang: -0.45, w: 0.48, h: 0.08, fill: 'under', level: 2, until: 2 },
      { at: 'chest', y: 0.18, ang: 2.7, w: 0.5, h: 0.07, fill: 'under', level: 2, until: 2 },
      { at: 'spine', y: 0.06, ang: 0.35, w: 0.42, h: 0.06, fill: 'under', level: 2, until: 2 },
      { at: 'thighL', t: 0.4, ang: -0.5, w: 0.8, h: 0.09, fill: 'skin', level: 2 },
      { at: 'kneeL', t: 0.3, ang: 0.15, w: 1.0, h: 0.09, fill: 'skin', level: 2 },
      { at: 'kneeR', t: 0.55, ang: -0.4, w: 1.2, h: 0.1, fill: 'skin', level: 3 },
      { at: 'thighR', t: 0.3, ang: 2.9, w: 0.9, h: 0.09, fill: 'skin', level: 3 },
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

  // Goku, Tournament of Power (the Whis gi; Tournament of power ui.docx and the owner's stills): Jiren's blows tear the
  // orange top at the chest and the back; then the top is gone (the `torn` look) — the navy undershirt with holes in it,
  // a ragged orange fringe left at the waist over the sash, the trousers holed at the thigh and in tatters at the knees;
  // last (torn.strip, level 3: Mastered Ultra Instinct on) the undershirt goes too — bare to a ragged navy-and-orange
  // band at the belt. The wristbands and the boots stay
  const WAIST = [0, 1.57, 3.14, -1.57];
  const DAMAGE_GOKU_TOP = {
    tearAt: 2,
    rips: [
      { at: 'chest', y: 0.2, ang: 0.55, w: 0.42, h: 0.07, fill: 'under', level: 1, until: 1 },
      { at: 'spine', y: 0.13, ang: -2.7, w: 0.5, h: 0.07, fill: 'under', level: 1, until: 1 },
      { at: 'thighR', t: 0.45, ang: 0.3, w: 0.8, h: 0.09, fill: 'skin', level: 1 },
      { at: 'chest', y: 0.17, ang: -0.4, w: 0.2, h: 0.045, fill: 'skin', cloth: 'under', level: 2, until: 2 },
      { at: 'chest', y: 0.07, ang: 0.45, w: 0.16, h: 0.04, fill: 'skin', cloth: 'under', level: 2, until: 2 },
      { at: 'chest', y: 0.2, ang: 2.6, w: 0.3, h: 0.05, fill: 'skin', cloth: 'under', level: 2, until: 2 },
      ...WAIST.map((a, i) => ({ at: 'spine', y: 0.035, ang: a + 0.2, w: 1.75, h: 0.055, fill: 'top', cloth: 'under', level: 2, until: 2, seed: 40 + i })),
      { at: 'thighL', t: 0.5, ang: -0.4, w: 0.9, h: 0.1, fill: 'skin', level: 2 },
      { at: 'kneeL', t: 0.35, ang: 0.2, w: 1.0, h: 0.09, fill: 'skin', level: 2 },
      { at: 'kneeR', t: 0.62, ang: -0.5, w: 1.3, h: 0.1, fill: 'skin', level: 2 },
      { at: 'kneeL', t: 0.82, ang: 2.4, w: 1.6, h: 0.08, fill: 'skin', level: 2 },
      ...WAIST.map((a, i) => ({ at: 'spine', y: 0.03, ang: a - 0.3, w: 1.8, h: 0.065, fill: 'under', cloth: 'top', level: 3, seed: 60 + i })),
      { at: 'thighR', t: 0.3, ang: -2.8, w: 1.0, h: 0.1, fill: 'skin', level: 3 },
      { at: 'kneeR', t: 0.3, ang: 0.6, w: 0.9, h: 0.09, fill: 'skin', level: 3 },
    ],
  };
  const TORN_GOKU_TOP = { chest: 'under', trap: 'under', abs: 'under', keepSleeve: 'both', strip: { at: 3, chest: 'skin', trap: 'skin', abs: 'skin', keepSleeve: null } };
  // Vegeta, Tournament of Power (the Super suit): Toppo's destruction and the Final Explosion. Rips to the skin first;
  // then (torn, level 3) the armour and the whole upper suit are gone and so are the gloves — bare to a ragged band at
  // the waist (the owner's stills: "I swear that Universe 7 is going to win", "I leave the rest to you"); boots stay
  const DAMAGE_VEGETA_TOP = {
    tearAt: 3,
    rips: [
      { at: 'chest', y: 0.21, ang: 0.6, w: 0.36, h: 0.06, fill: 'skin', level: 1, until: 2 },
      { at: 'thighL', t: 0.5, ang: 0.4, w: 0.7, h: 0.08, fill: 'skin', level: 1 },
      { at: 'spine', y: 0.12, ang: -0.5, w: 0.5, h: 0.08, fill: 'skin', level: 2, until: 2 },
      { at: 'chest', y: 0.15, ang: 2.8, w: 0.6, h: 0.08, fill: 'skin', level: 2, until: 2 },
      { at: 'kneeR', t: 0.4, ang: 0, w: 0.9, h: 0.08, fill: 'skin', level: 2 },
      ...WAIST.map((a, i) => ({ at: 'spine', y: 0.06, ang: a + 0.5, w: 1.8, h: 0.075, fill: 'top', cloth: 'top', level: 3, seed: 80 + i })),
      { at: 'thighR', t: 0.35, ang: -0.3, w: 1.1, h: 0.11, fill: 'skin', level: 3 },
      { at: 'kneeL', t: 0.5, ang: 0.4, w: 1.1, h: 0.1, fill: 'skin', level: 3 },
      { at: 'thighL', t: 0.3, ang: 2.9, w: 0.9, h: 0.1, fill: 'skin', level: 3 },
    ],
  };
  const TORN_VEGETA_TOP = { chest: 'skin', trap: 'skin', abs: 'skin', gloves: 'off', armor: 'off' };

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
    // KID GOKU (2026-10-16, the owner's collage: the boy with the four-star ball): both outfits bring the young body
    // (profile goku, bodies.young: the boy's build and face, the Power Pole on his back) and the loose tail
    goku_early: {
      slot: 'outfit', name: 'Early Adventure (Kid)', chars: ['goku'], era: 'early', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', body: 'young',
      look: { topStyle: 'gi', top: 0x2a4aa8, sleeves: 'none', pants: 0x2a4aa8, pantsStyle: 'gi', belt: 0xf2f0e8, wrist: 0xf2f0e8, boots: 0x5a3a28, bootStyle: 'shoe' },
      defaults: { tail: 'tail_saiyan_free' },
    },
    goku_turtle_young: {
      slot: 'outfit', name: 'Turtle School (Kid)', chars: ['goku'], era: 'turtle', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', body: 'young',
      base: 'goku_saiyan', look: { under: null, sleeves: 'none', wrist: 0x1f3d9e }, defaults: { emblem: 'emblem_kame', tail: 'tail_saiyan_free' },
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
      look: Object.assign({}, GI, GI_PALETTES.namek.look, { damage: DAMAGE_GOKU_NAMEK, torn: { chest: 'skin', trap: 0x2a4aa8, abs: 0x2a4aa8, keepSleeve: 'L' } }),
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
      // torn in the Tournament of Power its own way (DAMAGE_GOKU_TOP): the orange top, then the undershirt
      base: 'goku_saiyan', look: Object.assign({}, GI_PALETTES.super.look, { boots: 0x1c3a9a, damage: DAMAGE_GOKU_TOP, torn: TORN_GOKU_TOP }),
      defaults: { emblem: 'emblem_whis' }, emblemOk: true, palettes: GI_PALETTES,
    },
    goku_end_z: {
      slot: 'outfit', name: 'End of Z', chars: ['goku'], era: 'end_z', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'endz_village' },
      look: { topStyle: 'gi', top: 0x3ab0b0, under: 0x2a9090, sleeves: 'none', wrist: 0xe8b030, belt: 0xf2f0e8, pants: 0x1f4f4a, pantsStyle: 'gi', boots: 0xb0642a, bootStyle: 'gi' },
    },
    // MOVIE 2 · Super Broly: the blue winter jacket with the pink "SAB" on the chest (the owner's collage), zipped
    // over the Super gi; the gi's trousers and boots under it
    goku_broly_winter: {
      slot: 'outfit', name: 'Winter Clothes (Movie)', chars: ['goku'], era: 'super', kind: 'movie', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'bb_clash' },
      base: 'goku_saiyan',
      look: Object.assign({}, GI_PALETTES.super.look, {
        boots: 0x1c3a9a, sleeves: 'long', sleeveColor: 0x2a48c0, wrist: 0x2a48c0,
        jacket: { color: 0x2a48c0, open: 0.18, collar: 0xeeeef4 },
        emblem: { front: 'SAB', back: null, fg: '#ff4a9a', bg: 'rgba(0,0,0,0)' },
      }),
    },

    /* ================= THE TOURNAMENT OF POWER: the supporting cast's looks (the owner's stills of the stands) ===== */
    // their authored looks (the character files), so a mission can put them in the Tournament ones
    tien_classic: { slot: 'outfit', name: 'Crane Gi', chars: ['tien'], era: 'saiyan', kind: 'canon', canon: true, accuracy: 'reference', status: 'prototype', own: true, look: {} },
    a18_classic: { slot: 'outfit', name: 'Android Saga', chars: ['android_18'], era: 'android', kind: 'canon', canon: true, accuracy: 'reference', status: 'prototype', own: true, look: {} },
    // Tien: the dark Chinese vest with the red 天 on the chest, cream sleeves, a white sash, dark red trousers
    tien_top: {
      slot: 'outfit', name: 'Tournament Vest', chars: ['tien'], era: 'super', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'top_jiren' },
      look: {
        topStyle: 'shirt', top: 0x34363e, sleeves: 'long', sleeveColor: 0xeee2c4, arms: 0xeee2c4, sleeveBulk: 1.12, wrist: 0xeee2c4,
        belt: 0xf2eee2, beltStyle: 'sash', pants: 0x6a1c24, pantsStyle: 'gi', boots: 0x18181c, bootStyle: 'shoe',
        emblem: { front: '天', back: null, center: 0.075, fg: '#c0202a', bg: 'rgba(0,0,0,0)' },
      },
    },
    // Android 18: the pink tracksuit, zipped to the collar, white trainers
    a18_top: {
      slot: 'outfit', name: 'Tournament Tracksuit', chars: ['android_18'], era: 'super', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'top_jiren' },
      look: {
        topStyle: 'shirt', top: 0xe0588a, sleeves: 'long', sleeveColor: 0xe0588a, arms: 0xe0588a, wrist: 0xf4f2ee,
        collar: 0xe0588a, collarStyle: 'turtle', bustSoft: true,
        pants: 0xe0588a, pantsStyle: 'slacks', boots: 0xf4f2ee, bootStyle: 'shoe',
      },
    },

    /* ================= ANDROID 18: her eras, on her authored Android Saga look (a18_classic, `own`) ================= */
    // Buu Saga (the owner's reference, 2026-10-16): a cropped dark leather vest with a gold badge over a white T-shirt, a
    // pearl necklace, small gold hoops, dark gloves, a gold bangle, a brown belt with a silver buckle and a gold wallet
    // chain, teal capri jeans with rolled cuffs, orange slouch socks, black flat shoes; her hair a fuller bob tucked
    // behind the left ear. The story's Super era wears it too (the party); the Tournament of Power puts her in a18_top
    a18_buu: {
      slot: 'outfit', name: 'Buu Saga', chars: ['android_18'], era: 'buu', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'bog_party' }, base: 'a18_classic',
      look: {
        top: 0xf2eee8, sleeves: 'short', sleeveColor: 0xf2eee8, arms: null, stripes: null, hem: null,
        jacket: { color: 0x2c2422, open: 0.62, short: true },
        gloves: 0x3a2620, gloveLen: 0.24, belt: 0x7a4626, buckle: 0xc8ccd4,
        pants: 0x3f8096, pantsStyle: 'tight', crop: 0.5, legs: 0xf4dcc0,
        socks: 0xf0901e, socksH: 0.11, boots: 0x141418, bootStyle: 'shoe', bootTop: 0.05,
      },
      hair: { style: 'a18_buu' },
      props: [
        ...A18_PEARLS,
        { id: 'earringL', shape: 'hoop', joint: 'head', pos: [0.132, 0.084, -0.004], radius: 0.01, color: GOLD },
        { id: 'earringR', shape: 'hoop', joint: 'head', pos: [-0.132, 0.084, -0.004], radius: 0.01, color: GOLD },
        { id: 'badge', shape: 'tri', joint: 'chest', pos: [0.075, 0.2, 0.162], rot: [-0.3, 0.45, 0], size: [0.017, 0.021, 0.005], color: GOLD },
        { id: 'bangle', shape: 'cuff', joint: 'elbowL', pos: [0, -0.215, 0], radius: 0.05, length: 0.016, color: GOLD, outline: 0.4 },
        { id: 'chain', shape: 'strip', joint: 'hips', path: [[-0.1, 0.05, 0.112], [-0.11, -0.009, 0.111], [-0.167, -0.065, 0.093], [-0.212, -0.104, 0.049], [-0.222, -0.122, -0.012], [-0.204, -0.118, -0.071], [-0.158, -0.092, -0.112], [-0.112, -0.051, -0.141], [-0.08, -0.01, -0.14]], width: 0.009, thick: 0.005, color: GOLD, outline: 0.2 },
      ],
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
      look: Object.assign({}, SUIT, SUIT_PALETTES.super.look, { damage: DAMAGE_VEGETA_TOP, torn: TORN_VEGETA_TOP }),
      defaults: { armor: 'armor_v_whis', emblem: 'emblem_whis' }, armorOk: true, emblemOk: true, palettes: SUIT_PALETTES,
    },
    // MOVIE 2 · Super Broly: the armour he fights Broly in (the Super cut of the suit and the white armour)
    vegeta_broly: {
      slot: 'outfit', name: 'Movie Armor (Broly)', chars: ['vegeta'], era: 'super', kind: 'movie', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'bb_clash' },
      look: Object.assign({}, SUIT, SUIT_PALETTES.super.look),
      defaults: { armor: 'armor_v_whis' }, armorOk: true, emblemOk: true, palettes: SUIT_PALETTES,
    },
    // ...and the lime-green winter coat he arrives at the glacier in (the owner's collage: zipped, a darker collar)
    vegeta_broly_winter: {
      slot: 'outfit', name: 'Winter Coat (Movie)', chars: ['vegeta'], era: 'super', kind: 'movie', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'bb_clash' },
      look: Object.assign({}, SUIT, SUIT_PALETTES.super.look, {
        topStyle: 'shirt', top: 0x9ad83a, sleeves: 'long', sleeveColor: 0x9ad83a, arms: 0x9ad83a, collar: 0x6aa82a, collarStyle: 'turtle',
        jacket: { color: 0x9ad83a, open: 0.18, collar: 0x6aa82a },
      }),
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
    // the Cell Saga look (the owner's visual reference p.229): a blue bodysuit under white Saiyan armour with gold
    // shoulder straps and a gold belly plate, white gloves, white boots; the sword stays on his back (its strap kept).
    // His hair grown to the shoulders after the Time Chamber comes with the outfit (`hair`, 2026-10-15)
    ft_armor: {
      slot: 'outfit', name: 'Saiyan Armor (Cell Saga)', chars: ['future_trunks'], era: 'android', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'cell_chamber' },
      hair: { style: 'trunks_long' },
      look: {
        topStyle: 'armor', top: 0x2a46b0, arms: 0x2a46b0, sleeves: 'long', sleeveColor: 0x2a46b0,
        armor: { plate: 0xf2f0ea, belly: 0xe2b83a, pads: 0xe2b83a, padStyle: 'strap', trim: 0xe2b83a },
        gloves: 0xf2f0ea, pants: 0x2a46b0, pantsStyle: 'tight',
        boots: 0xf2f0ea, bootTip: 0xe2b83a, bootStyle: 'saiyan',
        strap: { color: 0x3cb4c6, buckle: 0xf2f0ea, core: 0xd8342a, tilt: 0.62, length: 0.27 },
      },
    },
    ft_bojack: {
      slot: 'outfit', name: 'Sleeveless Jacket (Movie)', chars: ['future_trunks'], era: 'android', kind: 'movie', canon: true,
      status: 'planned', needs: 'the movie chapter (movies are separate content)',
    },
    // the Goku Black arc look (the owner's visual reference p.228, built 2026-10-15): a blue denim jacket over a black
    // shirt, the red scarf round his neck, a red cape, the olive strap across the chest, dark baggy trousers, olive boots.
    // The longer, fuller hair of that arc comes with the outfit (`hair`: its own style since 2026-10-15)
    ft_super: {
      slot: 'outfit', name: 'Denim Jacket and Cape (Super)', chars: ['future_trunks'], era: 'super', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', unlock: { missionComplete: 'hit_contract' },
      base: 'ft_capsule',
      hair: { style: 'trunks_super' },
      look: {
        top: 0x22222a, jacket: { color: 0x5a86c4, collar: 0xb8202c }, sleeveColor: 0x5a86c4, sleeveBulk: 1.12, wrist: 0x4a72ae,
        choker: 0xb8202c, chokerH: 0.05, chokerAt: 0.35,
        pants: 0x34343c, belt: 0x5a5a62, buckle: 0xd0d0d8, buckleCore: 0x5a5a62,
        boots: 0x8a8648, bootSole: 0x3a3428,
        strap: { color: 0x5a6e34, buckle: 0xd0d0d8, core: 0x5a6e34, tilt: 0.62, length: 0.27 },
        cape: 0xa8202a,
        emblem: { front: null, back: null, sleeve: '@capsule', fg: '#262630', bg: '#e8e8f0' },
      },
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

    /* ================= GOGETA: costumes (owner's reference sheet) ================= */
    // Fusion Reborn: the dark vest, the ORANGE quilted collar, the navy sash, blue wraps over black
    // shoes (the character file holds the data)
    gogeta_reborn: {
      slot: 'outfit', name: 'Fusion Reborn', chars: ['gogeta'], era: 'buu', kind: 'movie', canon: true, accuracy: 'reference',
      status: 'prototype',
      look: Object.assign({}, SL.data.characters.gogeta.appearance.outfit),
    },
    // Super Broly: a blacker vest, the GOLD collar, a teal sash and teal wraps
    gogeta_broly: {
      slot: 'outfit', name: 'Super Broly', chars: ['gogeta'], era: 'super', kind: 'movie', canon: true, accuracy: 'reference',
      status: 'prototype', unlock: { missionComplete: 'bb_gogeta' }, base: 'gogeta_reborn', // the film's own mission (it was the What-If's)
      look: { jacket: { color: 0x141418, open: 1.45 }, paddedCollar: { color: 0xf2c43a, size: 1.12 }, belt: 0x2a8a98, boots: 0x2a7f8a },
    },
    gogeta_gt: {
      slot: 'outfit', name: 'Super Saiyan 4 (GT)', chars: ['gogeta'], era: 'super', kind: 'gt', canon: true,
      status: 'planned', needs: 'Super Saiyan 4: the red fur on the body and arms, the red-black mane, no vest — a fur layer the builder cannot draw yet',
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
      slot: 'tail', name: 'Saiyan Tail', chars: ['vegeta', 'goku', 'bardock', 'kid_gohan'], era: 'prologue', kind: 'canon', canon: true, status: 'prototype',
      look: { color: 'auto', style: 'wrapped' },
    },
    tail_saiyan_free: {
      slot: 'tail', name: 'Saiyan Tail (Loose)', chars: ['vegeta', 'goku', 'bardock', 'kid_gohan'], era: 'prologue', kind: 'canon', canon: true, status: 'prototype',
      look: { color: 'auto', style: 'free' },
    },

    /* ================= KID GOHAN (2026-10-16): Piccolo's gi, and the Raditz-arc clothes ================= */
    // his authored look: Piccolo's purple gi from the training on (no hat any more — that went with the tunic)
    kg_training: {
      slot: 'outfit', name: 'Piccolo\'s Training Gi', chars: ['kid_gohan'], era: 'saiyan', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', own: true, look: {},
    },
    // at four, when Raditz takes him (the owner's collage): the yellow tunic with its standing collar nearly to the ankle, the
    // green long sleeves, the red hat with the four-star Dragon Ball on top sitting back on his head, dark shoes. The
    // Raditz missions dress him in it; story-wise nothing else changes (kit, forms, size)
    kg_raditz: {
      slot: 'outfit', name: 'Raditz Arc (Hat and Tunic)', chars: ['kid_gohan'], era: 'saiyan', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype',
      look: {
        topStyle: 'shirt', top: 0xf0c03a, collar: 0xf0c03a, collarStyle: 'turtle',
        sleeves: 'long', sleeveColor: 0x3a9a4a, wrist: 0x2e8040,
        hem: { color: 0xf0c03a, len: 0.52, flare: 1.3, arc: 2.7 },
        pants: 0xa8742a, pantsStyle: 'gi', boots: 0x1e1a1e, bootStyle: 'shoe',
        cap: 0xd8452a, capBall: 0xffa21a, capStars: 4, capTilt: 0.42,
      },
      defaults: { tail: 'tail_saiyan_free' },
    },

    /* ================= YOUNG CHI-CHI: two ages (the owner's correction of the board p.194, 2026-10-16) ================= */
    // the child: the agreed covered version of the helmet armour (the character file holds the data)
    cc_kid: {
      slot: 'outfit', name: 'Helmet Armour (Child)', chars: ['young_chichi'], era: 'early', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype', own: true, look: {}, body: 'young',
    },
    // years later, the 23rd World Martial Arts Tournament: the blue sleeveless dress with its standing collar and red
    // edging, open at the sides over full red trousers, the red sash and wristbands, white lower legs, pink shoes. It is
    // made for her grown body (profile young_chichi, bodies.adult: her height then, the long straight hair, no helmet)
    cc_tournament23: {
      slot: 'outfit', name: '23rd World Tournament', chars: ['young_chichi'], era: 'tenkaichi23', kind: 'canon', canon: true, accuracy: 'approximate',
      status: 'prototype',
      look: {
        topStyle: 'shirt', top: 0x2440b0, sleeves: 'none', arms: 0xf6d0b0, collar: 0x2440b0, collarStyle: 'turtle',
        wrist: 0xd02a3a, belt: 0xd02a3a, beltStyle: 'sash', hem: { color: 0x2440b0, len: 0.52, flare: 1.32, arc: 2.3, trim: 0xd02a3a },
        pants: 0xd02a3a, pantsStyle: 'harem', harem: { thigh: 1.25, balloon: 1.55, at: 0.32, cuff: 0.52 }, legs: 0xf2f0ea, boots: 0xe0506a, bootStyle: 'shoe',
      },
    },

    /* ================= test mannequin (developer only): the .glb route ================= */
    /* ================= UNIVERSE 6: Caulifla and Kefla ================= */
    // `own`: the outfit authored on the character (src/data/characters/caulifla_kefla.js) is the piece's look, so the
    // wardrobe never copies it; palettes recolour only the clothes (the cuffs, boots and earrings keep their colours)
    caulifla_default: {
      slot: 'outfit', name: 'Bandeau & Harem Pants', chars: ['caulifla'], era: 'super', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', own: true, look: {},
    },
    kefla_default: {
      slot: 'outfit', name: 'Crop Top & Leggings', chars: ['kefla'], era: 'super', kind: 'canon', canon: true, accuracy: 'reference',
      status: 'prototype', own: true, look: {},
      palettes: {
        crimson: { name: 'Crimson', look: { top: 0xb01e2e, pants: 0xb01e2e } },
        black: { name: 'Black', look: { top: 0x22202a, pants: 0x22202a } },
        violet: { name: 'Royal Violet', look: { top: 0x4c2a7c, pants: 0x4c2a7c } },
        teal: { name: 'Deep Teal', look: { top: 0x15585a, pants: 0x15585a } },
        white: { name: 'White', look: { top: 0xe6e2da, pants: 0xe6e2da } },
      },
    },
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
      // Kid Goku (the early adventure and the Turtle School outfits) is the young body: a boy's proportions (a big head
      // and hands, short limbs, narrow shoulders), round eyes, the Power Pole across his back. `height` sizes the
      // figure only: the fighter keeps Goku's size in play (hurt box, reach), as every outfit does
      bodies: {
        adult: {},
        young: {
          height: 0.76,
          build: {
            chestW: 0.165, chestD: 0.122, chestTop: 0.25, shoulderX: 0.162, shoulderY: 0.2, delt: 0.056, waistW: 0.13, waistD: 0.104, absLen: 0.17,
            pelvisW: 0.138, pelvisD: 0.112, hipX: 0.08, upperArmLen: 0.22, foreArmLen: 0.2, upperArmR: 0.044, foreArmR: 0.04, fist: 0.05,
            thighLen: 0.36, shinLen: 0.34, thighR: 0.07, shinR: 0.054, hipY: 0.84, neckR: 0.044, neckLen: 0.036, headR: 0.152, footLen: 0.95,
          },
          hair: { style: 'goku_kid', color: 0x16161c },
          // the eyes set wider and opened rounder on the bigger head, the brows higher off them
          face: { pupil: 0x1c1c26, eyeX: 0.05, eyeW: 1.38, eyeH: 1.5, browY: 0.006, browThick: 0.75, jaw: 0.86, jawW: 0.96, cheeks: 0.25, nose: 0.55 },
          // the Power Pole: across his back from over the right shoulder down to the left hip
          props: [{ id: 'powerPole', joint: 'chest', shape: 'cuff', pos: [-0.13, 0.4, -0.15], rot: [0.12, 0, 0.62], radius: 0.017, length: 0.74, color: 0xc8281e, outline: 0.5 }],
        },
      },
      canonByEra: {
        early: { outfit: 'goku_early', tail: 'tail_saiyan_free' },
        turtle: { outfit: 'goku_turtle_young', emblem: 'emblem_kame', tail: 'tail_saiyan_free' },
        saiyan: { outfit: 'goku_saiyan', emblem: 'emblem_kame' },
        saiyan_return: { outfit: 'goku_saiyan', emblem: 'emblem_kaio' },
        namek: { outfit: 'goku_namek', emblem: 'emblem_go' },
        android_arrival: { outfit: 'goku_yardrat' },
        android: { outfit: 'goku_cell', emblem: 'none' },
        buu: { outfit: 'goku_buu', emblem: 'none' },
        end_z: { outfit: 'goku_end_z', emblem: 'none' },
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
    // Gogeta lives outside the canon story (What-If, Free Battle): the movie look, and the Broly one to pick
    gogeta: {
      default: { outfit: 'gogeta_reborn' },
      canonByEra: { buu: { outfit: 'gogeta_reborn' } },
    },
    // Universe 6 (no story mission dresses them yet): their reference outfits
    caulifla: { default: { outfit: 'caulifla_default' }, canonByEra: {} },
    // Tien: his authored look; the Tournament of Power missions put him in tien_top (mission appearance)
    tien: { default: { outfit: 'tien_classic' }, canonByEra: {} },
    // Android 18: the Android Saga look until the Buu Saga's; the Super era (Bulma's party) keeps the Buu Saga's (the
    // owner, 2026-10-16), and the Tournament of Power missions still put her in a18_top (mission appearance)
    android_18: {
      default: { outfit: 'a18_classic' },
      canonByEra: { android: { outfit: 'a18_classic' }, buu: { outfit: 'a18_buu' }, super: { outfit: 'a18_buu' } },
    },
    // Kefla's body controls (SL.Wardrobe): [build path, value at -1, value at +1]; 0 is her authored build. The ranges
    // stay inside natural, athletic proportions (checked by eye in the viewer at both ends)
    kefla: {
      default: { outfit: 'kefla_default' },
      canonByEra: {},
      bodyControls: [
        { id: 'chest', name: 'Chest', keys: [['bustShape', 0.9, 2.0]] },
        { id: 'waist', name: 'Waist', keys: [['waistW', 0.094, 0.116], ['waistD', 0.084, 0.098]] },
        { id: 'hips', name: 'Hips', keys: [['pelvisW', 0.156, 0.182], ['pelvisD', 0.128, 0.146]] },
        { id: 'thighs', name: 'Upper Thighs', keys: [['thighShape.top', 1.08, 1.3], ['thighShape.mid', 1.0, 1.1]] },
      ],
    },
    test_dummy: { default: { outfit: 'dummy_default' }, canonByEra: {}, devOnly: true },
    // young Chi-Chi has two bodies: the child of the early adventure, and the young woman of the 23rd World Tournament.
    // Each outfit is made for one of them and brings that body (SL.Wardrobe: profile.bodies) — the helmet armour never
    // goes on the grown body, the tournament dress never on the child's
    // Kid Gohan: Piccolo's gi by default and everywhere in the story, the Raditz missions excepted (their `appearance`);
    // his loose tail through the tail slot, as his authored look has it
    kid_gohan: {
      default: { outfit: 'kg_training', tail: 'tail_saiyan_free' },
      canonByEra: {},
    },
    young_chichi: {
      default: { outfit: 'cc_kid' },
      canonByEra: { early: { outfit: 'cc_kid' }, tenkaichi23: { outfit: 'cc_tournament23' } },
      bodies: {
        young: {},
        adult: {
          build: {
            chestW: 0.174, chestD: 0.124, chestTop: 0.27, shoulderX: 0.174, shoulderY: 0.22, delt: 0.055, waistW: 0.11, waistD: 0.09, absLen: 0.19,
            pelvisW: 0.146, pelvisH: 0.11, pelvisD: 0.118, hipX: 0.086, upperArmR: 0.04, foreArmR: 0.035, fist: 0.043, thighR: 0.076, shinR: 0.055,
            neckR: 0.042, neckLen: 0.068, headR: 0.124, footLen: 0.85, bustShape: 1,
          },
          hair: { style: 'chichi_long', color: 0x141418 },
          face: { pupil: 0x141414, eyeW: 1.08, eyeH: 1.12, lashWing: true, browThick: 0.75, jaw: 0.92, jawW: 0.9, cheeks: 0, nose: 0.7 },
          headExtras: [],
          // the dress's red-edged opening, from the collar across to her right (laid on the chest's surface)
          props: [{ id: 'piping', joint: 'chest', shape: 'strip', path: [[0, 0.31, 0.099], [-0.035, 0.29, 0.119], [-0.07, 0.267, 0.126], [-0.1, 0.25, 0.122], [-0.125, 0.238, 0.106]], width: 0.012, thick: 0.005, color: 0xd02a3a, outline: 0.3 }],
        },
      },
    },
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
