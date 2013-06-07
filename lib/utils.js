
var colors = require('colors')
  , verbosity = 1;

module.exports.setVerbosity = function (v) {
  verbosity = v;
};

module.exports.error = function (message) {
  var out = '  [Hoax]'.grey
    + ' Error: '.red
    + message
    + '\n';
  if (verbosity) {
    process.stderr.write(out);
  }
};

module.exports.log = function (message) {
  var out = '  [Hoax]'.grey
    + ' Status: '.cyan
    + message
    + '\n';
  if (verbosity) {
    process.stdout.write(out);
  }
};
