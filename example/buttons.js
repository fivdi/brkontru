var bot = require('../'),
  buttons = [
    new bot.Button(bot.pins.p9_23),
    new bot.Button(bot.pins.p9_24, {
      debounceInterval: 0,
      pullType: bot.pullTypes.PULL_DOWN,
      isActiveLow: false
    })
  ];

buttons.forEach(function (button) {
  button.on('error', function (err) {
    console.log('error: ' + button.name + err);
  });
  button.on('pressed', function () {
    console.log('pressed: ' + button.name);
  });
  button.on('released', function () {
    console.log('released: ' + button.name);
  });
});

