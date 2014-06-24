var bot = require('../'),
  leds = [
    new bot.Led(bot.pins.p9_26),  // Initially off (isActiveLow === false)
    new bot.Led(bot.pins.p9_27, { // Initially on (isActiveLow === true)
      isActiveLow: true,
    })
  ];

leds.forEach(function (led) {
  led.on('error', function (err) {
    console.log('error: ' + led.name + err);
  });
  led.on('ready', function (err) {
    console.log('ready: ' + led.name);
  });
});

