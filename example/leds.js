var bot = require('../'),
  leds = [
    new bot.Led(bot.pins.p9_26),
    new bot.Led(bot.pins.p9_27)
  ];

leds.forEach(function (led) {
  led.on('error', function (err) {
    console.log('error: ' + led.name + err);
  });
  led.on('ready', function (err) {
    console.log('ready: ' + led.name);
  });
});

leds[1].on('ready', function () {
  leds[1].heartbeat();
});

setInterval(function () {
  leds[0].turnOn();
  setTimeout(function () {
    leds[0].turnOff();
  }, 250);
}, 1000);


