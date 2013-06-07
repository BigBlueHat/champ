
/*
 * Hoax
 * https://github.com/nick-thompson/hoax
 *
 * Copyright (c) 2013 Nick Thompson
 * MIT License.
 */

var fs    = require('fs')
  , path  = require('path')
  , glob  = require('glob')
  , async = require('async')
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
  var cmd = 'python tag.py "' + track + '"';
  exec(cmd, { cwd: pyDir }, function (err, stdout, stderr) {
    if (err) return utils.error(err.message);
    if (stderr) return utils.error(stderr);
    callback.call(null, null, JSON.parse(stdout));
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
    callback.call(null, null, buffer.toString('base64'));
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
    callback.call(null, null, files.map(function (file) {
      return path.join(fp, file);
    }));
  });
}

/**
 * Create a new Hoax instance at `uri` with tracks from `directory`.
 *
 * @param {string} uri
 * @param {string} directory
 * @param {function} callback
 */

function createNew (uri, directory, callback) {
  readDir(directory, function (err, tracks) {
    if (err) throw err;
    async.each(tracks, function (track, done) {
      utils.log('Reading ' + track);
      async.parallel([
        readTag.bind(null, track),
        readBinary.bind(null, track)
      ], function (err, results) {
        utils.log('Uploading ' + track);
        var meta = results[0]
          , b64string = results[1];

        console.log(meta);
      });
    }, callback);
  });
}

function updateExisting (uri, directory) {
  console.log(uri, directory);
}

module.exports = {
  'new': createNew,
  'update': updateExisting
};

