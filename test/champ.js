
var path    = require('path')
  , Pouch   = require('pouchdb')
  , load    = require('./load').loadModule
  , champ   = load(path.resolve(__dirname, '../lib/index.js'))
  , expect  = require('chai').expect;

// Test fixtures
var fixtures = path.resolve(__dirname, './fixtures')
  , flow = path.resolve(__dirname, './fixtures/01 Uppermost - Flow.mp3')
  , norm = path.resolve(__dirname, './fixtures/02 Uppermost - The Norm.mp3')
  , app = path.resolve(__dirname, './fixtures/app')
  , testRemote = 'http://localhost:5984/champtests';

// So we don't clutter the test results
champ.utils.setVerbosity(0);

describe('Core functionality', function () {

  var db;

  before(function (done) {
    Pouch(testRemote, function (err, pouch) {
      if (err) return done(err);
      db = pouch;
      done();
    });
  });

  after(function (done) {
    Pouch.destroy(testRemote, done);
  });

  it('Can glob a directory looking for .mp3 files', function (done) {
    champ.readDir(fixtures, function (err, data) {
      if (err) return done(err);
      expect(data).to.have.length(2);
      expect(data[0]).to.equal(flow);
      done();
    });
  });

  it('Should be able to read id3 tags with Mutagen', function (done) {
    champ.readTag(flow, function (err, data) {
      if (err) return done(err);
      expect(data.title).to.equal('Flow');
      expect(data.artist).to.equal('Uppermost');
      expect(data._id).to.equal('21f965c6-5463-44a7-9897-7d9536d2db86');
      done();
    });
  });

  it('Should read id3 tags and binary data in parallel', function (done) {
    champ.getTrackData(flow, function (err, metadata, b64string) {
      if (err) return done(err);
      expect(metadata.title).to.equal('Flow');
      expect(metadata.artist).to.equal('Uppermost');
      expect(metadata._id).to.equal('21f965c6-5463-44a7-9897-7d9536d2db86');
      expect(/[a-zA-Z0-9\+\/=]*/.test(b64string)).to.equal(true);
      done();
    });
  });

  it('Should save two documents for each track', function (done) {
    champ.getTrackData(flow, function (err, metadata, b64string) {
      if (err) return done(err);
      champ.pushTrack(db, metadata, b64string, function (err, res) {
        if (err) return done(err);
        expect(res).to.have.length(2);
        expect(res[0].id).to.equal('m:21f965c6-5463-44a7-9897-7d9536d2db86');
        expect(res[1].id).to.equal('21f965c6-5463-44a7-9897-7d9536d2db86');
        done();
      });
    });
  });

  it('Can push a couchapp from a directory', function (done) {
    champ.pushApp(db, app, null, function (err, res) {
      if (err) return done(err);
      expect(res.ok).to.equal(true);
      expect(res.id).to.equal('_design/champ');
      db.getAttachment('_design/champ/index.html', function (err, res) {
        if (err) return done(err);
        expect(res.toString()).to.equal('omgwtfbbq\n');
        done();
      });
    });
  });

});

