const BufferHelper = require('./bin/lib/BufferHelper');
const Item = require('./bin/lib/Item');
const BitReader = require('./bin/lib/BitReader');
var {BaseCodeIndex} = require('./bin/lib/Tables');

var items = [
  //'9c 04 27 10 19 00 00 00 10 00 80 00 65 00 0e 22 97 e6 06 82 ef 05 bd 38 61 94 c2 68 85 51 0b 23 66 95 37 0f 0f ff 01',
  //'9c 04 2e 00 17 00 00 00 10 08 80 00 65 00 60 8a 27 e7 06 02 31 c2 2a 54 12 93 12 31 92 46 1f 64 3c c4 01 18 10 80 88 20 46 04 29 a0 fe 03',
  //'9c 04 27 10 02 00 00 00 10 00 80 00 64 00 08 3a d6 16 03 82 31 95 a7 64 e5 00 8d 0a ff 89 9b 14 37 2b 6e 5a dc fc 07',
  //'9c 04 35 05 34 00 00 00 11 08 c0 04 64 80 08 72 03 17 06 42 6d 10 2c a8 a0 20 f4 1f 40 49 80 92 80 d2 80 52 04 82 04 a1 ec 85 49 60 a4 b9 dd 71 78 09 4f fc 0f',
 // '9d 06 1e 06 4f 92 42 26 01 17 10 f2 c4 11 00 80 00 65 84 08 30 27 76 07 02 84 40 b1 e0 3f',
  //'9d 06 20 07 00 96 a7 ea 00 0f a0 7a 4a 11 00 82 00 65 a4 0a 20 56 37 06 82 80 e0 00 06 06 ff 01',
  //'9c 04 37 05 2c 00 00 00 11 08 80 04 64 a0 24 62 c6 16 06 42 ed 90 26 28 0f 0e f4 ff 84 56 0a ad 15 5a 2d b4 94 c8 4d b2 34 bc 3f 63 e6 74 c3 c3 c3 8c 10 27 23 e3 3f',
  //  '9d 13 19 10 2d 00 00 00 04 2c 00 00 00 18 00 a0 00 64 18 00 20 17 83 03 02',
  // '9d 13 19 10 2e 00 00 00 04 2c 00 00 00 18 00 a0 00 64 18 02 20 27 63 03 02',
  //  '9d 13 19 10 2f 00 00 00 04 2c 00 00 00 18 00 a0 00 64 18 04 20 27 13 03 02',
  //'9d 13 19 10 30 00 00 00 04 2c 00 00 00 18 00 a0 00 64 18 06 20 17 03 03 02',

  //   '9d 06 2c 00 4c 00 00 00 01 01 00 00 00 11 00 80 00 64 24 02 80 87 d6 06 02 4c 81 06 6d 40 41 01 00 bc 40 c0 33 46 86 68 d4 e8 f1 1f', // Guillaume's face (44 bytes)
  //'9c 04 3b 06 e8 9f 7d 49 11 08 80 04 65 00 0c 12 d6 36 06 c2 a8 38 00 20 a8 1b 11 c4 0b 00 60 ff 23 60 c4 78 22 28 45 d0 8a a0 16 41 30 f0 f0 dc 01 fa 27 97 f4 bc 4d 01 28 fe 03', // Faith gmb (59 bytes) 

  // '9d 13 19 10 fe 85 e6 8c 04 e9 9f 68 ee 18 00 a0 00 65 18 06 20 07 23 03 02', // One rune from faith rw
  // '9c 04 1e 05 4b 2f 59 5a 10 00 80 00 65 00 12 72 e7 46 06 02 03 01 00 c9 3c 3c e0 37 fc 07', // Magic wand of self repair (30 bytes)
  //'9c 04 2d 05 a7 bf a2 d9 10 00 c0 00 65 00 24 32 26 37 07 02 ac f1 d9 d0 41 29 72 42 05 a3 5c 3e 3e 00 58 d9 02 55 27 a0 4d 01 17 fe 07', // rare fools crystal sword (45 bytes)
  //   '9c 04 36 01 5f 95 ab c0 11 08 c0 04 65 00 04 52 17 26 07 c2 aa 30 04 c5 d0 8f 0f f4 1f 02 b2 08 2c 59 9e 58 4a b1 b4 62 a9 c5 52 9a 96 1c 26 d9 c3 03 05 db f2 1f', // SA fort (54 bytes)
  // '9d 06 40 01 52 00 00 00 01 01 00 00 00 11 08 c0 04 64 64 06 50 47 07 07 42 ed 90 21 28 8e f1 f0 20 08 0f 96 8c fe 43 40 16 81 25 cb 13 50 29 a0 56 40 b5 80 4a d3 92 c3 24 7b 78 a0 60 83 fe 03', // Fortitude (64 bytes)
  // '9c 04 2b 10 14 00 00 00 10 00 c0 00 65 00 a4 8a d7 76 06 82 71 81 05 36 80 80 00 36 fc 7f 40 c1 0a a8 34 28 5e 10 00 62 ba e4 3f', // trans gloves (43 bytes)
  //    '9d 06 36 00 32 00 00 00 00 01 00 00 00 11 08 80 00 65 24 02 80 37 b7 06 82 71 01 05 60 a0 a0 10 e0 00 97 04 3e 1f 6e 70 22 28 45 d0 8a a0 16 41 3c 14 3e 14 ff 01', // Tal mask
  //  '9d 06 36 00 33 00 00 00 00 01 00 00 00 11 08 80 00 65 24 02 80 37 b7 06 82 71 01 05 60 a0 a0 10 e0 00 97 04 3e 1f 6e 70 22 28 45 d0 8a a0 16 41 3c 14 3e 14 ff 01', // tal mask 1os (54 bytes)
  // '9c 04 14 10 e2 29 4b cc 10 00 a0 00 65 00 32 22 27 53 03 02',
  //'9C 04 25 10 1C 00 00 00 10 00 80 00 65 00 04 A2 56 76 07 82 F1 25 C5 80 11 D1 A2 D8 87 03 39 E9 8D A6 05 FF 01',
  //'9C 04 34 01 06 00 00 00 11 08 80 04 64 00 0C 52 47 07 07 32 ED 90 1D 28 0B F1 D4 98 0D FF 1F 2E B0 85 E7 FF 07 82 59 71 80 09 86 B1 11 FC 11 37 03 1E F2 1F',
  //'9C 04 30 06 CF 00 00 00 10 00 80 00 65 00 0C 32 26 76 07 82 90 21 0A 19 22 BF 11 35 8B 51 1E 48 3E 4C C0 E2 42 80 81 00 E7 91 67 C8 1E 6E FE 03', // Rare bow
  //'9C 04 1B 01 A8 00 00 00 10 00 80 00 65 00 0C 12 57 97 06 82 40 10 08 18 10 F8 0F', // Cracked Quilted Armor
  //	'9C 04 1A 05 A0 00 00 00 10 00 80 00 65 00 0E 42 76 26 07 02 41 80 02 01 FF 01', // cRUDE DAGGER
  //	'9C 04 1D 01 94 00 00 00 10 00 80 00 65 00 0C 22 E7 76 06 02 C6 A0 1D 68 68 80 F0 E0 3F', // 15% ed sup ring mail
  //'9C 04 1E 05 92 00 00 00 10 00 80 00 65 00 10 82 16 86 07 02 06 01 80 6F 70 70 A8 20 FC 07', // magic hand axe of worth
  //'9c 04 14 10 46 8b fd dd 10 00 a0 00 65 00 32 22 27 53 03 02',
  //'9c 04 14 10 a3 a5 fe 6e 10 00 a0 00 65 00 50 22 27 33 03 02',
  //'9c 04 14 10 d1 32 7f a7 10 00 a0 00 65 00 70 22 27 33 03 02',
  //'9c 04 14 10 68 99 bf c3 10 00 a0 00 65 00 30 22 27 33 03 02',
  //	'9c 04 2c 10 b4 ac df 61 10 00 80 00 65 00 60 a2 56 76 07 02 a8 25 55 be b8 d8 29 d3 81 80 52 05 c3 42 e2 82 81 21 f1 c9 00 95 f8 0f',
  //	'9c 0e 14 10 5a b6 ef 30 10 00 a2 00 65 08 00 80 06 17 03 02',
  //	'9c 04 1a 05 2d bb 77 18 10 08 80 00 02 00 aa ca 56 76 06 02 83 20 24 42 fe 03',
  //'9c 04 14 10 96 bd 3b 9c 10 00 a2 00 65 00 52 92 36 37 06 02',
  //'9d 06 21 05 cb be 1d 4e 00 46 8b fd dd 11 00 82 00 65 84 08 30 37 47 07 82 80 40 41 61 0d 89 fc 07'
];

const StatTypes = require('./bin/lib/StatTypes');

for (let i = 0; i < items.length; i++) {
  var s = Buffer.from(items[i].replace(/ /g, ''), 'hex');
  var n = Buffer.alloc(s.length);
  s.copy(n, 0);
  items[i] = n;

  let it = new Item(items[i]);
  console.log(it);
  console.log(it.serialize());

  for (var s = 0; s < it.stats.length; s++){
    switch (true) {
      case it.stats[s] instanceof StatTypes.SignedStat:
        console.log(it.stats[s].name);
    }
  }
}

