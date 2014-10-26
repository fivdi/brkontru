'use strict';

var bot = require('../'),
  ainBad = new bot.Ain(bot.pins.p8_07), // p8_07 can't be used for adc, expect error
  ainGood = new bot.Ain(bot.pins.p9_36); // p9_36 (AIN5) can be used for adc, should work

ainBad.on('error', function(err) {
  console.log('expected error -> ' + err.stack);
});

ainGood.on('error', function(err) {
  console.log('unexpected error -> ' + err.stack);
});

ainGood.once('ready', function () {
  console.log(ainGood.pin.name + ' - ' + ainGood.rawValue() + ' - ' + ainGood.value());
});

