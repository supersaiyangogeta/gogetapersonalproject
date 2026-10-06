/*
 * Dialogue: all lines are original writing that follows each character's
 * personality. Matchups are data-driven: add 'a>b' entries to create new
 * rival exchanges without touching code.
 */
(function () {
  'use strict';
  const D = SL.data.dialogue;

  D.speakers = {
    goku: 'Goku', vegeta: 'Vegeta', bardock: 'Bardock', frieza: 'Frieza',
    frieza_soldier: 'Frieza Soldier', frieza_gunner: 'Frieza Gunner', frieza_elite: 'Elite Soldier',
    soldier: 'Frieza Soldier', captain: 'Squad Captain', scouter: 'Scouter',
  };

  D.lines = {
    // generic intros
    goku_intro: ["Alright, let's have a good fight!", "I've been training for this. Don't hold back!"],
    vegeta_intro: ["Kneel before the Prince of all Saiyans.", "You'll regret standing in my way."],
    bardock_intro: ["Let's get this over with.", "Another fight. Fine by me."],
    frieza_soldier_intro: ['Ha! Easy bonus money.'],
    frieza_elite_intro: ["You'll make a fine trophy, monkey."],

    // matchups
    goku_vs_vegeta: ["So you're the Saiyan everyone warned me about. I'm kind of excited!"],
    vegeta_vs_goku: ["A low-class warrior, excited? I'll crush that smile off your face."],
    goku_vs_bardock: ["Huh? Why do you look just like me?"],
    bardock_vs_goku: ['Heh... that face. Show me you have Saiyan blood, kid.'],
    vegeta_vs_bardock: ['A third-class grunt dares to face royalty?'],
    bardock_vs_vegeta: ["Titles don't win fights, Prince. Fists do."],
    goku_vs_goku: ["Whoa, this is weird! Okay, let's see who trained harder!"],
    vegeta_vs_vegeta: ["There is only room for ONE Vegeta!"],
    bardock_vs_bardock: ['A fake wearing my face. You picked the wrong soldier.'],

    // transformations
    goku_kaioken: ['Kaioken!'],
    goku_ssj: ["I've had enough... I won't let you hurt anyone else!"],
    vegeta_ssj: ['Witness it! The legendary power belongs to ME!'],

    // mechanic callouts
    goku_zenkai: ["Heh... I'm not done yet!"],
    vegeta_prideMax: ["Now you understand the gap between us!"],
    bardock_rage: ["You think this is enough to stop me?!"],
    bardock_fury: ["You'll pay for that! Every last one of you!"],

    // victories
    goku_victory: ["That was a great fight! Let's do it again sometime!", 'Phew! You really made me work for that one.'],
    vegeta_victory: ['Hmph. As expected.', "Know your place. You were never on my level."],
    bardock_victory: ["Stay down. I've got bigger problems than you.", "That's how a Saiyan soldier fights."],
    frieza_soldier_victory: ['Hah! Monkeys are nothing without their tails.'],

    // defeats
    goku_defeat: ["Aw man... I've gotta train harder."],
    vegeta_defeat: ['This... this is impossible...!'],
    bardock_defeat: ["Tch... not... like this..."],
  };

  /** Returns a random line for a key, or null. */
  D.get = function (key) {
    const l = D.lines[key];
    if (!l || !l.length) return null;
    return l[Math.floor(Math.random() * l.length)];
  };

  D.introFor = function (a, b) {
    return D.get(a + '_vs_' + b) || D.get(a + '_intro');
  };
})();
