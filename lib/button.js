var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  glob = require('glob'),
  _ = require('lodash'),
  pullTypes = require('./pulltypes'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio-keys.dts');

var defaultOptions = {
  debounceInterval: 50,
  pullType: pullTypes.PULL_UP,
  isActiveLow: true
};

function Button(pin, options) {
  var config,
    muxValue;

  if (!(this instanceof Button)) {
    return new Button(pin, options);
  }

  options = options ? _.defaults(options, defaultOptions) : defaultOptions;

  switch (options.pullType) {
    case pullTypes.NONE:
      muxValue = 0x2f;
      break;

    case pullTypes.PULL_DOWN:
      muxValue = 0x27;
      break;

    case pullTypes.PULL_UP:
    default:
      muxValue = 0x37;
      break;
  }

  this.pin = pin;
  this.name = 'btn_' + pin.name;

  config = {
    debounceInterval: options.debounceInterval,
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

    findInputDevice(this.name, function (err, device) {
      if (err) return this.emit('error', err);

      fs.createReadStream(device).on('data', function(buf) {
        if (buf[12] === 1) {
          this.emit('pressed');
        } else {
          this.emit('released');
        }
      }.bind(this));

      this.emit('ready');
    }.bind(this));
  }.bind(this));
}
util.inherits(Button, events.EventEmitter);

module.exports = Button;

function findInputDevice(name, cb) {
  function find() {
    var PATTERN = '/dev/input/by-path/platform-' + name + '.*-event';

    glob(PATTERN, null, function (err, matches) {
      if (err) return cb(err);
      if (matches.length === 0) return setImmediate(find); // TODO - Stop looping at some point!
      if (matches.length !== 1) {
        return cb(new Error('No unique device matching \'' + PATTERN + '\' found'));
      }
      cb(null, matches[0]);
    });
  }

  setImmediate(find);
}

