var bot = require('../'),
  ain = new bot.Ain(bot.pins.p9_36);

ain.once('ready', function () {
  setInterval(function () {
    console.log(ain.value());
  }, 1000);
});

