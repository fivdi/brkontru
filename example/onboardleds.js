var bot = require('../'),
  leds = [
    new bot.Led('beaglebone:green:usr0'),
    new bot.Led('beaglebone:green:usr1'),
    new bot.Led('beaglebone:green:usr2'),
    new bot.Led('beaglebone:green:usr3')
  ];

bot.once('ready', leds, function () {
  leds.forEach(function (led) {
    led.blink(10, 1990);
  });
});

