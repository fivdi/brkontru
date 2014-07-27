var bot = require('../'),
  Led = bot.Led,
  leds;

leds = [Led.USR0, Led.USR1, Led.USR2, Led.USR3].map(function(usrledName) {
  return new Led(usrledName);
});

bot.once('ready', leds, function () {
  var blinkLeds = function (delayOn, delayOff) {
    leds.forEach(function (led) {
      led.blink(delayOn, delayOff);
    });
  };

  setInterval(function () {
    blinkLeds(1, 9);
    setTimeout(function () {
      blinkLeds(10, 0);
    }, 250);
  }, 500);
});

