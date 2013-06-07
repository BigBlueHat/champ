
var colors = require('colors');

module.exports.error = function (message) {
  var out = '\n  [Hoax]'.grey
    + ' Error: '.red
    + message
    + '\n\n';
  process.stderr.write(out);
};

module.exports.log = function (message) {
  var out = '\n  [Hoax]'.grey
    + ' Log: '.green
    + message
    + '\n\n';
  process.stdout.write(out);
};
