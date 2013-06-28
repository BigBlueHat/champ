
/*
 * Champ
 * https://github.com/nick-thompson/champ
 *
 * Copyright (c) 2013 Nick Thompson
 * MIT License.
 */

var fs        = require('fs')
  , path      = require('path')
  , glob      = require('glob')
  , async     = require('async')
  , utils     = module.exports.utils = require('./utils')
  , CouchApp  = require('./couchapp')
  , Pouch     = require('pouchdb')
  , exec      = require('child_process').exec
  , pyDir     = path.resolve(__dirname, '../tag')
  , manifest  = path.resolve(process.env['HOME'], '.champ');

/**
 * Read the track metadata.
 *
 * @param {string} track Path to the audio file.
 * @param {function} callback (err, metadata)
 */

function readTag (track, callback) {
  var cmd = 'python tag.py "' + track + '"';
  exec(cmd, { cwd: pyDir }, function (err, stdout, stderr) {
    if (err) return callback.call(null, err);
    if (stderr) return callback.call(null, new Error(stderr));
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
    if (err) return callback.call(null, err);
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
    if (err) return callback.call(null, err);
    callback.call(null, null, files.map(function (file) {
      return path.join(fp, file);
    }));
  });
}

/**
 * Generate a CouchApp from `appDir` and push it to `db`.
 * Defaults to an _id of '_design/champ'
 *
 * @param {object} db PouchDB database object
 * @param {string} appDir Root directory of the CouchApp
 * @param {string} rev Existing rev to allow updates
 * @param {function} callback (err, response)
 */

function pushApp (db, appDir, rev, callback) {
  utils.log('pushing CouchApp...')
  CouchApp(appDir, function (err, doc) {
    if (err) return callback.call(null, err);
    if (rev) doc._rev = rev;
    doc._id = '_design/champ';
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
  meta['_id'] = 'm:' + meta['_id'];
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
 * Update a set of results, writing to the cache manifest file.
 *
 * @param {string} uri
 * @param {object} cache The current cache state
 * @param {object} results Set of results to be added
 * @param {function} callback (err)
 */

function writeCache (uri, cache, results, callback) {
  utils.log('writing cache manifest to ~/.champ...');
  cache[uri] = cache[uri] || {};
  results.forEach(function add (result) {
    if (result instanceof Array) return result.forEach(add);
    if (result && result.id) {
      cache[uri][result.id] = result.rev;
    }
  });
  fs.writeFile(manifest, JSON.stringify(cache), callback);
}

/**
 * Read and return the cache manifest.
 *
 * @param {function} callback (err, data)
 */

function readCache (callback) {
  fs.readFile(manifest, 'utf8', function (err, data) {
    if (err) {
      if (err.code == 'ENOENT') {
        data = null;
      } else {
        return callback.call(null, err);
      }
    }
    data = data
      ? JSON.parse(data)
      : {};
    callback.call(null, null, data);
  });
}

/**
 * Create a new champ instance at `uri` with tracks from `directory`.
 *
 * @param {string} uri
 * @param {string} directory
 * @param {function} callback (err)
 */

module.exports.push = function create (uri, directory, callback) {
  var appDir = path.resolve(__dirname, '../app');
  readCache(function (err, cache) {
    cache[uri] = cache[uri] || {};
    Pouch(uri, function (err, db) {
      if (err) return callback.call(null, err);
      var appRev = cache[uri].hasOwnProperty('_design/champ')
          ? cache[uri]['_design/champ']
          : null;
      pushApp(db, appDir, appRev, function (err, appResponse) {
        if (err) return callback.call(null, err);
        readDir(directory, function (err, tracks) {
          if (err) return callback.call(null, err);
          async.map(tracks, function (track, done) {
            getTrackData(track, function (err, metadata, b64string) {
              if (err) return callback.call(null, err);
              if (cache[uri].hasOwnProperty(metadata.musicbrainz_trackid)) {
                return done(null);
              }
              pushTrack(db, metadata, b64string, done);
            });
          }, function (err, results) {
            if (err) return callback.call(null, err);
            writeCache(uri, cache, results.concat([appResponse]), callback);
          });
        });
      });
    });
  });
}

