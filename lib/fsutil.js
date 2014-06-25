var glob = require('glob');

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

