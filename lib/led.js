var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  fsutil = require('./fsutil'),
  pullTypes = require('./pulltypes'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio-leds.dts');

var LED_ROOT_PATH = '/sys/class/leds/',
  NONE = new Buffer('none'),
  HEARTBEAT = new Buffer('heartbeat'),
  TIMER = new Buffer('timer'),
  MAX_BRIGHTNESS = 255,
  NUMBER_POOL_MAX = 1000,
  NUMBER_POOL = [];

var defaultOptions = {
  pullType: pullTypes.NONE,
  isActiveLow: false
};

(function () {
  var num = 0;

  for (; num <= NUMBER_POOL_MAX; num += 1) {
    NUMBER_POOL.push(new Buffer('' + num))
  }
})();

function Led(pin, options) {
  var config,
    muxValue;

  if (!(this instanceof Led)) {
    return new Led(pin, options);
  }

  options = options ? _.defaults(options, defaultOptions) : defaultOptions;

  switch (options.pullType) {
    case pullTypes.NONE:
      muxValue = 0x0f;
      break;

    case pullTypes.PULL_DOWN:
      muxValue = 0x07;
      break;

    case pullTypes.PULL_UP:
    default:
      muxValue = 0x17;
      break;
  }

  this.pin = pin;
  this.name = 'bot_led_' + pin.name;

  config = {
    header: pin.name.toUpperCase().replace('_', '.'),
    gpioBank: Math.floor(pin.gpio / 32),
    gpioBankPlusOne: Math.floor(pin.gpio / 32) + 1,
    gpioOffset: pin.gpio % 32,
    isActiveLow: options.isActiveLow ? 1 : 0,
    label: this.name,
    muxOffset: '0x' + pin.muxOffset.toString(16),
    muxValue: '0x' + muxValue.toString(16),
    name: this.name,
    partNumber: this.name
  };

  dto.install(config, function (err) {
    if (err) return this.emit('error', err);

    fsutil.waitForFile(LED_ROOT_PATH + this.name + '/trigger', function (err, device) {
      if (err) return this.emit('error', err);

      this.triggerFd = fs.openSync(LED_ROOT_PATH + this.name + '/trigger', 'r+');
      this.brightnessFd = fs.openSync(LED_ROOT_PATH + this.name + '/brightness', 'r+');

      this.currentTrigger = NONE;

      this.emit('ready');
    }.bind(this));
  }.bind(this));
}
util.inherits(Led, events.EventEmitter);

Led.prototype.brightness = function(val) {
  var valBuf;

  if (val >= 0 && val <= MAX_BRIGHTNESS) {
    valBuf = NUMBER_POOL[val];
  } else {
    valBuf = NUMBER_POOL[0];
  }

  trigger(this, NONE);
  fs.writeSync(this.brightnessFd, valBuf, 0, valBuf.length, 0);
};

Led.prototype.heartbeat = function() {
  trigger(this, HEARTBEAT);
};

module.exports = Led;

function trigger(led, val) {
  if (led.currentTrigger !== val) {
    fs.writeSync(led.triggerFd, val, 0, val.length, 0);
    led.currentTrigger = val;
  }
}

