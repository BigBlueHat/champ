
/*
 * Hoax
 * https://github.com/nick-thompson/hoax
 *
 * Copyright (c) 2013 Nick Thompson
 * MIT License.
 */

var fs        = require('fs')
  , path      = require('path')
  , glob      = require('glob')
  , async     = require('async')
  , utils     = require('./utils')
  , CouchApp  = require('./couchapp')
  , Pouch     = require('pouchdb')
  , exec      = require('child_process').exec
  , pyDir     = path.resolve(__dirname, '../tag')

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
  Pouch(uri, function (err, db) {
    if (err) throw err;
    utils.log('Installing CouchApp...');
    CouchApp(path.resolve(__dirname, '../client'), function (err, doc) {
      doc._id = '_design/hoax';
      doc.views = {};
      doc.filters = {};
      doc.rewrites = {};
      doc.filters.meta = (function (doc, req) {
        return 'musicbrainz_trackid' in doc;
      }).toString();
      db.put(doc, function (err, res) {
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
                , b64string = results[1]
                , fileDoc;

              // This document will hold the actual music file.
              fileDoc = {
                _id: meta['_id'],
                _attachments: {
                  'file.mp3': {
                    'content_type': 'audio/mpeg',
                    'data': b64string
                  }
                }
              };

              // And we'll patch the metadata document with a consistant namespace
              meta['_id'] = 'meta_' + meta['_id'];

              // Go!
              db.bulkDocs({ docs: [meta, fileDoc] }, function (err, res) {
                if (err) throw err;
              });
            });
          }, callback);
        });
      });
    });
  });
}

function updateExisting (uri, directory) {
  console.log(uri, directory);
}

module.exports = {
  'new': createNew,
  'update': updateExisting
};

