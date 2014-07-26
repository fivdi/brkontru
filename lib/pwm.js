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

var OCP_ROOT_PATH = '/sys/devices/ocp.*/';

function Pwm(pin, options) {
  var installSubSystem,
    installModule,
    installPwm;

  if (!(this instanceof Pwm)) {
    return new Pwm(pin, options);
  }

  if (pin.pwm === undefined) {
    throw new Error(pin.name + ' doesn\'t suppoer pwm');
  }

  installSubSystem = function () {
    if (pwmSubSystems[pin.pwm.subSystem] === undefined) {
      pwmSubSystems[pin.pwm.subSystem] = new PwmSubSystem(pin.pwm.subSystem);
      pwmSubSystems[pin.pwm.subSystem].on('ready', installModule);
    } else {
      installModule();
    }
  }.bind(this);

  installModule = function () {
    if (pwmModules[pin.pwm.module] === undefined) {
      pwmModules[pin.pwm.module] = new PwmModule(pin.pwm.module);
      pwmModules[pin.pwm.module].on('ready', installPwm);
    } else {
      installPwm();
    }
  }.bind(this);

  installPwm = function () {
    var config,
      waitForInstall;

    waitForInstall = function() {
      fsu.waitForFile(OCP_ROOT_PATH + this.name + '.*/', function (err, device) {
        if (err) return this.emit('error', err);
  
        this.pwmPath = device;
        this.dutyFd = fs.openSync(this.pwmPath + 'duty', 'r+');

        this.emit('ready');
      }.bind(this));
    }.bind(this);

    options = options ? _.defaults(options, defaultOptions) : defaultOptions;
    this.pin = pin;
    this.name = 'bot_pwm_' + pin.name;
//    this.readBuffer = new Buffer(16);

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

  installSubSystem();
}
util.inherits(Pwm, events.EventEmitter);

Pwm.HIGH = 1;
Pwm.LOW = 0;

var defaultOptions = {
  duty: 0,
  enabled: true,
  period: 500000,
  polarity: Pwm.HIGH
};

module.exports = Pwm;

Pwm.prototype.duty = function(value) {
  if (value === undefined) {
    fs.readSync(this.dutyFd, this.readBuffer, 0, 1, 0);
    return +this.readBuffer.toString();
  } else {
    fsu.writeNumber(this.dutyFd, value);
  }
}

