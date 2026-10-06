/*
 * LORE — capsules hidden off the radar's path in the Dragon Ball hunts (db_hunt.js spawns the ones
 * for the hunt's stage). Picking one up files its entry under Records → Lore. Original writing for
 * this project; nothing here is quoted.
 *   { id, stage, at: [x, z] (from the arena centre), title, text }
 */
(function () {
  'use strict';
  SL.data.lore = [
    { id: 'wild_nest', stage: 'wilderness', at: [52, 10], title: 'Wilderness Canyon', text: 'The canyons east of Mount Paozu have dinosaurs older than any city. A boy with a tail once lived on them for a month and came home heavier.' },
    { id: 'wild_paozu', stage: 'wilderness', at: [-58, 26], title: 'Mount Paozu', text: 'Grandpa Gohan raised a baby from the stars on this mountain and never once asked where he came from. He only asked that the boy be kind.' },
    { id: 'plains_turtle', stage: 'plains', at: [-46, 18], title: 'The Turtle School', text: 'Master Roshi\'s students run deliveries with turtle shells on their backs. The shell is twenty kilograms. The lesson is never the shell.' },
    { id: 'plains_saibamen', stage: 'plains', at: [24, 54], title: 'Saibamen', text: 'Planted in soil with a cultivation fluid, a Saibaman is fully grown in minutes — and as strong as a trained martial artist. They are sold by the crate.' },
    { id: 'namek_villages', stage: 'namek', at: [-40, -30], title: 'The Namekian Villages', text: 'Each village keeps one Dragon Ball and an elder to guard it. They live on water alone, and they had not fought in centuries before the scouters came.' },
    { id: 'namek_suns', stage: 'namek', at: [44, 28], title: 'Three Suns', text: 'Namek has three suns and no night. The Namekians did not have a word for darkness until Frieza\'s soldiers brought it.' },
    { id: 'coast_capsule', stage: 'coast', at: [-50, 10], title: 'Capsule Corporation', text: 'Dr. Brief\'s capsules fold a house, a plane or a motorbike into something you can carry in a pocket. His daughter used one to start a hunt for the Dragon Balls.' },
    { id: 'coast_radar', stage: 'coast', at: [48, -12], title: 'The Dragon Radar', text: 'A teenage girl built the first Dragon Radar in a garage. Every hunt for the balls since has followed the same blinking dot.' },
    { id: 'city_champion', stage: 'satan_city', at: [-30, -38], title: 'Satan City', text: 'Renamed for the man who "defeated Cell". The statue in the square is twelve metres tall. The real man is somewhat shorter.' },
    { id: 'city_hero', stage: 'satan_city', at: [36, 20], title: 'The Great Saiyaman', text: 'A hero in a helmet and a cape fights crime here with poses he clearly practised. Nobody has noticed that he goes to Orange Star High.' },
    { id: 'waste_craters', stage: 'wasteland', at: [48, 40], title: 'The Wastes', text: 'Every crater out here is a fight somebody won. The old ones have grass in them. The new ones are still warm.' },
    { id: 'waste_scouter', stage: 'wasteland', at: [-56, -8], title: 'Scouters', text: 'A scouter reads a fighter\'s power as a number. Earth\'s fighters learned to hide their power — and that was the end of the numbers meaning anything.' },
    { id: 'village_south', stage: 'south_village', at: [30, 16], title: 'The Village in the South', text: 'Rain is rare and the soil is poor. The prize money from one World Tournament would feed the whole village for years.' },
    { id: 'village_boy', stage: 'south_village', at: [-34, 22], title: 'A Good Person', text: 'Goku once wished that the evil he had fought would be born again as a good person, so they could have a real fight one day. He never said where.' },
  ];
})();
