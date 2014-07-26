var bot = require('../'),
  pwm = new bot.Pwm(bot.pins.p9_42);

pwm.on('ready', function () {
  pwm.duty(0);
  setTimeout(function () {
    pwm.duty(450000);
  }, 1000);
});

