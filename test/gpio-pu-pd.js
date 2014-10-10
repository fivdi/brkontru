var assert = require('assert'),
  bot = require('../'),
  pullTypes = bot.pullTypes,
  input = new bot.Gpio(bot.pins.p8_07, {
    direction: bot.Gpio.IN,
    pullType: pullTypes.PULL_UP
  });

input.once('ready', function () {
  assert.equal(input.pullType(), pullTypes.PULL_UP, 'expected pullTypes.PULL_UP');
  assert.equal(input.value(), 1, 'expected value of 1');
  input.pullType(pullTypes.PULL_DOWN);
  assert.equal(input.pullType(), pullTypes.PULL_DOWN, 'expected pullTypes.PULL_DOWN');
  assert.equal(input.value(), 0, 'expected value of 0');
  input.pullType(pullTypes.PULL_UP);
  assert.equal(input.pullType(), pullTypes.PULL_UP, 'expected pullTypes.PULL_UP');
  assert.equal(input.value(), 1, 'expected value of 1');
  input.pullType(pullTypes.NONE);
  assert.equal(input.pullType(), pullTypes.NONE, 'expected pullTypes.NONE');
});

