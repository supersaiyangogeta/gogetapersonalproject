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
    raditz: 'Raditz', piccolo: 'Piccolo', gohan: 'Gohan', kid_gohan: 'Gohan', king_kai: 'King Kai', king_yemma: 'King Yemma', narrator: 'Narrator', vegeta_voice: 'Vegeta (scouter)',
    krillin: 'Krillin', tien: 'Tien', yamcha: 'Yamcha', nappa: 'Nappa', saibaman: 'Saibaman', chiaotzu: 'Chiaotzu', yajirobe: 'Yajirobe',
    dodoria: 'Dodoria', cui: 'Cui', zarbon: 'Zarbon', dende: 'Dende', namekian_elder: 'Village Elder', guru: 'Grand Elder Guru',
    guldo: 'Guldo', ginyu: 'Captain Ginyu', recoome: 'Recoome', burter: 'Burter', jeice: 'Jeice', nail: 'Nail',
    future_trunks: 'Trunks', mecha_frieza: 'Frieza', king_cold: 'King Cold',
    teen_gohan: 'Gohan', cell: 'Cell',
    android_19: 'Android 19', android_20: 'Dr. Gero', android_17: 'Android 17', android_18: 'Android 18', android_16: 'Android 16', cell_junior: 'Cell Junior', chichi: 'Chi-Chi', announcer: 'Announcer',
    adult_gohan: 'Gohan', great_saiyaman: 'Great Saiyaman', videl: 'Videl', goten: 'Goten', kid_trunks: 'Trunks', city_thug: 'Robber', civilian: 'Civilian',
    mr_satan: 'Mr. Satan', idasa: 'Idasa', ikose: 'Ikose', supreme_kai: 'Supreme Kai', shin: 'Shin', kibito: 'Kibito', babidi: 'Babidi', dabura: 'Dabura', spopovich: 'Spopovich', yamu: 'Yamu', pui_pui: 'Pui Pui', yakon: 'Yakon', gotenks: 'Gotenks', gotenks_fat: 'Gotenks?', gotenks_thin: 'Gotenks?', evil_buu: 'Evil Buu', super_buu: 'Super Buu', gunman: 'Hunter', gunman_b: 'Hunter', buutenks: 'Super Buu', elder_kai: 'Old Kai',
    majin_buu: 'Majin Buu',
    vegito: 'Vegito', gogeta: 'Gogeta', jiren: 'Jiren', beerus: 'Beerus', pan: 'Pan', teen_goten: 'Goten', teen_trunks: 'Trunks', rocco: 'Rocco', buuhan: 'Buuhan', buuccolo: 'Super Buu', kibitoshin: 'Kibitoshin', gokule: 'Gokule', baba: 'Baba',
    kid_buu: 'Kid Buu', porunga: 'Porunga', crowd: 'Crowd', woman: 'Woman in the crowd', old_man: 'Old man',
    bulma: 'Bulma',
    shenron: 'Shenron', whis: 'Whis', oolong: 'Oolong', roshi: 'Master Roshi', puar: 'Puar', oracle_fish: 'Oracle Fish', marron: 'Marron', bubbles: 'Bubbles', uub: 'Uub', uub_mother: "Uub's Mother", village_chief: 'Village Chief', village_kid: 'Child', mr_buu: 'Mr. Buu', tv_cameraman: 'Cameraman', future_gohan: 'Gohan',
  };

  D.lines = {
    // Version 0.3 — Chapter 3 cast
    krillin_intro: ["I'm scared out of my mind... but I'm not backing down!"],
    tien_intro: ['Focus. Watch every movement.'],
    yamcha_intro: ["Leave this one to me. I've got it covered."],
    nappa_intro: ['Heh heh. Which one of you wants to break first?'],
    krillin_victory: ['Phew! I actually pulled that off!'],
    tien_victory: ['Discipline wins.'],
    nappa_victory: ['Ha! Too easy. Next!'],
    nappa_taunt: ["Get up! I'm just getting started!", 'Ha! Is that it?', "Don't break so fast, it's no fun!"],
    nappa_angry: ["That's it! Now you've made me mad!"],
    nappa_rampage: ["I'll blow this whole place off the map!"],
    nappa_hurt: ['Grrgh! You little pest!'],
    // Namek Saga — Frieza's men
    dodoria_intro: ['Heh heh heh. I do love it when they run.'],
    dodoria_taunt: ['Stay down! It hurts less that way!', 'Ha! Squash!'],
    dodoria_angry: ["You'll pay for every scratch, monkey!"],
    cui_intro: ['Let us settle this, Vegeta. For good.'],
    zarbon_intro: ['Must we? You will ruin my hair.'],
    zarbon_taunt: ['Stay down. This is embarrassing for both of us.', 'You fight like someone with nothing left to lose.'],
    zarbon_angry: ['You are going to make me do something I hate.'],
    zarbon_hurt: ['You actually touched me.'],
    zarbon_transform: ['Look well, monkey. You will not see this twice.'],
    zarbon_beaten: ['Lord Frieza... will hear... of this...'],
    krillin_potential: ["Whoa — is this me?!"],
    recoome_taunt: ['Recoome likes it when they get back up!', 'Watch this one — Recoome has been practising!'],
    recoome_angry: ['Now Recoome is not playing!'],
    recoome_hurt: ['Ooh! That one nearly tickled!'],
    guldo_taunt: ['Stand still! You are ruining this!', 'Do you know how hard it is to aim while holding my breath?'],
    guldo_angry: ['Fine! FINE! No more games!'],
    guldo_hurt: ['That is not fair, I was inhaling!'],
    burter_intro: ['Take a good look. Nobody in this universe is faster than Burter.'],
    burter_taunt: ['Too slow! Were you even trying?', 'I could do this all day. At this speed, I nearly am.'],
    burter_angry: ['You got lucky. Nobody touches me twice.'],
    burter_hurt: ['How did you— nobody sees me coming!'],
    burter_beaten: ['Impossible... I am the fastest...'],
    jeice_intro: ['Name is Jeice. The Red Magma. Try to keep up, mate.'],
    jeice_taunt: ['Come on then, walk into it!', 'You want to get close? It will cost you.'],
    jeice_angry: ['Right. No more warm-up.'],
    jeice_hurt: ['Oi! Watch the hair!'],
    jeice_beaten: ['Captain... I need the captain...'],
    jeice_cover: ['Burter, go! I have got the space!'],
    jeice_alone: ['Burter? BURTER! ...Right. I am getting the captain.'],
    ginyu_intro: ['Captain Ginyu. You have heard of me, I am sure.'],
    ginyu_taunt: ['Posture! Presentation! You have neither.', 'A fine body. Wasted on you.'],
    ginyu_angry: ['You are damaging my property.'],
    ginyu_hurt: ['Enough of that!'],
    ginyu_change: ['CHANGE... NOW!'],
    ginyu_changed: ['Marvellous. It fits.'],
    ginyu_missed: ['Hold STILL, you miserable little—'],
    ginyu_beaten: ['This body... is broken...'],
    frieza_taunt: ['Is that everything? Do take your time.', 'You are all so very small.', 'Oh, I am enjoying this.', 'Struggle all you like. It changes nothing.', 'How tiresome.'],
    frieza_shaken: ['Stay back... stay BACK!', 'This is not possible. I am the strongest in the universe!', 'Hold still, you monkey!'],
    frieza_full_taunt: ['One hundred percent. Can you feel the difference?', 'Is this what you wanted? Look at it!'],
    frieza_angry: ['You have stopped being amusing.'],
    frieza_hurt: ['You actually marked me.'],
    frieza_angry3: ['You have made me use this shape. Look at it.'],
    frieza_final: ['This is what I actually look like.'],
    frieza_transform2: ['Let me show you something. Do try to stay conscious.'],
    frieza_transform3: ['You want more? Very well. More.'],
    frieza_transform4: ['No more games. No more forms. This is all of it.'],
    guru_greeting: ['Come closer, child of Earth. I have been waiting for someone with hands like yours.'],
    guru_unlock: ['You have carried more than you know. Let me take the lid off it.'],
    nail_taunt: ['You are wasting time. That is the idea.', 'Hit me again. I have time.'],
    nail_hurt: ['That will grow back.'],
    nail_stall: ['Every second I keep you here is a second they are not spending on you.'],
    nail_offer: ['Take it. My people cannot afford my pride.'],
    piccolo_fuse: ['I can feel all of it. Every one of them.'],
    guru_warn: ['Frieza has called for five more. They are not like the ones you have met.'],
    dodoria_hunt: ['Come out, little ones. I can hear your hearts.', 'You cannot hide from a scouter!'],
    dodoria_lost: ['Where did they— fine. Run. I have all day.'],
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
    vegeta_majin: ['Let him have my mind. I only need my hands for this.'],

    goku_kaioken3: ['Times three!'],
    goku_kaioken4: ["Times four! My body can take it... I hope!"],

    // in-combat barks (V0.2) — rate limited by Battle.bark
    goku_combo: ["Didn't see that one coming, huh?", "Keep up!", "Here's another!"],
    goku_hurt: ['Gah! That one stung!', 'Whoa... nice hit!'],
    goku_lowHp: ["I can't give up now!", "Not yet... I've still got something left!"],
    goku_ultimateTaunt: ['Everyone, lend me your energy!'],

    // Future Trunks (Age 764)
    trunks_ssj: ['You have no idea what is coming. Let me show you what it costs.'],
    gohan_ssj: ['I do not want to do this. You are making me.'],
    gohan_ssj2: ['You wanted to see it. Look at it.'],
    cell_semi: ['Seventeen. Thank you. You will not feel a thing, and then you will not feel anything.'],
    cell_perfect: ['Perfect. That is the only word for it, so I will use it.'],
    cell_taunt: ['Take your time. I have all of it.', 'Is that everything? Say so, and I will start.'],
    trunks_combo: ['Stay down.', 'You are wasting my time.', 'I did not come here to lose.'],
    trunks_hurt: ['Tch — fine.', 'I have taken worse than that.'],
    trunks_lowHp: ['Not here. Not to you.', 'I did not come this far for this.'],
    // Mecha Frieza in the demonstration (Chapter 5): hurt, then afraid
    mf_hurt: ['Lucky. That was luck.', 'You will pay for every one of those.'],
    mf_fear: ['No — no, stay away!', 'This body was supposed to be perfect!'],
    goku_reactTransform: ["Wow, your power just shot way up! This is gonna be fun!"],
    vegeta_combo: ['Pathetic!', 'Is that all?'],
    vegeta_counter: ["Too slow!", 'Did you really think that would work?', 'Predictable.'],
    vegeta_taunt: ['Get up, clown.', 'I have barely started.'],
    vegeta_hurt: ['You dare?!', 'Grr... lucky shot!'],
    vegeta_lowHp: ['I refuse to lose to the likes of you!'],
    vegeta_reactTransform: ["That glow... no. NO! That power is meant for me!"],
    bardock_combo: ['Keep your guard up, rookie.', 'Too slow!'],
    bardock_hurt: ['Heh... is that all?'],
    bardock_lowHp: ["I've survived worse than this."],
    bardock_reactTransform: ['So that is the legend... Kakarot.'],
    goku_kaioken_learn: ['Kaioken!'],
    goku_overload: ['Gah... too much!'],
    kid_gohan_combo: ['I did it!', 'Hyaaah!'],
    kid_gohan_hurt: ['Ow...!', "I-I'm not scared!"],
    kid_gohan_lowHp: ["Mister Piccolo... I won't give up!"],
    kid_gohan_reactTransform: ["Wh-what is that power...?"],
    kid_gohan_intro: ["I... I'll fight!"],
    kid_gohan_victory: ['Phew... I really did it!'],
    kid_gohan_defeat: ['I want to go home...'],
    kid_gohan_potential: ['STOP IT!'],
    raditz_combo: ['Pathetic!', "You're a disgrace to our race!"],
    raditz_hurt: ['You little...!', 'Lucky shot, weakling!'],
    raditz_lowHp: ["This can't be happening... not to an elite!"],
    raditz_reactTransform: ['What?! Your power level... it jumped!'],
    piccolo_combo: ['Stay down.'],
    piccolo_intro: ["I'll handle this. Stay out of my way."],
    piccolo_victory: ['Hmph. A waste of my time.', 'You were never a threat.'],
    piccolo_defeat: ['I... underestimated you...'],
    piccolo_trap: ["Walk into it. I'll wait."],
    piccolo_grab: ['Get over here.', "You're not going anywhere."],
    piccolo_hurt: ['Tch...!'],
    piccolo_lowHp: ["Don't count me out yet."],
    raditz_intro: ['Kneel, and I might let you live.'],
    raditz_victory: ['Know your place, weakling.'],
    raditz_defeat: ['Impossible... I am an elite!'],
    goku_vs_raditz: ["You're really my brother...? Then why are you doing this?"],
    raditz_vs_goku: ['Kakarot. Time to remember what you are.'],
    frieza_soldier_reactTransform: ["W-what's happening to his hair?!"],

    // mechanic callouts
    chiaotzu_hold: ['Hold still!', "You can't move, can you?", 'Now, everyone!'],
    yajirobe_senzu: ['Here, eat this!', "Last one... don't waste it.", 'Ugh, fine. Take a bean.'],
    raditz_grab: ["Where do you think you're going?", 'Caught you.', "Struggle all you like!"],
    raditz_tailPain: ['Aaagh! My tail!', 'Let go of it!'],
    goku_zenkai: ["Heh... I'm not done yet!"],
    vegeta_prideMax: ["Now you understand the gap between us!"],
    bardock_rage: ["You think this is enough to stop me?!"],
    bardock_fury: ["You'll pay for that! Every last one of you!"],

    // victories
    goku_victory: ["That was a great fight! Let's do it again sometime!", 'Phew! You really made me work for that one.'],
    vegeta_victory: ['Hmph. As expected.', "Know your place. You were never on my level."],
    bardock_victory: ["Stay down. I've got bigger problems than you.", "That's how a Saiyan soldier fights."],
    frieza_soldier_victory: ['Hah! Monkeys are nothing without their tails.'],

    // Chapter 10 (Buu Saga: Majin) — paraphrased English written for this project
    goku_ssj2: ['This is what it looks like when I stop holding back.'],
    goku_ssj3: ['And this... is to go... even further beyond!'],
    goku_god: ['So this is a god\'s power... It\'s so calm.'],
    goku_godki: ['The red\'s gone — but the power\'s still here!'],
    vegeta_ssj2: ['You are not the only one who kept climbing, Kakarot.'],
    majin_combo: ['MORE!', 'Is that pain? I barely feel it!', 'Again! AGAIN!'],
    majin_hurt: ['Ha! Finally!', 'Yes... THAT is how it should feel!'],
    majin_lowHp: ['I will not lose to you. Not now. Not ever again!'],
    majin_taunt: ['Stop smiling, Kakarot. Fight me!', 'Seven years I waited for this!'],
    buu_hurt: ['Owww!', 'Hee hee! Tickles!', 'Buu mad now!'],
    buu_annoyed: ['Buu is MAD!', 'Buu not like you!'],
    buu_taunt: ['Buu likes this game!', 'Hee hee hee!', 'Do again! Do again!'],
    kid_buu_taunt: ['HYAAAAAAAH!', 'Hehehehehe!', 'Kyahahaha!'],
    kid_buu_hurt: ['Grrrrr...!', 'GYAAAH!'],

    // Gogeta: few words, all of them sure of themselves (barks: def.barks in gogeta.js)
    gogeta_intro: ["Let's finish this.", "Whenever you're ready."],
    gogeta_victory: ['Not bad.', "You're pretty strong. Just not strong enough."],
    gogeta_defeat: ['Heh... not bad... at all.'],
    gogeta_taunt: ["Now it's my turn.", 'Come on. Show me something.'],
    gogeta_combo: ['Too slow.', 'Keep up.'],
    gogeta_hurt: ['Heh. That one I felt.'],
    gogeta_lowHp: ['Time to end this.'],
    gogeta_ultimate: ['Time to end this.'],
    gogeta_tempo: ["Now we're talking."],
    // Jiren: almost nothing — and every word a verdict
    jiren_intro: ['...', 'Show me your strength.'],
    jiren_victory: ['Strength is everything.', 'You are not strong enough.'],
    jiren_defeat: ['...How?'],
    jiren_taunt: ['Is that all?', '...', 'Your strength is lacking.'],
    jiren_combo: ['Too weak.', '...'],
    jiren_hurt: ['...!'],
    jiren_lowHp: ['I will not lose.'],
    jiren_ultimate: ['Disappear.'],
    jiren_fullPower: ['Then I will stop holding back.'],
    // Beerus: bored, rude, and suddenly very dangerous
    beerus_intro: ['*yawn* ...Let\'s get this over with.', 'You woke me up for THIS?'],
    beerus_victory: ['Hm. Not bad, for a mortal. Now, where is dinner?', 'That was barely a warm-up.'],
    beerus_defeat: ['...I was holding back. Obviously.'],
    beerus_taunt: ['Is that all?', 'I could do this in my sleep. I nearly am.', 'One hand is plenty.'],
    beerus_combo: ['Too slow.', 'Hmph.'],
    beerus_hurt: ['Oh?'],
    beerus_lowHp: ['Now you\'ve made me angry.'],
    beerus_ultimate: ['Hakai.'],
    beerus_roused: ['Oh? Now THAT was interesting.', 'Fine. Both hands.'],

    // Pan, four years old
    pan_intro: ["I'm NOT a baby! I'm four!", 'Grandpa says I have to win in style!'],
    pan_victory: ['I won! I won! Did you see, Grandpa?!', 'Hee hee! That was easy!'],
    pan_defeat: ["No fair! I wasn't ready!"],
    pan_combo: ['Hiyaaa!', 'Take that!'],
    pan_hurt: ['Owie!', "Hey! That's mean!"],

    // defeats
    goku_defeat: ["Aw man... I've gotta train harder."],
    vegeta_defeat: ['This... this is impossible...!'],
    bardock_defeat: ["Tch... not... like this..."],
  };

  /*
   * EXCHANGES: a matchup that talks back and forth before a Free Battle (Battle._introSeq plays
   * them line by line, each speaker in his own shot, instead of one intro line each). Keyed by the
   * two character ids, in either order; each line names its speaker: [id, line, seconds?].
   */
  D.exchanges = {
    'jiren|goku': [['goku', "You're Jiren, right? I've been dying to fight you!", 2.4], ['jiren', '...You talk too much.', 1.8]],
    'jiren|vegeta': [['vegeta', "I'm the one who'll beat you. Not Kakarot.", 2.2], ['jiren', 'Then prove it.', 1.5]],
    'jiren|gogeta': [['gogeta', 'So you are the strongest in your universe.', 2.2], ['jiren', 'And you are two men pretending to be one.', 2.4], ['gogeta', 'Heh. Come find out.', 1.6]],
    'jiren|vegito': [['vegito', "Arms crossed, huh? Let's see how long that lasts.", 2.2], ['jiren', '...', 1.2]],
    'beerus|goku': [['goku', 'Lord Beerus! Fight me for real this time!', 2.2], ['beerus', 'Fine. But if you lose, you owe me pudding.', 2.4]],
    'beerus|vegeta': [['vegeta', 'Lord Beerus... I won\'t hold back.', 2.2], ['beerus', 'Good. Neither will I. Probably.', 2.2]],
    'beerus|gogeta': [['beerus', 'A fusion. Hm. You look like you might actually be fun.', 2.6], ['gogeta', 'Only one way to find out.', 1.8]],
    'beerus|majin_buu': [['majin_buu', 'Cat man! Buu play with cat man!', 2.2], ['beerus', 'Absolutely not.', 1.6]],
    'jiren|beerus': [['beerus', 'Hmph. So this is the mortal everyone keeps talking about.', 2.4], ['jiren', 'A god. Good.', 1.6]],
    'gogeta|vegito': [['vegito', 'So... another fusion?'], ['gogeta', 'Looks like it.'], ['vegito', "Let's see who's better."], ['gogeta', 'Sure.', 1.4]],
    'gogeta|goku': [['goku', "Whoa! So that's what we'd look like?"], ['gogeta', 'Pretty much.', 1.6]],
    'gogeta|vegeta': [['vegeta', 'Tch. Another fusion.'], ['gogeta', "Don't worry. I'll make it quick."]],
    'gogeta|majin_buu': [['majin_buu', 'YOU! Buu not like you! Buu turn you into candy!', 2.4], ['gogeta', 'Go ahead. Try it.', 1.7]],
    'gogeta|super_buu': [['super_buu', 'Two Saiyans in one body. I wonder how you taste.', 2.4], ['gogeta', "You'll choke.", 1.5]],
    'gogeta|buuhan': [['buuhan', 'Another fusion. How delicious.', 2.2], ['gogeta', "You'll choke.", 1.5]],
    'gogeta|kid_buu': [['kid_buu', 'HYAAAAAAAAH!', 1.6], ['gogeta', '...Yeah. Same to you.', 1.8]],
    'gogeta|frieza': [['frieza', 'Another monkey... and this one is two of them.', 2.4], ['gogeta', 'Twice the trouble for you.', 1.8]],
    'gogeta|cell': [['cell', 'Goku and Vegeta in one body. Every cell in me is curious.', 2.6], ['gogeta', 'They should be nervous.', 1.8]],
  };
  D.exchangeFor = function (a, b) {
    return D.exchanges[a + '|' + b] || D.exchanges[b + '|' + a] || null;
  };

  /** Returns a random line for a key, or null. */
  // the line said last time for each key: the same bark twice in a row sounds like a loop
  const LAST = {};
  D.get = function (key) {
    const l = D.lines[key];
    if (!l || !l.length) return null;
    let i = Math.floor(Math.random() * l.length);
    if (l.length > 1 && i === LAST[key]) i = (i + 1) % l.length; // (one roll either way: seeded fights stay the same)
    LAST[key] = i;
    return l[i];
  };

  D.introFor = function (a, b) {
    return D.get(a + '_vs_' + b) || D.get(a + '_intro');
  };
})();
