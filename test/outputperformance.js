var bot = require('../'),
  out = new bot.Gpio(bot.pins.p9_26);

function test() {
  var time = process.hrtime(),
    opsPerSec,
    i;

  for (i = 0; i !== 50000; i += 1) {
    out.value(1);
    out.value(0);
  }

  time = process.hrtime(time);
  opsPerSec = Math.floor(i * 2 / (time[0] + time[1] / 1E9));

  console.log('ok - ' + __filename);
  console.log('     ' + opsPerSec + ' output ops per second');
}

out.on('ready', function() {
  test();
});

