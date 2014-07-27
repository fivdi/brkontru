var bot = require('../'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 100Hz. Cycle = 10ms, on for 9ms, off for 1ms.
  usr0.blink(9, 1);
});

