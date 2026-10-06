/*
 * THE DRAGON BALLS — where the seven are hidden, and what the Eternal Dragon can grant.
 *
 * Each ball is its own short hunt (src/data/missions/db_hunt.js) on a stage the story already built:
 * the Dragon Radar on the HUD points the way; the clue says what kind of place it is; the ball
 * itself glints when you are close. Some are just hidden (under a boulder, on a rooftop, on top of a
 * spire), some are guarded — an optional fight, never a wall: you can grab the ball and leave.
 *
 *   spot.kind   'nest'    a dinosaur sleeps by it: it wakes when you come close; a heavy blow knocks
 *                         it over, three drive it off
 *               'boulder' under a rock: break the rock
 *               'high'    on top of the tallest spire / building near the start: fly up
 *               'hunters' two treasure hunters have it: beat them and it drops
 *               'crater'  in a crater in the wastes: Saibamen dig out of the ground around it
 *               'village' by the well in Uub's village: the children found it
 *   spot.guards [{ charId, count }]  fighters standing round it (team 1); 'nest' uses the T-Rex creature
 *
 * Wishes (src/data/missions/db_hunt.js, db_shenron): one per summoning; the balls scatter after it.
 */
(function () {
  'use strict';
  SL.data.dragonBalls = {
    // who goes looking: Goku (flight, Instant Transmission). The radar is Bulma's, the habit is his.
    hunter: 'goku',
    stars: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
    spots: [
      {
        star: 1, stage: 'wilderness', kind: 'nest', where: 'Wilderness Canyon',
        start: [0, 0, 60], ball: [-34, -48],
        clue: 'The radar points into the canyon. Something big has been eating well around here.',
        line: 'The radar says it\'s in the canyon... next to something snoring?',
      },
      {
        star: 2, stage: 'plains', kind: 'boulder', where: 'Grassland Hills',
        start: [0, 0, 50], ball: [38, -30],
        clue: 'The blip sits still in open country. Nothing there but grass and one very big rock.',
        line: 'It should be right here... under THAT?',
      },
      {
        star: 3, stage: 'namek', kind: 'high', where: 'Planet Namek',
        start: [0, 0, 55], guards: [{ charId: 'frieza_soldier', count: 2 }, { charId: 'frieza_gunner', count: 1 }],
        clue: 'Not a Namekian ball — an Earth one, carried off-world. Frieza\'s stragglers are camped under the spire it sits on.',
        line: 'An Earth Dragon Ball on Namek? And company, too.',
      },
      {
        star: 4, stage: 'coast', kind: 'hunters', where: 'Coastal Flats',
        start: [0, 0, 50], ball: [24, -36], guards: [{ charId: 'gunman', count: 1 }, { charId: 'gunman_b', count: 1 }],
        clue: 'The radar says the four-star ball is moving. Two treasure hunters are already arguing over it.',
        line: 'The four-star ball... Grandpa\'s ball. Hey — that\'s not yours!',
      },
      {
        star: 5, stage: 'satan_city', kind: 'high', where: 'Satan City',
        start: [0, 0, 40],
        clue: 'Straight up. The radar\'s blip is on top of the tallest building in town.',
        line: 'The radar says... up. Way up.',
      },
      {
        star: 6, stage: 'wasteland', kind: 'crater', where: 'Rocky Wasteland',
        start: [0, 0, 55], ball: [-30, -34], guards: [{ charId: 'saibaman', count: 3 }],
        clue: 'At the bottom of a crater in the wastes. The ground around it is soft — as if something dug it.',
        line: 'A crater... and the ground\'s moving.',
      },
      {
        star: 7, stage: 'south_village', kind: 'village', where: 'Uub\'s Village',
        start: [0, 0, 40], ball: [-10, -18],
        clue: 'A village at the far end of the south. The children say a little sun fell in the night.',
        line: 'Hey! Have you kids seen a little orange ball?',
      },
    ],
    // granted by Shenron (db_shenron); `when` decides if it is on offer this summoning
    wishes: [
      { id: 'warrior', title: 'Bring me a warrior I have never fought', desc: 'The next fighter the story would unlock joins Free Battle now.' },
      { id: 'wardrobe', title: 'Give me clothes from the years to come', desc: 'Two outfits you have not unlocked yet.' },
      { id: 'music', title: 'Let me hear the music of every battle', desc: 'Records gains a Sound Test with every song in the game.' },
      { id: 'fusion', title: 'Show me something that never happened', desc: 'What If: "The Ultimate Fusion" opens now.' },
      { id: 'peace', title: 'Nothing. Just... a peaceful day.', desc: 'Shenron is not used to that one.' },
    ],
  };
})();
