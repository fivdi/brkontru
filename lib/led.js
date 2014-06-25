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
  ON = new Buffer('255'),
  OFF = new Buffer('0');

var defaultOptions = {
  pullType: pullTypes.NONE,
  isActiveLow: false
};

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

Led.prototype.turnOn = function() {
  trigger(this, NONE);
  brightness(this, ON);
};

Led.prototype.turnOff = function() {
  trigger(this, NONE);
  brightness(this, OFF);
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

function brightness(led, val) {
  fs.writeSync(led.brightnessFd, val, 0, val.length, 0);
}

