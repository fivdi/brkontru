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
    var inc = period / 1000;
    var timeout = function() {
      var duty = pwm.duty() + inc;
      if (duty <= period) {
        pwm.duty(duty);
        setTimeout(timeout, 1);  
      }
    }

    pwm.duty(0);
    setTimeout(timeout, 1);  
  });
});

