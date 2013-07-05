
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
  , pyDir     = path.resolve(__dirname, '../tag');

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
    callback.call(null, null, buffer);
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
    doc.rewrites = [
      { from: "api" , to: "../../"},
      { from: "api/*" , to: "../../*" },
      { from: "/", to: "index.html" },
      { from: "/*", to: "*" }
    ];
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
 * @param {object} buffer Track binary buffer
 * @param {function} callback (err, response)
 */

function pushTrack (db, meta, buffer, callback) {
  var fid = meta._id
    , aid = fid + '/file.mp3'
    , results = [];
  meta._id = 'm:' + meta._id;
  db.put(meta, function (err, res) {
    if (err && !(err.error == 'conflict')) return callback.call(null, err);
    utils.log('uploading ' + meta.title + '...');
    results.push(res);
    db.put({ _id: fid }, function (err, res) {
      if (err && !(err.error == 'conflict')) return callback.call(null, err);
      db.putAttachment(aid, res.rev, buffer, 'audio/mpeg', function (err, res) {
        if (err) return callback.call(null, err);
        results.push(res);
        return callback.call(null, null, results);
      });
    });
  });
}

/**
 * Create or update a champ instance at `uri` with tracks from `directory`.
 *
 * @param {string} uri
 * @param {string} directory
 * @param {function} callback (err)
 */

module.exports.push = function push (uri, directory, callback) {
  var appDir = path.resolve(__dirname, '../app');
  Pouch(uri, function (err, db) {
    if (err) return callback.call(null, err);
    db.get('_design/champ', function (err, doc) {
      var appRev = doc && doc._rev || null;
      pushApp(db, appDir, appRev, function (err, appResponse) {
        if (err) return callback.call(null, err);
        readDir(directory, function (err, tracks) {
          if (err) return callback.call(null, err);
          async.map(tracks, function (track, done) {
            getTrackData(track, function (err, metadata, buffer) {
              if (err) return callback.call(null, err);
              pushTrack(db, metadata, buffer, done);
            });
          }, callback);
        });
      });
    });
  });
}

