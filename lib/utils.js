
var colors = require('colors')
  , verbosity = 1;

// Inject a method onto the array prototype to
// partition an array into groups.

Array.prototype.group = function (size) {
  var groups = [];
  while (this.length > size) {
    groups.push(this.splice(0, size));
  }
  groups.push(this);
  return groups;
};

// And expose utility functions.

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
