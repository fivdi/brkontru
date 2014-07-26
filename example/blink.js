var bot = require('../'),
  led1 = new bot.Led(bot.pins.p9_26),
  led2 = new bot.Led(bot.pins.p9_27);

led1.once('ready', function () {
  led1.blink(300, 300);
});

led2.once('ready', function () {
  led2.blink(1, 19);
});

