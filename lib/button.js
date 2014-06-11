var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  glob = require('glob'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/gpio-keys.dts');

function Button(pin) {
  var config;

  if (!(this instanceof Button)) {
    return new Button(pin);
  }

  this.pin = pin;
  this.name = 'btn_' + pin.name;

  config = {
    code: '1', // TODO - Should this be configurable?
    debounceInterval: '50', // TODO - Should this be configurable?
    gpioBank: Math.floor(pin.gpio / 32) + 1,
    gpioOffset: pin.gpio % 32,
    label: this.name,
    muxOffset: '0x' + pin.muxOffset.toString(16),
    muxValue: '0x37', // TODO - Should this be configurable?
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

