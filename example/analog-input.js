var bot = require('../'),
  ain = new bot.Ain(bot.pins.p9_33);

ain.once('ready', function () {
  console.log(ain.name + ' - ' + ain.pin.ain.vsenseName + ' - ' + ain.value());
});

