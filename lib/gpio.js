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

var GPIO_ROOT_PATH = '/sys/class/gpio/',
  GPIO_EXPORT_PATH = GPIO_ROOT_PATH + 'export',
  ONE = number(1)[0],
  STATE_GPIO_NONE = 'gpio',
  STATE_GPIO_PU = 'gpio_pu',
  STATE_GPIO_PD = 'gpio_pd',
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

Gpio.NONE = 'none';
Gpio.FALLING = 'falling';
Gpio.RISING = 'rising';
Gpio.BOTH = 'both';

var defaultOptions = {
  direction: Gpio.OUT,
  pullType: pullTypes.NONE
};

module.exports = Gpio;

Gpio.prototype.direction = function (val) {
  if (val === undefined) {
    return fs.readFileSync(this.directionFilePath, FS_OPTIONS).slice(0, -1);
  } else {
    if (val === Gpio.IN || val === Gpio.OUT) {
      fs.writeFileSync(this.directionFilePath, val, FS_OPTIONS);
    }
    // TODO - error if val invalid?
  }
};

Gpio.prototype.edge = function (val) {
  if (val === undefined) {
    return fs.readFileSync(this.edgeFilePath, FS_OPTIONS).slice(0, -1);
  } else {
    if (val === Gpio.NONE || val === Gpio.FALLING || Gpio.RISING || Gpio.BOTH) {
      fs.writeFileSync(this.edgeFilePath, val, FS_OPTIONS);
    }
    // TODO - error if val invalid?
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
    if (pullType === pullTypes.PULL_UP || pullType === pullTypes.PULL_DOWN ||
        pullType === pullTypes.NONE) {
      if (pullType === pullTypes.PULL_UP) {
        state = STATE_GPIO_PU;
      } else if (pullType === pullTypes.PULL_DOWN) {
        state = STATE_GPIO_PD;
      } else if (pullType === pullTypes.NONE) {
        state = STATE_GPIO_NONE;
      }

      fs.writeFileSync(this.stateFilePath, state, FS_OPTIONS);
    }
    // TODO - error if val invalid?
  }
};

Gpio.prototype.value = function(val) {
  if (val === undefined) {
    fs.readSync(this.valueFd, this.readBuffer, 0, 1, 0);
    return this.readBuffer[0] === ONE ? 1 : 0;
  } else {
    fsu.writeNumber(this.valueFd, val);
  }
};

function waitForGpio(gpio, options) {
  fsu.waitForFile(fsu.OCP_ROOT_PATH + gpio.name + '.*/state', function (err, stateFilePath) {
    if (err) return gpio.emit('error', err);

    gpio.stateFilePath = stateFilePath;
    gpio.directionFilePath = gpio.gpioPath + 'direction';
    gpio.edgeFilePath = gpio.gpioPath + 'edge';

    gpio.pullType(options.pullType);

    // export pin if it hasn't already been exported
    if (!fs.existsSync(gpio.gpioPath)) {
      fs.writeFileSync(GPIO_EXPORT_PATH, gpio.pin.gpioNo);
    }

    // write options.direction to gpio direction file
    fs.writeFileSync(gpio.directionFilePath, options.direction);

    gpio.valueFd = fs.openSync(gpio.gpioPath + 'value', 'r+');

    gpio.emit('ready');
  });
}

