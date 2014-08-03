var bot = require('../'),
  led = new bot.Pwm(bot.pins.p9_14),
  led2 = new bot.Pwm(bot.pins.p9_16),
  led3 = new bot.Pwm(bot.pins.p9_21),
  led4 = new bot.Pwm(bot.pins.p9_22),
  led5 = new bot.Pwm(bot.pins.p9_42);

led.once('ready', function () {
  var period = led.period();
  var duty = 0;
  var delta = period / 50;

  (function updateDuty() {
    led.duty(duty);

    duty += delta;

    if (duty < 0 || duty > period) {
      delta = -delta;
      duty += delta;
    }

    setTimeout(updateDuty, 10);
  })();
});

