
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
 * @param {function} callback (err, metadata)
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
 * @param {function} callback (err, b64data)
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
 * Generate a CouchApp from `appDir` and push it to `db`.
 * Defaults to an _id of '_design/hoax'
 *
 * @param {object} db PouchDB database object
 * @param {string} appDir Root directory of the CouchApp
 * @param {function} callback (err, response)
 */

function pushApp (db, appDir, callback) {
  utils.log('Installing CouchApp...');
  CouchApp(appDir, function (err, doc) {
    if (err) return callback.call(null, err);
    doc._id = '_design/hoax';
    doc.filters = {
      meta: (function (doc, req) {
        return !!doc.musicbrainz_trackid;
      }).toString()
    };
    db.put(doc, callback)
  });
}

/**
 * Retrieve metadata and Base64 encoded binary for a track.
 *
 * @param {string} track
 * @param {function} callback (err, metadata, b64string)
 */

function getTrackData (track, callback) {
  utils.log('reading ' + track + '...');
  async.parallel([
    readTag.bind(null, track),
    readBinary.bind(null, track)
  ], function (err, results) {
    if (err) return callback.call(null, err);
    callback.call(null, null, results[0], results[1]);
  });
}

/**
 * Push a track's metadata and file docs to the db.
 *
 * @param {object} db PouchDB database instance
 * @param {object} meta Metadata document
 * @param {object} b64string Base64-encoded track binary
 * @param {function} callback (err, response)
 */

function pushTrack (db, meta, b64string, callback) {
  utils.log('uploading ' + meta.title + '...');
  meta['_id'] = 'meta_' + meta['_id'];
  var fileDoc = {
    _id: meta['musicbrainz_trackid'],
    _attachments: {
      'file.mp3': {
        'content_type': 'audio/mpeg',
        'data': b64string
      }
    }
  };
  db.bulkDocs({ docs: [meta, fileDoc] }, callback);
}

/**
 * Create a new Hoax instance at `uri` with tracks from `directory`.
 *
 * @param {string} uri
 * @param {string} directory
 * @param {function} callback (err)
 */

function createNew (uri, directory, callback) {
  // This can be a parameter on createNew in the future for customizable
  // client side applications.
  var appDir = path.resolve(__dirname, '../client');
  Pouch(uri, function (err, db) {
    if (err) throw err;
    pushApp(db, appDir, function (err, response) {
      readDir(directory, function (err, tracks) {
        if (err) throw err;
        async.each(tracks, function (track, done) {
          getTrackData(track, function (err, metadata, b64string) {
            pushTrack(db, metadata, b64string, function (err, response) {
              if (err) return callback.call(null, err);
            });
          });
        }, callback);
      });
    });
  });
}

function updateExisting (uri, directory) {
  // Check a ~/.hoax file
  console.log(uri, directory);
}

module.exports = {
  'new': createNew,
  'update': updateExisting,
  'utils': utils
};

