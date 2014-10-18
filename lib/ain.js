var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  number = require('./numberpool'),
  fsu = require('./fsutil'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/ain.dts'),
  AinSubSystem = require('./ainsubsystem'),
  ainSubSystem;

function Ain(pin, options) {
  var installAinSubSystem,
    installAin;

  if (!(this instanceof Ain)) {
    return new Ain(pin, options);
  }

  if (pin.ain === undefined) {
    throw new Error(pin.name + ' doesn\'t support analog input');
  }

  installAinSubSystem = function () {
    if (ainSubSystem === undefined) {
      ainSubSystem = new AinSubSystem();
    }
    if (!ainSubSystem.ready) {
      ainSubSystem.once('ready', installAin);
    } else {
      installAin();
    }
  };

  installAin = function () {
    var config,
      waitForInstall;

    waitForInstall = function() {
      fsu.waitForFile(fsu.OCP_ROOT_PATH + this.name + '.*/', function (err, device) {
        if (err) return this.emit('error', err);
  
        this.ainPath = device;
        this.ainFd = fs.openSync(this.ainPath + this.pin.ain.vsenseName, 'r');

        this.emit('ready');
      }.bind(this));
    }.bind(this);

    options = options ? _.defaults(options, defaultOptions) : defaultOptions;
    this.scaledMin = options.scaledMin;
    this.scaledMax = options.scaledMax;
    this.pin = pin;
    this.name = 'bot_ain_' + pin.name;
    this.readBuffer = new Buffer(16);

    config = {
      header: pin.name.toUpperCase().replace('_', '.'),
      name: this.name,
      partNumber: this.name,
      vsenseName: pin.ain.vsenseName,
      vsenseScale: options.vsenseScale
    };

    dto.install(config, function (err) {
      if (err) return this.emit('error', err);
      waitForInstall();
    }.bind(this));

  }.bind(this);

  installAinSubSystem();
}
util.inherits(Ain, events.EventEmitter);

var defaultOptions = {
  scaledMin: 0,
  scaledMax: 1,
  vsenseScale: 100
};

module.exports = Ain;

Ain.prototype.value = function () {
  return ((this.rawValue() * (this.scaledMax - this.scaledMin)) / 1800) + this.scaledMin;
};

Ain.prototype.rawValue = function() {
  return fsu.readNumber(this.ainFd, this.readBuffer);
};

