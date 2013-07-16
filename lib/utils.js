
var colors = require('colors')
  , verbosity = 1;


/**
 * Split an array into groups of a specified size.
 *
 * @param {object} array
 * @param {number} size
 */

module.exports.group = function (array, size) {
  var groups = [];
  while (array.length > size) {
    groups.push(array.splice(0, size));
  }
  groups.push(array);
  return groups;
};

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
