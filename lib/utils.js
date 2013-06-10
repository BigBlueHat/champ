
var colors = require('colors')
  , verbosity = 1;

module.exports.setVerbosity = function (v) {
  verbosity = v;
};

module.exports.error = function (message) {
  var out = 'champ'.grey
    + ' error '.red
    + message
    + '\n';
  if (verbosity) {
    process.stderr.write(out);
  }
};

module.exports.log = function (message) {
  var out = 'champ'.grey
    + ' status '.cyan
    + message
    + '\n';
  if (verbosity) {
    process.stdout.write(out);
  }
};
