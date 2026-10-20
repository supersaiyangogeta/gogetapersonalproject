/*
 * SUPER PERFECT CELL — Cell after he rebuilt himself from one cell with a Saiyan's comeback in him (the Cell Games).
 * His own roster entry, not a fourth form: the story's Cell stays the three fighters in one body that the Cell Games
 * chapters are built on (and their tests pin), and this is the Free Battle fighter of the state after them.
 *
 * From the owner's visual reference (p.37): Perfect Cell's recognisable body, with stronger energy effects and
 * electrical arcs — the lightning runs through the aura, and the form stays readable under it. He keeps Perfect Cell's
 * kit and regeneration, faster, harder and with Instant Transmission's lesson learned: his Kamehameha comes from
 * closer, and the Solar Kamehameha is his.
 */
(function () {
  'use strict';
  const C = SL.data.characters;
  const CL = C.cell;
  if (!CL) return;
  const PF = CL.forms.find((f) => f.id === 'perfect');
  if (!PF) return;
  C.super_perfect_cell = Object.assign({}, CL, {
    id: 'super_perfect_cell',
    name: 'Super Perfect Cell',
    fullName: 'Super Perfect Cell',
    era: 'Cell Saga',
    playable: true, // Free Battle after the Cell Games (unlocks.js)
    prototype: true,
    style: 'Perfect · Lightning',
    card: ['Cell Saga', 'Back from a single cell'],
    blurb: 'He blew himself up and grew back from one cell — and came back with a Saiyan\'s strength from the brink. He has never been more perfect.',
    ratings: { power: 5, speed: 5, ki: 5, defense: 4 },
    stats: Object.assign({}, CL.stats, { hp: 40000, ki: 170 }),
    // one form: Perfect Cell's body, look and kit, with the lightning in the aura (the schema wants the first form
    // called 'base'; nothing in Cell's look or kit is filtered by the form's id)
    forms: [
      Object.assign({}, PF, {
        id: 'base',
        name: 'Super Perfect',
        kiCost: undefined,
        storyBoss: undefined,
        line: undefined,
        sequence: undefined,
        practiced: undefined,
        aura: { color: 0xa8ff6a, core: 0xffffff, particles: 0xd0ffa0, speed: 1.7, idle: 0.35, sharp: 0.3, sparks: 0xd8f4ff, lightning: true, boltColor: 0xd8f4ff },
        mult: { damage: 2.0, speed: 1.45, defense: 1.6, kiRegen: 1.5, chargeRate: 1.4, guardStamina: 1.2 },
      }),
    ],
    // Perfect Cell's plates belong to the story Cell's 'perfect' form; his one form is 'base'
    // the perfect form's props and spots become his single form's; the earlier shapes' spots are left out
    appearance: Object.assign({}, CL.appearance, {
      props: (CL.appearance.props || []).map((p) => (p.forms && p.forms.includes('perfect') ? Object.assign({}, p, { forms: ['base'] }) : p)),
      decals: (CL.appearance.decals || []).filter((d) => !d.forms || d.forms.includes('perfect')).map((d) => (d.forms ? Object.assign({}, d, { forms: ['base'] }) : d)),
    }),
    // Perfect Cell's wheel techniques (the Perfect Counter) on his single form
    extras: (CL.extras || []).map((x) => (x.forms && x.forms.includes('perfect') ? Object.assign({}, x, { forms: ['base'] }) : x)),
    ai: Object.assign({}, CL.ai, { aggression: 0.8, ranged: 0.5, beam: 0.5, preferredRange: 3.4 }),
    intro: { pose: 'cl_calm', expression: 'smirk' },
    victory: { poses: ['cl_calm'], expression: 'smirk' },
  });
})();
