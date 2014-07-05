var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  fsu = require('./fsutil'),
  pullTypes = require('./pulltypes'),
  mux = require('./mux'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio-leds.dts');

var LED_ROOT_PATH = '/sys/class/leds/',
  NONE = new Buffer('none'),
  HEARTBEAT = new Buffer('heartbeat'),
  TIMER = new Buffer('timer'),
  MAX_BRIGHTNESS = 255;

var defaultOptions = {
  pullType: pullTypes.NONE,
  isActiveLow: false // led initially off
};

function Led(pin, options) {
  var config,
    muxValue,
    waitForLed;

  if (!(this instanceof Led)) {
    return new Led(pin, options);
  }

  waitForLed = function() {
    fsu.waitForFile(LED_ROOT_PATH + this.name + '/trigger', function (err, device) {
      if (err) return this.emit('error', err);

      this.triggerFd = fs.openSync(LED_ROOT_PATH + this.name + '/trigger', 'r+');
      this.brightnessFd = fs.openSync(LED_ROOT_PATH + this.name + '/brightness', 'r+');
      this.delayOnFd = -1;
      this.delayOffFd = -1;

      this.emit('ready');
    }.bind(this));
  }.bind(this);

  if (typeof pin === 'string') {
    // onboard led
    this.pin = null;
    this.name = pin;
    waitForLed();
  }
  else
  {
    options = options ? _.defaults(options, defaultOptions) : defaultOptions;
    muxValue = mux.muxValue(options.pullType, 0);
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
      waitForLed();
    }.bind(this));
  }
}
util.inherits(Led, events.EventEmitter);

Led.prototype.heartbeat = function() {
  trigger(this, HEARTBEAT);
};

Led.prototype.none = function() {
  trigger(this, NONE);
};

Led.prototype.timer = function() {
  trigger(this, TIMER);
};

Led.prototype.brightness = function(val) {
  if (val < 0) {
    val = 0;
  } else if (val > MAX_BRIGHTNESS) {
    val = MAX_BRIGHTNESS;
  }

  fsu.writeNumber(this.brightnessFd, val);
};

Led.prototype.value = Led.prototype.brightness;

Led.prototype.delay = function(delayOn, delayOff) {
  if (this.delayOnFd === -1 || this.delayOffFd === -1) {
    this.timer();
  }

  fsu.writeNumber(this.delayOffFd, delayOff);
  fsu.writeNumber(this.delayOnFd, delayOn);
};

Led.prototype.blink = Led.prototype.delay;

module.exports = Led;

function trigger(led, val) {
  if (led.delayOnFd != -1) {
    fs.closeSync(led.delayOnFd);
    led.delayOnFd = -1;
  }
  if (led.delayOffFd != -1) {
    fs.closeSync(led.delayOffFd);
    led.delayOffFd = -1;
  }

  fs.writeSync(led.triggerFd, val, 0, val.length, 0);

  if (val === TIMER) {
    led.delayOnFd = fs.openSync(LED_ROOT_PATH + led.name + '/delay_on', 'r+');
    led.delayOffFd = fs.openSync(LED_ROOT_PATH + led.name + '/delay_off', 'r+');
  }
}

