var bot = require('../'),
  button = new bot.Button(bot.pins.p9_23),
  led = new bot.Led(bot.pins.p9_26),
  ledBrightness = 0;

button.on('pressed', function () {
  led.brightness(ledBrightness ^= 255);
});

