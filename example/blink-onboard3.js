var bot = require('../'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 100Hz. Cycle = 10ms, on for 1ms, off for 9ms.
  usr0.blink(1, 9);
});

