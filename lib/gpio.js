var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  number = require('./numberpool'),
  fsu = require('./fsutil'),
  pullTypes = require('./pulltypes'),
  mux = require('./mux'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio.dts');

var OCP_ROOT_PATH = '/sys/devices/ocp.*/',
  GPIO_ROOT_PATH = '/sys/class/gpio/'
  ONE = number(1)[0];

function Gpio(pin, options) {
  var config,
    muxValue,
    waitForGpio;

  if (!(this instanceof Gpio)) {
    return new Gpio(pin, options);
  }

  waitForGpio = function() {
    fsu.waitForFile(OCP_ROOT_PATH + this.name + '.*/state', function (err, device) {
      if (err) return this.emit('error', err);

      // export pin if it hasn't already been exported
      if (!fs.existsSync(this.gpioPath)) {
        fs.writeFileSync(GPIO_ROOT_PATH + 'export', this.pin.gpio);
      }

      // write options.direction to gpio direction file
      fs.writeFileSync(this.gpioPath + 'direction', options.direction);

      this.valueFd = fs.openSync(this.gpioPath + 'value', 'r+');

      this.emit('ready');
    }.bind(this));
  }.bind(this);

  options = options ? _.defaults(options, defaultOptions) : defaultOptions;
  muxValue = mux.muxValue(options.pullType, 1);
  this.pin = pin;
  this.name = 'bot_gpio_' + pin.name;
  this.gpioPath = GPIO_ROOT_PATH + 'gpio' + pin.gpio + '/';
  this.readBuffer = new Buffer(16);

  config = {
    header: pin.name.toUpperCase().replace('_', '.'),
    gpioBank: Math.floor(pin.gpio / 32),
    gpioOffset: pin.gpio % 32,
    muxOffset: '0x' + pin.muxOffset.toString(16),
    muxValue: '0x' + muxValue.toString(16),
    name: this.name,
    partNumber: this.name
  };

  dto.install(config, function (err) {
    if (err) return this.emit('error', err);
    waitForGpio();
  }.bind(this));
}
util.inherits(Gpio, events.EventEmitter);

Gpio.IN = 'in';
Gpio.OUT = 'out';
Gpio.OUT_HIGH = 'high';
Gpio.OUT_LOW = 'low';

var defaultOptions = {
  direction: Gpio.OUT,
  pullType: pullTypes.NONE
};

module.exports = Gpio;

Gpio.prototype.value = function(val) {
  if (val === undefined) {
    fs.readSync(this.valueFd, this.readBuffer, 0, 1, 0);
    return this.readBuffer[0] === ONE ? 1 : 0;
  } else {
    fsu.writeNumber(this.valueFd, val);
  }
};

