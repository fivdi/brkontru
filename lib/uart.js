var fs = require('fs'),
  util = require('util'),
  Duplexify = require('duplexify'),
  _ = require('lodash'),
  su = require('bindings')('serialutil.node');

module.exports = Uart;

Uart.B0 = su.B0;
Uart.B50 = su.B50;
Uart.B75 = su.B75;
Uart.B110 = su.B110;
Uart.B134 = su.B134;
Uart.B150 = su.B150;
Uart.B200 = su.B200;
Uart.B300 = su.B300;
Uart.B600 = su.B600;
Uart.B1200 = su.B1200;
Uart.B1800 = su.B1800;
Uart.B2400 = su.B2400;
Uart.B4800 = su.B4800;
Uart.B9600 = su.B9600;
Uart.B19200 = su.B19200;
Uart.B38400 = su.B38400;
Uart.B57600 = su.B57600;
Uart.B115200 = su.B115200;
Uart.B230400 = su.B230400;
Uart.B460800 = su.B460800;
Uart.B500000 = su.B500000;
Uart.B576000 = su.B576000;
Uart.B921600 = su.B921600;
Uart.B1000000 = su.B1000000;
Uart.B1152000 = su.B1152000;
Uart.B1500000 = su.B1500000;
Uart.B2000000 = su.B2000000;
Uart.B2500000 = su.B2500000;
Uart.B3000000 = su.B3000000;
Uart.B3500000 = su.B3500000;
Uart.B4000000 = su.B4000000;

var defaultOptions = {
  baudRate: Uart.B38400
};

util.inherits(Uart, Duplexify);

function Uart(uartPath, options) {
  if (!(this instanceof Uart)) {
    return new Uart(uartPath);
  }

  options = options ? _.defaults(options, defaultOptions) : defaultOptions;

  // Consider calling Duplexify with the allowHalfOpen option set to false.
  // It's super-class (Duplex) will then ensure that this.end is called when
  // the read stream fires the 'end' event. (see:
  // https://github.com/joyent/node/blob/v0.10.25/lib/_stream_duplex.js)
  Duplexify.call(this, null, null);

  this._rxfd = -1;
  this._txfd = -1;

  this._rxstream = fs.createReadStream(uartPath, {highWaterMark: 512});
  this._txstream = fs.createWriteStream(uartPath, {highWaterMark: 512, flags: 'r+'});

  this._rxstream.once('open', function (rxfd) {
    this._rxfd = rxfd;
    onopen(this, options);
  }.bind(this));
  this._txstream.once('open', function (txfd) {
    this._txfd = txfd
    onopen(this, options);
  }.bind(this));

  this._rxstream.once('close', function () {
    this._rxfd = -1;
    onclose(this);
  }.bind(this));
  this._txstream.once('close', function () {
    this._txfd = -1;
    onclose(this);
  }.bind(this));

  this.setReadable(this._rxstream);
  this.setWritable(this._txstream);
}

Uart.prototype.baudRate = function(rate) {
  if (rate === undefined) {
    return su.getBaudRate(this._rxfd);
  } else {
    su.setBaudRate(this._rxfd, rate);
  }
};

Uart.prototype.close = function () {
  this.removeAllListeners('data'); // Is this a good idea? Should the user be doing this?

  // TODO: the following is a bit of a hack.
  // Here \n EOF is faked for this._rxfd inorder to close the read stream.
  // It's faked three times as the uart may receive a character between
  // \n and EOF and the stream will not be closed. Faking three times
  // increases the chances of it working!
  su.setCanonical(this._rxfd, true);
  su.fakeInput(this._rxfd, '\n'.charCodeAt(0));
  su.fakeInput(this._rxfd, 4); // fake eof
  su.fakeInput(this._rxfd, '\n'.charCodeAt(0));
  su.fakeInput(this._rxfd, 4); // fake eof
  su.fakeInput(this._rxfd, '\n'.charCodeAt(0));
  su.fakeInput(this._rxfd, 4); // fake eof
};

function onopen(uart, options) {
  if (uart._rxfd !== -1 && uart._txfd !== -1) {
    su.setRawMode(uart._rxfd);
    uart.baudRate(options.baudRate);

    setImmediate(function () {
      uart.emit('open');
      uart.emit('ready');
    });
  }
}

var onclose = function (uart) {
  if (uart._rxfd === -1 && uart._txfd === -1) {
    setImmediate(function () {
      uart.emit('close');
    });
  }
}

