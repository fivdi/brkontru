var events = require('events'),
  util = require('util'),
  Dto = require('./dto'),
  dto = new Dto(__dirname + '/../templates/pwm-module.dts');

function PwmModule(module) {
  var config;

  if (!(this instanceof PwmModule)) {
    return new PwmModule(module);
  }

  this.name = 'bot_pwm_' + module;

  config = {
    partNumber: this.name,
    module: module
  };

  dto.install(config, function (err) {
    if (err) return this.emit('error', err);
    this.emit('ready');
  }.bind(this));
}
util.inherits(PwmModule, events.EventEmitter);

module.exports = PwmModule;

