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
    var period = pwm.period();
    var duty = 0;
    var inc = period / 1000;

    var timeout = function() {
      duty += inc;
      if (duty <= period) {
        pwm.duty(duty);
        setTimeout(timeout, 1);  
      }
    }

    pwm.duty(duty);
    setTimeout(timeout, 1);  
  });
});

