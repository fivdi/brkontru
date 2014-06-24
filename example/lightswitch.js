var bot = require('../'),
  button = new bot.Button(bot.pins.p9_23),
  led = new bot.Led(bot.pins.p9_26),
  ledState = 0;

button.on('pressed', function () {
  ledState ^= 1;
  if (ledState) {
    led.turnOn();
  } else {
    led.turnOff();
  }
});

