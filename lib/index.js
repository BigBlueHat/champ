
/*
 * Hoax
 * https://github.com/nick-thompson/hoax
 *
 * Copyright (c) 2013 Nick Thompson
 * MIT License.
 */

var path  = require('path')
  , glob  = require('glob')
  , utils = require('./utils')
  , exec  = require('child_process').exec
  , pyDir = path.resolve(__dirname, '../tag')

/**
 * Read the track metadata.
 *
 * @param {string} track Path to the audio file.
 * @param {function} callback
 */

function readTag (track, callback) {
  var cmd = 'python tag.py "' + fp + '"';
  exec(cmd, { cwd: pyDir }, function (err, stdout, stderr) {
    if (err) return utils.error(err.message);
    if (stderr) return utils.error(stderr);
    callback.call(null, JSON.parse(stdout));
  });
}

/**
 * Read the track binary as a Base64 string.
 *
 * @param {string} track Path to the audio file.
 * @param {function} callback
 */

function readBinary (track, callback) {
  fs.readFile(track, function (err, buffer) {
    if (err) return utils.error(err.message);
    callback.call(null, buffer.toString('base64'));
  });
}

/**
 * Recursively read a directory, returning a list of the files therein.
 *
 * @param {string} fp Filepath of the directory.
 * @param {function} callback
 */

function readDir (fp, callback) {
  glob('**/*.mp3', { cwd: fp }, function (err, files) {
    if (err) return utils.error(err.message);
    callback.call(null, files.map(function (file) {
      return path.join(fp, file);
    }));
  });
}

function createNew (uri, directory) {
  console.log(uri, directory);
}

function updateExisting (uri, directory) {
  console.log(uri, directory);
}

module.exports = {
  'new': createNew,
  'update': updateExisting
};

