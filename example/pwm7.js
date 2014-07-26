var bot = require('../'),
  pwms = [
    new bot.Pwm(bot.pins.p8_13),
    new bot.Pwm(bot.pins.p8_19),
    new bot.Pwm(bot.pins.p9_14),
    new bot.Pwm(bot.pins.p9_16),
    new bot.Pwm(bot.pins.p9_21),
    new bot.Pwm(bot.pins.p9_22),
    new bot.Pwm(bot.pins.p9_42)
  ];

pwms.forEach(function (pwm) {
  pwm.once('ready', function () {
    console.log(pwm.name + ' ready');
    pwm.duty(0);
    setTimeout(function () {
      pwm.duty(450000);
    }, 1000);
  });
});

