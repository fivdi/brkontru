var bot = require('../'),
  button = new bot.Gpio(bot.pins.p9_23, {direction: bot.Gpio.IN}),
  led = new bot.Gpio(bot.pins.p9_26);

setTimeout(function () {
  setInterval(function() {
    led.value(button.value());
  }, 100);
}, 2000);

