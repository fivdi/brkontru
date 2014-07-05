var fs = require('fs'),
  glob = require('glob'),
  number = require('./numberpool');

module.exports.waitForFile = function(pattern, cb) {
  function wait() {
    glob(pattern, null, function (err, matches) {
      if (err) return cb(err);
      if (matches.length === 0) return setImmediate(wait); // TODO - Stop looping at some point!
      if (matches.length > 1) {
        return cb(new Error('Multiple files matching \'' + pattern + '\' found'));
      }
      cb(null, matches[0]);
    });
  }

  setImmediate(wait);
};

module.exports.writeNumber = function(fd, num) {
  var numBuf = number(num);

  if (fd != -1) {
    fs.writeSync(fd, numBuf, 0, numBuf.length, 0);    
  }
}

