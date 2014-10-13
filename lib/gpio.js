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

var GPIO_ROOT_PATH = '/sys/class/gpio/'
  ONE = number(1)[0],
  STATE_GPIO_NONE = 'gpio',
  STATE_GPIO_PU = 'gpio_pu',
  STATE_GPIO_PD = 'gpio_pd',
  STATE_GPIO_NONE_BUF = new Buffer(STATE_GPIO_NONE),
  STATE_GPIO_PU_BUF = new Buffer(STATE_GPIO_PU),
  STATE_GPIO_PD_BUF = new Buffer(STATE_GPIO_PD),
  FS_OPTIONS = {encoding: 'utf8'};

function Gpio(pin, options) {
  var config,
    muxValue;

  if (!(this instanceof Gpio)) {
    return new Gpio(pin, options);
  }

  options = options ? _.defaults(options, defaultOptions) : defaultOptions;
  muxValue = mux.muxValue(options.pullType, 1);
  this.pin = pin;
  this.name = 'bot_gpio_' + pin.name;
  this.gpioPath = GPIO_ROOT_PATH + 'gpio' + pin.gpioNo + '/';
  this.readBuffer = new Buffer(16);

  config = {
    header: pin.name.toUpperCase().replace('_', '.'),
    gpioBank: Math.floor(pin.gpioNo / 32),
    gpioOffset: pin.gpioNo % 32,
    muxOffset: '0x' + pin.muxOffset.toString(16),
    muxValue: '0x' + muxValue.toString(16),
    name: this.name,
    partNumber: this.name
  };

  dto.install(config, function (err) {
    if (err) return this.emit('error', err);
    waitForGpio(this, options);
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

Gpio.prototype.pullType = function(pullType) {
  var state;

  if (pullType === undefined) {
    state = fs.readFileSync(this.stateFilePath, FS_OPTIONS).slice(0, -1);

    if (state === STATE_GPIO_NONE) {
      return pullTypes.NONE;
    } else if (state === STATE_GPIO_PU) {
      return pullTypes.PULL_UP;
    } else if (state === STATE_GPIO_PD) {
      return pullTypes.PULL_DOWN;
    } else {
      return undefined;
    }
  } else {
    if (pullType === pullTypes.PULL_UP) {
      state = STATE_GPIO_PU_BUF;
    } else if (pullType === pullTypes.PULL_DOWN) {
      state = STATE_GPIO_PD_BUF;
    } else { // pullTypes.NONE or anything else
      state = STATE_GPIO_NONE_BUF;
    }

    fs.writeFileSync(this.stateFilePath, state, FS_OPTIONS);
  }
};

function waitForGpio(gpio, options) {
  fsu.waitForFile(fsu.OCP_ROOT_PATH + gpio.name + '.*/state', function (err, stateFilePath) {
    if (err) return gpio.emit('error', err);

    gpio.stateFilePath = stateFilePath;
    gpio.pullType(options.pullType);

    // export pin if it hasn't already been exported
    if (!fs.existsSync(gpio.gpioPath)) {
      fs.writeFileSync(GPIO_ROOT_PATH + 'export', gpio.pin.gpioNo);
    }

    // write options.direction to gpio direction file
    fs.writeFileSync(gpio.gpioPath + 'direction', options.direction);

    gpio.valueFd = fs.openSync(gpio.gpioPath + 'value', 'r+');

    gpio.emit('ready');
  });
}

