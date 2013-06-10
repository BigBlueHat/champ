
var path    = require('path')
  , load    = require('./load').loadModule
  , champ   = load(path.resolve(__dirname, '../lib/index.js'))
  , expect  = require('chai').expect;

// Test fixtures
var fixtures = path.resolve(__dirname, './fixtures')
  , flow = path.resolve(__dirname, './fixtures/01 Uppermost - Flow.mp3')
  , norm = path.resolve(__dirname, './fixtures/02 Uppermost - The Norm.mp3');

// So we don't clutter the test results
champ.utils.setVerbosity(0);

describe('Core functionality', function () {

  it('Should be able to read id3 tags with Mutagen', function (done) {
    champ.readTag(flow, function (err, data) {
      expect(data.title).to.equal('Flow');
      expect(data.artist).to.equal('Uppermost');
      expect(data._id).to.equal('21f965c6-5463-44a7-9897-7d9536d2db86');
      done();
    });
  });

  it('Should read id3 tags and binary data in parallel', function (done) {
    champ.getTrackData(flow, function (err, metadata, b64string) {
      expect(metadata.title).to.equal('Flow');
      expect(metadata.artist).to.equal('Uppermost');
      expect(metadata._id).to.equal('21f965c6-5463-44a7-9897-7d9536d2db86');
      expect(/[a-zA-Z0-9\+\/=]*/.test(b64string)).to.equal(true);
      done();
    });
  });

  it('Can glob a directory looking for .mp3 files', function (done) {
    champ.readDir(fixtures, function (err, data) {
      expect(data).to.have.length(2);
      expect(data[0]).to.equal(flow);
      done();
    });
  });

});

