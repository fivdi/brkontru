var bot = require('../'),
  leds = [
    new bot.Led('beaglebone:green:usr0'),
    new bot.Led('beaglebone:green:usr1'),
    new bot.Led('beaglebone:green:usr2'),
    new bot.Led('beaglebone:green:usr3')
  ];

leds.forEach(function (led) {
  led.on('ready', function () {
    led.blink(10, 1990);
  });
});

