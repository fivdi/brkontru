var fs = require('fs'),
  events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  number = require('./numberpool'),
  fsu = require('./fsutil'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/pwm.dts'),
  PwmSubSystem = require('./pwmsubsystem'),
  PwmModule = require('./pwmmodule'),
  pwmSubSystems = {},
  pwmModules = {};

function Pwm(pin, options) {
  var installPwmSubSystem,
    installPwmModule,
    installPwm;

  if (!(this instanceof Pwm)) {
    return new Pwm(pin, options);
  }

  if (pin.pwm === undefined) {
    throw new Error(pin.name + ' doesn\'t support pwm');
  }

  installPwmSubSystem = function () {
    if (pwmSubSystems[pin.pwm.subSystem] === undefined) {
      pwmSubSystems[pin.pwm.subSystem] = new PwmSubSystem(pin.pwm.subSystem);
    }
    if (!pwmSubSystems[pin.pwm.subSystem].ready) {
      pwmSubSystems[pin.pwm.subSystem].once('ready', installPwmModule);
    } else {
      installPwmModule();
    }
  };

  installPwmModule = function () {
    if (pwmModules[pin.pwm.module] === undefined) {
      pwmModules[pin.pwm.module] = new PwmModule(pin.pwm.module);
    }
    if (!pwmModules[pin.pwm.module].ready) {
      pwmModules[pin.pwm.module].once('ready', installPwm);
    } else {
      installPwm();
    }
  };

  installPwm = function () {
    var config,
      waitForInstall;

    waitForInstall = function() {
      fsu.waitForFile(fsu.OCP_ROOT_PATH + this.name + '.*/', function (err, device) {
        if (err) return this.emit('error', err);
  
        this.pwmPath = device;
        this.periodFd = fs.openSync(this.pwmPath + 'period', 'r+');
        this.dutyFd = fs.openSync(this.pwmPath + 'duty', 'r+');
        this.runFd = fs.openSync(this.pwmPath + 'run', 'r+');
        this.polarityFd = fs.openSync(this.pwmPath + 'polarity', 'r+');

        this.emit('ready');
      }.bind(this));
    }.bind(this);

    options = options ? _.defaults(options, defaultOptions) : defaultOptions;
    this.pin = pin;
    this.name = 'bot_pwm_' + pin.name;
    this.readBuffer = new Buffer(16);

    config = {
      channel: pin.pwm.channel,
      duty: options.duty,
      enabled: options.enabled ? 1 : 0,
      hardwareIp: pin.pwm.mux,
      header: pin.name.toUpperCase().replace('_', '.'),
      module: pin.pwm.module,
      muxOffset: '0x' + pin.muxOffset.toString(16),
      muxValue: '0x' + pin.pwm.muxMode.toString(16),
      name: this.name,
      partNumber: this.name,
      period: options.period,
      polarity: options.polarity
    };

    dto.install(config, function (err) {
      if (err) return this.emit('error', err);
      waitForInstall();
    }.bind(this));

  }.bind(this);

  installPwmSubSystem();
}
util.inherits(Pwm, events.EventEmitter);

Pwm.HIGH = 1;
Pwm.LOW = 0;

var defaultOptions = {
  duty: 0,
  enabled: true,
  period: 500000,
  polarity: Pwm.LOW
};

module.exports = Pwm;

Pwm.prototype.period = function(value) {
  if (value === undefined) {
    return fsu.readNumber(this.periodFd, this.readBuffer);
  } else {
    fsu.writeNumber(this.periodFd, value);
  }
}

Pwm.prototype.duty = function(value) {
  if (value === undefined) {
    return fsu.readNumber(this.dutyFd, this.readBuffer);
  } else {
    fsu.writeNumber(this.dutyFd, value);
  }
}

Pwm.prototype.enabled = function(value) {
  if (value === undefined) {
    return !!fsu.readNumber(this.runFd, this.readBuffer);
  } else {
    fsu.writeNumber(this.runFd, value ? 1 : 0);
  }
}

Pwm.prototype.polarity = function(value) {
  if (value === undefined) {
    return fsu.readNumber(this.polarityFd, this.readBuffer) ? Pwm.HIGH : Pwm.LOW;
  } else {
    fsu.writeNumber(this.polarityFd, value === Pwm.HIGH ? 1 : 0);
  }
}

