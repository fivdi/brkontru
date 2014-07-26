var bot = require('../'),
  led1 = new bot.Led(bot.pins.p9_26),
  led2 = new bot.Led(bot.pins.p9_27);

led1.once('ready', function () {
  led1.heartbeat();
});

led2.once('ready', function () {
  setInterval(function () {
    led2.value(1);
    setTimeout(function () {
      led2.value(0);
    }, 250);
  }, 1000);
});

