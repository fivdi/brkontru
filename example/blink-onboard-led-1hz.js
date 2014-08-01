var bot = require('../'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 1Hz. Cycle = 1000ms, on for 500ms, off for 500ms.
  usr0.blink();
});

