
var path    = require('path')
  , load    = require('./load').loadModule
  , hoax    = load(path.resolve(__dirname, '../lib/index.js'))
  , assert  = require('assert');

// Test fixtures
var fixtures = path.resolve(__dirname, './fixtures')
  , flow = path.resolve(__dirname, './fixtures/01 Uppermost - Flow.mp3')
  , norm = path.resolve(__dirname, './fixtures/02 Uppermost - The Norm.mp3');

describe('Core functionality', function () {

  it('Should be able to read id3 tags with Mutagen', function () {
    hoax.readTag(flow, function (err, data) {
      assert.equal('Flow', data.title);
      assert.equal('Uppermost', data.artist);
      assert.equal('21f965c6-5463-44a7-9897-7d9536d2db86', data._id);
    });
  });

  it('Can glob a directory looking for .mp3 files', function () {
    hoax.readDir(fixtures, function (err, data) {
      assert.equal(2, data.length);
      assert.equal(flow, data[0]);
    });
  });

  it('Should be more modular')

});

