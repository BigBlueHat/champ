
var colors = require('colors');

module.exports.error = function (message) {
  var out = '  [Hoax]'.grey
    + ' Error: '.red
    + message
    + '\n';
  process.stderr.write(out);
};

module.exports.log = function (message) {
  var out = '  [Hoax]'.grey
    + ' Status: '.cyan
    + message
    + '\n';
  process.stdout.write(out);
};
